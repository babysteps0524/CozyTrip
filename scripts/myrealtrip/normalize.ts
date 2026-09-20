import type { AffiliateLink, Hotel, HotelImage, ImageType } from "../../src/types";
import { getMyRealTripConfig } from "./config";

export interface MyRealTripAccommodationImage {
  url?: string;
  imageUrl?: string;
  type?: string;
  imageType?: string;
  category?: string;
  imageCategory?: string;
  kind?: string;
  alt?: string;
  width?: number;
  height?: number;
}

type MyRealTripRawAccommodationItem = MyRealTripAccommodationItem & {
  imageUrls?: unknown;
  imageList?: unknown;
  photos?: unknown;
  hotelImages?: unknown;
};

export interface MyRealTripAccommodationItem {
  itemId: number;
  itemName: string;
  salePrice: number;
  originalPrice: number;
  starRating: number;
  reviewScore: string;
  reviewCount: number;
  imageUrl: string;
  productUrl: string;
  deepLink: string;
  images?: MyRealTripAccommodationImage[];
  imageUrls?: string[];
  imageList?: MyRealTripAccommodationImage[];
  photos?: MyRealTripAccommodationImage[];
  hotelImages?: MyRealTripAccommodationImage[];
  area?: string;
  district?: string;
  neighborhood?: string;
  regionName?: string;
  location?: {
    area?: string;
    district?: string;
    neighborhood?: string;
    address?: string;
  };
  region?: { name?: string };
}

export interface MyRealTripAccommodationSearchResponse {
  data?: {
    items?: MyRealTripAccommodationItem[];
    totalCount?: number;
    page?: number;
    size?: number;
  };
  meta?: { totalCount?: number };
  result?: { status?: number; message?: string; code?: string };
}

export interface MyRealTripRegion {
  regionId: number;
  name: string;
  subName: string;
  enName: string;
  type: string;
}

export interface MyRealTripRegionAutocompleteResponse {
  data?: { regions?: MyRealTripRegion[] };
}

export interface MyRealTripDestination {
  slug: string;
  city: string;
  cityEn: string;
  prefecture: string;
  regionKeyword: string;
  regionId?: number;
}

const DESTINATIONS: MyRealTripDestination[] = [
  { slug: "tokyo", city: "도쿄", cityEn: "Tokyo", prefecture: "Tokyo", regionKeyword: "도쿄", regionId: 2955 },
  { slug: "osaka", city: "오사카", cityEn: "Osaka", prefecture: "Osaka", regionKeyword: "오사카", regionId: 2225 },
  { slug: "fukuoka", city: "후쿠오카", cityEn: "Fukuoka", prefecture: "Fukuoka", regionKeyword: "후쿠오카", regionId: 193957 },
  { slug: "sapporo", city: "삿포로", cityEn: "Sapporo", prefecture: "Hokkaido", regionKeyword: "삿포로", regionId: 2674 },
];

const MYREALTRIP_IMAGE_TYPES: readonly ImageType[] = [
  "hero",
  "gallery",
  "room",
  "bathroom",
  "facility",
  "restaurant",
  "location",
  "attraction",
];

const MYREALTRIP_IMAGE_TYPE_ALIASES: Record<string, ImageType> = {
  hero: "hero",
  main: "hero",
  gallery: "gallery",
  exterior: "gallery",
  room: "room",
  rooms: "room",
  bedroom: "room",
  bathroom: "bathroom",
  bath: "bathroom",
  toilet: "bathroom",
  restroom: "bathroom",
  facility: "facility",
  facilities: "facility",
  amenity: "facility",
  restaurant: "restaurant",
  dining: "restaurant",
  breakfast: "restaurant",
  location: "location",
  attraction: "attraction",
};

function normalizeImageType(value: unknown): ImageType | undefined {
  if (typeof value !== "string") return undefined;

  const normalized = value.trim().toLowerCase();
  return MYREALTRIP_IMAGE_TYPE_ALIASES[normalized];
}

function getImageUrl(image: MyRealTripAccommodationImage): string {
  const value = image.url ?? image.imageUrl ?? "";
  return typeof value === "string" ? value.trim() : "";
}

function getImageType(image: MyRealTripAccommodationImage): ImageType | undefined {
  return normalizeImageType(
    image.type ??
      image.imageType ??
      image.category ??
      image.imageCategory ??
      image.kind,
  );
}

function collectImageCandidates(
  item: MyRealTripRawAccommodationItem,
): MyRealTripAccommodationImage[] {
  const collections: unknown[] = [
    item.images,
    item.imageList,
    item.photos,
    item.hotelImages,
  ];

  const imageUrls = Array.isArray(item.imageUrls) ? item.imageUrls : [];
  collections.push(
    imageUrls.map((value) =>
      typeof value === "string" ? { url: value } : value,
    ),
  );

  return collections.flatMap((collection) =>
    Array.isArray(collection)
      ? collection.filter(
          (value): value is MyRealTripAccommodationImage =>
            Boolean(value && typeof value === "object"),
        )
      : [],
  );
}

