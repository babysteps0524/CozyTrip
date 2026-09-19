import { resolve } from "node:path";
import type { Hotel, HotelPost } from "../src/types";

type HotelInventoryStatus =
  | "published"
  | "pending"
  | "retrying"
  | "retry-exhausted";

interface FailedHotelPost {
  hotelId?: string;
  attemptCount?: number;
  firstFailedAt?: string;
  lastFailedAt?: string;
  failedAt?: string;
  status?: "retrying" | "retry-exhausted";
  reason?: string;
}

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
  failures?: FailedHotelPost[];
}

const root = resolve(import.meta.dir, "..");
const hotelPath = resolve(root, "src/data/generated/myrealtrip-hotels.json");
const postPath = resolve(root, "src/data/generated/hotel-posts.generated.json");
const failurePath = resolve(
  root,
  "src/data/generated/hotel-post-failures.generated.json",
);
const outputPath = resolve(
  root,
  "src/data/generated/hotel-inventory.generated.json",
);

async function readJson<T>(path: string, required = true): Promise<T | undefined> {
  const file = Bun.file(path);

  if (!(await file.exists())) {
    if (required) {
      throw new Error(`Required file not found: ${path}`);
    }
    return undefined;
  }

  return JSON.parse(await file.text()) as T;
}

function normalizeFailure(
  failure: FailedHotelPost,
): {
  attemptCount: number;
  firstFailedAt?: string;
  lastFailedAt?: string;
  status: "retrying" | "retry-exhausted";
  reason?: string;
} {
  const attemptCount =
    Number.isInteger(failure.attemptCount) && Number(failure.attemptCount) > 0
      ? Number(failure.attemptCount)
      : 1;

  const lastFailedAt = failure.lastFailedAt ?? failure.failedAt;

  return {
    attemptCount,
    ...(failure.firstFailedAt
      ? { firstFailedAt: failure.firstFailedAt }
      : lastFailedAt
        ? { firstFailedAt: lastFailedAt }
        : {}),
    ...(lastFailedAt ? { lastFailedAt } : {}),
    status:
      failure.status ??
      (attemptCount >= 5 ? "retry-exhausted" : "retrying"),
    ...(failure.reason ? { reason: failure.reason } : {}),
  };
}

async function main(): Promise<void> {
  const [hotelFile, postFile, failureFile] = await Promise.all([
    readJson<HotelFile>(hotelPath),
    readJson<PostFile>(postPath),
    readJson<FailureFile>(failurePath, false),
  ]);

  if (!Array.isArray(hotelFile?.hotels) || hotelFile.hotels.length === 0) {
    throw new Error("MyRealTrip hotel inventory is empty or invalid.");
  }

  if (!Array.isArray(postFile?.posts)) {
    throw new Error("Generated hotel posts are missing or invalid.");
  }

  const hotels = hotelFile.hotels;
  const posts = postFile.posts;
  const failures = failureFile?.failures ?? [];

  const publishedHotelIds = new Set(posts.map((post) => post.hotelId));
  const failuresById = new Map(
    failures
      .filter((failure) => typeof failure.hotelId === "string")
      .map((failure) => [failure.hotelId as string, normalizeFailure(failure)]),
  );

  const inventoryHotels: HotelInventoryItem[] = hotels.map((hotel) => {
    const failure = failuresById.get(hotel.id);
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
      ...(failure?.firstFailedAt
        ? { firstFailedAt: failure.firstFailedAt }
        : {}),
      ...(failure?.lastFailedAt
        ? { lastFailedAt: failure.lastFailedAt }
        : {}),
      ...(failure?.reason ? { lastFailureReason: failure.reason } : {}),
    };
  });

  const destinations = [...new Set(inventoryHotels.map((hotel) => hotel.destinationId))]
    .sort()
    .map((destinationId) => {
      const items = inventoryHotels.filter(
        (hotel) => hotel.destinationId === destinationId,
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
    });

  const report: HotelInventoryReport = {
    generatedAt: new Date().toISOString(),
    source: "myrealtrip",
    totalInventory: inventoryHotels.length,
    published: inventoryHotels.filter((item) => item.status === "published")
      .length,
    pending: inventoryHotels.filter((item) => item.status === "pending").length,
    retrying: inventoryHotels.filter((item) => item.status === "retrying").length,
    retryExhausted: inventoryHotels.filter(
      (item) => item.status === "retry-exhausted",
    ).length,
    remaining: inventoryHotels.filter((item) => item.status !== "published")
      .length,
    destinations,
    hotels: inventoryHotels,
  };

  await Bun.write(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(
    `Hotel inventory generated: ${report.published}/${report.totalInventory} published, ${report.remaining} remaining.`,
  );
  console.log(`Saved: ${outputPath}`);
}

await main();
