import type { HotelImage } from "../types";

export const images: HotelImage[] = [];

export const imageMap = new Map(images.map((image) => [image.id, image]));

export function getImageById(id: string): HotelImage | undefined {
  return imageMap.get(id);
}

export function getImagesByHotelId(hotelId: string): HotelImage[] {
  return images.filter((image) => image.hotelId === hotelId);
}

export function getImagesByType(type: HotelImage["type"]): HotelImage[] {
  return images.filter((image) => image.type === type);
}

export function getConfirmedImages(): HotelImage[] {
  return images.filter((image) => image.rightsConfirmed);
}
