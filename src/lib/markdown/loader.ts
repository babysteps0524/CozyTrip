import type { MarkdownDocument } from "../../types/markdown";

import { parseMarkdown } from "./parser";

const hotelMarkdownModules = import.meta.glob("../../content/hotels/**/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
});

const guideMarkdownModules = import.meta.glob("../../content/guides/**/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
});

function loadDocuments(modules: Record<string, unknown>): MarkdownDocument[] {
  return Object.entries(modules)
    .map(([sourcePath, source]) => {
      if (typeof source !== "string") {
        throw new Error(`Markdown source가 문자열이 아닙니다: ${sourcePath}`);
      }

      return parseMarkdown(source, sourcePath);
    })
    .sort((a, b) =>
      b.frontmatter.publishedAt.localeCompare(a.frontmatter.publishedAt),
    );
}

export const hotelDocuments = loadDocuments(hotelMarkdownModules);

export const guideDocuments = loadDocuments(guideMarkdownModules);

export const markdownDocuments = [...hotelDocuments, ...guideDocuments];

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
