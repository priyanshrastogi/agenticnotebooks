import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';

import { RequestWithUser } from '@/common/types/request.types';

import { CreditsUsageService } from '../credits-usage.service';

@Injectable()
export class CreditsGuard implements CanActivate {
  constructor(private readonly creditsUsageService: CreditsUsageService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    // Check if user exists and has ID
    if (!request.user || !request.user.id) {
      return false;
    }

    // Check if the user can use 1 credit (default count)
    const allowed = await this.creditsUsageService.validateUsageAllowed(
      request.user.id,
      request.user.activePlan,
    );

    if (!allowed) {
      throw new HttpException(
        {
          message: 'Usage limit exceeded',
          code: 'CREDITS_LIMIT_EXCEEDED',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
