import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import { Repository } from 'typeorm';

import { PLANS } from '@/common/constants/plans';
import {
  DailyCreditsUsage,
  PeriodicCreditsUsage,
  User,
  UserRole,
} from '@/common/entities';

import { CreditsUsageResponseDto } from './dto/credits-usage-response.dto';

// Extend dayjs with UTC plugin
dayjs.extend(utc);

@Injectable()
export class CreditsUsageService {
  private readonly logger = new Logger(CreditsUsageService.name);

  constructor(
    @InjectRepository(DailyCreditsUsage)
    private dailyCreditsUsageRepository: Repository<DailyCreditsUsage>,
    @InjectRepository(PeriodicCreditsUsage)
    private periodicCreditsUsageRepository: Repository<PeriodicCreditsUsage>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
  ) {}

  /**
   * Record usage for a user
   * @param userId User ID
   * @param activePlan Active plan
   * @param count Number of credits to use
   * @returns Success status
   */
  async recordUsage(
    userId: string,
    activePlan: string,
    count: number,
  ): Promise<boolean> {
    // Record usage for free plans (both daily and monthly)
    if (activePlan === 'free') {
      await this.recordFreeUsage(userId, count);
    }
    // For users with Pro plan, record against Pro first
    else if (activePlan === 'pro' || activePlan === 'pro+lt_credits') {
      const success = await this.recordProUsage(userId, count);

      // If the user has both Pro and lifetime and Pro is maxed out, use lifetime
      if (!success && activePlan === 'pro+lt_credits') {
        await this.recordLifetimeUsage(userId, count);
      }
    }
    // For users with only lifetime credits
    else if (activePlan === 'lt_credits') {
      await this.recordLifetimeUsage(userId, count);
    }

    return true;
  }

  /**
   * Get a user's usage summary
   * @param userId User ID
   * @param activePlan Active plan
   * @returns Usage summary
   */
  async getUserUsageSummary(
    userId: string,
    activePlan: string,
  ): Promise<CreditsUsageResponseDto> {
    const response: CreditsUsageResponseDto = {
      activePlan: activePlan,
      periodicUsage: [],
      isRateLimited: false,
    };

    // For free plan users, get daily usage
    if (activePlan === 'free') {
      // Get today's date in UTC, normalized to start of day
      const today = dayjs.utc().startOf('day').toDate();

      const dailyUsage = await this.getDailyUsage(userId, today);
      if (dailyUsage) {
        response.dailyUsage = {
          date: dayjs.utc(dailyUsage.date).format('YYYY-MM-DD'),
          used: dailyUsage.used,
          limit: dailyUsage.limit,
          remaining: Math.max(0, dailyUsage.limit - dailyUsage.used),
        };

        // Check if rate limited
        response.isRateLimited = dailyUsage.used >= dailyUsage.limit;
      } else {
        // If no record exists yet, create default values based on plan
        response.dailyUsage = {
          date: dayjs.utc(today).format('YYYY-MM-DD'),
          used: 0,
          limit: PLANS.free.features.dailyLimit,
          remaining: PLANS.free.features.dailyLimit,
        };
      }

      const firstDayOfMonth = dayjs.utc().startOf('month').toDate();
      const lastDayOfMonth = dayjs.utc().endOf('month').toDate();

      // Get or create periodic usage record for this month
      const periodicUsage = await this.getOrCreatePeriodicUsage(
        userId,
        null,
        'free',
        PLANS.free.features.monthlyLimit,
        firstDayOfMonth,
        lastDayOfMonth,
      );

      response.periodicUsage = [
        {
          plan: periodicUsage.plan,
          periodStart: periodicUsage.periodStart,
          periodEnd: periodicUsage.periodEnd,
          used: periodicUsage.used,
          limit: periodicUsage.limit,
          remaining: Math.max(0, periodicUsage.limit - periodicUsage.used),
          usagePercentage: Math.round(
            (periodicUsage.used / periodicUsage.limit) * 100,
          ),
        },
      ];
    }

    // Get all current periodic usage records (could be multiple if they have pro+lifetime)
    const periodicUsages = await this.periodicCreditsUsageRepository.find({
      where: {
        userId,
        currentPeriod: true,
      },
    });

    // Map to DTOs
    response.periodicUsage = periodicUsages.map((usage) => {
      const remaining = Math.max(0, usage.limit - usage.used);
      const usagePercentage = Math.round((usage.used / usage.limit) * 100);

      return {
        plan: usage.plan,
        periodStart: usage.periodStart,
        periodEnd: usage.periodEnd,
        used: usage.used,
        limit: usage.limit,
        remaining,
        usagePercentage,
      };
    });

    // Check if rate limited based on periodic usage
    if (periodicUsages.length > 0 && !response.isRateLimited) {
      // If user has pro+lifetime, they're only rate limited if both are maxed out
      if (activePlan === 'pro+lt_credits') {
        const proUsage = periodicUsages.find((u) => u.plan === 'pro');
        const ltUsage = periodicUsages.find((u) => u.plan === 'lt_credits');

        if (proUsage && ltUsage) {
          response.isRateLimited =
            proUsage.used >= proUsage.limit && ltUsage.used >= ltUsage.limit;
        }
      } else {
        // For single plan users, check if any plan is at limit
        response.isRateLimited = periodicUsages.some(
          (usage) => usage.used >= usage.limit,
        );
      }
    }

    return response;
  }

