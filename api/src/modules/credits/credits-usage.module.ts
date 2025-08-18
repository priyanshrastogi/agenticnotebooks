import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  DailyCreditsUsage,
  PeriodicCreditsUsage,
  User,
  UserRole,
} from '@/common/entities';

import { CreditsUsageController } from './credits-usage.controller';
import { CreditsUsageService } from './credits-usage.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DailyCreditsUsage,
      PeriodicCreditsUsage,
      User,
      UserRole,
    ]),
  ],
  controllers: [CreditsUsageController],
  providers: [CreditsUsageService],
  exports: [CreditsUsageService],
})
export class CreditsUsageModule {}
