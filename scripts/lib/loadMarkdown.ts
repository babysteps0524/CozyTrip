import { readdir, readFile } from "node:fs/promises";

import { extname, join } from "node:path";

import type { MarkdownDocument, Post } from "../../src/types";

import { parseMarkdown } from "../../src/lib/markdown/parser";

import { parsePostBlocks } from "../../src/lib/markdown/blockParser";

import { getHotelById } from "../../src/data/hotels";

import { hotelPostToPost } from "../../src/lib/post";

import generatedHotelPosts from "../../src/data/generated/hotel-posts.generated.json";

interface GeneratedHotelPostsFile {
  generatedAt: string;
  source: "ai";
  postCount: number;
  posts: import("../../src/types").HotelPost[];
}

const projectRoot = process.cwd();

const contentRoot = join(projectRoot, "content");

async function getMarkdownFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, {
    withFileTypes: true,
  });

  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await getMarkdownFiles(fullPath)));
      continue;
    }

    if (extname(entry.name).toLowerCase() === ".md") {
      files.push(fullPath);
    }
  }

  return files;
}

async function loadDirectory(directory: string): Promise<MarkdownDocument[]> {
  const absoluteDirectory = join(contentRoot, directory);
  const files = await getMarkdownFiles(absoluteDirectory);
  const documents: MarkdownDocument[] = [];

  for (const filePath of files) {
    const source = await readFile(filePath, "utf8");
    const document = parseMarkdown(source, filePath);
    documents.push(document);
  }

  return documents.sort((a, b) =>
    b.frontmatter.publishedAt.localeCompare(a.frontmatter.publishedAt),
  );
}

export async function loadMarkdownDocuments(): Promise<MarkdownDocument[]> {
  const [hotelDocuments, guideDocuments] = await Promise.all([
    loadDirectory("hotels"),
    loadDirectory("guides"),
  ]);

  return [...guideDocuments, ...hotelDocuments];
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

function loadGeneratedHotelPosts(): Post[] {
  const source = generatedHotelPosts as GeneratedHotelPostsFile;

  if (!Array.isArray(source.posts)) {
    return [];
  }

  const posts: Post[] = [];

  for (const hotelPost of source.posts) {
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

export async function loadPosts(): Promise<Post[]> {
  const documents = await loadMarkdownDocuments();
  const markdownPosts = documents.map(createPostFromMarkdown);
  const generatedPosts = loadGeneratedHotelPosts();

  const postMap = new Map<string, Post>();

  for (const post of markdownPosts) {
    postMap.set(post.id, post);
  }

  for (const post of generatedPosts) {
    postMap.set(post.id, post);
  }

  return Array.from(postMap.values());
}
