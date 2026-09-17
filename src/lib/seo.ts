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

export function createCanonical(path: string): string {
  return `${SITE_URL}${normalizeCanonicalPath(path)}`;
}

function getFirstImage(
  images: HotelImage[] | undefined,
): HotelImage | undefined {
  return images?.find((image) => image.rightsConfirmed && Boolean(image.src));
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
    const destination = destinations.find((item) => item.slug === destinationSlug);

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
    const destination = destinations.find((item) => item.slug === destinationSlug);

    if (destination) {
      const destinationHotels = hotels.filter(
        (hotel) => hotel.destinationId === destination.id,
      );
      const firstHotelImage = destinationHotels
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
    const destinationSlug = hotelDetailMatch[1];
    const hotelSlug = hotelDetailMatch[2];
    const destination = destinations.find((item) => item.slug === destinationSlug);
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

export function createHotelStructuredData(
  hotel: Hotel,
  destination: Destination,
): Record<string, unknown> {
  const canonical = createCanonical(
    `/japan/${destination.slug}/hotels/${hotel.slug}/`,
  );
  const images = hotel.images
    .filter((image) => image.rightsConfirmed && Boolean(image.src))
    .map((image) => image.src.startsWith("http") ? image.src : `${SITE_URL}${image.src.startsWith("/") ? image.src : `/${image.src}`}`)
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
      streetAddress: hotel.location.address,
    },
  };

  if (hotel.nameEn) {
    data.alternateName = hotel.nameEn;
  }

  if (images.length > 0) {
    data.image = images;
  }

  if (hotel.location.latitude !== undefined && hotel.location.longitude !== undefined) {
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

  if (hotel.checkIn || hotel.checkOut) {
    data.checkinTime = hotel.checkIn;
    data.checkoutTime = hotel.checkOut;
  }

  return data;
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
    items.push({
      "@type": "ListItem",
      position: 3,
      name: "호텔",
      item: createCanonical(`/japan/${destination.slug}/hotels/`),
    });
    items.push({
      "@type": "ListItem",
      position: 4,
      name: hotel.name,
      item: createCanonical(route),
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
}
