import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Allow subdomain access in development
  async rewrites() {
    return {
      beforeFiles: [
        // Handle subdomain routing in development
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: '(?<subdomain>intellicharts|agenticrows)\\.localhost',
            },
          ],
          destination: '/:path*',
        },
      ],
    };
  },
};

export default nextConfig;
