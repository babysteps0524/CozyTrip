import { resolve } from "node:path";
import type { Hotel } from "../src/types";
import {
  formatHotelValidationFailure,
  validateHotelData,
} from "./lib/validate-hotel-data";

interface AgodaHotelsFile {
  generatedAt?: string;
  source?: string;
  hotelCount?: number;
  hotels?: Hotel[];
}

const root = resolve(import.meta.dir, "..");
const inputPath = resolve(root, "src/data/generated/agoda-hotels.json");

async function main(): Promise<void> {
  const raw = await Bun.file(inputPath).text();
  const source = JSON.parse(raw) as AgodaHotelsFile;
  const hotels = Array.isArray(source.hotels) ? source.hotels : [];

  if (hotels.length === 0) {
    console.log("No hotels found. Nothing to validate.");
    return;
  }

  let validCount = 0;
  let invalidCount = 0;
  let warningCount = 0;

  for (const hotel of hotels) {
    const result = validateHotelData(hotel);
    warningCount += result.warnings.length;

    for (const warning of result.warnings) {
      console.warn(`Hotel data warning [${hotel.id}]: ${warning}`);
    }

    if (result.valid) {
      validCount += 1;
      continue;
    }

    invalidCount += 1;
    console.error(formatHotelValidationFailure(hotel, result));
  }

  console.log("");
  console.log("Hotel data validation complete.");
  console.log(`Total: ${hotels.length}`);
  console.log(`Valid: ${validCount}`);
  console.log(`Invalid: ${invalidCount}`);
  console.log(`Warnings: ${warningCount}`);

  if (invalidCount > 0) {
    process.exit(1);
  }
}

await main();
