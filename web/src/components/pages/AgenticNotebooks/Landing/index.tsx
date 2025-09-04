'use client';

import { useTheme } from 'next-themes';
import React, { useEffect, useState } from 'react';

import { LandingAppPreview } from './sections/LandingAppPreview';
import { LandingFAQs } from './sections/LandingFAQs';
import { LandingFeatures } from './sections/LandingFeatures';
import { LandingFinalCTA } from './sections/LandingFinalCTA';
import { LandingFooter } from './sections/LandingFooter';
import { LandingHeader } from './sections/LandingHeader';
import { LandingHero } from './sections/LandingHero';
import { LandingHowItWorks } from './sections/LandingHowItWorks';
import { LandingPrivacy } from './sections/LandingPrivacy';
import { LandingUseCases } from './sections/LandingUseCases';

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div>
      <LandingHeader />
      <LandingHero isDarkTheme={resolvedTheme === 'dark'} mounted={mounted} />
      <LandingAppPreview />
      <LandingFeatures />
      <LandingPrivacy />
      <LandingHowItWorks />
      <LandingUseCases />
      <LandingFAQs />
      <LandingFinalCTA />
      <LandingFooter />
    </div>
  );
}
