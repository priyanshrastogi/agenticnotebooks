import { ChevronRight } from 'lucide-react';
import React from 'react';

import Link from '@/components/blocks/custom-link';
import { Button } from '@/components/ui/button';

export function LandingFinalCTA() {
  return (
    <section className="bg-primary dark:bg-primary/80 relative z-10 py-24">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="mb-6 text-3xl font-bold md:text-4xl">Start Analyzing Your Data Today</h2>
        <p className="text-foreground/90 mx-auto mb-10 max-w-2xl text-lg">
          Join thousands of users who are already saving time and gaining insights from their data
          with AgenticNotebooks.
        </p>
        <Link href="/new">
          <Button
            size="lg"
            variant="secondary"
            className="h-auto w-full rounded-md px-8 py-3 text-base font-semibold sm:w-auto"
          >
            <span>Try AgenticNotebooks Free</span>
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
