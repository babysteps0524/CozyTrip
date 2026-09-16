export interface MarkdownFrontmatter {
  id: string;
  category: "hotel" | "guide";
  title: string;
  description: string;
  slug: string;
  destinationId?: string;
  hotelId?: string;
  publishedAt: string;
  updatedAt?: string;
  author?: string;
  tags?: string[];
}

export interface MarkdownDocument {
  frontmatter: MarkdownFrontmatter;
  content: string;
  sourcePath: string;
}
