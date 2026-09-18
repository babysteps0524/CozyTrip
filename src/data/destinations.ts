import type { Destination } from "../types";

export const destinations: Destination[] = [
  {
    id: "japan-tokyo",
    name: "도쿄",
    nameEn: "Tokyo",
    slug: "tokyo",
    country: "일본",
    countryCode: "JP",
    prefecture: "Tokyo",
    description: "도쿄의 신주쿠, 시부야, 긴자 등 주요 여행 지역과 호텔 정보를 확인해보세요.",
    popularAreas: ["신주쿠", "시부야", "긴자", "아사쿠사", "우에노"],
    popularAttractions: ["도쿄 스카이트리", "센소지", "시부야", "도쿄역"],
  },

  {
    id: "japan-osaka",
    name: "오사카",
    nameEn: "Osaka",
    slug: "osaka",
    country: "일본",
    countryCode: "JP",
    prefecture: "Osaka",
    description: "오사카의 난바, 우메다, 신사이바시 등 주요 여행 지역과 호텔 정보를 확인해보세요.",
    popularAreas: ["난바", "우메다", "신사이바시", "텐노지"],
    popularAttractions: [
      "도톤보리",
      "오사카성",
      "유니버설 스튜디오 재팬",
      "신세카이",
    ],
  },

  {
    id: "japan-kyoto",
    name: "교토",
    nameEn: "Kyoto",
    slug: "kyoto",
    country: "일본",
    countryCode: "JP",
    prefecture: "Kyoto",
    description: "교토역, 기온, 가와라마치 등 주요 여행 지역과 주변 호텔 정보를 확인해보세요.",
    popularAreas: ["교토역", "기온", "가와라마치", "아라시야마"],
    popularAttractions: ["기요미즈데라", "후시미 이나리", "아라시야마", "기온"],
  },

  {
    id: "japan-fukuoka",
    name: "후쿠오카",
    nameEn: "Fukuoka",
    slug: "fukuoka",
    country: "일본",
    countryCode: "JP",
    prefecture: "Fukuoka",
    description: "후쿠오카의 하카타, 텐진, 나카스 등 주요 지역과 호텔 정보를 확인해보세요.",
    popularAreas: ["하카타", "텐진", "나카스", "모모치"],
    popularAttractions: [
      "캐널시티 하카타",
      "오호리 공원",
      "후쿠오카 타워",
      "나카스",
    ],
  },

  {
    id: "japan-sapporo",
    name: "삿포로",
    nameEn: "Sapporo",
    slug: "sapporo",
    country: "일본",
    countryCode: "JP",
    prefecture: "Hokkaido",
    description:
      "삿포로역, 오도리, 스스키노 등 주요 지역과 호텔 정보를 확인해보세요.",
    popularAreas: ["삿포로역", "오도리", "스스키노", "나카지마 공원"],
    popularAttractions: [
      "오도리 공원",
      "삿포로 시계탑",
      "삿포로 TV 타워",
      "스스키노",
    ],
  },

  {
    id: "japan-okinawa",
    name: "오키나와",
    nameEn: "Okinawa",
    slug: "okinawa",
    country: "일본",
    countryCode: "JP",
    prefecture: "Okinawa",
    description:
      "나하, 온나손, 차탄 등 주요 지역과 오키나와 여행을 위한 호텔 정보를 확인해보세요.",
    popularAreas: ["나하", "온나손", "차탄", "아메리칸 빌리지"],
    popularAttractions: [
      "슈리성",
      "국제거리",
      "아메리칸 빌리지",
      "추라우미 수족관",
    ],
  },
];

export const destinationMap = new Map(
  destinations.map((destination) => [destination.id, destination]),
);

export function getDestinationById(id: string): Destination | undefined {
  return destinationMap.get(id);
}

export function getDestinationBySlug(slug: string): Destination | undefined {
  return destinations.find((destination) => destination.slug === slug);
}
