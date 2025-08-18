'use client';

import { Calendar, Tag, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';

import { BlogPost } from '@/lib/blog';

interface BlogPostContentProps {
  post: BlogPost;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function BlogPostContent({ post }: BlogPostContentProps) {
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const contentRef = useRef<HTMLDivElement>(null);

  // Handle client-side initialization
  useEffect(() => {
    // Exit if content ref isn't available
    if (!contentRef.current) return;

    // Function to collect heading elements and data
    const getHeadings = () => {
      const headingElements = contentRef.current?.querySelectorAll('h2, h3, h4, h5, h6') || [];
      const items: TocItem[] = [];

      headingElements.forEach((el) => {
        if (el.textContent && el.id) {
          items.push({
            id: el.id,
            text: el.textContent,
            level: parseInt(el.tagName.charAt(1)),
          });
        }
      });

      return items;
    };

    // Get headings and set TOC
    const headings = getHeadings();
    setToc(headings);

    // Wrap tables in responsive container
    const tables = contentRef.current.querySelectorAll('table');
    tables.forEach((table) => {
      if (table.parentElement?.className !== 'table-wrapper') {
        const wrapper = document.createElement('div');
        wrapper.className = 'table-wrapper';
        table.parentElement?.insertBefore(wrapper, table);
        wrapper.appendChild(table);
      }
    });

    // If no headings, exit
    if (headings.length === 0) return;

    // Initially set the first heading as active
    setActiveId(headings[0].id);

    // Function to update active heading on scroll
    const onScroll = () => {
      // Get all heading elements
      const headingElements = Array.from(
        contentRef.current?.querySelectorAll('h2, h3, h4, h5, h6') || []
      );

      // If no headings, exit
      if (headingElements.length === 0) return;

      // Calculate position of viewport top with offset
      const scrollTop = window.scrollY + 150;

      // Find headings that are above the viewport top
      const headingsAboveViewport = headingElements
        .filter((el) => el.getBoundingClientRect().top + window.scrollY < scrollTop)
        .map((el) => ({
          id: el.id,
          top: el.getBoundingClientRect().top + window.scrollY,
        }));

      // If no headings above viewport, use first heading
      if (headingsAboveViewport.length === 0) {
        setActiveId(headingElements[0].id);
        return;
      }

      // Find the heading closest to the viewport top (the one we just scrolled past)
      const closest = headingsAboveViewport.reduce((prev, current) =>
        current.top > prev.top ? current : prev
      );

      // Set it as active
      setActiveId(closest.id);
    };

    // Attach scroll listener
    window.addEventListener('scroll', onScroll, { passive: true });

    // Initial check
    onScroll();

    // Cleanup
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Handle clicking on TOC links
  const handleTocClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();

    const element = document.getElementById(id);
    if (element) {
      // Update active ID
      setActiveId(id);

      // Scroll to element
      window.scrollTo({
        top: element.getBoundingClientRect().top + window.scrollY - 100,
        behavior: 'smooth',
      });
    }
  };

  return (
    <article className="mx-auto max-w-5xl">
      {/* Back link at top */}
      <div className="mb-8">
        <Link
          href="/blog"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
        >
          <span>←</span> <span>Back to blog</span>
        </Link>
      </div>

      {/* Main title */}
      <h1 className="mb-8 text-center text-2xl font-bold sm:text-4xl md:text-5xl">{post.title}</h1>

      {/* Cover image */}
      {post.coverImage && (
        <div className="relative mb-8 aspect-[16/9] h-auto max-h-[300px] w-full overflow-hidden rounded-lg sm:max-h-[350px] md:max-h-[500px]">
          <Image src={post.coverImage} alt={post.title} fill className="object-cover" priority />
        </div>
      )}

      {/* Meta information */}
      <div className="text-muted-foreground mb-12 flex flex-wrap items-center gap-5 text-sm">
        <div className="flex items-center">
          <Calendar className="mr-2 h-4 w-4" />
          <time>{post.formattedDate}</time>
        </div>

        <div className="flex items-center">
          <User className="mr-2 h-4 w-4" />
          <span>{post.author.name}</span>
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog/category/${tag.toLowerCase()}`}
                  className="bg-muted hover:bg-muted/80 rounded-full px-2 py-1 text-xs"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content and sidebar container */}
      <div className="flex flex-col gap-12 lg:flex-row">
        {/* Main content */}
        <div
          ref={contentRef}
          className="prose prose-zinc dark:prose-invert max-w-none lg:max-w-2xl"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Sidebar with TOC - hidden on mobile and tablet */}
        <aside className="hidden w-full lg:block">
          <div
            className={`rounded-lg border p-6 lg:sticky lg:top-24 ${toc.length === 0 ? 'hidden' : ''}`}
          >
            <h3 className="mb-4 text-base font-medium">On this page</h3>
            <nav className="text-sm">
              <ul className="space-y-3">
                {toc.map((item) => (
                  <li key={item.id} style={{ marginLeft: `${(item.level - 2) * 12}px` }}>
                    <a
                      href={`#${item.id}`}
                      onClick={(e) => handleTocClick(e, item.id)}
                      className={`block border-l-2 py-1 pl-3 transition-colors ${
                        activeId === item.id
                          ? 'border-primary text-primary font-medium'
                          : 'text-muted-foreground hover:text-foreground hover:border-muted-foreground border-transparent'
                      }`}
                    >
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>
      </div>
    </article>
  );
}
