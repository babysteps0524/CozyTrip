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

type FailedHotelPostStatus = "retrying" | "retry-exhausted";

interface FailedHotelPost {
  hotelId: string;
  destinationId: string;
  hotelName: string;
  failedAt: string;
  firstFailedAt: string;
  lastFailedAt: string;
  attemptCount: number;
  status: FailedHotelPostStatus;
  reason: string;
}

interface FailedHotelPostFile {
  generatedAt: string;
  source: "ai";
  failures: FailedHotelPost[];
}

interface HotelPostDestinationReport {
  destinationId: string;
  target: number;
  inventory: number;
  publishedBefore: number;
  attempted: number;
  succeeded: number;
  failed: number;
  publishedAfter: number;
  remaining: number;
  status: "target-reached" | "shortfall" | "exhausted";
}

interface HotelPostRunReport {
  generatedAt: string;
  source: "ai";
  plan: Record<string, number>;
  totalTarget: number;
  totalSucceeded: number;
  totalFailed: number;
  totalPublished: number;
  totalInventory: number;
  totalRemaining: number;
  destinations: HotelPostDestinationReport[];
}

type HotelInventoryStatus =
  | "published"
  | "pending"
  | "retrying"
  | "retry-exhausted";

interface HotelInventoryItem {
  hotelId: string;
  destinationId: string;
  hotelName: string;
  slug: string;
  status: HotelInventoryStatus;
  attemptCount: number;
  firstFailedAt?: string;
  lastFailedAt?: string;
  lastFailureReason?: string;
}

interface HotelInventoryDestinationReport {
  destinationId: string;
  inventory: number;
  published: number;
  pending: number;
  retrying: number;
  retryExhausted: number;
  remaining: number;
}

interface HotelInventoryReport {
  generatedAt: string;
  source: "myrealtrip";
  totalInventory: number;
  published: number;
  pending: number;
  retrying: number;
  retryExhausted: number;
  remaining: number;
  destinations: HotelInventoryDestinationReport[];
  hotels: HotelInventoryItem[];
}

const root = resolve(import.meta.dir, "..");
const inputPath = resolve(root, "src/data/generated/myrealtrip-hotels.json");
const outputDir = resolve(root, "src/data/generated");
const outputPath = resolve(outputDir, "hotel-posts.generated.json");
const failurePath = resolve(outputDir, "hotel-post-failures.generated.json");
const runReportPath = resolve(outputDir, "hotel-post-run.generated.json");
const inventoryReportPath = resolve(
  outputDir,
  "hotel-inventory.generated.json",
);

function getCliOption(name: string): string | undefined {
  const prefix = `--${name}=`;
  const argument = process.argv.find((item) => item.startsWith(prefix));

  return argument ? argument.slice(prefix.length).trim() || undefined : undefined;
}

const requestedHotelId =
  getCliOption("hotel-id") ?? process.env.AI_HOTEL_ID?.trim() ?? undefined;
const requestedLimit = Number(
  getCliOption("limit") ?? process.env.AI_POST_LIMIT ?? "1",
);
const dailyPlan = process.env.AI_DAILY_PLAN?.trim() || undefined;

const MAX_GENERATION_ATTEMPTS = 2;
const MAX_FAILURE_ATTEMPTS = 5;
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

function normalizeFailure(
  failure: Partial<FailedHotelPost>,
): FailedHotelPost | undefined {
  if (
    typeof failure.hotelId !== "string" ||
    typeof failure.destinationId !== "string" ||
    typeof failure.hotelName !== "string" ||
    typeof failure.reason !== "string"
  ) return undefined;

  const lastFailedAt =
    typeof failure.lastFailedAt === "string"
      ? failure.lastFailedAt
      : typeof failure.failedAt === "string"
        ? failure.failedAt
        : undefined;

  if (!lastFailedAt) return undefined;

  const attemptCount =
    typeof failure.attemptCount === "number" &&
    Number.isInteger(failure.attemptCount) &&
    failure.attemptCount > 0
      ? failure.attemptCount
      : 1;

  return {
    hotelId: failure.hotelId,
    destinationId: failure.destinationId,
    hotelName: failure.hotelName,
    failedAt: lastFailedAt,
    firstFailedAt:
      typeof failure.firstFailedAt === "string"
        ? failure.firstFailedAt
        : lastFailedAt,
    lastFailedAt,
    attemptCount,
    status:
      attemptCount >= MAX_FAILURE_ATTEMPTS
        ? "retry-exhausted"
        : "retrying",
    reason: failure.reason,
  };
}

