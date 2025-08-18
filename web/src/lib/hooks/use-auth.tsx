import { useQuery } from '@tanstack/react-query';

import { refreshToken as refreshTokenAction } from '@/lib/actions/auth';

export interface Auth {
  accessToken: string | null;
  isAuthenticated: boolean;
}

export function useAuth(): Auth { 
  const authQuery = useQuery({
    queryKey: ['auth'],
    queryFn: async () => {
      const result = await refreshTokenAction();
      if(result.success && result.tokens) {
        return {
          accessToken: result.tokens.accessToken,
          isAuthenticated: true,
        }
      }
      return {
        accessToken: null,
        isAuthenticated: false,
      }
    },
    retry: false,
    enabled: false,
    staleTime: 12 * 60 * 60 * 1000,
  });

  return authQuery.data || { accessToken: null, isAuthenticated: false };
}