const affiliateLinks = (productUrl: string): AffiliateLink[] => [
  {
    provider: "myrealtrip",
    url: productUrl,
    label: "마이리얼트립에서 호텔 확인",
    description: "최신 객실 요금과 예약 조건은 마이리얼트립에서 확인하세요.",
    rel: "sponsored",
    external: true,
  },
];

function slugify(value: string): string {
  const slug = value
    .normalize("NFKD")
    .toLowerCase()
    .trim()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "hotel";
}

function toHotelImages(
  item: MyRealTripRawAccommodationItem,
  hotelId: string,
  imageUsageAllowed: boolean,
): HotelImage[] {
  if (!imageUsageAllowed) return [];

  const candidates = collectImageCandidates(item)
    .map((image) => ({
      ...image,
      url: getImageUrl(image),
      normalizedType: getImageType(image),
    }))
    .filter((image) => image.url.length > 0)
    .filter((image) => image.normalizedType && image.normalizedType !== "hero")
    .filter(
      (image, index, all) =>
        all.findIndex((candidate) => candidate.url === image.url) === index,
    )
    .slice(0, 24);

  const typedImages = candidates.map((image, index) => ({
    id: `myrealtrip-${item.itemId}-${image.normalizedType}-${index + 1}`,
    src: image.url,
    alt:
      image.alt ||
      `${item.itemName} ${image.normalizedType} 이미지`,
    width: image.width,
    height: image.height,
    source: "myrealtrip" as const,
    type: image.normalizedType!,
    hotelId,
    credit: "MyRealTrip Partner API",
    sourceUrl: item.productUrl,
    license: "MyRealTrip Partner API 이미지 URL — 환경설정에서 직접 표시를 허용함",
    rightsConfirmed: true,
  }));

  const hero = item.imageUrl
    ? [{
        id: `myrealtrip-${item.itemId}-hero`,
        src: item.imageUrl,
        alt: `${item.itemName} 대표 이미지`,
        source: "myrealtrip" as const,
        type: "hero" as const,
        hotelId,
        credit: "MyRealTrip Partner API",
        sourceUrl: item.productUrl,
        license: "MyRealTrip Partner API 이미지 URL — 환경설정에서 직접 표시를 허용함",
        rightsConfirmed: true,
      }]
    : [];

  return [...hero, ...typedImages];
}

function resolveHotelArea(item: MyRealTripAccommodationItem): string {
  const candidates = [
    item.area,
    item.district,
    item.neighborhood,
    item.regionName,
    item.location?.area,
    item.location?.district,
    item.location?.neighborhood,
    item.region?.name,
  ];

  return candidates.find((value) => typeof value === "string" && value.trim())?.trim() ?? "";
}

function toHotel(
  item: MyRealTripAccommodationItem,
  destination: MyRealTripDestination,
  imageUsageAllowed: boolean,
): Hotel {
  const id = `myrealtrip-${item.itemId}`;
  const slug = `${slugify(item.itemName)}-${item.itemId}`;
  const area = resolveHotelArea(item);

  return {
    id,
    externalId: String(item.itemId),
    provider: "myrealtrip",
    name: item.itemName,
    dataSource: "myrealtrip",
    dataFetchedAt: new Date().toISOString(),
    slug,
    country: "일본",
    countryCode: "JP",
    prefecture: destination.prefecture,
    city: destination.city,
    area,
    destinationId: `japan-${destination.slug}`,
    description: `${destination.city} 지역의 ${item.itemName} 호텔 정보를 마이리얼트립 숙소 검색 API에서 확인할 수 있는 데이터 기준으로 소개합니다.`,
    location: {
      country: "일본",
      countryCode: "JP",
      prefecture: destination.prefecture,
      city: destination.city,
      area,
    },
    images: toHotelImages(item, id, imageUsageAllowed),
    facilities: [],
    restaurants: [],
    accommodationType: "호텔",
    ...(Number.isFinite(item.starRating) && item.starRating >= 0 && item.starRating <= 5
      ? { starRating: item.starRating }
      : {}),
    ratingAverage: Number(item.reviewScore),
    numberOfReviews: item.reviewCount,
    affiliateLinks: affiliateLinks(item.productUrl),
    publishedAt: new Date().toISOString().slice(0, 10),
    updatedAt: new Date().toISOString().slice(0, 10),
  };
}

export function findCityRegion(
  response: MyRealTripRegionAutocompleteResponse,
  city: string,
): MyRealTripRegion | undefined {
  const regions = response.data?.regions ?? [];

  return (
    regions.find((region) => region.name === city && region.type === "CITY") ??
    regions.find(
      (region) =>
        region.name === city ||
        region.subName.includes(city) ||
        region.enName.toLowerCase() === city.toLowerCase(),
    )
  );
}

export function normalizeAccommodationItems(
  response: MyRealTripAccommodationSearchResponse,
  destination: MyRealTripDestination,
): Hotel[] {
  const items = response.data?.items ?? [];
  const imageUsageAllowed = getMyRealTripConfig().imageUsageAllowed;

  return items.map((item) => toHotel(item, destination, imageUsageAllowed));
}

export function getMyRealTripDestinations(): MyRealTripDestination[] {
  return DESTINATIONS.map((destination) => ({ ...destination }));
}
