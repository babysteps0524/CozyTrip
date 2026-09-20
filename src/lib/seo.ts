import type { Destination, Hotel, HotelImage, HotelPost, Post } from "../types";

import generatedHotelPosts from "../data/generated/hotel-posts.generated.json";

export const SITE_NAME = "CozyTrip 코지트립";
export const SITE_URL = "https://cozytrip.kr";
export const DEFAULT_TITLE = `${SITE_NAME} | 일본 호텔과 여행 정보`;
export const DEFAULT_DESCRIPTION =
  "일본 호텔과 여행 정보를 한곳에서 알아보세요. 도쿄, 오사카, 후쿠오카, 삿포로 호텔과 여행 정보를 제공합니다.";

export interface SeoMetadata {
  title: string;
  description: string;
  canonical: string;
  ogType: "website" | "article";
  image?: HotelImage;
}

interface GeneratedHotelPostsFile {
  generatedAt: string;
  source: "ai";
  postCount: number;
  posts: HotelPost[];
}

function normalizeDescription(description: string): string {
  return description.replace(/\s+/g, " ").trim();
}

function normalizeNfc(value: string): string {
  return value.normalize("NFC");
}

function normalizeCanonicalPath(path: string): string {
  if (path === "/") return "/";
  return path.endsWith("/") ? path : `${path}/`;
}

export function createCanonical(path: string): string {
  return `${SITE_URL}${normalizeCanonicalPath(path)}`;
}

function getFirstImage(images: HotelImage[] | undefined): HotelImage | undefined {
  return images?.find((image) => image.rightsConfirmed && Boolean(image.src));
}

