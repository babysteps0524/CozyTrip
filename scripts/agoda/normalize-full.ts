import type { HotelFacility, HotelImage, HotelRoom } from "../../src/types";

import type {
  AgodaFullFacility,
  AgodaFullPicture,
  AgodaFullRoomType,
} from "./types";

function clean(value: string | undefined | null): string {
  return (value ?? "").trim();
}

function getFacilityName(facility: AgodaFullFacility): string {
  return (
    clean(facility.propertyTranslatedName) ||
    clean(facility.propertyName) ||
    "호텔 시설"
  );
}

export function normalizeFacilities(
  facilities: AgodaFullFacility[],
): HotelFacility[] {
  const unique = new Map<string, HotelFacility>();

  for (const facility of facilities) {
    const name = getFacilityName(facility);

    if (!name) {
      continue;
    }

    const key = [clean(facility.propertyGroupDescription), name]
      .join("|")
      .toLowerCase();

    if (unique.has(key)) {
      continue;
    }

    unique.set(key, {
      name,

      description: clean(facility.propertyName) || undefined,

      group: clean(facility.propertyGroupDescription) || undefined,
    });
  }

  return Array.from(unique.values());
}

function getRoomName(room: AgodaFullRoomType): string {
  return (
    clean(room.standardCaptionTranslated) ||
    clean(room.standardCaption) ||
    clean(room.hotelRoomtypeAlternateName) ||
    `객실 ${room.hotelRoomtypeId ?? ""}`.trim()
  );
}

function createRoomImages(room: AgodaFullRoomType): HotelImage[] {
  const urls = [
    room.hotelRoomtypePicture,
    ...(room.hotelRoomtypePictures ?? []),
  ].filter((value): value is string => Boolean(clean(value)));

  return urls.map((src, index) => ({
    id: ["agoda-room", room.hotelRoomtypeId ?? "unknown", index].join("-"),

    src: clean(src),

    alt: `${getRoomName(room)} 객실 이미지`,

    /*
     * Agoda Content API의 해당 응답 필드에서는
     * 실제 이미지 width/height를 제공하지 않으므로
     * 0을 넣지 않고 undefined를 사용한다.
     *
     * 현재 HotelImage 타입은 필수이므로
     * 실제 이미지 메타데이터를 확보하는 단계에서
     * 최종값을 넣는다.
     */

    source: "agoda",

    type: "room",

    hotelId: room.hotelId,

    credit: "Agoda",

    rightsConfirmed: false,
  }));
}

export function normalizeRooms(rooms: AgodaFullRoomType[]): HotelRoom[] {
  return rooms
    .filter(
      (room) =>
        Boolean(clean(room.hotelRoomtypeId)) ||
        Boolean(clean(room.standardCaptionTranslated)) ||
        Boolean(clean(room.standardCaption)),
    )
    .map((room) => ({
      id: clean(room.hotelRoomtypeId) || undefined,

      name: getRoomName(room),

      maxOccupancy: room.maxOccupancyPerRoom,

      size: room.sizeOfRoom,

      bedType: clean(room.bedType) || undefined,

      images: createRoomImages(room),
    }));
}

export function normalizeFullPictures(
  pictures: AgodaFullPicture[],
  hotelId: string,
  hotelName: string,
): HotelImage[] {
  return pictures
    .filter(
      (picture) => picture.hotelId === hotelId && Boolean(clean(picture.URL)),
    )
    .map((picture, index) => ({
      id: `agoda-${hotelId}-full-${picture.pictureId ?? index}`,

      src: clean(picture.URL),

      alt:
        clean(picture.captionTranslated) ||
        clean(picture.caption) ||
        `${hotelName} 호텔 이미지`,

      source: "agoda",

      type: getPictureType(picture.pictureGroup, index),

      hotelId,

      credit: "Agoda",

      rightsConfirmed: false,
    }));
}

function getPictureType(
  group: string | undefined,
  index: number,
): HotelImage["type"] {
  const value = clean(group).toLowerCase();

  if (value.includes("room") || value.includes("bed")) {
    return "room";
  }

  if (
    value.includes("restaurant") ||
    value.includes("dining") ||
    value.includes("food")
  ) {
    return "restaurant";
  }

  if (
    value.includes("pool") ||
    value.includes("spa") ||
    value.includes("gym") ||
    value.includes("facility") ||
    value.includes("lobby")
  ) {
    return "facility";
  }

  if (
    value.includes("location") ||
    value.includes("view") ||
    value.includes("exterior")
  ) {
    return "location";
  }

  return index === 0 ? "hero" : "gallery";
}
