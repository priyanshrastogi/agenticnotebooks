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
            Transform any data source into beautiful, customizable charts in seconds
            with our intelligent AI agent.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-16 md:grid-cols-2 md:gap-10 lg:grid-cols-4">
          {/* Step 1 */}
          <div className="relative">
            <div className="text-primary/20 absolute -top-8 left-0 text-5xl font-bold">1</div>
            <h3 className="mb-2 pl-0 text-xl font-semibold">Input Data</h3>
            <p className="text-muted-foreground">
              Paste JSON, upload CSV/XML, connect to APIs, or import HTML tables. Our AI agent
              accepts data in any format.
            </p>
          </div>
          {/* Step 2 */}
          <div className="relative">
            <div className="text-primary/20 absolute -top-8 left-0 text-5xl font-bold">2</div>
            <h3 className="mb-2 pl-0 text-xl font-semibold">AI Parsing</h3>
            <p className="text-muted-foreground">
              Our intelligent agent automatically understands your data structure, identifies patterns,
              and determines the best visualization type.
            </p>
          </div>
          {/* Step 3 */}
          <div className="relative">
            <div className="text-primary/20 absolute -top-8 left-0 text-5xl font-bold">3</div>
            <h3 className="mb-2 pl-0 text-xl font-semibold">Create Charts</h3>
            <p className="text-muted-foreground">
              Watch as beautiful, interactive charts are generated instantly. Choose from multiple
              chart types and layouts.
            </p>
          </div>
          {/* Step 4 */}
          <div className="relative">
            <div className="text-primary/20 absolute -top-8 left-0 text-5xl font-bold">4</div>
            <h3 className="mb-2 pl-0 text-xl font-semibold">Customize & Export</h3>
            <p className="text-muted-foreground">
              Fine-tune colors, labels, and styles. Export as PNG, SVG, or interactive HTML for
              presentations and reports.
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