  /**
   * Get a user's daily credits usage
   * @param userId User ID
   * @param date Date to check in UTC (defaults to today)
   * @returns Daily usage record or null if not found
   */
  async getDailyUsage(
    userId: string,
    date: Date = dayjs.utc().toDate(),
  ): Promise<DailyCreditsUsage | null> {
    // Normalize the date to midnight UTC
    const normalizedDate = dayjs.utc(date).startOf('day').toDate();

    return this.dailyCreditsUsageRepository.findOne({
      where: {
        userId,
        date: normalizedDate,
      },
    });
  }

  /**
   * Check if a user is allowed to use more credits
   * @param userId User ID
   * @param activePlan Active plan
   * @param count Number of credits to check
   * @returns Whether the usage is allowed
   */
  async validateUsageAllowed(
    userId: string,
    activePlan: string,
    count: number = 1,
  ): Promise<boolean> {
    // For free plan users, check both daily and monthly limits
    if (activePlan === 'free') {
      // Check daily limit - use UTC dates
      const today = dayjs.utc().startOf('day').toDate();

      const dailyUsage = await this.getDailyUsage(userId, today);

      if (dailyUsage) {
        if (dailyUsage.used + count > dailyUsage.limit) {
          return false;
        }
      } else {
        // If no daily record exists, create one
        const newDailyUsage = this.dailyCreditsUsageRepository.create({
          userId,
          date: today,
          used: 0,
          limit: PLANS.free.features.dailyLimit,
        });
        await this.dailyCreditsUsageRepository.save(newDailyUsage);
      }

      // Check monthly limit - use UTC dates
      const firstDayOfMonth = dayjs.utc().startOf('month').toDate();
      const lastDayOfMonth = dayjs.utc().endOf('month').toDate();

      // Get or create periodic usage record for this month
      const periodicUsage = await this.getOrCreatePeriodicUsage(
        userId,
        null,
        'free',
        PLANS.free.features.monthlyLimit,
        firstDayOfMonth,
        lastDayOfMonth,
      );

      return periodicUsage.used + count <= periodicUsage.limit;
    }

    // For pro+lifetime users
    else if (activePlan === 'pro+lt_credits') {
      // Check pro plan first
      const proUsage = await this.getCurrentPeriodicUsage(userId, 'pro');

      // If pro has enough credits, allow it
      if (proUsage && proUsage.used + count <= proUsage.limit) {
        return true;
      }

      // Otherwise, check lifetime credits
      const ltUsage = await this.getCurrentPeriodicUsage(userId, 'lt_credits');
      return ltUsage ? ltUsage.used + count <= ltUsage.limit : false;
    }

    // For pro or lifetime users
    else {
      const plan = activePlan === 'pro' ? 'pro' : 'lt_credits';
      const usage = await this.getCurrentPeriodicUsage(userId, plan);
      return usage ? usage.used + count <= usage.limit : false;
    }
  }

  /**
   * Create a periodic usage record for a new subscription period
   * @param userId User ID
   * @param subscriptionId Subscription ID (null for free plans)
   * @param plan Plan code
   * @param limit Credit limit
   * @param periodStart Period start date in UTC
   * @param periodEnd Period end date in UTC
   * @returns The created record
   */
  async createPeriodicUsageRecord(
    userId: string,
    subscriptionId: string | null,
    plan: string,
    limit: number,
    periodStart: Date,
    periodEnd: Date,
  ): Promise<PeriodicCreditsUsage> {
    // Set any current period to false for this user and plan
    if (subscriptionId) {
      await this.periodicCreditsUsageRepository.update(
        { subscriptionId, currentPeriod: true },
        { currentPeriod: false },
      );
    } else {
      // For free users, update based on userId and plan only
      await this.periodicCreditsUsageRepository.update(
        {
          userId,
          plan,
          currentPeriod: true,
        },
        { currentPeriod: false },
      );
    }

    // Create new record
    const periodicUsage = new PeriodicCreditsUsage();
    periodicUsage.userId = userId;
    if (subscriptionId) {
      periodicUsage.subscriptionId = subscriptionId;
    }
    periodicUsage.plan = plan;
    periodicUsage.used = 0;
    periodicUsage.limit = limit;
    periodicUsage.periodStart = periodStart;
    periodicUsage.periodEnd = periodEnd;
    periodicUsage.currentPeriod = true;

    return this.periodicCreditsUsageRepository.save(periodicUsage);
  }

