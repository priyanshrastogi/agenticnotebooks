import { ApiProperty } from '@nestjs/swagger';

export class DailyUsageDto {
  @ApiProperty({
    description: 'Date of usage',
    example: '2023-01-01',
  })
  date: string;

  @ApiProperty({
    description: 'Number of credits used on this date',
    example: 3,
  })
  used: number;

  @ApiProperty({
    description: 'Daily credit limit',
    example: 3,
  })
  limit: number;

  @ApiProperty({
    description: 'Remaining credits for the day',
    example: 0,
  })
  remaining: number;
}

export class PeriodicUsageDto {
  @ApiProperty({
    description: 'Plan type',
    example: 'pro',
  })
  plan: string;

  @ApiProperty({
    description: 'Period start date',
    example: '2023-01-01T00:00:00.000Z',
  })
  periodStart: Date;

  @ApiProperty({
    description: 'Period end date',
    example: '2023-02-01T00:00:00.000Z',
  })
  periodEnd: Date;

  @ApiProperty({
    description: 'Number of credits used in this period',
    example: 150,
  })
  used: number;

  @ApiProperty({
    description: 'Credit limit for this period',
    example: 600,
  })
  limit: number;

  @ApiProperty({
    description: 'Remaining credits for this period',
    example: 450,
  })
  remaining: number;

  @ApiProperty({
    description: 'Usage percentage',
    example: 25,
  })
  usagePercentage: number;
}

export class CreditsUsageResponseDto {
  @ApiProperty({
    description: 'Daily usage information for free plan users',
    type: DailyUsageDto,
    required: false,
  })
  dailyUsage?: DailyUsageDto;

  @ApiProperty({
    description: 'Periodic (monthly/lifetime) usage information',
    type: [PeriodicUsageDto],
  })
  periodicUsage: PeriodicUsageDto[];

  @ApiProperty({
    description: "User's active plan",
    example: 'pro',
  })
  activePlan: string;

  @ApiProperty({
    description: 'Whether the user is currently rate limited',
    example: false,
  })
  isRateLimited: boolean;
}
