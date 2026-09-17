export type ImageSource =
  "rakuten" | "agoda" | "official" | "owned" | "licensed";

export type ImageType =
  | "hero"
  | "gallery"
  | "room"
  | "facility"
  | "restaurant"
  | "location"
  | "attraction";

export type ImageFormat = "webp" | "avif" | "jpeg" | "png";

export interface ResponsiveImageVariant {
  src: string;
  width: number;
  format: ImageFormat;
}

export interface HotelImage {
  id: string;
  src: string;
  alt: string;

  width: number;
  height: number;

  source: ImageSource;
  type: ImageType;

  hotelId?: string;

  credit?: string;
  sourceUrl?: string;

  rightsConfirmed: boolean;

  variants?: ResponsiveImageVariant[];
}
