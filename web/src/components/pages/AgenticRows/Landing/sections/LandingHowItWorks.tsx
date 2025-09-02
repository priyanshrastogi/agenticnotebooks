import { ChevronRight } from 'lucide-react';
import React from 'react';

import Link from '@/components/blocks/custom-link';
import { Button } from '@/components/ui/button';

export function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="relative z-10 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">How It Works</h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Get insights from your data in just a few simple steps, all while keeping your data
            private.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-16 md:grid-cols-2 md:gap-10 lg:grid-cols-4">
          {/* Step 1 */}
          <div className="relative">
            <div className="text-primary/20 absolute -top-8 left-0 text-5xl font-bold">1</div>
            <h3 className="mb-2 pl-0 text-xl font-semibold">Import</h3>
            <p className="text-muted-foreground">
              Import your Excel or CSV files. JavaScript in your browser processes the data
              locally—nothing is uploaded to our servers.
            </p>
          </div>
          {/* Step 2 */}
          <div className="relative">
            <div className="text-primary/20 absolute -top-8 left-0 text-5xl font-bold">2</div>
            <h3 className="mb-2 pl-0 text-xl font-semibold">Ask</h3>
            <p className="text-muted-foreground">
              Ask questions in plain English. Only column metadata (names, datatypes) and your query
              are sent to our AI—never your actual data.
            </p>
          </div>
          {/* Step 3 */}
          <div className="relative">
            <div className="text-primary/20 absolute -top-8 left-0 text-5xl font-bold">3</div>
            <h3 className="mb-2 pl-0 text-xl font-semibold">Analyze</h3>
            <p className="text-muted-foreground">
              Our AI returns processing instructions that execute in your browser. Analyze and
              visualize while your data stays private.
            </p>
          </div>
          {/* Step 4 */}
          <div className="relative">
            <div className="text-primary/20 absolute -top-8 left-0 text-5xl font-bold">4</div>
            <h3 className="mb-2 pl-0 text-xl font-semibold">Refine</h3>
            <p className="text-muted-foreground">
              Continue the conversation to modify your analysis or export results. All
              transformations occur locally in your browser.
            </p>
          </div>
        </div>
        <div className="mt-16 text-center">
          <Link href="/new">
            <Button
              className="h-auto w-full rounded-md px-8 py-3 text-base font-semibold sm:w-auto"
              size="lg"
            >
              <span>Try It Yourself</span>
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
