import type { Destination, Hotel, Post, HotelImage } from "../types";

export const SITE_NAME = "CozyTrip 코지트립";

export const SITE_URL = "https://cozytrip.kr";

export const DEFAULT_TITLE = `${SITE_NAME} | 일본 호텔과 여행 정보`;

export const DEFAULT_DESCRIPTION =
  "일본 호텔과 여행 정보를 한곳에서 알아보세요. 도쿄, 오사카, 교토, 후쿠오카, 삿포로, 오키나와 호텔과 여행 정보를 제공합니다.";

export interface SeoMetadata {
  title: string;
  description: string;
  canonical: string;
  ogType: "website" | "article";
  image?: HotelImage;
}

function normalizeDescription(description: string): string {
  return description.replace(/\s+/g, " ").trim();
}

function normalizeCanonicalPath(path: string): string {
  if (path === "/") {
    return "/";
  }

  return path.endsWith("/") ? path : `${path}/`;
}

function createCanonical(path: string): string {
  return `${SITE_URL}${normalizeCanonicalPath(path)}`;
}

function getFirstImage(
  images: HotelImage[] | undefined,
): HotelImage | undefined {
  return images?.[0];
}

export function createSeoMetadata(
  route: string,
  destinations: Destination[],
  hotels: Hotel[],
  posts: Post[],
): SeoMetadata {
  const normalizedRoute = normalizeCanonicalPath(route);

  if (normalizedRoute === "/") {
    return {
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      canonical: createCanonical("/"),
      ogType: "website",
    };
  }

  const destinationMatch = normalizedRoute.match(/^\/japan\/([^/]+)\/$/);

  if (destinationMatch) {
    const destinationSlug = destinationMatch[1];

    const destination = destinations.find(
      (item) => item.slug === destinationSlug,
    );

    if (destination) {
      return {
        title: `${destination.name} 호텔과 여행 정보 | ${SITE_NAME}`,
        description: normalizeDescription(destination.description),
        canonical: createCanonical(`/japan/${destination.slug}/`),
        ogType: "website",
        image: destination.heroImage,
      };
    }
  }

  const hotelListMatch = normalizedRoute.match(/^\/japan\/([^/]+)\/hotels\/$/);

  if (hotelListMatch) {
    const destinationSlug = hotelListMatch[1];

    const destination = destinations.find(
      (item) => item.slug === destinationSlug,
    );

    if (destination) {
      const destinationHotels = hotels.filter(
        (hotel) => hotel.destinationId === destination.id,
      );

      const firstHotelImage = destinationHotels[0]?.images?.[0];

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
    const destinationSlug = hotelDetailMatch[1];

    const hotelSlug = hotelDetailMatch[2];

    const destination = destinations.find(
      (item) => item.slug === destinationSlug,
    );

    const hotel = hotels.find((item) => item.slug === hotelSlug);

    if (destination && hotel && hotel.destinationId === destination.id) {
      return {
        title: `${hotel.name} | ${SITE_NAME}`,
        description: normalizeDescription(hotel.description),
        canonical: createCanonical(
          `/japan/${destination.slug}/hotels/${hotel.slug}/`,
        ),
        ogType: "website",
        image: getFirstImage(hotel.images),
      };
    }
  }

  const guideMatch = normalizedRoute.match(/^\/guides\/([^/]+)\/$/);

  if (guideMatch) {
    const guideSlug = guideMatch[1];

    const guide = posts.find(
      (item) => item.slug === guideSlug && item.category === "guide",
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
