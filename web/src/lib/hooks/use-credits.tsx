import { useQuery, useQueryClient } from '@tanstack/react-query';

import { CreditsUsageData,fetchCreditsUsage } from '@/lib/fetch/credits';

import { useAuth } from './use-auth';

export const CREDITS_QUERY_KEY = ['creditsUsage'];

/**
 * Hook for fetching and managing the user's credits usage
 */
export function useCredits() {
  const { accessToken, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery<CreditsUsageData>({
    queryKey: CREDITS_QUERY_KEY,
    queryFn: () => {
      if (!accessToken) {
        const { accessToken } = queryClient.getQueryData(['auth']) as { accessToken: string };
        return fetchCreditsUsage(accessToken);
      }
      return fetchCreditsUsage(accessToken);
    },
    enabled: isAuthenticated,
  });

  return {
    isRateLimited: data?.isRateLimited || false,
    activePlan: data?.activePlan,
    isLoading,
    isError,
    error,
    refetch,
    dailyUsage: data?.dailyUsage,
    periodicUsage: data?.periodicUsage,
    hasCredits: () => !data?.isRateLimited,
  };
}
