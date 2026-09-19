import { resolve } from "node:path";
import type { Hotel, HotelPost } from "../src/types";

type HotelPostRunStatus =
  | "target-reached"
  | "shortfall"
  | "exhausted";

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
  status: HotelPostRunStatus;
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

interface HotelFile {
  hotels?: Hotel[];
}

interface PostFile {
  posts?: HotelPost[];
}

const root = resolve(import.meta.dir, "..");
const hotelPath = resolve(root, "src/data/generated/myrealtrip-hotels.json");
const postPath = resolve(root, "src/data/generated/hotel-posts.generated.json");
const reportPath = resolve(
  root,
  "src/data/generated/hotel-post-run.generated.json",
);

function fail(message: string): never {
  throw new Error(`Hotel run report validation failed: ${message}`);
}

function readJson<T>(path: string): T {
  throw new Error("unreachable");
}

async function readFileJson<T>(path: string): Promise<T> {
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

function isNonNegativeInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 0;
}

function assertEqual(
  label: string,
  actual: number,
  expected: number,
): void {
  if (actual !== expected) {
    fail(`${label}: expected ${expected}, got ${actual}`);
  }
}

function validateDestination(
  report: HotelPostDestinationReport,
  inventory: number,
): void {
  if (!report.destinationId) fail("destinationId is empty.");

  for (const field of [
    "target",
    "inventory",
    "publishedBefore",
    "attempted",
    "succeeded",
    "failed",
    "publishedAfter",
    "remaining",
  ] as const) {
    if (!isNonNegativeInteger(report[field])) {
      fail(
        `[${report.destinationId}] ${field} must be a non-negative integer.`,
      );
    }
  }

  assertEqual(
    `[${report.destinationId}] inventory`,
    report.inventory,
    inventory,
  );

  if (report.succeeded > report.attempted) {
    fail(
      `[${report.destinationId}] succeeded cannot exceed attempted.`,
    );
  }

  if (report.failed > report.attempted) {
    fail(`[${report.destinationId}] failed cannot exceed attempted.`);
  }

  if (report.succeeded + report.failed !== report.attempted) {
    fail(
      `[${report.destinationId}] succeeded + failed must equal attempted.`,
    );
  }

  if (report.publishedBefore > report.inventory) {
    fail(
      `[${report.destinationId}] publishedBefore cannot exceed inventory.`,
    );
  }

  if (report.publishedAfter > report.inventory) {
    fail(
      `[${report.destinationId}] publishedAfter cannot exceed inventory.`,
    );
  }

  assertEqual(
    `[${report.destinationId}] publishedAfter`,
    report.publishedAfter,
    report.publishedBefore + report.succeeded,
  );

  assertEqual(
    `[${report.destinationId}] remaining`,
    report.remaining,
    Math.max(0, report.inventory - report.publishedAfter),
  );

  const expectedStatus: HotelPostRunStatus =
    report.remaining === 0
      ? "exhausted"
      : report.succeeded >= report.target
        ? "target-reached"
        : "shortfall";

  if (report.status !== expectedStatus) {
    fail(
      `[${report.destinationId}] status must be ${expectedStatus}, got ${report.status}.`,
    );
  }
}

async function main(): Promise<void> {
  const [hotelFile, postFile, report] = await Promise.all([
    readFileJson<HotelFile>(hotelPath),
    readFileJson<PostFile>(postPath),
    readFileJson<HotelPostRunReport>(reportPath),
  ]);

  if (!Array.isArray(hotelFile.hotels) || hotelFile.hotels.length === 0) {
    fail("MyRealTrip hotel inventory is empty or invalid.");
  }

  if (!Array.isArray(postFile.posts)) {
    fail("Generated hotel posts are missing or invalid.");
  }

  if (
    report.source !== "ai" ||
    !report.generatedAt ||
    !report.plan ||
    typeof report.plan !== "object" ||
    Array.isArray(report.plan) ||
    !Array.isArray(report.destinations)
  ) {
    fail("Report structure is invalid.");
  }

  const inventoryByDestination = new Map<string, number>();
  for (const hotel of hotelFile.hotels) {
    inventoryByDestination.set(
      hotel.destinationId,
      (inventoryByDestination.get(hotel.destinationId) ?? 0) + 1,
    );
  }

  const hotelDestinationById = new Map(
    hotelFile.hotels.map((hotel) => [hotel.id, hotel.destinationId]),
  );

  const publishedByDestination = new Map<string, number>();
  const seenPostHotelIds = new Set<string>();

  for (const post of postFile.posts) {
    const destinationId = hotelDestinationById.get(post.hotelId);

    if (!destinationId) {
      fail(`Post references unknown hotelId: ${post.hotelId}`);
    }

    if (seenPostHotelIds.has(post.hotelId)) {
      fail(`Duplicate published hotelId: ${post.hotelId}`);
    }

    seenPostHotelIds.add(post.hotelId);
    publishedByDestination.set(
      destinationId,
      (publishedByDestination.get(destinationId) ?? 0) + 1,
    );
  }

  const seenDestinations = new Set<string>();
  for (const reportDestination of report.destinations) {
    if (seenDestinations.has(reportDestination.destinationId)) {
      fail(
        `Duplicate destination in report: ${reportDestination.destinationId}`,
      );
    }

    seenDestinations.add(reportDestination.destinationId);

    const inventory = inventoryByDestination.get(reportDestination.destinationId);
    if (inventory === undefined) {
      fail(
        `Report contains unknown destination: ${reportDestination.destinationId}`,
      );
    }

    validateDestination(reportDestination, inventory);
  }

  for (const [destinationId, target] of Object.entries(report.plan)) {
    if (!isNonNegativeInteger(target) || target <= 0) {
      fail(`[${destinationId}] plan target must be a positive integer.`);
    }

    const destination = report.destinations.find(
      (item) => item.destinationId === destinationId,
    );

    if (!destination) {
      fail(`Plan destination is missing from report: ${destinationId}`);
    }

    assertEqual(
      `[${destinationId}] publishedBefore`,
      destination.publishedBefore,
      publishedByDestination.get(destinationId) ?? 0,
    );
  }

  const totalTarget = Object.values(report.plan).reduce(
    (sum, value) => sum + value,
    0,
  );
  const totalSucceeded = report.destinations.reduce(
    (sum, item) => sum + item.succeeded,
    0,
  );
  const totalFailed = report.destinations.reduce(
    (sum, item) => sum + item.failed,
    0,
  );
  const totalInventory = report.destinations.reduce(
    (sum, item) => sum + item.inventory,
    0,
  );
  const totalRemaining = report.destinations.reduce(
    (sum, item) => sum + item.remaining,
    0,
  );

  assertEqual("totalTarget", report.totalTarget, totalTarget);
  assertEqual("totalSucceeded", report.totalSucceeded, totalSucceeded);
  assertEqual("totalFailed", report.totalFailed, totalFailed);
  assertEqual("totalInventory", report.totalInventory, totalInventory);
  assertEqual(
    "totalPublished",
    report.totalPublished,
    postFile.posts.length,
  );
  assertEqual(
    "totalRemaining",
    report.totalRemaining,
    Math.max(0, report.totalInventory - report.totalPublished),
  );

  if (report.destinations.length === 0 && totalTarget > 0) {
    fail("A positive plan requires at least one destination report.");
  }

  console.log(
    `Hotel run report validation passed: ${report.destinations.length} destination(s), ${report.totalPublished} published, ${report.totalRemaining} remaining.`,
  );
}

await main();