  /**
   * Get a user's current periodic usage record for a specific plan
   * @param userId User ID
   * @param plan Plan code
   * @returns Current usage record or null
   */
  private async getCurrentPeriodicUsage(
    userId: string,
    plan: string,
  ): Promise<PeriodicCreditsUsage | null> {
    return this.periodicCreditsUsageRepository.findOne({
      where: {
        userId,
        plan,
        currentPeriod: true,
      },
    });
  }

  /**
   * Get or create a periodic usage record
   * @param userId User ID
   * @param subscriptionId Subscription ID (null for free plans)
   * @param plan Plan code
   * @param limit Credit limit
   * @param periodStart Period start date in UTC
   * @param periodEnd Period end date in UTC
   * @returns The usage record
   */
  private async getOrCreatePeriodicUsage(
    userId: string,
    subscriptionId: string | null,
    plan: string,
    limit: number,
    periodStart: Date,
    periodEnd: Date,
  ): Promise<PeriodicCreditsUsage> {
    // Try to find an existing record - create where query
    const whereQuery: Record<string, any> = {
      userId,
      plan,
      currentPeriod: true,
    };

    const existingUsage = await this.periodicCreditsUsageRepository.findOne({
      where: whereQuery,
    });

    if (existingUsage) {
      return existingUsage;
    }

    // Create a new record if not found
    return this.createPeriodicUsageRecord(
      userId,
      subscriptionId,
      plan,
      limit,
      periodStart,
      periodEnd,
    );
  }

  /**
   * Record usage for a free plan user
   * @param userId User ID
   * @param count Number of credits to use
   */
  private async recordFreeUsage(userId: string, count: number): Promise<void> {
    // Update daily usage - use UTC date
    const today = dayjs.utc().startOf('day').toDate();

    let dailyUsage = await this.getDailyUsage(userId, today);

    if (!dailyUsage) {
      // Create new daily usage record
      dailyUsage = this.dailyCreditsUsageRepository.create({
        userId,
        date: today,
        used: 0,
        limit: PLANS.free.features.dailyLimit,
      });
    }

    dailyUsage.used += count;
    await this.dailyCreditsUsageRepository.save(dailyUsage);

    // Update monthly usage - use UTC dates
    const firstDayOfMonth = dayjs.utc().startOf('month').toDate();
    const lastDayOfMonth = dayjs.utc().endOf('month').toDate();

    // Get or create periodic usage for this month
    const periodicUsage = await this.getOrCreatePeriodicUsage(
      userId,
      null,
      'free',
      PLANS.free.features.monthlyLimit,
      firstDayOfMonth,
      lastDayOfMonth,
    );

    periodicUsage.used += count;
    await this.periodicCreditsUsageRepository.save(periodicUsage);
  }

  /**
   * Record usage for a pro plan user
   * @param userId User ID
   * @param count Number of credits to use
   * @returns Whether the usage was successfully recorded
   */
  private async recordProUsage(
    userId: string,
    count: number,
  ): Promise<boolean> {
    const proUsage = await this.getCurrentPeriodicUsage(userId, 'pro');

    if (!proUsage) {
      return false;
    }

    // Check if enough credits remain
    if (proUsage.used + count > proUsage.limit) {
      return false;
    }

    // Update usage
    proUsage.used += count;
    await this.periodicCreditsUsageRepository.save(proUsage);

    return true;
  }

  /**
   * Record usage for a lifetime credits user
   * @param userId User ID
   * @param count Number of credits to use
   */
  private async recordLifetimeUsage(
    userId: string,
    count: number,
  ): Promise<void> {
    const ltUsage = await this.getCurrentPeriodicUsage(userId, 'lt_credits');

    if (!ltUsage) {
      throw new BadRequestException('No lifetime credits record found');
    }

    // Update usage
    ltUsage.used += count;
    await this.periodicCreditsUsageRepository.save(ltUsage);
  }
}
