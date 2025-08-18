'use client';

import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useCredits } from '@/lib/hooks/use-credits';

export default function FreeMessageNotification() {
  const credits = useCredits();

  let message = '';

  const isRateLimited = credits.isRateLimited;
  const activePlan = credits.activePlan;
  const freeMessages = credits.dailyUsage?.remaining || 0;

  if (isRateLimited) {
    message =
      'You have reached the limit of your free plan. Please upgrade to a paid plan to continue.';
  } else if (activePlan === 'free' && freeMessages < 3) {
    message = `You have ${freeMessages} free message${freeMessages === 1 ? '' : 's'} remaining today.`;
  }

  if (activePlan !== 'free' || freeMessages >= 3) return null;

  return (
    <div className="bg-secondary/30 flex items-center justify-between px-4 py-3">
      <p className="text-sm">{message}</p>
      <div className="flex items-center gap-2">
        <Button variant="link" className="text-primary hover:text-primary/80 h-auto p-0">
          Upgrade Plan
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
