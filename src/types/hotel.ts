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

export interface HotelPolicy {
  childPolicy?: string;
  extraFees?: string[];
  bookingNotes?: string[];
}

export type HotelDataSource = "manual" | "myrealtrip";

export interface Hotel {
  id: string;

  /** 외부 공급자에서 사용하는 호텔 식별자 */
  externalId?: string;

  /** 외부 호텔 데이터 공급자 */
  provider?: HotelDataSource;

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

  policy?: HotelPolicy;

  accommodationType?: string;

  starRating?: number;

  ratingAverage?: number;

  numberOfReviews?: number;

  checkIn?: string;

  checkOut?: string;

  affiliateLinks?: AffiliateLink[];

  publishedAt?: string;

  updatedAt?: string;

  /** 데이터가 마지막으로 API에서 조회된 날짜 */
  dataFetchedAt?: string;

  /** 호텔 정보의 주요 데이터 출처 */
  dataSource?: HotelDataSource;
}
