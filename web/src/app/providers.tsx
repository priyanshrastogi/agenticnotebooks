'use client';

import { isServer, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import cookies from 'js-cookie';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { NavigationGuardProvider } from 'next-navigation-guard';
import { ThemeProvider } from 'next-themes';
import NextTopLoader from 'nextjs-toploader';
import React, { useEffect } from 'react';

import { refreshToken as refreshTokenAction } from '@/lib/actions/auth';
import { NavigationBlockerProvider } from '@/lib/contexts/navigation-blocker';
import { PostHogProvider } from '@/lib/contexts/posthog';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 10 * 60 * 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const refreshTokenOnMount = async () => {
      try {
        const result = await refreshTokenAction();
        if (result.success && result.tokens) {
          queryClient.setQueryData(['auth'], {
            accessToken: result.tokens.accessToken,
            isAuthenticated: true,
          });
        }
      } catch (error) {
        console.error('Failed to refresh token on mount:', error);
      }
    };

    if (cookies.get('loggedIn')) {
      refreshTokenOnMount();
    }

    const isRunningAsInstalledPWA =
      window.matchMedia('(display-mode: standalone)').matches ||
      // @ts-expect-error - standalone exists on iOS Safari but not in Navigator type
      window.navigator.standalone ||
      document.referrer.includes('android-app://');

    if (isRunningAsInstalledPWA && pathname === '/') {
      router.replace('/new');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <NavigationBlockerProvider>
        <NavigationGuardProvider>
          <PostHogProvider>
            <QueryClientProvider client={queryClient}>
              {process.env.NEXT_PUBLIC_APP_ENV === 'development' ? (
                <ReactQueryDevtools initialIsOpen={false} />
              ) : null}
              {children}
              <NextTopLoader color="oklch(0.596 0.145 163.225)" showSpinner={false} />
            </QueryClientProvider>
          </PostHogProvider>
        </NavigationGuardProvider>
      </NavigationBlockerProvider>
    </ThemeProvider>
  );
}
