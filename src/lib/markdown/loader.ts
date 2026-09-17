import type { MarkdownDocument } from "../../types/markdown";

import { parseMarkdown } from "./parser";

type MarkdownModule = Record<string, string>;

const hotelMarkdownModules =
  typeof import.meta.glob === "function"
    ? import.meta.glob<string>("../../content/hotels/**/*.md", {
        eager: true,
        query: "?raw",
        import: "default",
      })
    : ({} as MarkdownModule);

const guideMarkdownModules =
  typeof import.meta.glob === "function"
    ? import.meta.glob<string>("../../content/guides/**/*.md", {
        eager: true,
        query: "?raw",
        import: "default",
      })
    : ({} as MarkdownModule);

function loadDocuments(modules: MarkdownModule): MarkdownDocument[] {
  return Object.entries(modules)
    .map(([sourcePath, source]) => parseMarkdown(source, sourcePath))
    .sort((a, b) =>
      b.frontmatter.publishedAt.localeCompare(a.frontmatter.publishedAt),
    );
}

export const hotelDocuments = loadDocuments(hotelMarkdownModules);

export const guideDocuments = loadDocuments(guideMarkdownModules);

export const markdownDocuments = [...guideDocuments, ...hotelDocuments].sort(
  (a, b) => b.frontmatter.publishedAt.localeCompare(a.frontmatter.publishedAt),
);

export function getMarkdownById(id: string): MarkdownDocument | undefined {
  return markdownDocuments.find((document) => document.frontmatter.id === id);
}

export function getMarkdownBySlug(slug: string): MarkdownDocument | undefined {
  return markdownDocuments.find(
    (document) => document.frontmatter.slug === slug,
  );
}

export function getMarkdownByCategory(
  category: "hotel" | "guide",
): MarkdownDocument[] {
  return markdownDocuments.filter(
    (document) => document.frontmatter.category === category,
  );
}

export function getMarkdownByHotelId(hotelId: string): MarkdownDocument[] {
  return markdownDocuments.filter(
    (document) => document.frontmatter.hotelId === hotelId,
  );
}

export function getMarkdownByDestinationId(
  destinationId: string,
): MarkdownDocument[] {
  return markdownDocuments.filter(
    (document) => document.frontmatter.destinationId === destinationId,
  );
}
