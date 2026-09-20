import { resolve } from "node:path";
import type { Hotel, HotelPost } from "../src/types";
import { validateHotelPost } from "../src/lib/ai/validate";

interface GeneratedHotelPostsFile {
  generatedAt: string;
  source: "ai";
  postCount: number;
  posts: HotelPost[];
}

interface MyRealTripHotelsFile {
  hotels: Hotel[];
}

const root = resolve(import.meta.dir, "..");
const postsPath = resolve(root, "src/data/generated/hotel-posts.generated.json");
const hotelsPath = resolve(root, "src/data/generated/myrealtrip-hotels.json");

function getHotelId(): string {
  const argument = process.argv.find((item) => item.startsWith("--hotel-id="));
  const hotelId = argument?.slice("--hotel-id=".length).trim();

  if (!hotelId) {
    throw new Error(
      "Usage: bun scripts/publish-hotel-post.ts --hotel-id=myrealtrip-123",
    );
  }

  return hotelId;
}

async function main(): Promise<void> {
  const hotelId = getHotelId();

  const postsFile = JSON.parse(
    await Bun.file(postsPath).text(),
  ) as GeneratedHotelPostsFile;
  const hotelsFile = JSON.parse(
    await Bun.file(hotelsPath).text(),
  ) as MyRealTripHotelsFile;

  const postIndex = postsFile.posts.findIndex(
    (post) => post.hotelId === hotelId,
  );

  if (postIndex < 0) {
    throw new Error(`Hotel post not found: ${hotelId}`);
  }

  const post = postsFile.posts[postIndex];
  const hotel = hotelsFile.hotels.find((item) => item.id === hotelId);

  if (!hotel) {
    throw new Error(`Source hotel not found: ${hotelId}`);
  }

  validateHotelPost(post, hotel, {
    availableImages: hotel.images.filter((image) => image.rightsConfirmed),
    strictFacts: true,
  });

  const now = new Date().toISOString();
  postsFile.posts[postIndex] = {
    ...post,
    status: "published",
    publishedAt: post.publishedAt ?? now,
    updatedAt: now,
  };
  postsFile.postCount = postsFile.posts.length;
  postsFile.generatedAt = now;

  await Bun.write(
    postsPath,
    JSON.stringify(postsFile, null, 2) + "\n",
  );

  console.log(`Published hotel post: ${post.id}`);
  console.log(`Hotel: ${hotel.name} (${hotel.id})`);
  console.log(`Status: ${postsFile.posts[postIndex].status}`);
}

if (import.meta.main) {
  await main();
}
