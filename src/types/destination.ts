import type { Hotel } from "./hotel";
import type { HotelImage } from "./image";

export interface Destination {
  id: string;

  name: string;
  nameEn: string;

  slug: string;

  country: string;
  countryCode: string;

  prefecture?: string;

  description: string;

  heroImage?: HotelImage;

  hotels?: Hotel[];

  popularAreas?: string[];

  popularAttractions?: string[];

  publishedAt?: string;
  updatedAt?: string;
}
