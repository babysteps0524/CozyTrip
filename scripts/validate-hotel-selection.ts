import { resolve } from "node:path";
import type { Hotel, HotelPost } from "../src/types";
import { parseDailyPlan, selectHotels, validateSelectedHotels } from "./generate-hotel-posts";

interface MyRealTripHotelsFile { hotels?: Hotel[]; }
interface GeneratedHotelPostFile { posts?: HotelPost[]; }
interface FailedHotelPost {
  hotelId: string;
  destinationId: string;
  hotelName: string;
  attemptCount: number;
  status: "retrying" | "retry-exhausted";
  reason: string;
}
interface FailedHotelPostFile { failures?: FailedHotelPost[]; }

const root = resolve(import.meta.dir, "..");
const hotelsPath = resolve(root, "src/data/generated/myrealtrip-hotels.json");
const postsPath = resolve(root, "src/data/generated/hotel-posts.generated.json");
const failuresPath = resolve(root, "src/data/generated/hotel-post-failures.generated.json");
const DEFAULT_DAILY_PLAN = "japan-tokyo:3,japan-osaka:3,japan-kyoto:2,japan-fukuoka:2,japan-okinawa:1";

async function readJson<T>(path: string, fallback: T): Promise<T> {
  const file = Bun.file(path);
  if (!(await file.exists())) return fallback;
  return JSON.parse(await file.text()) as T;
}

async function main(): Promise<void> {
  const source = await readJson<MyRealTripHotelsFile>(hotelsPath, {});
  const postsSource = await readJson<GeneratedHotelPostFile>(postsPath, {});
  const failuresSource = await readJson<FailedHotelPostFile>(failuresPath, {});
  const hotels = Array.isArray(source.hotels) ? source.hotels : [];
  const existingPosts = Array.isArray(postsSource.posts) ? postsSource.posts : [];
  const failedHotels = Array.isArray(failuresSource.failures) ? failuresSource.failures : [];

  if (hotels.length === 0) throw new Error("MyRealTrip hotel inventory is empty.");

  const dailyPlanValue = process.env.AI_DAILY_PLAN?.trim() || DEFAULT_DAILY_PLAN;
  const plan = parseDailyPlan(dailyPlanValue);
  const selectedHotels = selectHotels(hotels, existingPosts, failedHotels);

  validateSelectedHotels(selectedHotels, hotels, existingPosts, failedHotels, plan);

  console.log("");
  console.log("Hotel daily selection validation complete.");
  console.log(`Inventory: ${hotels.length}`);
  console.log(`Existing posts: ${existingPosts.length}`);
  console.log(`Retry queue: ${failedHotels.length}`);
  console.log(`Selected for generation: ${selectedHotels.length}`);
  console.log(`Daily plan: ${dailyPlanValue}`);
  console.log("");

  for (const [destinationId, target] of Object.entries(plan)) {
    const selected = selectedHotels.filter((hotel) => hotel.destinationId === destinationId);
    console.log(`${destinationId}: ${selected.length}/${target} selected`);
  }

  const plannedTotal = Object.values(plan).reduce((total, count) => total + count, 0);
  if (selectedHotels.length !== plannedTotal) {
    throw new Error(`Expected ${plannedTotal} selected hotels, got ${selectedHotels.length}.`);
  }

  console.log("");
  console.log("Hotel daily selection validation passed.");
}

await main();