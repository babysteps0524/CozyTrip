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

  /**
   * API에서 실제 이미지 크기를 제공하지 않는 경우
   * 생략할 수 있다.
   */
  width?: number;

  height?: number;

  source: ImageSource;

  type: ImageType;

  hotelId?: string;

  credit?: string;

  sourceUrl?: string;

  rightsConfirmed: boolean;

  variants?: ResponsiveImageVariant[];
}
