import type { MarkdownDocument, Post } from "../types";

import { guideDocuments, hotelDocuments } from "../lib/markdown";

import { parsePostBlocks } from "../lib/markdown";

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

const loadedPosts: Post[] = markdownDocuments.map(createPostFromMarkdown);

let runtimePosts: Post[] | null = null;

export const posts: Post[] = loadedPosts;

export function setRuntimePosts(nextPosts: Post[]): void {
  runtimePosts = nextPosts;
}

function getRuntimePosts(): Post[] {
  return runtimePosts ?? loadedPosts;
}

export const postMap = new Map(posts.map((post) => [post.id, post]));

export function getPostById(id: string): Post | undefined {
  return getRuntimePosts().find((post) => post.id === id);
}

export function getPostBySlug(slug: string): Post | undefined {
  return getRuntimePosts().find((post) => post.slug === slug);
}

export function getPostsByCategory(category: Post["category"]): Post[] {
  return getRuntimePosts().filter((post) => post.category === category);
}

export function getPostsByDestination(destinationId: string): Post[] {
  return getRuntimePosts().filter(
    (post) => post.destinationId === destinationId,
  );
}

export function getPostsByHotel(hotelId: string): Post[] {
  return getRuntimePosts().filter((post) => post.hotelId === hotelId);
}
