import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { BlogPostContent } from '@/components/pages/Blog';
import { getAllPostSlugs, getPostData } from '@/lib/blog';
import type { Tenant } from '@/lib/tenant';

interface BlogPostProps {
  params: Promise<{ slug: string; tenant: Tenant }>;
}

export async function generateMetadata({
  params,
}: BlogPostProps): Promise<Metadata> {
  try {
    const { slug, tenant } = await params;
    const post = await getPostData(slug, tenant);
    
    const siteNames = {
      agenticnotebooks: 'AgenticNotebooks',
      intellicharts: 'IntelliCharts',
    };
    
    const siteName = siteNames[tenant] || siteNames.agenticnotebooks;
    
    return {
      title: `${post.title} | ${siteName} Blog`,
      description: post.excerpt,
      openGraph: {
        title: `${post.title} | ${siteName} Blog`,
        description: post.excerpt,
        images: [post.coverImage || ''],
      },
    };
  } catch {
    return {
      title: 'Blog Post',
      description: 'Read our latest blog post about data analysis and insights.',
    };
  }
}

export async function generateStaticParams() {
  // Generate params for both tenants
  const agenticnotebooksSlugs = getAllPostSlugs('agenticnotebooks');
  const intellichartsSlugs = getAllPostSlugs('intellicharts');
  
  const params = [
    ...agenticnotebooksSlugs.map(({ slug }) => ({ tenant: 'agenticnotebooks', slug })),
    ...intellichartsSlugs.map(({ slug }) => ({ tenant: 'intellicharts', slug })),
  ];
  
  return params;
}

export default async function BlogPost({ params }: BlogPostProps) {
  try {
    const { slug, tenant } = await params;
    const post = await getPostData(slug, tenant);

    return (
      <div className="container mx-auto max-w-7xl px-6 py-16">
        <BlogPostContent post={post} />
      </div>
    );
  } catch {
    notFound();
  }
}
