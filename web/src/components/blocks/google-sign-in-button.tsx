'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useTopLoader } from 'nextjs-toploader';
import { useEffect,useState } from 'react';

import { Button } from '@/components/ui/button';
import { getGoogleAuthUrl, refreshToken } from '@/lib/actions/auth';

interface GoogleSignInButtonProps {
  className?: string;
  variant?: 'default' | 'secondary' | 'outline';
  fullWidth?: boolean;
  onAuthComplete?: () => void;
}

export function GoogleSignInButton({
  className = '',
  variant = 'outline',
  fullWidth = false,
  onAuthComplete,
}: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loader = useTopLoader();
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data === 'google-auth-success') {
        try {
          const result = await refreshToken();
          if (result.success && result.tokens) {
            queryClient.setQueryData(['auth'], {
              accessToken: result.tokens.accessToken,
              isAuthenticated: true,
            });
            onAuthComplete?.();
          } else if (result.error) {
            console.error('Failed to refresh token:', result.error);
          }
        } catch (err) {
          console.error('Error refreshing token:', err);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryClient]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    loader.start();

    try {
      const result = await getGoogleAuthUrl();

      if (result.url) {
        // Try to open a popup window
        const width = 500;
        const height = 600;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2.5;

        const popup = window.open(
          result.url,
          'google-oauth',
          `width=${width},height=${height},left=${left},top=${top},popup=true`
        );

        // If popup is blocked or closed, open in the same window
        if (!popup || popup.closed) {
          setError('Popup was blocked. Redirecting in the same window...');
          setTimeout(() => {
            window.location.href = result.url;
          }, 1500);
        }
      } else {
        setError(result.error || 'Failed to initialize Google sign-in');
      }
    } catch (err) {
      console.error('Google sign-in error:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
      loader.done();
    }
  };

  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      <Button
        variant={variant}
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className={`flex h-10 items-center gap-2 ${fullWidth ? 'w-full' : ''} ${className}`}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
          <g transform="matrix(1, 0, 0, 1, 0, 0)">
            <path
              d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5.22,16.25 5.22,12.21C5.22,8.17 8.36,5.15 12.19,5.15C15.29,5.15 17.1,6.78 17.1,6.78L19.05,4.74C19.05,4.74 16.56,2.42 12.1,2.42C6.42,2.42 2.03,7.06 2.03,12.21C2.03,17.36 6.4,22 12.25,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1Z"
              fill="currentColor"
            />
          </g>
        </svg>
        {isLoading ? 'Loading...' : 'Sign in with Google'}
      </Button>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