export function createSeoMetadata(
  route: string,
  destinations: Destination[],
  hotels: Hotel[],
  posts: Post[],
): SeoMetadata {
  const normalizedRoute = normalizeNfc(normalizeCanonicalPath(route));

  if (normalizedRoute === "/") {
    return {
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      canonical: createCanonical("/"),
      ogType: "website",
    };
  }

  if (normalizedRoute === "/japan/") {
    return {
      title: `일본 여행 및 호텔 정보 | ${SITE_NAME}`,
      description: "도쿄, 오사카, 후쿠오카, 삿포로의 호텔과 주요 지역, 여행 정보를 확인해보세요.",
      canonical: createCanonical("/japan/"),
      ogType: "website",
    };
  }

  if (normalizedRoute === "/guides/") {
    return {
      title: `일본 여행 가이드 | ${SITE_NAME}`,
      description: "일본 여행을 준비할 때 필요한 지역별 호텔 선택과 숙소 정보를 확인해보세요.",
      canonical: createCanonical("/guides/"),
      ogType: "website",
    };
  }

  if (normalizedRoute === "/about/") {
    return {
      title: `코지트립 소개 | ${SITE_NAME}`,
      description: "CozyTrip 코지트립의 운영 목적, 호텔 정보 출처와 여행 정보 제공 원칙을 확인해보세요.",
      canonical: createCanonical("/about/"),
      ogType: "website",
    };
  }

  if (normalizedRoute === "/privacy/") {
    return {
      title: `개인정보처리방침 | ${SITE_NAME}`,
      description: "CozyTrip 코지트립의 개인정보 및 외부 서비스 이용에 관한 안내를 확인해보세요.",
      canonical: createCanonical("/privacy/"),
      ogType: "website",
    };
  }

  if (normalizedRoute === "/affiliate/") {
    return {
      title: `제휴 및 광고 안내 | ${SITE_NAME}`,
      description: "CozyTrip 코지트립의 호텔 예약 제휴 링크와 광고 관련 안내를 확인해보세요.",
      canonical: createCanonical("/affiliate/"),
      ogType: "website",
    };
  }

  if (normalizedRoute === "/contact/") {
    return {
      title: `문의 | ${SITE_NAME}`,
      description: "CozyTrip 코지트립의 호텔 정보, 이미지, 콘텐츠 및 제휴 관련 문의 안내입니다.",
      canonical: createCanonical("/contact/"),
      ogType: "website",
    };
  }

  const destinationMatch = normalizedRoute.match(/^\/japan\/([^/]+)\/$/);
  if (destinationMatch) {
    const destination = destinations.find((item) => normalizeNfc(item.slug) === normalizeNfc(destinationMatch[1]));
    if (destination) {
      return {
        title: `${destination.name} 호텔 및 여행 정보 | ${SITE_NAME}`,
        description: normalizeDescription(
          `${destination.name} 여행에 필요한 호텔, 주요 지역과 여행 정보를 확인해보세요. ${destination.description}`,
        ),
        canonical: createCanonical(`/japan/${destination.slug}/`),
        ogType: "website",
        image: getFirstImage(destination.heroImage ? [destination.heroImage] : undefined),
      };
    }
  }

  const hotelListMatch = normalizedRoute.match(/^\/japan\/([^/]+)\/hotels\/$/);
  if (hotelListMatch) {
    const destination = destinations.find((item) => normalizeNfc(item.slug) === normalizeNfc(hotelListMatch[1]));
    if (destination) {
      const firstHotelImage = hotels
        .filter((hotel) => hotel.destinationId === destination.id)
        .flatMap((hotel) => hotel.images)
        .find((image) => image.rightsConfirmed && Boolean(image.src));

      return {
        title: `${destination.name} 호텔 추천 및 숙소 정보 | ${SITE_NAME}`,
        description: normalizeDescription(
          `${destination.name} 여행을 위한 호텔과 숙소 정보를 알아보세요. ${destination.description}`,
        ),
        canonical: createCanonical(`/japan/${destination.slug}/hotels/`),
        ogType: "website",
        image: firstHotelImage,
      };
    }
  }

  const hotelDetailMatch = normalizedRoute.match(
    /^\/japan\/([^/]+)\/hotels\/([^/]+)\/$/,
  );
  if (hotelDetailMatch) {
    const destination = destinations.find(
      (item) => normalizeNfc(item.slug) === normalizeNfc(hotelDetailMatch[1]),
    );
    const hotel = hotels.find(
      (item) => normalizeNfc(item.slug) === normalizeNfc(hotelDetailMatch[2]),
    );

    if (destination && hotel && hotel.destinationId === destination.id) {
      const hotelPost = posts.find(
        (item) => item.category === "hotel" && item.hotelId === hotel.id,
      );

      return {
        title: hotelPost?.title
          ? `${hotelPost.title} | ${SITE_NAME}`
          : `${hotel.name} | ${SITE_NAME}`,
        description: normalizeDescription(
          hotelPost?.description || hotel.description,
        ),
        canonical: createCanonical(
          `/japan/${destination.slug}/hotels/${hotel.slug}/`,
        ),
        ogType: hotelPost ? "article" : "website",
        image: getFirstImage(hotel.images),
      };
    }
  }

  const guideMatch = normalizedRoute.match(/^\/guides\/([^/]+)\/$/);
  if (guideMatch) {
    const guide = posts.find(
      (item) => normalizeNfc(item.slug) === normalizeNfc(guideMatch[1]) && item.category === "guide",
    );

    if (guide) {
      const guideImage = guide.blocks.find((block) => block.type === "image");
      const guideGallery = guide.blocks.find(
        (block) => block.type === "gallery" && block.images.length > 0,
      );
      const image =
        guideImage?.type === "image"
          ? guideImage.image
          : guideGallery?.type === "gallery"
            ? guideGallery.images[0]
            : undefined;

      return {
        title: `${guide.title} | ${SITE_NAME}`,
        description: normalizeDescription(guide.description),
        canonical: createCanonical(`/guides/${guide.slug}/`),
        ogType: "article",
        image,
      };
    }
  }

  return {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    canonical: createCanonical(normalizedRoute),
    ogType: "website",
  };
}

