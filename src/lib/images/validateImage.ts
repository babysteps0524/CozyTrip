import type { HotelImage } from "../../types";

export interface ImageValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateImage(image: HotelImage): ImageValidationResult {
  const errors: string[] = [];

  if (!image.id.trim()) {
    errors.push("이미지 ID가 없습니다.");
  }

  if (!image.src.trim()) {
    errors.push(`이미지 ${image.id}의 src가 없습니다.`);
  }

  if (!image.alt.trim()) {
    errors.push(`이미지 ${image.id}의 alt가 없습니다.`);
  }

  if (!Number.isFinite(image.width) || image.width <= 0) {
    errors.push(`이미지 ${image.id}의 width가 올바르지 않습니다.`);
  }

  if (!Number.isFinite(image.height) || image.height <= 0) {
    errors.push(`이미지 ${image.id}의 height가 올바르지 않습니다.`);
  }

  if (!image.rightsConfirmed) {
    errors.push(`이미지 ${image.id}의 사용 권리가 확인되지 않았습니다.`);
  }

  if (
    image.source !== "owned" &&
    image.source !== "licensed" &&
    !image.sourceUrl
  ) {
    errors.push(`이미지 ${image.id}의 출처 URL이 없습니다.`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateImages(images: HotelImage[]): ImageValidationResult {
  const errors = images.flatMap((image) => validateImage(image).errors);

  return {
    valid: errors.length === 0,
    errors,
  };
}
