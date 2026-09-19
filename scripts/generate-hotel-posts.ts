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

function selectHotels(hotels: Hotel[]): Hotel[] {
  if (requestedHotelId) {
    const hotel = hotels.find((item) => item.id === requestedHotelId);

    if (!hotel) {
      throw new Error(`AI_HOTEL_ID not found: ${requestedHotelId}`);
    }

    return [hotel];
  }

  if (!Number.isInteger(requestedLimit) || requestedLimit <= 0) {
    throw new Error("AI_POST_LIMIT must be a positive integer.");
  }

  return hotels.slice(0, requestedLimit);
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

  const selectedHotels = selectHotels(source.hotels);
  const existingPosts = await readExistingPosts();
  const generatedPosts: HotelPost[] = [];
  let successCount = 0;
  let failureCount = 0;
  let validationFailureCount = 0;

  console.log(
    requestedHotelId
      ? `AI generation target: ${requestedHotelId}`
      : `AI generation limit: ${selectedHotels.length} hotel(s)`,
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