function getGeneratedHotelPost(hotelId: string): HotelPost | undefined {
  const source = generatedHotelPosts as GeneratedHotelPostsFile;
  if (!Array.isArray(source.posts)) return undefined;
  return source.posts.find((post) => post.hotelId === hotelId);
}

function createFaqItems(hotel: Hotel, hotelPost?: HotelPost) {
  const sourcePost = hotelPost ?? getGeneratedHotelPost(hotel.id);
  if (!sourcePost || sourcePost.faq.length === 0) return [];

  return sourcePost.faq.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  }));
}

export function createHotelStructuredData(
  hotel: Hotel,
  destination: Destination,
): Record<string, unknown> {
  const canonical = createCanonical(
    `/japan/${destination.slug}/hotels/${hotel.slug}/`,
  );
  const images = hotel.images
    .filter((image) => image.rightsConfirmed && Boolean(image.src))
    .map((image) =>
      image.src.startsWith("http")
        ? image.src
        : `${SITE_URL}${image.src.startsWith("/") ? image.src : `/${image.src}`}`,
    )
    .slice(0, 8);

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: hotel.name,
    description: normalizeDescription(hotel.description),
    url: canonical,
    address: {
      "@type": "PostalAddress",
      addressCountry: hotel.location.countryCode,
      addressRegion: hotel.location.prefecture,
      addressLocality: hotel.location.city,
      ...(hotel.location.address
        ? { streetAddress: hotel.location.address }
        : {}),
    },
  };

  if (hotel.nameEn) data.alternateName = hotel.nameEn;
  if (images.length > 0) data.image = images;

  if (
    hotel.location.latitude !== undefined &&
    hotel.location.longitude !== undefined
  ) {
    data.geo = {
      "@type": "GeoCoordinates",
      latitude: hotel.location.latitude,
      longitude: hotel.location.longitude,
    };
  }

  if (hotel.starRating !== undefined) {
    data.starRating = {
      "@type": "Rating",
      ratingValue: hotel.starRating,
      bestRating: 5,
    };
  }

  if (hotel.checkIn) data.checkinTime = hotel.checkIn;
  if (hotel.checkOut) data.checkoutTime = hotel.checkOut;

  return data;
}


export function createHotelListStructuredData(
  destination: Destination,
  hotels: Hotel[],
): Record<string, unknown> {
  const destinationHotels = hotels.filter(
    (hotel) => hotel.destinationId === destination.id,
  );

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: destination.name + " 호텔 목록",
    url: createCanonical("/japan/" + destination.slug + "/hotels/"),
    numberOfItems: destinationHotels.length,
    itemListElement: destinationHotels.map((hotel, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: hotel.name,
      url: createCanonical(
        "/japan/" + destination.slug + "/hotels/" + hotel.slug + "/",
      ),
    })),
  };
}

export function createFaqStructuredData(
  hotel: Hotel,
  hotelPost?: HotelPost,
): Record<string, unknown> | undefined {
  const mainEntity = createFaqItems(hotel, hotelPost);
  if (mainEntity.length === 0) return undefined;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity,
  };
}

export function createBreadcrumbStructuredData(
  route: string,
  destination: Destination,
  hotel?: Hotel,
): Record<string, unknown> {
  const items: Array<Record<string, unknown>> = [
    {
      "@type": "ListItem",
      position: 1,
      name: "CozyTrip",
      item: createCanonical("/"),
    },
    {
      "@type": "ListItem",
      position: 2,
      name: destination.name,
      item: createCanonical(`/japan/${destination.slug}/`),
    },
  ];

  if (hotel) {
    items.push(
      {
        "@type": "ListItem",
        position: 3,
        name: "호텔",
        item: createCanonical(`/japan/${destination.slug}/hotels/`),
      },
      {
        "@type": "ListItem",
        position: 4,
        name: hotel.name,
        item: createCanonical(route),
      },
    );
  }

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
}
