import { Grid2X2CheckIcon } from 'lucide-react';
import React from 'react';

import { cn } from '@/lib/utils';

export default function Logo({ className, onlyIcon }: { className?: string; onlyIcon?: boolean }) {
  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
        <Grid2X2CheckIcon className="h-6 w-6 text-white" />
      </div>
      {!onlyIcon && (
        <span className="ml-1 flex items-center justify-center text-xl font-bold tracking-tight">
          <span className="">Intellicharts</span>
        </span>
      )}
    </div>
  );
}
