import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { Hotel, HotelPost, HotelPostGenerationInput } from "../src/types";
import { generateHotelPost, getConfiguredAIProviders } from "../src/lib/ai";
import { validateHotelPost } from "../src/lib/ai/validate";
import {
  formatHotelValidationFailure,
  validateHotelData,
} from "./lib/validate-hotel-data";

interface MyRealTripHotelsFile {
  generatedAt: string;
  source: "myrealtrip";
  hotelCount: number;
  hotels: Hotel[];
}

interface GeneratedHotelPostFile {
  generatedAt: string;
  source: "ai";
  postCount: number;
  posts: HotelPost[];
}

const root = resolve(import.meta.dir, "..");
const inputPath = resolve(root, "src/data/generated/myrealtrip-hotels.json");
const outputDir = resolve(root, "src/data/generated");
const outputPath = resolve(outputDir, "hotel-posts.generated.json");

const requestedHotelId = process.env.AI_HOTEL_ID?.trim() || undefined;
const requestedLimit = Number(process.env.AI_POST_LIMIT ?? "1");
const dailyPlan = process.env.AI_DAILY_PLAN?.trim() || undefined;

const DEFAULT_DAILY_PLAN: Record<string, number> = {
  "japan-tokyo": 3,
  "japan-osaka": 3,
  "japan-kyoto": 2,
  "japan-fukuoka": 2,
  "japan-okinawa": 1,
};

function toGenerationInput(hotel: Hotel): HotelPostGenerationInput {
  return {
    hotel: {
      id: hotel.id,
      name: hotel.name,
      nameEn: hotel.nameEn,
      country: hotel.country,
      prefecture: hotel.prefecture,
      city: hotel.city,
      area: hotel.area,
      description: hotel.description,
      location: {
        address: hotel.location.address,
        nearestStations: hotel.location.nearestStations,
      },
      accommodationType: hotel.accommodationType,
      starRating: hotel.starRating,
      checkIn: hotel.checkIn,
      checkOut: hotel.checkOut,
      facilities: hotel.facilities?.map((item) => item.name),
      restaurants: hotel.restaurants?.map((item) => item.name),
    },
    images: hotel.images.filter((image) => image.rightsConfirmed),
  };
}

async function readExistingPosts(): Promise<HotelPost[]> {
  const file = Bun.file(outputPath);

  if (!(await file.exists())) return [];

  try {
    const raw = await file.text();
    const parsed = JSON.parse(raw) as Partial<GeneratedHotelPostFile>;

    if (!Array.isArray(parsed.posts)) return [];

    return parsed.posts.filter(
      (post): post is HotelPost =>
        Boolean(
          post &&
            typeof post === "object" &&
            typeof post.id === "string" &&
            typeof post.hotelId === "string" &&
            typeof post.title === "string",
        ),
    );
  } catch (error) {
    console.warn(
      "Could not read existing generated hotel posts. Starting with an empty set:",
      error instanceof Error ? error.message : error,
    );
    return [];
  }
}

function mergePosts(
  existingPosts: HotelPost[],
  generatedPosts: HotelPost[],
): HotelPost[] {
  const postMap = new Map<string, HotelPost>();

  for (const post of existingPosts) {
    postMap.set(post.hotelId, post);
  }

  for (const post of generatedPosts) {
    postMap.set(post.hotelId, post);
  }

  return [...postMap.values()];
}

function parseDailyPlan(value: string): Record<string, number> {
  const plan: Record<string, number> = {};

  for (const entry of value.split(",")) {
    const [destinationId, rawCount] = entry.split(":").map((item) => item.trim());

    if (!destinationId || !rawCount) {
      throw new Error(
        `Invalid AI_DAILY_PLAN entry: ${entry}. Expected destinationId:count.`,
      );
    }

    const count = Number(rawCount);

    if (!Number.isInteger(count) || count <= 0) {
      throw new Error(
        `Invalid AI_DAILY_PLAN count for ${destinationId}: ${rawCount}`,
      );
    }

    plan[destinationId] = count;
  }

  if (Object.keys(plan).length === 0) {
    throw new Error("AI_DAILY_PLAN must contain at least one destination.");
  }

  return plan;
}

