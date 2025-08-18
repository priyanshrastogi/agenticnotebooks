'use client';

import { BarChart3, Brain, Cpu, Database, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

type LoadingMessage = {
  text: string;
  icon: React.ElementType;
};

type LoadingIndicatorProps = {
  className?: string;
};

export default function LoadingIndicator({ className }: LoadingIndicatorProps) {
  const [loadingPhase, setLoadingPhase] = useState(0);

  const loadingMessages: LoadingMessage[] = [
    {
      text: 'Processing your request...',
      icon: Cpu,
    },
    {
      text: 'Crunching your data...',
      icon: Database,
    },
    {
      text: 'Analyzing patterns...',
      icon: BarChart3,
    },
    {
      text: 'Generating insights...',
      icon: Brain,
    },
    {
      text: 'Finishing things up...',
      icon: Sparkles,
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingPhase((prev) => (prev + 1) % loadingMessages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [loadingMessages.length]);

  const CurrentIcon = loadingMessages[loadingPhase].icon;

  return (
    <div className={cn('flex justify-start', className)}>
      <div className="w-full">
        <div className="flex w-fit max-w-[80%] items-center gap-2 p-3">
          <CurrentIcon className="text-muted-foreground h-4 w-4 animate-pulse" />
          <p className="text-muted-foreground animate-pulse text-sm">
            {loadingMessages[loadingPhase].text}
          </p>
        </div>
      </div>
    </div>
  );
}
