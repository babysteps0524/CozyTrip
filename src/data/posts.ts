import type { Post } from "../types";

export const posts: Post[] = [
  {
    id: "sample-tokyo-hotel-guide",

    category: "hotel",

    title: "도쿄 호텔을 선택할 때 확인할 점",

    slug: "sample-tokyo-hotel-guide",

    description:
      "도쿄 여행에서 호텔을 선택할 때 위치와 교통 등을 확인하는 방법을 알아봅니다.",

    destinationId: "japan-tokyo",

    hotelId: "sample-tokyo-hotel",

    blocks: [
      {
        type: "heading",
        level: 2,
        text: "도쿄 호텔 위치 확인하기",
      },

      {
        type: "paragraph",
        text: "도쿄는 지역에 따라 여행 동선과 교통 환경이 크게 달라질 수 있습니다. 호텔을 선택할 때는 주요 방문지와 역의 위치를 함께 확인하는 것이 좋습니다.",
      },

      {
        type: "heading",
        level: 2,
        text: "주요 역과의 거리 확인하기",
      },

      {
        type: "paragraph",
        text: "숙소 주변의 역과 이용하려는 노선을 확인하면 여행 일정에 맞는 숙소를 비교하기 쉽습니다.",
      },
    ],

    publishedAt: "2026-09-16",

    tags: ["도쿄", "일본여행", "호텔"],
  },

  {
    id: "sample-japan-travel-guide",

    category: "guide",

    title: "일본 여행에서 호텔 지역을 선택하는 방법",

    slug: "sample-japan-travel-guide",

    description:
      "일본 여행을 준비하면서 숙박 지역을 선택할 때 확인할 사항을 정리합니다.",

    destinationId: "japan-tokyo",

    blocks: [
      {
        type: "heading",
        level: 2,
        text: "여행 일정부터 확인하기",
      },

      {
        type: "paragraph",
        text: "숙박 지역을 선택하기 전에 여행 기간과 주요 방문지를 먼저 정리하면 호텔 위치를 비교하기 쉽습니다.",
      },

      {
        type: "heading",
        level: 2,
        text: "교통편 확인하기",
      },

      {
        type: "paragraph",
        text: "공항에서 숙소까지 이동하는 방법과 여행 중 자주 이용할 역을 함께 확인하는 것이 좋습니다.",
      },
    ],

    publishedAt: "2026-09-16",

    tags: ["일본여행", "호텔", "여행가이드"],
  },
];

export const postMap = new Map(posts.map((post) => [post.id, post]));

export function getPostById(id: string): Post | undefined {
  return postMap.get(id);
}

export function getPostBySlug(slug: string): Post | undefined {
  return posts.find((post) => post.slug === slug);
}

export function getPostsByCategory(category: Post["category"]): Post[] {
  return posts.filter((post) => post.category === category);
}

export function getPostsByDestination(destinationId: string): Post[] {
  return posts.filter((post) => post.destinationId === destinationId);
}

export function getPostsByHotel(hotelId: string): Post[] {
  return posts.filter((post) => post.hotelId === hotelId);
}
