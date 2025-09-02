import React from 'react';

import { getTenant } from '@/lib/tenant';
import { cn } from '@/lib/utils';

interface TenantLogoProps {
  className?: string;
  onlyIcon?: boolean;
}

export default async function TenantLogo({ className, onlyIcon }: TenantLogoProps) {
  const tenant = await getTenant();
  const LogoIcon = tenant.logoIcon;

  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
        <LogoIcon className="h-6 w-6 text-white" />
      </div>
      {!onlyIcon && (
        <span className="ml-1 flex items-center justify-center text-xl font-bold tracking-tight">
          <span className="">{tenant.name}</span>
        </span>
      )}
    </div>
  );
}