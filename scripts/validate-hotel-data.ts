import { resolve } from "node:path";
import type { Hotel } from "../src/types";
import {
  formatHotelValidationFailure,
  validateHotelData,
} from "./lib/validate-hotel-data";

interface HotelSourceFile {
  generatedAt?: string;
  source?: string;
  hotelCount?: number;
  hotels?: Hotel[];
  search?: {
    checkIn?: string;
    checkOut?: string;
    adultCount?: number;
    childCount?: number;
  };
}

interface HotelSource {
  name: string;
  filePath: string;
  source: HotelSourceFile;
}

const root = resolve(import.meta.dir, "..");

const sources: HotelSource[] = [
  {
    name: "Agoda",
    filePath: resolve(root, "src/data/generated/agoda-hotels.json"),
    source: await readSource(
      resolve(root, "src/data/generated/agoda-hotels.json"),
    ),
  },
  {
    name: "MyRealTrip",
    filePath: resolve(root, "src/data/generated/myrealtrip-hotels.json"),
    source: await readSource(
      resolve(root, "src/data/generated/myrealtrip-hotels.json"),
    ),
  },
];

async function readSource(filePath: string): Promise<HotelSourceFile> {
  const file = Bun.file(filePath);

  if (!(await file.exists())) {
    return {};
  }

  const raw = await file.text();

  try {
    return JSON.parse(raw) as HotelSourceFile;
  } catch (error) {
    throw new Error(
      [
        `Failed to parse hotel data: ${filePath}`,
        error instanceof Error ? error.message : String(error),
      ].join("\n"),
    );
  }
}

async function main(): Promise<void> {
  const allHotels = sources.flatMap((source) =>
    Array.isArray(source.source.hotels)
      ? source.source.hotels.map((hotel) => ({
          hotel,
          sourceName: source.name,
        }))
      : [],
  );

  if (allHotels.length === 0) {
    console.log("No hotels found. Nothing to validate.");
    for (const source of sources) {
      const count = Array.isArray(source.source.hotels)
        ? source.source.hotels.length
        : 0;
      console.log(`${source.name}: ${count} hotel(s)`);
    }
    return;
  }

  let validCount = 0;
  let invalidCount = 0;
  let warningCount = 0;

  for (const { hotel, sourceName } of allHotels) {
    const result = validateHotelData(hotel);
    warningCount += result.warnings.length;

    for (const warning of result.warnings) {
      console.warn(
        `Hotel data warning [${sourceName} / ${hotel.id}]: ${warning}`,
      );
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
  console.log(`Total: ${allHotels.length}`);
  console.log(`Valid: ${validCount}`);
  console.log(`Invalid: ${invalidCount}`);
  console.log(`Warnings: ${warningCount}`);

  for (const source of sources) {
    const count = Array.isArray(source.source.hotels)
      ? source.source.hotels.length
      : 0;
    console.log(`${source.name}: ${count} hotel(s)`);
  }

  if (invalidCount > 0) {
    process.exit(1);
  }
}

await main();
