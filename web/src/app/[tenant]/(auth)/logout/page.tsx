'use client';

import { LogOut } from 'lucide-react';
import { useTopLoader } from 'nextjs-toploader';
import { useEffect } from 'react';

import { logout } from '@/lib/actions/auth';

export default function LogoutPage() {
  const loader = useTopLoader();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        loader.start();
        const result = await logout();

        if (result.success) {
          window.location.href = '/';
        } else {
          console.error('Logout failed:', result.error);
          loader.done();
        }
      } catch (error) {
        console.error('An error occurred during logout:', error);
        loader.done();
      }
    };
    handleLogout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <div className="border-border w-full max-w-md rounded-lg border p-8 text-center shadow-md">
        <div className="mb-4 flex justify-center">
          <LogOut className="text-primary h-12 w-12" />
        </div>
        <h1 className="mb-3 text-2xl font-bold">Logging out...</h1>
        <p className="text-muted-foreground">
          Thank you for using Intellicharts. You are being securely logged out of your account.
        </p>
      </div>
    </div>
  );
}
