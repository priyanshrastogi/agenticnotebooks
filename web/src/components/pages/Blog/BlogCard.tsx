import { Calendar,ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import { BlogPost } from '@/lib/blog';

interface BlogCardProps {
  post: BlogPost;
  currentCategory?: string;
}

export function BlogCard({ post, currentCategory }: BlogCardProps) {
  return (
    <article className="overflow-hidden rounded-lg border shadow-sm transition-shadow hover:shadow-md">
      {post.coverImage && (
        <div className="relative h-48 w-full">
          <Image src={post.coverImage} alt={post.title} fill className="object-cover" />
        </div>
      )}
      <div className="p-6">
        <div className="text-muted-foreground mb-3 flex items-center text-sm">
          <Calendar className="mr-1 h-4 w-4" />
          <time>{post.formattedDate}</time>

          {post.tags && post.tags.length > 0 && (
            <>
              <span className="mx-2">•</span>
              <div className="flex space-x-2">
                {post.tags.slice(0, 2).map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog/category/${tag.toLowerCase()}`}
                    className={`rounded-full px-2 py-1 text-xs ${
                      currentCategory && tag.toLowerCase() === currentCategory.toLowerCase()
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>

        <h2 className="mb-2 line-clamp-2 text-xl font-semibold">
          <Link href={`/blog/${post.slug}`} className="hover:underline">
            {post.title}
          </Link>
        </h2>

        <p className="text-muted-foreground mb-4 line-clamp-3">{post.excerpt}</p>

        <Link
          href={`/blog/${post.slug}`}
          className="text-primary inline-flex items-center text-sm font-medium"
        >
          Read more <ChevronRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
