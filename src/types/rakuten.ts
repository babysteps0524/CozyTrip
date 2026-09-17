export interface RakutenHotelApiResponse {
  [key: string]: unknown;
}

export interface RakutenHotelImage {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface RakutenHotelRecord {
  id: string;
  name: string;
  nameEn?: string;
  slug: string;
  country: string;
  countryCode: string;
  prefecture: string;
  city: string;
  area: string;
  description: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  nearestStations?: string[];
  images: RakutenHotelImage[];
}
