import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { Hotel, HotelPost, HotelPostGenerationInput } from "../src/types";
import {
  AllAIProvidersFailedError,
  generateHotelPost,
  getConfiguredAIProviders,
} from "../src/lib/ai";
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

interface FailedHotelPost {
  hotelId: string;
  destinationId: string;
  hotelName: string;
  failedAt: string;
  reason: string;
}

interface FailedHotelPostFile {
  generatedAt: string;
  source: "ai";
  failures: FailedHotelPost[];
}

const root = resolve(import.meta.dir, "..");
const inputPath = resolve(root, "src/data/generated/myrealtrip-hotels.json");
const outputDir = resolve(root, "src/data/generated");
const outputPath = resolve(outputDir, "hotel-posts.generated.json");
const failurePath = resolve(outputDir, "hotel-post-failures.generated.json");

const requestedHotelId = process.env.AI_HOTEL_ID?.trim() || undefined;
const requestedLimit = Number(process.env.AI_POST_LIMIT ?? "1");
const dailyPlan = process.env.AI_DAILY_PLAN?.trim() || undefined;

const MAX_GENERATION_ATTEMPTS = 2;
const RETRY_DELAY_MS = 1_500;

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

async function readFailedHotels(): Promise<FailedHotelPost[]> {
  const file = Bun.file(failurePath);

  if (!(await file.exists())) return [];

  try {
    const raw = await file.text();
    const parsed = JSON.parse(raw) as Partial<FailedHotelPostFile>;

    if (!Array.isArray(parsed.failures)) return [];

    return parsed.failures.filter(
      (failure): failure is FailedHotelPost =>
        Boolean(
          failure &&
            typeof failure === "object" &&
            typeof failure.hotelId === "string" &&
            typeof failure.destinationId === "string" &&
            typeof failure.hotelName === "string" &&
            typeof failure.failedAt === "string" &&
            typeof failure.reason === "string",
        ),
    );
  } catch (error) {
    console.warn(
      "Could not read failed hotel post queue. Starting with an empty queue:",
      error instanceof Error ? error.message : error,
    );
    return [];
  }
}

