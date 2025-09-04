import { Controller, Get, HttpStatus, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { RequestWithUser } from '@/common/types/request.types';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';

import { CreditsUsageService } from './credits-usage.service';
import { CreditsUsageResponseDto } from './dto/credits-usage-response.dto';

@ApiTags('Credits')
@ApiBearerAuth('JWT-auth')
@Controller('credits')
export class CreditsUsageController {
  constructor(private readonly creditsUsageService: CreditsUsageService) {}

  @ApiOperation({ summary: "Get current user's usage summary" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Returns the user's usage summary",
    type: CreditsUsageResponseDto,
  })
  @UseGuards(JwtAuthGuard)
  @Get('usage')
  async getUsageSummary(@Req() request: RequestWithUser): Promise<CreditsUsageResponseDto> {
    const userId = request.user.id;
    const activePlan = request.user.activePlan;
    return this.creditsUsageService.getUserUsageSummary(userId, activePlan);
  }
}
