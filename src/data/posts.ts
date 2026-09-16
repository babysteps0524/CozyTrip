import type { MarkdownDocument, Post } from "../types";

import {
  guideDocuments,
  hotelDocuments,
  parsePostBlocks,
} from "../lib/markdown";

function createPostFromMarkdown(document: MarkdownDocument): Post {
  const { frontmatter, content } = document;

  return {
    id: frontmatter.id,

    category: frontmatter.category,

    title: frontmatter.title,

    slug: frontmatter.slug,

    description: frontmatter.description,

    destinationId: frontmatter.destinationId,

    hotelId: frontmatter.hotelId,

    blocks: parsePostBlocks(content),

    publishedAt: frontmatter.publishedAt,

    updatedAt: frontmatter.updatedAt,

    author: frontmatter.author,

    tags: frontmatter.tags,
  };
}

const markdownDocuments: MarkdownDocument[] = [
  ...guideDocuments,
  ...hotelDocuments,
];

export const posts: Post[] = markdownDocuments.map(createPostFromMarkdown);

export const postMap = new Map(posts.map((post) => [post.id, post]));

export function getPostById(id: string): Post | undefined {
  return postMap.get(id);
}

export function getPostBySlug(slug: string): Post | undefined {
  return posts.find((post) => post.slug === slug);
}

export function getPostsByCategory(category: Post["category"]): Post[] {
  return posts.filter((post) => post.category === category);
}

export function getPostsByDestination(destinationId: string): Post[] {
  return posts.filter((post) => post.destinationId === destinationId);
}

export function getPostsByHotel(hotelId: string): Post[] {
  return posts.filter((post) => post.hotelId === hotelId);
}
