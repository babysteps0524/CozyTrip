import type { Hotel } from "../types";
import agodaHotels from "./generated/agoda-hotels.json";

interface AgodaHotelFile {
  generatedAt: string;
  source: "agoda";
  hotelCount: number;
  hotels: Hotel[];
}

const manualHotels: Hotel[] = [
  {
    id: "sample-tokyo-hotel",
    name: "Sample Tokyo Hotel",
    nameEn: "Sample Tokyo Hotel",
    slug: "sample-tokyo-hotel",
    country: "일본",
    countryCode: "JP",
    prefecture: "Tokyo",
    city: "도쿄",
    area: "신주쿠",
    destinationId: "japan-tokyo",
    description: "CozyTrip 개발 과정에서 사용하는 샘플 호텔 데이터입니다.",
    location: {
      country: "일본",
      countryCode: "JP",
      prefecture: "Tokyo",
      city: "도쿄",
      area: "신주쿠",
      nearestStations: ["신주쿠역"],
    },
    images: [],
    rooms: [],
    facilities: [],
    restaurants: [],
    affiliateLinks: [],
    publishedAt: "2026-09-16",
  },
];

const generated = agodaHotels as AgodaHotelFile;
const generatedHotels = Array.isArray(generated.hotels) ? generated.hotels : [];

const hotelMap = new Map<string, Hotel>();

for (const hotel of manualHotels) {
  hotelMap.set(hotel.id, hotel);
}

for (const hotel of generatedHotels) {
  if (!hotelMap.has(hotel.id)) {
    hotelMap.set(hotel.id, hotel);
  }
}

export const hotels: Hotel[] = Array.from(hotelMap.values());

export const hotelMapById = new Map(
  hotels.map((hotel) => [hotel.id, hotel]),
);

export { hotelMap };

export function getHotelById(id: string): Hotel | undefined {
  return hotelMapById.get(id);
}

export function getHotelBySlug(slug: string): Hotel | undefined {
  return hotels.find((hotel) => hotel.slug === slug);
}

export function getHotelsByCity(city: string): Hotel[] {
  return hotels.filter((hotel) => hotel.city === city);
}

export function getHotelsByDestination(destinationId: string): Hotel[] {
  return hotels.filter((hotel) => hotel.destinationId === destinationId);
}
