import { resolve } from "node:path";
import type { Hotel, HotelPost } from "../src/types";
import { validateHotelPost } from "../src/lib/ai/validate";
import { validateHotelPostFacts } from "../src/lib/ai/factual";

interface MyRealTripHotelsFile {
  hotels: unknown[];
}

interface GeneratedHotelPostFile {
  posts: HotelPost[];
}

const root = resolve(import.meta.dir, "..");
const hotelsPath = resolve(root, "src/data/generated/myrealtrip-hotels.json");
const postsPath = resolve(root, "src/data/generated/hotel-posts.generated.json");

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function asHotel(value: unknown): Hotel | null {
  if (!isRecord(value) || typeof value.id !== "string") return null;
  return value as unknown as Hotel;
}

async function main(): Promise<void> {
  const hotelsFile = JSON.parse(await Bun.file(hotelsPath).text()) as MyRealTripHotelsFile;
  const postsFile = JSON.parse(await Bun.file(postsPath).text()) as GeneratedHotelPostFile;

  const hotels = Array.isArray(hotelsFile.hotels)
    ? hotelsFile.hotels.map(asHotel).filter((hotel): hotel is Hotel => hotel !== null)
    : [];
  const posts = Array.isArray(postsFile.posts) ? postsFile.posts : [];
  const hotelMap = new Map(hotels.map((hotel) => [hotel.id, hotel]));

  let failed = 0;

  for (const post of posts) {
    const hotel = hotelMap.get(post.hotelId);

    if (!hotel) {
      failed += 1;
      console.error(`HotelPost ${post.id} references missing hotel: ${post.hotelId}`);
      continue;
    }

    try {
      validateHotelPost(post, hotel, {
        availableImages: hotel.images.filter((image) => image.rightsConfirmed),
      });
      const factWarnings = validateHotelPostFacts(post, hotel);
      for (const warning of factWarnings) {
        console.warn(`FACT WARNING [${post.id}] ${warning.message}`);
      }
      console.log(`OK: ${post.id}`);
    } catch (error) {
      failed += 1;
      console.error(
        `FAILED: ${post.id}`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  const factWarningCount = posts.reduce((count, post) => {
    const hotel = hotelMap.get(post.hotelId);
    return hotel ? count + validateHotelPostFacts(post, hotel).length : count;
  }, 0);

  console.log(`HotelPost validation: ${posts.length - failed} passed, ${failed} failed.`);
  console.log(`Factual content warnings: ${factWarningCount}`);

  if (failed > 0) process.exit(1);
}

await main();
