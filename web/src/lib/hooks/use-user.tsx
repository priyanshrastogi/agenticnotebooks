'use client';

import { useQuery } from '@tanstack/react-query';

import { userApi } from '@/lib/fetch/user';
import { useAuth } from '@/lib/hooks/use-auth';

export interface User {
  email: string;
  name?: string;
  id: string;
  emailVerified: boolean;
  active: boolean;
  createdAt: string;
  lastLogin?: string | null;
}

export function useUser() {
  const { accessToken, isAuthenticated } = useAuth();

  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      if (!accessToken) return null;
      return userApi.getCurrentUser(accessToken);
    },
    enabled: isAuthenticated,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  return {
    user: user as User | null,
    isLoading,
    error,
    refetch,
  };
}
