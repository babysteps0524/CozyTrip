import type { HotelImage } from "../../types";

import { getImageById } from "../../data/images";

export function resolveImage(imageId: string): HotelImage | undefined {
  return getImageById(imageId);
}
