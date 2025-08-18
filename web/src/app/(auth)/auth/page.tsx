import { Metadata } from 'next';
import { Suspense } from 'react';

import AuthForm from '@/components/pages/Auth/AuthForm';

export const metadata: Metadata = {
  title: 'Sign In or Sign Up | Intellicharts',
  description:
    'Sign in to your Intellicharts account or create a new account to analyze your spreadsheet data.',
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://intellicharts.com/auth',
  },
};

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: 'login' | 'signup' }>;
}) {
  const resolvedSearchParams = await searchParams;
  const modeParam = resolvedSearchParams.mode;
  const mode = typeof modeParam === 'string' ? (modeParam as 'login' | 'signup') : undefined;

  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <Suspense
        fallback={
          <div className="border-border w-full max-w-md rounded-lg border p-8 shadow-md">
            <h1 className="mb-6 text-center text-2xl font-bold">Loading...</h1>
          </div>
        }
      >
        <AuthForm initialMode={mode} />
      </Suspense>
    </div>
  );
}
