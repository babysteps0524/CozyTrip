import type { AgodaHotelInformation, AgodaHotelPicture } from "./types";

import type { Hotel, HotelImage, HotelLocation } from "../../src/types";

export interface AgodaHotelContext {
  hotel: AgodaHotelInformation;
  pictures?: AgodaHotelPicture[];

  cityName: string;
  cityTranslated?: string;
  cityId?: string;

  description?: string;

  address?: {
    addressLine1?: string;
    addressLine2?: string;
    postalCode?: string;
    state?: string;
    city?: string;
    country?: string;
  };

  checkIn?: string;
  checkOut?: string;
}

function clean(value: string | undefined | null): string {
  return (value ?? "").trim();
}

function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .trim()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

function createHotelSlug(hotel: AgodaHotelInformation): string {
  const name = clean(
    hotel.translatedName || hotel.hotelName || `hotel-${hotel.hotelId}`,
  );

  const base = slugify(name);

  if (base) {
    return `${base}-${hotel.hotelId}`;
  }

  return `hotel-${hotel.hotelId}`;
}

function getHotelName(hotel: AgodaHotelInformation): string {
  return clean(
    hotel.translatedName ||
      hotel.hotelName ||
      hotel.hotelFormerlyName ||
      `호텔 ${hotel.hotelId}`,
  );
}

function getHotelEnglishName(hotel: AgodaHotelInformation): string | undefined {
  const original = clean(hotel.hotelName);

  return original || undefined;
}

function getImageType(pictureGroup: string | undefined): HotelImage["type"] {
  const group = clean(pictureGroup).toLowerCase();

  if (group.includes("room") || group.includes("bed")) {
    return "room";
  }

  if (
    group.includes("restaurant") ||
    group.includes("dining") ||
    group.includes("food")
  ) {
    return "restaurant";
  }

  if (
    group.includes("pool") ||
    group.includes("facility") ||
    group.includes("lobby") ||
    group.includes("spa") ||
    group.includes("gym")
  ) {
    return "facility";
  }

  if (
    group.includes("location") ||
    group.includes("view") ||
    group.includes("exterior")
  ) {
    return "location";
  }

  return "gallery";
}

function getImageAlt(hotelName: string, picture: AgodaHotelPicture): string {
  const caption = clean(picture.captionTranslated || picture.caption);

  if (caption) {
    return `${hotelName} - ${caption}`;
  }

  return `${hotelName} 호텔 이미지`;
}

function createHotelImages(
  hotel: AgodaHotelInformation,
  pictures: AgodaHotelPicture[],
): HotelImage[] {
  const hotelName = getHotelName(hotel);

  return pictures
    .filter((picture) => {
      return picture.hotelId === hotel.hotelId && Boolean(clean(picture.URL));
    })
    .map((picture, index) => {
      const type = index === 0 ? "hero" : getImageType(picture.pictureGroup);

      return {
        id: `agoda-${hotel.hotelId}-${picture.pictureId}`,
        src: clean(picture.URL),
        alt: getImageAlt(hotelName, picture),

        /*
         * Agoda Feed 7은 이미지 URL과 분류정보를
         * 제공하지만 현재 단계에서는 실제 이미지의
         * 픽셀 크기를 알 수 없으므로 0으로 둔다.
         *
         * 다음 단계에서 이미지 metadata 수집을 추가한다.
         */

        source: "agoda",
        type,
        hotelId: hotel.hotelId,
        credit: "Agoda",
        sourceUrl: hotel.hotelUrl,
        rightsConfirmed: false,
      };
    });
}

function createLocation(
  hotel: AgodaHotelInformation,
  context: AgodaHotelContext,
): HotelLocation {
  const city =
    clean(context.address?.city) ||
    clean(context.cityTranslated) ||
    clean(context.cityName);

  return {
    country: clean(context.address?.country) || "일본",

    countryCode: "JP",

    prefecture: clean(context.address?.state),

    city,

    area: "",

    address: [
      clean(context.address?.addressLine1),
      clean(context.address?.addressLine2),
      clean(context.address?.postalCode),
    ]
      .filter(Boolean)
      .join(" "),

    latitude: typeof hotel.latitude === "number" ? hotel.latitude : undefined,

    longitude:
      typeof hotel.longitude === "number" ? hotel.longitude : undefined,
  };
}

function createDestinationId(context: AgodaHotelContext): string {
  const city = clean(context.cityTranslated) || clean(context.cityName);

  const slug = slugify(city);

  if (slug) {
    return `japan-${slug}`;
  }

  if (context.cityId) {
    return `agoda-city-${context.cityId}`;
  }

  return "japan";
}

function createDescription(
  hotel: AgodaHotelInformation,
  description?: string,
): string {
  const normalizedDescription = clean(description);

  if (normalizedDescription) {
    return normalizedDescription;
  }

  const name = getHotelName(hotel);

  return `${name}의 호텔 정보와 위치, 객실 및 예약 정보를 확인해 보세요.`;
}

export function normalizeAgodaHotel(context: AgodaHotelContext): Hotel {
  const { hotel, pictures = [], description, checkIn, checkOut } = context;

  const name = getHotelName(hotel);

  const location = createLocation(hotel, context);

  const images = createHotelImages(hotel, pictures);

  const today = new Date().toISOString().slice(0, 10);

  return {
    id: `agoda-${hotel.hotelId}`,

    name,

    nameEn: getHotelEnglishName(hotel),

    slug: createHotelSlug(hotel),

    country: clean(context.address?.country) || "일본",

    countryCode: "JP",

    prefecture: clean(context.address?.state),

    city: clean(context.cityTranslated) || clean(context.cityName),

    area: "",

    destinationId: createDestinationId(context),

    description: createDescription(hotel, description),

    location,

    images,

    rooms: [],

    facilities: [],

    restaurants: [],

    checkIn,

    checkOut,

    affiliateLinks: [],

    publishedAt: today,

    updatedAt: today,
  };
}

export function normalizeAgodaHotels(contexts: AgodaHotelContext[]): Hotel[] {
  const hotels = contexts.map(normalizeAgodaHotel);

  const uniqueHotels = new Map<string, Hotel>();

  for (const hotel of hotels) {
    uniqueHotels.set(hotel.id, hotel);
  }

  return Array.from(uniqueHotels.values());
}
