import { resolve } from "node:path";
import type { Hotel } from "../src/types";

interface HotelSourceFile {
  hotels?: Hotel[];
}

const root = resolve(import.meta.dir, "..");
const hotelPath = resolve(root, "src/data/generated/myrealtrip-hotels.json");

const EXPECTED_DAILY_PLAN = new Map<string, number>([
  ["japan-tokyo", 3],
  ["japan-osaka", 3],
  ["japan-kyoto", 2],
  ["japan-fukuoka", 2],
  ["japan-okinawa", 1],
]);

function fail(message: string): never {
  throw new Error(`Hotel daily plan validation failed: ${message}`);
}

async function readHotels(): Promise<Hotel[]> {
  const file = Bun.file(hotelPath);

  if (!(await file.exists())) {
    fail(`MyRealTrip hotel data not found: ${hotelPath}`);
  }

  let source: HotelSourceFile;

  try {
    source = JSON.parse(await file.text()) as HotelSourceFile;
  } catch (error) {
    fail(
      `Invalid MyRealTrip hotel JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  if (!Array.isArray(source.hotels) || source.hotels.length === 0) {
    fail("MyRealTrip hotel inventory is empty.");
  }

  return source.hotels;
}

async function main(): Promise<void> {
  const hotels = await readHotels();

  const inventoryCounts = new Map<string, number>();

  for (const hotel of hotels) {
    if (!hotel.destinationId) {
      fail(`Hotel has no destinationId: ${hotel.id}`);
    }

    inventoryCounts.set(
      hotel.destinationId,
      (inventoryCounts.get(hotel.destinationId) ?? 0) + 1,
    );
  }

  const expectedTotal = [...EXPECTED_DAILY_PLAN.values()].reduce(
    (total, count) => total + count,
    0,
  );

  if (expectedTotal !== 11) {
    fail(`Expected daily total is 11, got ${expectedTotal}.`);
  }

  for (const [destinationId, count] of EXPECTED_DAILY_PLAN) {
    if (!Number.isInteger(count) || count <= 0) {
      fail(`Invalid planned count for ${destinationId}: ${count}`);
    }

    const inventoryCount = inventoryCounts.get(destinationId) ?? 0;

    if (inventoryCount === 0) {
      fail(`Daily plan references a destination with no hotels: ${destinationId}`);
    }

    if (count > inventoryCount) {
      fail(
        `Daily plan for ${destinationId} requests ${count} hotels, but inventory has only ${inventoryCount}.`,
      );
    }
  }

  for (const destinationId of inventoryCounts.keys()) {
    if (!EXPECTED_DAILY_PLAN.has(destinationId)) {
      console.log(
        `Daily plan excluded destination: ${destinationId} (${inventoryCounts.get(destinationId)} hotels in inventory)`,
      );
    }
  }

  console.log("");
  console.log("Hotel daily plan validation complete.");
  console.log(`Hotel inventory: ${hotels.length}`);
  console.log(`Daily generation target: ${expectedTotal}`);

  for (const [destinationId, count] of EXPECTED_DAILY_PLAN) {
    console.log(
      `${destinationId}: ${count} post(s) / ${inventoryCounts.get(destinationId)} hotel(s)`,
    );
  }

  console.log("Hotel daily plan validation passed.");
}

await main();
