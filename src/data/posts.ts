import type { HotelPost, MarkdownDocument, Post } from "../types";

import { hotelPostToPost } from "../lib/post";
import { guideDocuments, hotelDocuments, parsePostBlocks } from "../lib/markdown";

import generatedHotelPosts from "./generated/hotel-posts.generated.json";

import { getHotelById } from "./hotels";

interface GeneratedHotelPostsFile {
  generatedAt: string;
  source: "ai";
  postCount: number;
  posts: HotelPost[];
}

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

function getGeneratedHotelPosts(): HotelPost[] {
  const source = generatedHotelPosts as GeneratedHotelPostsFile;
  return Array.isArray(source.posts) ? source.posts : [];
}

function createPostsFromGeneratedHotelPosts(): Post[] {
  const posts: Post[] = [];

  for (const hotelPost of getGeneratedHotelPosts()) {
    if (hotelPost.status !== "published") continue;

    const hotel = getHotelById(hotelPost.hotelId);

    if (!hotel) {
      console.warn(
        `Hotel not found for generated hotel post: ${hotelPost.hotelId}`,
      );
      continue;
    }

    posts.push(hotelPostToPost(hotelPost, hotel));
  }

  return posts;
}

const markdownDocuments: MarkdownDocument[] = [
  ...guideDocuments,
  ...hotelDocuments,
];

const markdownPosts: Post[] = markdownDocuments.map(createPostFromMarkdown);
const generatedHotelPostsList = createPostsFromGeneratedHotelPosts();

const postMapById = new Map<string, Post>();

for (const post of markdownPosts) {
  postMapById.set(post.id, post);
}

for (const post of generatedHotelPostsList) {
  postMapById.set(post.id, post);
}

const loadedPosts: Post[] = Array.from(postMapById.values());

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

export function getHotelPostByHotel(hotelId: string): HotelPost | undefined {
  return getGeneratedHotelPosts().find(
    (post) => post.hotelId === hotelId && post.status === "published",
  );
}
