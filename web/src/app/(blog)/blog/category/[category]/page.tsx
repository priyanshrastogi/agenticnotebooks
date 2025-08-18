import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { BlogHeader, BlogList } from '@/components/pages/Blog';
import { getCategoryPosts, getSortedPostsData } from '@/lib/blog';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);
  const categoryDisplay = decodedCategory.charAt(0).toUpperCase() + decodedCategory.slice(1);

  return {
    title: `${categoryDisplay} | Intellicharts Blog`,
    description: `Articles about ${decodedCategory} in Intellicharts blog.`,
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `https://intellicharts.com/blog/category/${category}`,
    },
  };
}

export function generateStaticParams() {
  const allPosts = getSortedPostsData();
  const categories = new Set<string>();

  allPosts.forEach((post) => {
    if (post.tags) {
      post.tags.forEach((tag) => {
        categories.add(tag.toLowerCase());
      });
    }
  });

  return Array.from(categories).map((category) => ({
    category,
  }));
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);
  const categoryPosts = getCategoryPosts(decodedCategory);

  if (categoryPosts.length === 0) {
    notFound();
  }

  const categoryDisplay = decodedCategory.charAt(0).toUpperCase() + decodedCategory.slice(1);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <BlogHeader
        title={categoryDisplay}
        description={`Articles related to ${categoryDisplay.toLowerCase()}`}
        showBackLink={true}
      />
      <BlogList posts={categoryPosts} currentCategory={decodedCategory} />
    </div>
  );
}
