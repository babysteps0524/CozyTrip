import type { AffiliateLink } from "./affiliate";
import type { HotelImage } from "./image";

export interface HotelLocation {
  country: string;
  countryCode: string;
  prefecture: string;
  city: string;
  area: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  nearestStations?: string[];
}

export interface HotelRoom {
  name: string;
  description?: string;
  images?: HotelImage[];
}

export interface HotelFacility {
  name: string;
  description?: string;
}

export interface HotelRestaurant {
  name: string;
  description?: string;
}

export interface Hotel {
  id: string;

  name: string;
  nameEn?: string;
  slug: string;

  country: string;
  countryCode: string;
  prefecture: string;
  city: string;
  area: string;

  destinationId: string;

  description: string;

  location: HotelLocation;

  images: HotelImage[];

  rooms?: HotelRoom[];

  facilities?: HotelFacility[];

  restaurants?: HotelRestaurant[];

  checkIn?: string;
  checkOut?: string;

  affiliateLinks?: AffiliateLink[];

  publishedAt?: string;
  updatedAt?: string;
}
