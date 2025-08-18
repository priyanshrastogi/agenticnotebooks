import { Metadata } from 'next';

import { BlogHeader, BlogList } from '@/components/pages/Blog';
import { getSortedPostsData } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Blog | Intellicharts',
  description:
    'Latest news, tutorials, and insights about spreadsheet analysis, data privacy, and more.',
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://intellicharts.com/blog',
  },
};

export default function BlogIndexPage() {
  const allPostsData = getSortedPostsData();

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <BlogHeader
        title="Blog"
        description="Latest news, tutorials, and insights about spreadsheet analysis, data privacy, and more."
      />
      <BlogList posts={allPostsData} />
    </div>
  );
}
