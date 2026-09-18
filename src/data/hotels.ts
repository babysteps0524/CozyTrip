import type { AffiliateLink, Hotel } from "../types";
import agodaHotels from "./generated/agoda-hotels.json";
import myRealTripHotels from "./generated/myrealtrip-hotels.json";

interface MyRealTripHotelFile {
  generatedAt: string;
  source: "myrealtrip";
  hotelCount: number;
  hotels: Hotel[];
}

interface AgodaHotelFile {
  generatedAt: string;
  source: "agoda";
  hotelCount: number;
  hotels: Hotel[];
}

const sampleAffiliateLinks: AffiliateLink[] = [
  {
    provider: "agoda",
    url: "https://www.agoda.com/",
    label: "Agoda에서 호텔 확인",
    description: "실제 객실 요금과 예약 가능 여부는 Agoda에서 확인하세요.",
    rel: "sponsored",
    external: true,
  },
  {
    provider: "tripcom",
    url: "https://www.trip.com/",
    label: "Trip.com에서 호텔 확인",
    description: "예약 조건과 객실 정보는 Trip.com에서 확인하세요.",
    rel: "sponsored",
    external: true,
  },
  {
    provider: "myrealtrip",
    url: "https://www.myrealtrip.com/",
    label: "마이리얼트립에서 확인",
    description: "예약 조건은 마이리얼트립에서 확인하세요.",
    rel: "sponsored",
    external: true,
  },
];

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
    description:
      "도쿄 신주쿠 지역을 기준으로 호텔 소개 페이지의 구성과 사용자 경험을 검증하기 위한 CozyTrip 샘플 호텔입니다.",
    location: {
      country: "일본",
      countryCode: "JP",
      prefecture: "Tokyo",
      city: "도쿄",
      area: "신주쿠",
      address: "도쿄 신주쿠 샘플 주소",
      nearestStations: ["신주쿠역", "신주쿠산초메역"],
    },
    images: [],
    rooms: [
      {
        id: "sample-standard-room",
        name: "스탠다드룸",
        description:
          "호텔 객실 정보를 연결하기 위한 샘플 객실입니다. 실제 객실 크기와 침대 구성은 예약 플랫폼의 최신 정보를 확인하세요.",
        maxOccupancy: 2,
        bedType: "더블 침대",
      },
      {
        id: "sample-family-room",
        name: "패밀리룸",
        description:
          "가족 여행객을 위한 샘플 객실 데이터입니다. 실제 투숙 가능 인원과 객실 조건은 예약 시 확인하세요.",
        maxOccupancy: 4,
        bedType: "더블 침대 및 추가 침구",
      },
    ],
    facilities: [
      {
        name: "Wi-Fi",
        description: "호텔 시설 데이터를 표시하기 위한 샘플 정보입니다.",
        group: "기본 시설",
      },
      {
        name: "24시간 프런트 데스크",
        description: "운영시간은 실제 호텔 또는 예약 플랫폼의 최신 정보를 확인하세요.",
        group: "서비스",
      },
      {
        name: "짐 보관",
        description: "짐 보관 가능 여부와 조건은 이용 전에 확인하세요.",
        group: "서비스",
      },
      {
        name: "레스토랑",
        description: "호텔 내 다이닝 정보를 표시하기 위한 샘플 시설입니다.",
        group: "다이닝",
      },
    ],
    restaurants: [
      {
        id: "sample-main-restaurant",
        name: "Sample Dining",
        description:
          "호텔 다이닝 정보를 표시하기 위한 샘플 레스토랑입니다. 실제 운영 여부와 메뉴는 최신 정보를 확인하세요.",
        cuisine: "일식·인터내셔널",
        mealTypes: ["조식", "석식"],
        openingHours: "운영시간은 공식 안내 확인",
        location: "호텔 내부",
      },
    ],
    policy: {
      childPolicy:
        "어린이 투숙 조건과 추가 요금은 객실 및 예약 조건에 따라 달라질 수 있습니다.",
      extraFees: [
        "세금 및 서비스 요금은 예약 플랫폼의 표시 조건을 확인하세요.",
        "추가 침구 및 인원 관련 비용은 예약 전에 확인하세요.",
      ],
      bookingNotes: [
        "본 데이터는 CozyTrip 개발용 샘플 데이터입니다.",
        "실제 가격, 객실 재고, 예약 가능 여부 및 정책은 예약 플랫폼에서 확인하세요.",
      ],
    },
    accommodationType: "호텔",
    checkIn: "15:00",
    checkOut: "11:00",
    affiliateLinks: sampleAffiliateLinks,
    publishedAt: "2026-09-16",
    updatedAt: "2026-09-18",
  },
];


