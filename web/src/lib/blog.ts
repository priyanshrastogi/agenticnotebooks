import { format, parseISO } from 'date-fns';
import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import html from 'remark-html';

import type { Tenant } from './tenant';

const postsDirectory = path.join(process.cwd(), 'content/blog');

export type BlogPost = {
  slug: string;
  title: string;
  date: string;
  formattedDate: string;
  excerpt: string;
  author: {
    name: string;
    image?: string;
  };
  content: string;
  coverImage?: string;
  tags?: string[];
};

export function getSortedPostsData(tenant?: Tenant): BlogPost[] {
  // If tenant is provided, use tenant-specific directory
  const targetDirectory = tenant 
    ? path.join(postsDirectory, tenant)
    : postsDirectory;

  // Check if directory exists, return empty array if not
  if (!fs.existsSync(targetDirectory)) {
    return [];
  }

  // Get file names under the target directory
  const fileNames = fs.readdirSync(targetDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      // Remove ".md" from file name to get slug
      const slug = fileName.replace(/\.md$/, '');

      // Read markdown file as string
      const fullPath = path.join(targetDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');

      // Use gray-matter to parse the post metadata section
      const matterResult = matter(fileContents);

      // Format date
      const date = matterResult.data.date;
      const formattedDate = format(parseISO(date), 'MMMM d, yyyy');

      // Return the combined data
      return {
        slug,
        formattedDate,
        content: '',
        ...matterResult.data,
      } as BlogPost;
    });

  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getAllPostSlugs(tenant?: Tenant): { slug: string }[] {
  // If tenant is provided, use tenant-specific directory
  const targetDirectory = tenant 
    ? path.join(postsDirectory, tenant)
    : postsDirectory;

  // Check if directory exists, return empty array if not
  if (!fs.existsSync(targetDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(targetDirectory);
  return fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      return {
        slug: fileName.replace(/\.md$/, ''),
      };
    });
}

export async function getPostData(slug: string, tenant?: Tenant): Promise<BlogPost> {
  // If tenant is provided, use tenant-specific directory
  const targetDirectory = tenant 
    ? path.join(postsDirectory, tenant)
    : postsDirectory;

  const fullPath = path.join(targetDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  // Format date
  const date = matterResult.data.date;
  const formattedDate = format(parseISO(date), 'MMMM d, yyyy');

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(remarkGfm) // Add GitHub Flavored Markdown support
    .use(html, { sanitize: false }) // Don't sanitize to preserve attributes
    .process(matterResult.content);

  // Get the HTML content
  let contentHtml = processedContent.toString();

  // Add IDs to headings manually with basic regex
  contentHtml = contentHtml.replace(/<(h[2-6])>(.*?)<\/\1>/g, (match, tag, content) => {
    // Create an ID from the content - lowercase, replace spaces with dashes
    const id = content
      .toLowerCase()
      .replace(/<[^>]*>/g, '') // Remove any HTML tags in the content
      .replace(/[^\w\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-'); // Replace spaces with dashes

    return `<${tag} id="${id}">${content}</${tag}>`;
  });

  // Combine the data with the slug and contentHtml
  return {
    slug,
    formattedDate,
    content: contentHtml,
    ...matterResult.data,
  } as BlogPost;
}

export function getCategoryPosts(category: string, tenant?: Tenant): BlogPost[] {
  const allPosts = getSortedPostsData(tenant);
  return allPosts.filter(
    (post) => post.tags && post.tags.map((t) => t.toLowerCase()).includes(category.toLowerCase())
  );
}