async function readFailedHotels(): Promise<FailedHotelPost[]> {
  const file = Bun.file(failurePath);
  if (!(await file.exists())) return [];

  try {
    const parsed = JSON.parse(await file.text()) as Partial<FailedHotelPostFile>;
    if (!Array.isArray(parsed.failures)) return [];

    return parsed.failures
      .map((failure) =>
        normalizeFailure(failure as Partial<FailedHotelPost>),
      )
      .filter((failure): failure is FailedHotelPost => Boolean(failure));
  } catch (error) {
    console.warn(
      "Could not read failed hotel post queue. Starting with an empty queue:",
      error instanceof Error ? error.message : error,
    );
    return [];
  }
}

function recordFailure(
  failedHotelMap: Map<string, FailedHotelPost>,
  hotel: Hotel,
  reason: string,
): FailedHotelPost {
  const previous = failedHotelMap.get(hotel.id);
  const now = new Date().toISOString();
  const attemptCount = (previous?.attemptCount ?? 0) + 1;
  const failure: FailedHotelPost = {
    hotelId: hotel.id,
    destinationId: hotel.destinationId,
    hotelName: hotel.name,
    failedAt: now,
    firstFailedAt: previous?.firstFailedAt ?? now,
    lastFailedAt: now,
    attemptCount,
    status:
      attemptCount >= MAX_FAILURE_ATTEMPTS
        ? "retry-exhausted"
        : "retrying",
    reason,
  };
  failedHotelMap.set(hotel.id, failure);
  return failure;
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
  const retryableFailedHotelIds = new Set(
    failedHotels
      .filter((failure) => failure.status !== "retry-exhausted")
      .map((failure) => failure.hotelId),
  );

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
        retryableFailedHotelIds.has(hotel.id),
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
    retryableFailedHotelIds.has(hotel.id),
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

  if (requestedHotelId && selectedHotels.length === 1) {
    const target = selectedHotels[0];
    console.log(
      `Individual hotel post mode: ${target.name} -> /japan/${target.destinationId.replace("japan-", "")}/hotels/${target.slug}/`,
    );
  }

  const plan = dailyPlan ? parseDailyPlan(dailyPlan) : undefined;
  const attemptedByDestination = new Map<string, number>();
  const successByDestination = new Map<string, number>();
  const failureByDestination = new Map<string, number>();

  for (const hotel of selectedHotels) {
    if (plan) {
      attemptedByDestination.set(
        hotel.destinationId,
        (attemptedByDestination.get(hotel.destinationId) ?? 0) + 1,
      );
    }

    const validation = validateHotelData(hotel);

    for (const warning of validation.warnings) {
      console.warn(`Hotel data warning [${hotel.id}]: ${warning}`);
    }

    if (!validation.valid) {
      validationFailureCount += 1;
      failureCount += 1;
      recordFailure(
        failedHotelMap,
        hotel,
        formatHotelValidationFailure(hotel, validation),
      );
      failureByDestination.set(
        hotel.destinationId,
        (failureByDestination.get(hotel.destinationId) ?? 0) + 1,
      );
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
      if (plan) {
        successByDestination.set(
          hotel.destinationId,
          (successByDestination.get(hotel.destinationId) ?? 0) + 1,
        );
      }
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

      recordFailure(
        failedHotelMap,
        hotel,
        formatGenerationError(error),
      );
      if (plan) {
        failureByDestination.set(
          hotel.destinationId,
          (failureByDestination.get(hotel.destinationId) ?? 0) + 1,
        );
      }

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
  const destinations: HotelPostDestinationReport[] = plan
    ? Object.entries(plan).map(([destinationId, target]) => {
        const inventory = source.hotels.filter(
          (hotel) => hotel.destinationId === destinationId,
        ).length;
        const publishedBefore = existingPosts.filter(
          (post) => source.hotels.some(
            (hotel) =>
              hotel.destinationId === destinationId &&
              hotel.id === post.hotelId,
          ),
        ).length;
        const attempted = attemptedByDestination.get(destinationId) ?? 0;
        const succeeded = successByDestination.get(destinationId) ?? 0;
        const failed = failureByDestination.get(destinationId) ?? 0;
        const publishedAfter = publishedBefore + succeeded;
        const remaining = Math.max(0, inventory - publishedAfter);
        const status =
          succeeded >= target
            ? "target-reached"
            : remaining === 0
              ? "exhausted"
              : "shortfall";

        return {
          destinationId,
          target,
          inventory,
          publishedBefore,
          attempted,
          succeeded,
          failed,
          publishedAfter,
          remaining,
          status,
        };
      })
    : [];

  const runReport: HotelPostRunReport = {
    generatedAt: new Date().toISOString(),
    source: "ai",
    plan: plan ?? {},
    totalTarget: destinations.reduce((sum, item) => sum + item.target, 0),
    totalSucceeded: successCount,
    totalFailed: failureCount,
    totalPublished: posts.length,
    totalInventory: source.hotels.length,
    totalRemaining: Math.max(0, source.hotels.length - posts.length),
    destinations,
  };

  const publishedHotelIds = new Set(posts.map((post) => post.hotelId));
  const inventoryHotels: HotelInventoryItem[] = source.hotels.map((hotel) => {
    const failure = failedHotelMap.get(hotel.id);
    let status: HotelInventoryStatus = "pending";

    if (publishedHotelIds.has(hotel.id)) {
      status = "published";
    } else if (failure?.status === "retry-exhausted") {
      status = "retry-exhausted";
    } else if (failure) {
      status = "retrying";
    }

    return {
      hotelId: hotel.id,
      destinationId: hotel.destinationId,
      hotelName: hotel.name,
      slug: hotel.slug,
      status,
      attemptCount: failure?.attemptCount ?? 0,
      ...(failure?.firstFailedAt ? { firstFailedAt: failure.firstFailedAt } : {}),
      ...(failure?.lastFailedAt ? { lastFailedAt: failure.lastFailedAt } : {}),
      ...(failure?.reason ? { lastFailureReason: failure.reason } : {}),
    };
  });

  const inventoryReport: HotelInventoryReport = {
    generatedAt: new Date().toISOString(),
    source: "myrealtrip",
    totalInventory: inventoryHotels.length,
    published: inventoryHotels.filter((item) => item.status === "published").length,
    pending: inventoryHotels.filter((item) => item.status === "pending").length,
    retrying: inventoryHotels.filter((item) => item.status === "retrying").length,
    retryExhausted: inventoryHotels.filter(
      (item) => item.status === "retry-exhausted",
    ).length,
    remaining: inventoryHotels.filter((item) => item.status !== "published").length,
    destinations: [...new Set(inventoryHotels.map((item) => item.destinationId))]
      .sort()
      .map((destinationId) => {
        const items = inventoryHotels.filter(
          (item) => item.destinationId === destinationId,
        );
        return {
          destinationId,
          inventory: items.length,
          published: items.filter((item) => item.status === "published").length,
          pending: items.filter((item) => item.status === "pending").length,
          retrying: items.filter((item) => item.status === "retrying").length,
          retryExhausted: items.filter(
            (item) => item.status === "retry-exhausted",
          ).length,
          remaining: items.filter((item) => item.status !== "published").length,
        };
      }),
    hotels: inventoryHotels,
  };

  await writeFile(
    inventoryReportPath,
    `${JSON.stringify(inventoryReport, null, 2)}\n`,
    "utf8",
  );

  await writeFile(
    runReportPath,
    `${JSON.stringify(runReport, null, 2)}\n`,
    "utf8",
  );


  console.log(`Saved ${posts.length} hotel post(s): ${outputPath}`);
  console.log(
    `Failed hotel queue: ${failedHotelMap.size} hotel(s) -> ${failurePath}`,
  );
  console.log(
    `Generation result: ${successCount} succeeded, ${failureCount} failed, ${validationFailureCount} validation failed, ${retrySuccessCount} retry succeeded, ${existingPosts.length} existing preserved.`,
  );
}

await main();
