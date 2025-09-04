import React from 'react';

import { AppNavbar, NavItem } from '@/components/blocks/app-navbar';
import { handleSmoothScroll } from '@/lib/scroll-utils';

// Define the landing page navigation items
const landingNavItems: NavItem[] = [
  { label: 'Features', href: '#features' },
  { label: 'Privacy', href: '#privacy' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Use Cases', href: '#use-cases' },
  { label: 'FAQs', href: '#faqs' },
];

export function LandingHeader() {
  // Create a wrapper on top of the nav items to handle the click event
  const navItemsWithSmoothScroll = landingNavItems.map((item) => ({
    ...item,
    onClick: (e: React.MouseEvent<HTMLAnchorElement>) => handleSmoothScroll(e, item.href),
  }));

  return <AppNavbar navItems={navItemsWithSmoothScroll} isLandingPage={true} />;
}
