import type { AffiliateLink, Hotel, HotelImage, ImageType } from "../../src/types";
import { getMyRealTripConfig } from "./config";

export interface MyRealTripAccommodationImage {
  url: string;
  type?: ImageType;
  alt?: string;
  width?: number;
  height?: number;
}

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
  { slug: "kyoto", city: "교토", cityEn: "Kyoto", prefecture: "Kyoto", regionKeyword: "교토", regionId: 8958 },
  { slug: "fukuoka", city: "후쿠오카", cityEn: "Fukuoka", prefecture: "Fukuoka", regionKeyword: "후쿠오카", regionId: 193957 },
  { slug: "sapporo", city: "삿포로", cityEn: "Sapporo", prefecture: "Hokkaido", regionKeyword: "삿포로", regionId: 2674 },
  { slug: "okinawa", city: "오키나와", cityEn: "Okinawa", prefecture: "Okinawa", regionKeyword: "오키나와", regionId: 9336 },
];

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
  item: MyRealTripAccommodationItem,
  hotelId: string,
  imageUsageAllowed: boolean,
): HotelImage[] {
  if (!imageUsageAllowed) return [];

  const candidates = (item.images ?? [])
    .filter((image) => image.url.trim())
    .filter((image) => image.type && image.type !== "hero")
    .slice(0, 8);

  const typedImages = candidates.map((image, index) => ({
    id: `myrealtrip-${item.itemId}-${image.type}-${index + 1}`,
    src: image.url,
    alt: image.alt || `${item.itemName} ${image.type} 이미지`,
    width: image.width,
    height: image.height,
    source: "myrealtrip" as const,
    type: image.type as ImageType,
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

function toHotel(
  item: MyRealTripAccommodationItem,
  destination: MyRealTripDestination,
  imageUsageAllowed: boolean,
): Hotel {
  const id = `myrealtrip-${item.itemId}`;
  const slug = `${slugify(item.itemName)}-${item.itemId}`;

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
    area: "",
    destinationId: `japan-${destination.slug}`,
    description: `${destination.city} 지역의 ${item.itemName} 호텔 정보를 마이리얼트립 숙소 검색 API에서 확인할 수 있는 데이터 기준으로 소개합니다.`,
    location: {
      country: "일본",
      countryCode: "JP",
      prefecture: destination.prefecture,
      city: destination.city,
      area: "",
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
