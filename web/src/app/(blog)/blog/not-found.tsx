import Link from 'next/link';

export default function BlogNotFound() {
  return (
    <div className="container mx-auto px-4 py-24 text-center">
      <h1 className="mb-6 text-4xl font-bold">Blog Post Not Found</h1>
      <p className="text-muted-foreground mb-8 text-lg">
        We couldn&apos;t find the blog post you&apos;re looking for.
      </p>
      <Link
        href="/blog"
        className="bg-primary hover:bg-primary/90 inline-flex items-center rounded-md px-6 py-2 text-white"
      >
        Return to Blog
      </Link>
    </div>
  );
}
