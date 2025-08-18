import Link from 'next/link';
import React from 'react';

interface BlogHeaderProps {
  title: string;
  description: string;
  showBackLink?: boolean;
  backLinkHref?: string;
  backLinkText?: string;
}

export function BlogHeader({
  title,
  description,
  showBackLink = false,
  backLinkHref = '/blog',
  backLinkText = '← Back to all articles',
}: BlogHeaderProps) {
  return (
    <div className="mb-16 text-center">
      {showBackLink && (
        <div className="mb-2">
          <Link href={backLinkHref} className="text-muted-foreground hover:text-foreground">
            {backLinkText}
          </Link>
        </div>
      )}
      <h1 className="mb-4 text-4xl font-bold">{title}</h1>
      <p className="text-muted-foreground mx-auto max-w-2xl text-lg">{description}</p>
    </div>
  );
}
