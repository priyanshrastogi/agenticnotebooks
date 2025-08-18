import { instance } from '@/lib/axios';

export interface DailyUsageData {
  date: string;
  used: number;
  limit: number;
  remaining: number;
}

export interface PeriodicUsageData {
  plan: string;
  periodStart: Date;
  periodEnd: Date;
  used: number;
  limit: number;
  remaining: number;
  usagePercentage: number;
}

export interface CreditsUsageData {
  dailyUsage?: DailyUsageData;
  periodicUsage: PeriodicUsageData[];
  activePlan: string;
  isRateLimited: boolean;
}

export async function fetchCreditsUsage(accessToken: string): Promise<CreditsUsageData> {
  const response = await instance.get<CreditsUsageData>('/credits/usage', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
}
