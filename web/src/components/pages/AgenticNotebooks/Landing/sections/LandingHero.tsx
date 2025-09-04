import { ChevronRight } from 'lucide-react';
import React from 'react';

import Link from '@/components/blocks/custom-link';
import { FlickeringGrid } from '@/components/magicui/flickering-grid';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { handleSmoothScroll } from '@/lib/scroll-utils';

interface LandingHeroProps {
  isDarkTheme: boolean;
  mounted: boolean;
}

export function LandingHero({ isDarkTheme, mounted }: LandingHeroProps) {
  return (
    <div className="relative pb-20 pt-28 md:pb-24 md:pt-36">
      <div className="absolute inset-0 z-0">
        {mounted && (
          <>
            <FlickeringGrid
              className="relative inset-0 z-0 [mask-image:radial-gradient(450px_circle_at_center,white,transparent)]"
              squareSize={4}
              gridGap={6}
              color={isDarkTheme ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)'}
              maxOpacity={0.5}
              flickerChance={0.1}
            />
            <div
              className="pointer-events-none absolute inset-0 z-10"
              style={{ backdropFilter: 'blur(2px)' }}
            />
          </>
        )}
      </div>
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 mb-6 rounded-full px-4 py-1.5 text-sm font-medium transition-colors">
            #1 Privacy-First AI Spreadsheet Tool
          </Badge>
          <h1 className="mb-6 max-w-5xl text-5xl font-bold leading-[1.1] tracking-tight md:text-6xl lg:text-7xl">
            Talk to Your Spreadsheets, Get Insights in Seconds
          </h1>
          <p className="text-muted-foreground mt-6 max-w-2xl text-xl font-medium leading-relaxed">
            Analyze, visualize, and clean Excel and CSV files without technical skills—all while
            your data stays completely private in your browser.
          </p>
          <div className="flex flex-col items-center gap-6 pt-12 sm:flex-row">
            <Link href="/new">
              <Button
                size="lg"
                className="h-auto w-full rounded-md px-8 py-3 text-base font-semibold sm:w-auto"
              >
                <span>Try AgenticNotebooks Free</span>
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#how-it-works" onClick={(e) => handleSmoothScroll(e, '#how-it-works')}>
              <Button
                variant="outline"
                size="lg"
                className="h-auto w-full rounded-md px-8 py-3 text-base font-semibold sm:w-auto"
              >
                <span>See How It Works</span>
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
