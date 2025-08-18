import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { BlogPostContent } from '@/components/pages/Blog';
import { getAllPostSlugs, getPostData } from '@/lib/blog';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;
    const post = await getPostData(slug);
    return {
      title: `${post.title} | Intellicharts Blog`,
      description: post.excerpt,
      openGraph: {
        title: `${post.title} | Intellicharts Blog`,
        description: post.excerpt,
        images: [post.coverImage || ''],
      },
      alternates: {
        canonical: `https://intellicharts.com/blog/${post.slug}`,
      },
    };
  } catch {
    return {
      title: 'Blog Post | Intellicharts',
      description: 'Read our latest blog post about spreadsheet analysis and data privacy.',
    };
  }
}

export async function generateStaticParams() {
  const slugs = getAllPostSlugs();
  return slugs;
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const post = await getPostData(slug);

    return (
      <div className="container mx-auto max-w-6xl px-6 py-16">
        <BlogPostContent post={post} />
      </div>
    );
  } catch {
    notFound();
  }
}
