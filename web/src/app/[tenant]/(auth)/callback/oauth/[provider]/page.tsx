'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'next/navigation';
import { useTopLoader } from 'nextjs-toploader';
import { useEffect, useRef,useState } from 'react';

import { Card, CardContent, CardDescription,CardHeader, CardTitle } from '@/components/ui/card';
import { googleAuthCallback } from '@/lib/actions/auth';

export default function OAuthCallbackPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const loader = useTopLoader();
  const queryClient = useQueryClient();
  const processedRef = useRef(false);

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  const provider = params.provider as string;
  const code = searchParams.get('code');

  useEffect(() => {
    if (processedRef.current) return;

    const handleCallback = async () => {
      processedRef.current = true;
      loader.start();

      try {
        if (!code) {
          throw new Error('No authorization code received');
        }

        if (provider === 'google') {
          const result = await googleAuthCallback({ code });

          if (result.success) {
            queryClient.setQueryData(['auth'], {
              accessToken: result.accessToken,
              isAuthenticated: true,
            });

            setStatus('success');

            if (window.opener && !window.opener.closed) {
              window.opener.postMessage('google-auth-success', window.location.origin);
              setTimeout(() => window.close(), 1000);
            }
          } else {
            setError(result.error || 'Authentication failed');
            setStatus('error');
          }
        } else {
          setError(`Unsupported provider: ${provider}`);
          setStatus('error');
        }
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError('An unexpected error occurred during authentication');
        setStatus('error');
      } finally {
        loader.done();
      }
    };

    handleCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, code]);

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            {status === 'loading' && 'Authenticating...'}
            {status === 'success' && 'Authentication Successful'}
            {status === 'error' && 'Authentication Failed'}
          </CardTitle>
          {status === 'success' && (
            <CardDescription className="text-center">
              You have successfully signed in with{' '}
              {provider.charAt(0).toUpperCase() + provider.slice(1)}.
              {window.opener ? ' Closing this window...' : ' Redirecting...'}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {status === 'loading' && (
            <div className="flex justify-center">
              <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2 border-t-2"></div>
            </div>
          )}
          {status === 'error' && error && (
            <div className="bg-destructive/10 text-destructive rounded-md p-4 text-center">
              <p>{error}</p>
              <button
                onClick={() => {
                  if (window.opener) {
                    window.close();
                  } else {
                    window.location.href = '/auth?mode=login';
                  }
                }}
                className="text-primary mt-4 text-sm font-medium hover:underline"
              >
                {window.opener ? 'Close this window' : 'Return to login'}
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
