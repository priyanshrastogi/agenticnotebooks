import { Metadata } from 'next';

import { BlogHeader, BlogList } from '@/components/pages/Blog';
import { getSortedPostsData } from '@/lib/blog';
import type { Tenant } from '@/lib/tenant';

interface BlogPageProps {
  params: {
    tenant: Tenant;
  };
}

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Latest news, tutorials, and insights about data analysis and visualization.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function BlogIndexPage({ params }: BlogPageProps) {
  const { tenant } = params;
  const allPostsData = getSortedPostsData(tenant);

  // Tenant-specific metadata
  const tenantTitles = {
    intellicharts: 'Latest insights about data visualization and AI-powered charts',
    agenticrows: 'Latest insights about spreadsheet analysis and AI agents',
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <BlogHeader
        title="Blog"
        description={tenantTitles[tenant] || tenantTitles.intellicharts}
      />
      <BlogList posts={allPostsData} />
    </div>
  );
}
