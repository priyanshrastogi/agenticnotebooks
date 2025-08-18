import './globals.css';

import { GoogleAnalytics } from '@next/third-parties/google';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import type { Metadata } from 'next';

import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Intellicharts | Analyze Spreadsheets with Natural Language, Privately',
  description:
    'Transform Excel & CSV files into insights without formulas or coding. Intellicharts uses natural language to analyze, visualize, and clean your data while keeping it private in your browser.',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', type: 'image/png', sizes: '32x32' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180' }],
  },
  applicationName: 'Intellicharts',
  appleWebApp: {
    capable: true,
    title: 'Intellicharts',
    statusBarStyle: 'default',
  },
  formatDetection: {
    telephone: false,
  },
  manifest: '/site.webmanifest',
  // Open Graph metadata
  openGraph: {
    type: 'website',
    siteName: 'Intellicharts',
    title: 'Intellicharts | Analyze Spreadsheets with Natural Language, Privately',
    description:
      'Transform Excel & CSV files into insights without formulas or coding. Intellicharts uses natural language to analyze, visualize, and clean your data while keeping it private in your browser.',
    url: 'https://intellicharts.com',
    images: [
      {
        url: 'https://intellicharts.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Intellicharts - Spreadsheet analysis with natural language',
      },
    ],
    locale: 'en_US',
  },
  // Twitter card metadata
  twitter: {
    card: 'summary_large_image',
    title: 'Intellicharts | Analyze Spreadsheets with Natural Language',
    description:
      'Transform Excel & CSV files into insights without formulas or coding. Intellicharts uses natural language to analyze, visualize, and clean your data while keeping it private in your browser.',
    images: ['https://intellicharts.com/twitter-image.png'],
    creator: '@intellicharts',
    site: '@intellicharts',
  },
  // Additional metadata
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://intellicharts.com',
  },
};

// JSON-LD structured data component
interface SchemaOrgOffer {
  '@type': 'Offer';
  price: string;
  priceCurrency: string;
}

interface SoftwareApplicationSchema {
  '@context': 'https://schema.org';
  '@type': 'SoftwareApplication';
  name: string;
  applicationCategory: string;
  offers: SchemaOrgOffer;
  operatingSystem: string;
  description: string;
  url: string;
}

function JsonLd({ data }: { data: SoftwareApplicationSchema }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Intellicharts',
            applicationCategory: 'BusinessApplication',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
            operatingSystem: 'Web',
            description:
              'Analyze, visualize, and clean Excel and CSV files without technical skills—all while your data stays completely private in your browser.',
            url: 'https://intellicharts.com',
          }}
        />
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable}`}>
        <Providers>{children}</Providers>
        {process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />}
      </body>
    </html>
  );
}
