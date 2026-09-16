import type { HotelImage } from "./image";

export type PostCategory =
  | "hotel"
  | "guide";

export type PostBlock =
  | PostHeadingBlock
  | PostParagraphBlock
  | PostImageBlock
  | PostGalleryBlock;

export interface PostHeadingBlock {
  type: "heading";

  level: 2 | 3;

  text: string;
}

export interface PostParagraphBlock {
  type: "paragraph";

  text: string;
}

export interface PostImageBlock {
  type: "image";

  image: HotelImage;
}

export interface PostGalleryBlock {
  type: "gallery";

  images: HotelImage[];

  caption?: string;
}

export interface Post {
  id: string;

  category: PostCategory;

  title: string;

  slug: string;

  description: string;

  destinationId?: string;

  hotelId?: string;

  blocks: PostBlock[];

  publishedAt: string;

  updatedAt?: string;

  author?: string;

  tags?: string[];
}