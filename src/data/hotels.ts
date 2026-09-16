import type { Hotel } from "../types";

export const hotels: Hotel[] = [
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

export const hotelMap = new Map(hotels.map((hotel) => [hotel.id, hotel]));

export function getHotelById(id: string): Hotel | undefined {
  return hotelMap.get(id);
}

export function getHotelBySlug(slug: string): Hotel | undefined {
  return hotels.find((hotel) => hotel.slug === slug);
}

export function getHotelsByCity(city: string): Hotel[] {
  return hotels.filter((hotel) => hotel.city === city);
}

export function getHotelsByDestination(destinationId: string): Hotel[] {
  const destination = destinationId.replace("japan-", "");

  return hotels.filter((hotel) => hotel.city === destination);
}