function selectHotels(
  hotels: Hotel[],
  existingPosts: HotelPost[],
): Hotel[] {
  if (requestedHotelId) {
    const hotel = hotels.find((item) => item.id === requestedHotelId);

    if (!hotel) {
      throw new Error(`AI_HOTEL_ID not found: ${requestedHotelId}`);
    }

    return [hotel];
  }

  const existingHotelIds = new Set(existingPosts.map((post) => post.hotelId));

  if (dailyPlan) {
    const plan = parseDailyPlan(dailyPlan);
    const selected: Hotel[] = [];

    for (const [destinationId, count] of Object.entries(plan)) {
      const candidates = hotels.filter(
        (hotel) =>
          hotel.destinationId === destinationId &&
          !existingHotelIds.has(hotel.id),
      );

      selected.push(...candidates.slice(0, count));
    }

    return selected;
  }

  if (!Number.isInteger(requestedLimit) || requestedLimit <= 0) {
    throw new Error("AI_POST_LIMIT must be a positive integer.");
  }

  return hotels
    .filter((hotel) => !existingHotelIds.has(hotel.id))
    .slice(0, requestedLimit);
}

function hasDuplicateTopic(
  post: HotelPost,
  existingPosts: HotelPost[],
  generatedPosts: HotelPost[],
): boolean {
  const normalize = (value: string): string =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]+/g, "");

  const title = normalize(post.title);

  return [...existingPosts, ...generatedPosts].some(
    (item) => item.hotelId !== post.hotelId && normalize(item.title) === title,
  );
}

async function main(): Promise<void> {
  const raw = await Bun.file(inputPath).text();
  const source = JSON.parse(raw) as MyRealTripHotelsFile;

  if (source.source !== "myrealtrip" || !Array.isArray(source.hotels)) {
    throw new Error(
      "src/data/generated/myrealtrip-hotels.json is not a valid MyRealTrip hotel file.",
    );
  }

  const configuredProviders = getConfiguredAIProviders();

  console.log(
    configuredProviders.length > 0
      ? `Configured AI providers: ${configuredProviders.join(", ")}`
      : "No AI provider API key is configured.",
  );

  if (source.hotels.length === 0) {
    console.log("No MyRealTrip hotels found. Nothing to generate.");
    return;
  }

  if (configuredProviders.length === 0) {
    console.log("Skipping generation because no AI provider is configured.");
    return;
  }

  const existingPosts = await readExistingPosts();
  const selectedHotels = selectHotels(source.hotels, existingPosts);
  const generatedPosts: HotelPost[] = [];
  let successCount = 0;
  let failureCount = 0;
  let validationFailureCount = 0;

  console.log(
    requestedHotelId
      ? `AI generation target: ${requestedHotelId}`
      : dailyPlan
        ? `AI daily plan: ${dailyPlan} -> ${selectedHotels.length} hotel(s)`
        : `AI generation limit: ${selectedHotels.length} new hotel(s)`,
  );

  for (const hotel of selectedHotels) {
    const validation = validateHotelData(hotel);

    for (const warning of validation.warnings) {
      console.warn(`Hotel data warning [${hotel.id}]: ${warning}`);
    }

    if (!validation.valid) {
      validationFailureCount += 1;
      failureCount += 1;
      console.error(formatHotelValidationFailure(hotel, validation));
      continue;
    }

    const input = toGenerationInput(hotel);

    console.log(`Generating hotel post: ${hotel.name} (${hotel.id})`);

    try {
      const result = await generateHotelPost(input);
      const post: HotelPost = {
        ...result.post,
        hotelId: hotel.id,
        slug: hotel.slug,
        generatedBy: result.provider,
      };

      validateHotelPost(post, hotel, { availableImages: input.images });

      if (hasDuplicateTopic(post, existingPosts, generatedPosts)) {
        throw new Error(
          `Duplicate hotel post topic detected: ${post.title}`,
        );
      }

      generatedPosts.push(post);
      successCount += 1;
      console.log(
        `Generated and validated with ${result.provider}: ${post.title}`,
      );
      console.log(
        `Provider attempts: ${result.attemptedProviders.join(" -> ")}`,
      );
    } catch (error) {
      failureCount += 1;
      if (
        error instanceof Error &&
        error.message.includes("HotelPost validation failed")
      ) {
        validationFailureCount += 1;
      }
      console.error(
        `Failed to generate or validate ${hotel.name}:`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  const posts = mergePosts(existingPosts, generatedPosts);

  await mkdir(outputDir, { recursive: true });

  const output: GeneratedHotelPostFile = {
    generatedAt: new Date().toISOString(),
    source: "ai",
    postCount: posts.length,
    posts,
  };

  await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");

  console.log(`Saved ${posts.length} hotel post(s): ${outputPath}`);
  console.log(
    `Generation result: ${successCount} succeeded, ${failureCount} failed, ${validationFailureCount} validation failed, ${existingPosts.length} existing preserved.`,
  );
}

await main();
