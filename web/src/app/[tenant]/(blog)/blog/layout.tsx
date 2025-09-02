import React from 'react';

import { AppNavbar } from '@/components/blocks/app-navbar';
import { PublicFooter } from '@/components/blocks/public-footer';

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <AppNavbar isLandingPage={true} />
      <main className="mt-[80px] flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
