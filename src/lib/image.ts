import type { HotelImage } from "../types";

export function isDisplayableHotelImage(image: HotelImage): boolean {
  return image.rightsConfirmed && Boolean(image.src.trim());
}

export function getDisplayableHotelImages(images: HotelImage[]): HotelImage[] {
  return images.filter(isDisplayableHotelImage);
}