const additionalSampleHotels: Hotel[] = [
  ["osaka", "오사카", "Osaka", "난바", "도톤보리와 난바 지역의 호텔 페이지 구조를 검증하기 위한 샘플 숙소입니다."],
  ["kyoto", "교토", "Kyoto", "교토역", "교토역 주변 호텔 페이지 구조를 검증하기 위한 샘플 숙소입니다."],
  ["fukuoka", "후쿠오카", "Fukuoka", "하카타", "하카타 지역의 호텔 페이지 구조를 검증하기 위한 샘플 숙소입니다."],
  ["sapporo", "삿포로", "Hokkaido", "삿포로역", "삿포로역 주변 호텔 페이지 구조를 검증하기 위한 샘플 숙소입니다."],
  ["okinawa", "오키나와", "Okinawa", "나하", "나하 지역의 호텔 페이지 구조를 검증하기 위한 샘플 숙소입니다."],
].map(([slugCity, city, prefecture, area, description]) => ({
  id: `sample-${slugCity}-hotel`,
  name: `Sample ${city} Hotel`,
  nameEn: `Sample ${city} Hotel`,
  slug: `sample-${slugCity}-hotel`,
  country: "일본",
  countryCode: "JP",
  prefecture,
  city,
  area,
  destinationId: `japan-${slugCity}`,
  description,
  location: {
    country: "일본",
    countryCode: "JP",
    prefecture,
    city,
    area,
    address: `${city} ${area} 개발용 샘플 주소`,
    nearestStations: [`${area}역`],
  },
  images: [],
  rooms: [
    {
      id: `sample-${slugCity}-standard-room`,
      name: "스탠다드룸",
      description: "CozyTrip 화면 검증을 위한 샘플 객실 정보입니다. 실제 객실 조건은 예약 플랫폼에서 확인하세요.",
      maxOccupancy: 2,
      bedType: "더블 침대",
    },
  ],
  facilities: [
    { name: "Wi-Fi", description: "개발용 샘플 시설 정보입니다.", group: "기본 시설" },
    { name: "프런트 데스크", description: "실제 운영 조건은 최신 호텔 정보를 확인하세요.", group: "서비스" },
    { name: "짐 보관", description: "이용 가능 여부와 조건은 예약 전에 확인하세요.", group: "서비스" },
  ],
  restaurants: [],
  policy: {
    bookingNotes: [
      "본 데이터는 CozyTrip 개발용 샘플 데이터입니다.",
      "실제 가격, 객실 재고, 예약 가능 여부 및 정책은 예약 플랫폼에서 확인하세요.",
    ],
  },
  accommodationType: "호텔",
  checkIn: "15:00",
  checkOut: "11:00",
  affiliateLinks: sampleAffiliateLinks,
  publishedAt: "2026-09-18",
  updatedAt: "2026-09-18",
} as Hotel));

const generated = agodaHotels as AgodaHotelFile;
const generatedHotels = Array.isArray(generated.hotels) ? generated.hotels : [];
const myRealTripGenerated = myRealTripHotels as MyRealTripHotelFile;
const myRealTripGeneratedHotels = Array.isArray(myRealTripGenerated.hotels)
  ? myRealTripGenerated.hotels
  : [];

const sampleHotels = [...manualHotels, ...additionalSampleHotels];

/*
 * Agoda API 데이터가 들어오면 샘플 호텔을 자동으로 대체합니다.
 * API 승인 전에는 generatedHotels가 비어 있으므로 샘플 데이터로 개발합니다.
 */
const sourceHotels =
  generatedHotels.length > 0
    ? generatedHotels
    : myRealTripGeneratedHotels.length > 0
      ? myRealTripGeneratedHotels
      : sampleHotels;

const hotelMap = new Map<string, Hotel>();

for (const hotel of sourceHotels) {
  hotelMap.set(hotel.id, hotel);
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
