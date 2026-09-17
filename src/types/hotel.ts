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
  id?: string;
  name: string;
  description?: string;
  maxOccupancy?: number;
  size?: number;
  bedType?: string;
  images?: HotelImage[];
}

export interface HotelFacility {
  name: string;
  description?: string;
  group?: string;
}

export interface HotelRestaurant {
  id?: string;
  name: string;
  description?: string;
  cuisine?: string;
  mealTypes?: string[];
  openingHours?: string;
  location?: string;
  images?: HotelImage[];
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

  accommodationType?: string;

  starRating?: number;

  ratingAverage?: number;

  numberOfReviews?: number;

  checkIn?: string;

  checkOut?: string;

  affiliateLinks?: AffiliateLink[];

  publishedAt?: string;

  updatedAt?: string;
}
