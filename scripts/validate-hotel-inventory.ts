import { resolve } from "node:path";
import type { Hotel, HotelPost } from "../src/types";

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

interface HotelFile {
  hotels?: Hotel[];
}

interface PostFile {
  posts?: HotelPost[];
}

interface FailureFile {
  failures?: Array<{
    hotelId?: string;
    attemptCount?: number;
    status?: "retrying" | "retry-exhausted";
  }>;
}

const root = resolve(import.meta.dir, "..");
const hotelPath = resolve(root, "src/data/generated/myrealtrip-hotels.json");
const postPath = resolve(root, "src/data/generated/hotel-posts.generated.json");
const failurePath = resolve(
  root,
  "src/data/generated/hotel-post-failures.generated.json",
);
const inventoryPath = resolve(
  root,
  "src/data/generated/hotel-inventory.generated.json",
);

function fail(message: string): never {
  throw new Error(`Hotel inventory validation failed: ${message}`);
}

async function readJson<T>(path: string): Promise<T> {
  const file = Bun.file(path);

  if (!(await file.exists())) {
    fail(`Required file not found: ${path}`);
  }

  try {
    return JSON.parse(await file.text()) as T;
  } catch (error) {
    fail(
      `Invalid JSON in ${path}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

function nonNegativeInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 0;
}

function assertEqual(label: string, actual: number, expected: number): void {
  if (actual !== expected) {
    fail(`${label}: expected ${expected}, got ${actual}`);
  }
}

async function main(): Promise<void> {
  const [hotelFile, postFile, failureFile, report] = await Promise.all([
    readJson<HotelFile>(hotelPath),
    readJson<PostFile>(postPath),
    readJson<FailureFile>(failurePath),
    readJson<HotelInventoryReport>(inventoryPath),
  ]);

  if (!Array.isArray(hotelFile.hotels) || hotelFile.hotels.length === 0) {
    fail("MyRealTrip hotel inventory is empty or invalid.");
  }

  if (!Array.isArray(postFile.posts)) {
    fail("Generated hotel posts are missing or invalid.");
  }

  if (
    report.source !== "myrealtrip" ||
    !report.generatedAt ||
    !Array.isArray(report.hotels) ||
    !Array.isArray(report.destinations)
  ) {
    fail("Inventory report structure is invalid.");
  }

  const hotelsById = new Map(hotelFile.hotels.map((hotel) => [hotel.id, hotel]));
  const publishedIds = new Set<string>();

  for (const post of postFile.posts) {
    if (!hotelsById.has(post.hotelId)) {
      fail(`Published post references unknown hotelId: ${post.hotelId}`);
    }

    if (publishedIds.has(post.hotelId)) {
      fail(`Duplicate published hotelId: ${post.hotelId}`);
    }

    publishedIds.add(post.hotelId);
  }

  const failuresById = new Map(
    (failureFile.failures ?? [])
      .filter(
        (failure): failure is {
          hotelId: string;
          attemptCount?: number;
          status?: "retrying" | "retry-exhausted";
        } => typeof failure.hotelId === "string",
      )
      .map((failure) => [failure.hotelId, failure]),
  );

  const reportById = new Map<string, HotelInventoryItem>();

  if (report.hotels.length !== hotelFile.hotels.length) {
    fail(
      `hotel count: expected ${hotelFile.hotels.length}, got ${report.hotels.length}`,
    );
  }

  for (const item of report.hotels) {
    if (reportById.has(item.hotelId)) {
      fail(`Duplicate hotelId in inventory report: ${item.hotelId}`);
    }

    const sourceHotel = hotelsById.get(item.hotelId);
    if (!sourceHotel) {
      fail(`Inventory report references unknown hotelId: ${item.hotelId}`);
    }

    if (item.destinationId !== sourceHotel.destinationId) {
      fail(`[${item.hotelId}] destinationId does not match source inventory.`);
    }

    if (item.hotelName !== sourceHotel.name) {
      fail(`[${item.hotelId}] hotelName does not match source inventory.`);
    }

    if (item.slug !== sourceHotel.slug) {
      fail(`[${item.hotelId}] slug does not match source inventory.`);
    }

    if (!nonNegativeInteger(item.attemptCount)) {
      fail(`[${item.hotelId}] attemptCount must be a non-negative integer.`);
    }

    if (publishedIds.has(item.hotelId) && item.status !== "published") {
      fail(`[${item.hotelId}] published hotel must have status=published.`);
    }

    if (!publishedIds.has(item.hotelId) && item.status === "published") {
      fail(`[${item.hotelId}] status=published but no post exists.`);
    }

    const failure = failuresById.get(item.hotelId);

    if (item.status === "pending" && failure) {
      fail(`[${item.hotelId}] pending hotel cannot have a failure record.`);
    }

    if (
      (item.status === "retrying" || item.status === "retry-exhausted") &&
      !failure
    ) {
      fail(`[${item.hotelId}] retry status requires a failure record.`);
    }

    if (failure && item.status !== "published") {
      const expectedAttemptCount =
        failure.attemptCount && failure.attemptCount > 0
          ? failure.attemptCount
          : 1;

      assertEqual(
        `[${item.hotelId}] attemptCount`,
        item.attemptCount,
        expectedAttemptCount,
      );

      const expectedStatus =
        failure.status ??
        (expectedAttemptCount >= 5 ? "retry-exhausted" : "retrying");

      if (item.status !== expectedStatus) {
        fail(
          `[${item.hotelId}] status: expected ${expectedStatus}, got ${item.status}`,
        );
      }
    }

    reportById.set(item.hotelId, item);
  }

  for (const hotel of hotelFile.hotels) {
    if (!reportById.has(hotel.id)) {
      fail(`Hotel missing from inventory report: ${hotel.id}`);
    }
  }

  const expectedCounts = {
    published: report.hotels.filter((item) => item.status === "published").length,
    pending: report.hotels.filter((item) => item.status === "pending").length,
    retrying: report.hotels.filter((item) => item.status === "retrying").length,
    retryExhausted: report.hotels.filter(
      (item) => item.status === "retry-exhausted",
    ).length,
  };

  assertEqual("totalInventory", report.totalInventory, hotelFile.hotels.length);
  assertEqual("published", report.published, expectedCounts.published);
  assertEqual("pending", report.pending, expectedCounts.pending);
  assertEqual("retrying", report.retrying, expectedCounts.retrying);
  assertEqual(
    "retryExhausted",
    report.retryExhausted,
    expectedCounts.retryExhausted,
  );
  assertEqual(
    "remaining",
    report.remaining,
    hotelFile.hotels.length - expectedCounts.published,
  );

  const destinationIds = new Set(
    hotelFile.hotels.map((hotel) => hotel.destinationId),
  );

  if (report.destinations.length !== destinationIds.size) {
    fail(
      `destination count: expected ${destinationIds.size}, got ${report.destinations.length}`,
    );
  }

  const seenDestinations = new Set<string>();

  for (const destination of report.destinations) {
    if (seenDestinations.has(destination.destinationId)) {
      fail(`Duplicate destination in inventory report: ${destination.destinationId}`);
    }
    seenDestinations.add(destination.destinationId);

    const items = report.hotels.filter(
      (item) => item.destinationId === destination.destinationId,
    );

    if (items.length === 0) {
      fail(`Destination has no hotels: ${destination.destinationId}`);
    }

    assertEqual(
      `[${destination.destinationId}] inventory`,
      destination.inventory,
      items.length,
    );
    assertEqual(
      `[${destination.destinationId}] published`,
      destination.published,
      items.filter((item) => item.status === "published").length,
    );
    assertEqual(
      `[${destination.destinationId}] pending`,
      destination.pending,
      items.filter((item) => item.status === "pending").length,
    );
    assertEqual(
      `[${destination.destinationId}] retrying`,
      destination.retrying,
      items.filter((item) => item.status === "retrying").length,
    );
    assertEqual(
      `[${destination.destinationId}] retryExhausted`,
      destination.retryExhausted,
      items.filter((item) => item.status === "retry-exhausted").length,
    );
    assertEqual(
      `[${destination.destinationId}] remaining`,
      destination.remaining,
      items.filter((item) => item.status !== "published").length,
    );
  }

  console.log(
    `Hotel inventory validation passed: ${report.published}/${report.totalInventory} published, ${report.remaining} remaining, ${report.retryExhausted} retry-exhausted.`,
  );
}

await main();
