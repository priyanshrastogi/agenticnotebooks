import { format, parseISO } from 'date-fns';
import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import html from 'remark-html';

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

export function getSortedPostsData(): BlogPost[] {
  // Get file names under /content/blog
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      // Remove ".md" from file name to get slug
      const slug = fileName.replace(/\.md$/, '');

      // Read markdown file as string
      const fullPath = path.join(postsDirectory, fileName);
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

export function getAllPostSlugs(): { slug: string }[] {
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames.map((fileName) => {
    return {
      slug: fileName.replace(/\.md$/, ''),
    };
  });
}

export async function getPostData(slug: string): Promise<BlogPost> {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
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

export function getCategoryPosts(category: string): BlogPost[] {
  const allPosts = getSortedPostsData();
  return allPosts.filter(
    (post) => post.tags && post.tags.map((t) => t.toLowerCase()).includes(category.toLowerCase())
  );
}
