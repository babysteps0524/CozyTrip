import type { HotelImage } from "../../types";

export interface ImageValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateImage(
  image: HotelImage,
): ImageValidationResult {
  const errors: string[] = [];

  if (!image.src.trim()) {
    errors.push("이미지 URL이 없습니다.");
  }

  if (!image.alt.trim()) {
    errors.push("이미지 alt가 없습니다.");
  }

  if (
    image.width !== undefined &&
    (!Number.isFinite(image.width) || image.width <= 0)
  ) {
    errors.push("이미지 width가 올바르지 않습니다.");
  }

  if (
    image.height !== undefined &&
    (!Number.isFinite(image.height) || image.height <= 0)
  ) {
    errors.push("이미지 height가 올바르지 않습니다.");
  }

  if (!image.rightsConfirmed) {
    errors.push("이미지 사용 권한이 확인되지 않았습니다.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateImages(
  images: HotelImage[],
): ImageValidationResult {
  const errors: string[] = [];

  images.forEach((image, index) => {
    const result = validateImage(image);

    if (!result.valid) {
      for (const error of result.errors) {
        errors.push(`이미지 ${index + 1}: ${error}`);
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}