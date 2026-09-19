import { resolve } from "node:path";
import type { Hotel } from "../src/types";

interface HotelSourceFile {
  hotels?: Hotel[];
}

const root = resolve(import.meta.dir, "..");
const filePath = resolve(root, "src/data/generated/myrealtrip-hotels.json");

function isDisplayableImage(image: Hotel["images"][number]): boolean {
  return Boolean(image.src.trim()) && image.rightsConfirmed;
}

async function main(): Promise<void> {
  const file = Bun.file(filePath);

  if (!(await file.exists())) {
    throw new Error(`MyRealTrip hotel data not found: ${filePath}`);
  }

  const source = JSON.parse(await file.text()) as HotelSourceFile;
  const hotels = Array.isArray(source.hotels) ? source.hotels : [];
  const imageUsageAllowed = process.env.MYREALTRIP_IMAGE_USAGE_ALLOWED === "true";

  if (hotels.length === 0) {
    throw new Error("MyRealTrip hotel data contains no hotels.");
  }

  const errors: string[] = [];
  let hotelsWithImages = 0;
  let displayableImages = 0;

  for (const hotel of hotels) {
    const images = Array.isArray(hotel.images)
      ? hotel.images.filter((image) => image.source === "myrealtrip")
      : [];
    const displayable = images.filter(isDisplayableImage);

    if (displayable.length > 0) {
      hotelsWithImages += 1;
      displayableImages += displayable.length;
    }

    if (imageUsageAllowed) {
      if (displayable.length === 0) {
        errors.push(
          `[${hotel.id}] image usage is enabled but no rights-confirmed MyRealTrip image is available.`,
        );
      }

      for (const image of images) {
        if (!image.rightsConfirmed) {
          errors.push(`[${hotel.id}] MyRealTrip image is not rights-confirmed.`);
        }
        if (!image.src.trim()) {
          errors.push(`[${hotel.id}] MyRealTrip image has an empty src.`);
        }
      }
    } else if (images.length > 0) {
      errors.push(
        `[${hotel.id}] MyRealTrip images exist while MYREALTRIP_IMAGE_USAGE_ALLOWED is not "true".`,
      );
    }
  }

  console.log("");
  console.log("MyRealTrip image validation complete.");
  console.log(`Hotels: ${hotels.length}`);
  console.log(`Hotels with displayable images: ${hotelsWithImages}`);
  console.log(`Displayable images: ${displayableImages}`);
  console.log(`Image usage allowed: ${imageUsageAllowed}`);

  if (errors.length > 0) {
    console.error("");
    for (const error of errors) {
      console.error(`Image validation error: ${error}`);
    }
    process.exit(1);
  }

  console.log("MyRealTrip image validation passed.");
}

await main();
