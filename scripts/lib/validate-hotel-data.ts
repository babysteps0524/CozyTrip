import type { Hotel } from "../../src/types";

export interface HotelValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function addRequiredStringError(
  errors: string[],
  value: string,
  field: string,
): void {
  if (!value.trim()) {
    errors.push(`${field} is required.`);
  }
}

export function validateHotelData(hotel: Hotel): HotelValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  addRequiredStringError(errors, hotel.id, "id");
  addRequiredStringError(errors, hotel.name, "name");
  addRequiredStringError(errors, hotel.slug, "slug");
  addRequiredStringError(errors, hotel.country, "country");
  addRequiredStringError(errors, hotel.countryCode, "countryCode");
  addRequiredStringError(errors, hotel.prefecture, "prefecture");
  addRequiredStringError(errors, hotel.city, "city");
  addRequiredStringError(errors, hotel.destinationId, "destinationId");
  addRequiredStringError(errors, hotel.description, "description");

  if (hotel.countryCode && hotel.countryCode.length !== 2) {
    errors.push("countryCode must contain exactly 2 characters.");
  }

  if (hotel.location.countryCode !== hotel.countryCode) {
    errors.push("location.countryCode does not match hotel.countryCode.");
  }

  if (hotel.location.city !== hotel.city) {
    errors.push("location.city does not match hotel.city.");
  }

  if (hotel.location.prefecture !== hotel.prefecture) {
    errors.push("location.prefecture does not match hotel.prefecture.");
  }

  if (hotel.images.length === 0) {
    warnings.push("No hotel images are available.");
  }

  const imageIds = new Set<string>();

  for (const image of hotel.images) {
    if (!image.id.trim()) {
      errors.push("An image is missing id.");
    } else if (imageIds.has(image.id)) {
      errors.push(`Duplicate image id: ${image.id}`);
    } else {
      imageIds.add(image.id);
    }

    if (!image.src.trim()) {
      errors.push(`Image ${image.id || "unknown"} is missing src.`);
    }

    if (!image.alt.trim()) {
      warnings.push(`Image ${image.id || "unknown"} is missing alt text.`);
    }

    if (image.width !== undefined && (!Number.isInteger(image.width) || image.width <= 0)) {
      errors.push(`Image ${image.id || "unknown"} has invalid width.`);
    }

    if (image.height !== undefined && (!Number.isInteger(image.height) || image.height <= 0)) {
      errors.push(`Image ${image.id || "unknown"} has invalid height.`);
    }

    if (!image.rightsConfirmed) {
      warnings.push(`Image ${image.id || "unknown"} is not rights-confirmed.`);
    }
  }

  if (hotel.latitude !== undefined && !isFiniteNumber(hotel.latitude)) {
    errors.push("latitude must be a finite number.");
  }

  if (hotel.longitude !== undefined && !isFiniteNumber(hotel.longitude)) {
    errors.push("longitude must be a finite number.");
  }

  if (hotel.latitude !== undefined && (hotel.latitude < -90 || hotel.latitude > 90)) {
    errors.push("latitude must be between -90 and 90.");
  }

  if (hotel.longitude !== undefined && (hotel.longitude < -180 || hotel.longitude > 180)) {
    errors.push("longitude must be between -180 and 180.");
  }

  if (hotel.starRating !== undefined) {
    if (!isFiniteNumber(hotel.starRating) || hotel.starRating < 0 || hotel.starRating > 5) {
      errors.push("starRating must be between 0 and 5.");
    }
  }

  if (hotel.ratingAverage !== undefined) {
    if (
      !isFiniteNumber(hotel.ratingAverage) ||
      hotel.ratingAverage < 0 ||
      hotel.ratingAverage > 10
    ) {
      errors.push("ratingAverage must be between 0 and 10.");
    }
  }

  if (hotel.numberOfReviews !== undefined) {
    if (!Number.isInteger(hotel.numberOfReviews) || hotel.numberOfReviews < 0) {
      errors.push("numberOfReviews must be a non-negative integer.");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function formatHotelValidationFailure(
  hotel: Hotel,
  result: HotelValidationResult,
): string {
  const lines = [`Hotel validation failed: ${hotel.name} (${hotel.id})`];

  for (const error of result.errors) {
    lines.push(`  - ${error}`);
  }

  return lines.join("\n");
}
