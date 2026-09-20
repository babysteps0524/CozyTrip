import { resolve } from "node:path";
import type { Hotel, HotelPost } from "../src/types";

interface MyRealTripHotelsFile {
  hotels: unknown[];
}

interface GeneratedHotelPostFile {
  posts: HotelPost[];
}

const root = resolve(import.meta.dir, "..");
const hotelsPath = resolve(root, "src/data/generated/myrealtrip-hotels.json");
const postsPath = resolve(root, "src/data/generated/hotel-posts.generated.json");

const TRACKED_IMAGE_TYPES = [
  "gallery",
  "room",
  "bathroom",
  "facility",
  "restaurant",
  "location",
  "attraction",
] as const;

type TrackedImageType = (typeof TRACKED_IMAGE_TYPES)[number];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function asHotel(value: unknown): Hotel | null {
  if (!isRecord(value) || typeof value.id !== "string") return null;
  return value as unknown as Hotel;
}

function getAssignedImageIds(post: HotelPost): Set<string> {
  const ids = new Set<string>();

  for (const section of post.sections) {
    for (const imageId of section.imageIds ?? []) {
      ids.add(imageId);
    }

    for (const assignment of section.imageAssignments ?? []) {
      ids.add(assignment.imageId);
    }
  }

  return ids;
}

function countByType(
  images: Hotel["images"],
  ids?: Set<string>,
): Record<TrackedImageType, number> {
  const counts = Object.fromEntries(
    TRACKED_IMAGE_TYPES.map((type) => [type, 0]),
  ) as Record<TrackedImageType, number>;

  for (const image of images) {
    if (image.type === "hero" || !image.rightsConfirmed) continue;
    if (ids && !ids.has(image.id)) continue;

    if (TRACKED_IMAGE_TYPES.includes(image.type as TrackedImageType)) {
      counts[image.type as TrackedImageType] += 1;
    }
  }

  return counts;
}

function formatCoverage(
  available: Record<TrackedImageType, number>,
  used: Record<TrackedImageType, number>,
): string {
  return TRACKED_IMAGE_TYPES
    .filter((type) => available[type] > 0)
    .map((type) => `${type} ${used[type]}/${available[type]}`)
    .join(", ");
}

async function main(): Promise<void> {
  const hotelsFile = JSON.parse(
    await Bun.file(hotelsPath).text(),
  ) as MyRealTripHotelsFile;
  const postsFile = JSON.parse(
    await Bun.file(postsPath).text(),
  ) as GeneratedHotelPostFile;

  const hotels = Array.isArray(hotelsFile.hotels)
    ? hotelsFile.hotels
        .map(asHotel)
        .filter((hotel): hotel is Hotel => hotel !== null)
    : [];

  const posts = Array.isArray(postsFile.posts) ? postsFile.posts : [];
  const hotelMap = new Map(hotels.map((hotel) => [hotel.id, hotel]));

  let warnings = 0;
  let structuralFailures = 0;

  for (const post of posts) {
    const hotel = hotelMap.get(post.hotelId);

    if (!hotel) {
      structuralFailures += 1;
      console.error(
        `FAILED [${post.id}] source hotel not found: ${post.hotelId}`,
      );
      continue;
    }

    // 본문용 typed image를 우선 사용하고, typed image가 하나도 없을 때
    // ensureHotelPostImages가 넣은 rights-confirmed hero fallback도 허용한다.
    const availableImages = hotel.images.filter(
      (image) =>
        image.rightsConfirmed &&
        image.src.trim() &&
        (image.type !== "hero" ||
          hotel.images.every(
            (candidate) =>
              !candidate.rightsConfirmed ||
              !candidate.src.trim() ||
              candidate.type === "hero",
          )),
    );
    const assignedIds = getAssignedImageIds(post);
    const availableIds = new Set(availableImages.map((image) => image.id));

    const unknownAssignedIds = [...assignedIds].filter(
      (imageId) => !availableIds.has(imageId),
    );
    const unassignedPostIds = post.imageIds.filter(
      (imageId) => !assignedIds.has(imageId),
    );
    const missingPostIds = [...assignedIds].filter(
      (imageId) => !post.imageIds.includes(imageId),
    );

    if (
      unknownAssignedIds.length > 0 ||
      unassignedPostIds.length > 0 ||
      missingPostIds.length > 0
    ) {
      structuralFailures += 1;
      console.error(`FAILED [${post.id}] image reference mismatch`);

      if (unknownAssignedIds.length > 0) {
        console.error(
          `  unknown/unusable assigned images: ${unknownAssignedIds.join(", ")}`,
        );
      }
      if (unassignedPostIds.length > 0) {
        console.error(
          `  post.imageIds not assigned to a section: ${unassignedPostIds.join(", ")}`,
        );
      }
      if (missingPostIds.length > 0) {
        console.error(
          `  assigned images missing from post.imageIds: ${missingPostIds.join(", ")}`,
        );
      }

      continue;
    }

    const available = countByType(availableImages);
    const used = countByType(availableImages, assignedIds);

    const missingRecommendedTypes = TRACKED_IMAGE_TYPES.filter(
      (type) => available[type] > 0 && used[type] === 0,
    );

    if (missingRecommendedTypes.length > 0) {
      warnings += 1;
      console.warn(
        `IMAGE WARNING [${post.id}] unused typed images: ${missingRecommendedTypes.join(", ")} | coverage: ${formatCoverage(available, used)}`,
      );
    } else {
      console.log(
        `OK [${post.id}] image coverage: ${formatCoverage(available, used)}`,
      );
    }
  }

  console.log(`Hotels in inventory: ${hotels.length}`);
  console.log(`Generated hotel posts: ${posts.length}`);
  console.log(`Image reference failures: ${structuralFailures}`);
  console.log(`Image coverage warnings: ${warnings}`);

  if (structuralFailures > 0) {
    process.exit(1);
  }
}

await main();