async function writeFailedHotels(failures: FailedHotelPost[]): Promise<void> {
  const output: FailedHotelPostFile = {
    generatedAt: new Date().toISOString(),
    source: "ai",
    failures,
  };

  await writeFile(failurePath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
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
    const [destinationId, rawCount] = entry
      .split(":")
      .map((item) => item.trim());

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
  failedHotels: FailedHotelPost[],
): Hotel[] {
  if (requestedHotelId) {
    const hotel = hotels.find((item) => item.id === requestedHotelId);

    if (!hotel) {
      throw new Error(`AI_HOTEL_ID not found: ${requestedHotelId}`);
    }

    return [hotel];
  }

  const existingHotelIds = new Set(existingPosts.map((post) => post.hotelId));
  const failedHotelIds = new Set(failedHotels.map((failure) => failure.hotelId));

  if (dailyPlan) {
    const plan = parseDailyPlan(dailyPlan);
    const selected: Hotel[] = [];

    for (const [destinationId, count] of Object.entries(plan)) {
      const candidates = hotels.filter(
        (hotel) =>
          hotel.destinationId === destinationId &&
          !existingHotelIds.has(hotel.id),
      );

      const failedCandidates = candidates.filter((hotel) =>
        failedHotelIds.has(hotel.id),
      );
      const newCandidates = candidates.filter(
        (hotel) => !failedHotelIds.has(hotel.id),
      );

      selected.push(
        ...failedCandidates.slice(0, count),
        ...newCandidates.slice(0, Math.max(0, count - failedCandidates.length)),
      );
    }

    return selected;
  }

  if (!Number.isInteger(requestedLimit) || requestedLimit <= 0) {
    throw new Error("AI_POST_LIMIT must be a positive integer.");
  }

  const candidates = hotels.filter((hotel) => !existingHotelIds.has(hotel.id));
  const failedCandidates = candidates.filter((hotel) =>
    failedHotelIds.has(hotel.id),
  );
  const newCandidates = candidates.filter(
    (hotel) => !failedHotelIds.has(hotel.id),
  );

  return [
    ...failedCandidates.slice(0, requestedLimit),
    ...newCandidates.slice(
      0,
      Math.max(0, requestedLimit - failedCandidates.length),
    ),
  ];
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

function formatGenerationError(error: unknown): string {
  if (error instanceof AllAIProvidersFailedError) {
    if (error.errors.length === 0) {
      return "All configured AI providers failed without a provider-specific error.";
    }

    return error.errors
      .map(({ provider, message }) => `${provider}: ${message}`)
      .join(" | ");
  }

  return error instanceof Error ? error.message : String(error);
}

async function sleep(milliseconds: number): Promise<void> {
  await new Promise((resolvePromise) => {
    setTimeout(resolvePromise, milliseconds);
  });
}

async function generateAndValidateHotelPost(
  hotel: Hotel,
  input: HotelPostGenerationInput,
): Promise<{
  post: HotelPost;
  provider: HotelPost["generatedBy"];
  attemptedProviders: string[];
}> {
  const result = await generateHotelPost(input);
  const post: HotelPost = {
    ...result.post,
    hotelId: hotel.id,
    slug: hotel.slug,
    generatedBy: result.provider,
  };

  validateHotelPost(post, hotel, { availableImages: input.images, strictFacts: true });

  return {
    post,
    provider: result.provider,
    attemptedProviders: result.attemptedProviders,
  };
}

async function generateWithRetry(
  hotel: Hotel,
  input: HotelPostGenerationInput,
): Promise<{
  post: HotelPost;
  provider: HotelPost["generatedBy"];
  attemptedProviders: string[];
  attempts: number;
}> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_GENERATION_ATTEMPTS; attempt += 1) {
    if (attempt > 1) {
      console.log(
        `Retrying hotel post: ${hotel.name} (${hotel.id}) - attempt ${attempt}/${MAX_GENERATION_ATTEMPTS}`,
      );
      await sleep(RETRY_DELAY_MS);
    }

    try {
      const result = await generateAndValidateHotelPost(hotel, input);

      return {
        ...result,
        attempts: attempt,
      };
    } catch (error) {
      lastError = error;
      console.warn(
        `Generation attempt ${attempt}/${MAX_GENERATION_ATTEMPTS} failed for ${hotel.name}: ${formatGenerationError(error)}`,
      );
    }
  }

  throw lastError ?? new Error("Hotel post generation failed.");
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
  const failedHotels = await readFailedHotels();
  const failedHotelMap = new Map(
    failedHotels.map((failure) => [failure.hotelId, failure]),
  );
  const selectedHotels = selectHotels(source.hotels, existingPosts, failedHotels);
  const generatedPosts: HotelPost[] = [];
  let successCount = 0;
  let failureCount = 0;
  let validationFailureCount = 0;
  let retrySuccessCount = 0;

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
      failedHotelMap.set(hotel.id, {
        hotelId: hotel.id,
        destinationId: hotel.destinationId,
        hotelName: hotel.name,
        failedAt: new Date().toISOString(),
        reason: formatHotelValidationFailure(hotel, validation),
      });
      console.error(formatHotelValidationFailure(hotel, validation));
      continue;
    }

    const input = toGenerationInput(hotel);

    console.log(`Generating hotel post: ${hotel.name} (${hotel.id})`);

    try {
      const result = await generateWithRetry(hotel, input);

      if (result.attempts > 1) {
        retrySuccessCount += 1;
      }

      if (hasDuplicateTopic(result.post, existingPosts, generatedPosts)) {
        throw new Error(
          `Duplicate hotel post topic detected: ${result.post.title}`,
        );
      }

      generatedPosts.push(result.post);
      successCount += 1;
      failedHotelMap.delete(hotel.id);

      console.log(
        `Generated and validated with ${result.provider}: ${result.post.title}`,
      );
      console.log(
        `Provider attempts: ${result.attemptedProviders.join(" -> ")}`,
      );
      if (result.attempts > 1) {
        console.log(`Retry succeeded on attempt ${result.attempts}.`);
      }
    } catch (error) {
      failureCount += 1;

      failedHotelMap.set(hotel.id, {
        hotelId: hotel.id,
        destinationId: hotel.destinationId,
        hotelName: hotel.name,
        failedAt: new Date().toISOString(),
        reason: formatGenerationError(error),
      });

      if (
        error instanceof Error &&
        error.message.includes("HotelPost validation failed")
      ) {
        validationFailureCount += 1;
      }

      console.error(
        `Failed to generate or validate ${hotel.name} after ${MAX_GENERATION_ATTEMPTS} attempt(s): ${formatGenerationError(error)}`,
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
  await writeFailedHotels([...failedHotelMap.values()]);

  console.log(`Saved ${posts.length} hotel post(s): ${outputPath}`);
  console.log(
    `Failed hotel queue: ${failedHotelMap.size} hotel(s) -> ${failurePath}`,
  );
  console.log(
    `Generation result: ${successCount} succeeded, ${failureCount} failed, ${validationFailureCount} validation failed, ${retrySuccessCount} retry succeeded, ${existingPosts.length} existing preserved.`,
  );
}

await main();
