'use client';

import { Suspense } from 'react';

import ForgotPasswordComponent from '@/components/pages/Auth/ForgotPassword';

export default function ForgotPasswordPage() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <Suspense
        fallback={
          <div className="border-border w-full max-w-md rounded-lg border p-8 shadow-md">
            <h1 className="mb-6 text-center text-2xl font-bold">Loading...</h1>
          </div>
        }
      >
        <ForgotPasswordComponent />
      </Suspense>
    </div>
  );
}
