import React from 'react';

import { BlogPost } from '@/lib/blog';

import { BlogCard } from './BlogCard';

interface BlogListProps {
  posts: BlogPost[];
  currentCategory?: string;
}

export function BlogList({ posts, currentCategory }: BlogListProps) {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <BlogCard key={post.slug} post={post} currentCategory={currentCategory} />
      ))}
    </div>
  );
}
