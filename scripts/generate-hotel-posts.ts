import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { Hotel, HotelImage, HotelPost, HotelPostGenerationInput } from "../src/types";
import { generateHotelPost, getConfiguredAIProviders } from "../src/lib/ai";
import {
  formatHotelValidationFailure,
  validateHotelData,
} from "./lib/validate-hotel-data";

interface AgodaHotelRecord {
  id?: string | number;
  hotelId?: string | number;
  name?: string;
  nameEn?: string;
  country?: string;
  countryCode?: string;
  prefecture?: string;
  city?: string;
  area?: string;
  destinationId?: string;
  description?: string;
  location?: {
    address?: string;
    nearestStations?: string[];
  };
  images?: HotelImage[];
  accommodationType?: string;
  starRating?: number;
  checkIn?: string;
  checkOut?: string;
  facilities?: Array<string | { name?: string }>;
  restaurants?: Array<string | { name?: string }>;
  slug?: string;
}

interface AgodaHotelsFile {
  generatedAt: string;
  source: string;
  hotelCount: number;
  hotels: AgodaHotelRecord[];
}

interface GeneratedHotelPostFile {
  generatedAt: string;
  source: "ai";
  postCount: number;
  posts: HotelPost[];
}

const root = resolve(import.meta.dir, "..");
const inputPath = resolve(root, "src/data/generated/agoda-hotels.json");
const outputDir = resolve(root, "src/data/generated");
const outputPath = resolve(outputDir, "hotel-posts.generated.json");

function stringValue(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (typeof item === "string") return item.trim();
      if (item && typeof item === "object") {
        return stringValue((item as { name?: unknown }).name);
      }
      return "";
    })
    .filter(Boolean);
}

function normalizeHotel(record: AgodaHotelRecord): Hotel {
  const id = stringValue(record.id ?? record.hotelId);

  if (!id) {
    throw new Error("Agoda hotel record is missing id.");
  }

  const city = stringValue(record.city, "도쿄");
  const area = stringValue(record.area, "");
  const prefecture = stringValue(record.prefecture, city);

  return {
    id,
    name: stringValue(record.name, "이름 미상 호텔"),
    nameEn: stringValue(record.nameEn),
    slug:
      stringValue(record.slug) ||
      id
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
    country: stringValue(record.country, "일본"),
    countryCode: stringValue(record.countryCode, "JP"),
    prefecture,
    city,
    area,
    destinationId: stringValue(record.destinationId, `japan-${city}`),
    description: stringValue(record.description, `${city}에 위치한 호텔입니다.`),
    location: {
      country: stringValue(record.country, "일본"),
      countryCode: stringValue(record.countryCode, "JP"),
      prefecture,
      city,
      area,
      address: record.location?.address,
      nearestStations: record.location?.nearestStations ?? [],
    },
    images: Array.isArray(record.images) ? record.images : [],
    rooms: [],
    facilities: stringArray(record.facilities).map((name) => ({ name })),
    restaurants: stringArray(record.restaurants).map((name) => ({ name })),
    accommodationType: record.accommodationType,
    starRating: record.starRating,
    checkIn: record.checkIn,
    checkOut: record.checkOut,
  };
}

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

async function main(): Promise<void> {
  const raw = await Bun.file(inputPath).text();
  const source = JSON.parse(raw) as AgodaHotelsFile;

  if (!Array.isArray(source.hotels)) {
    throw new Error("src/data/generated/agoda-hotels.json has no hotels array.");
  }

  const configuredProviders = getConfiguredAIProviders();
  console.log(
    configuredProviders.length > 0
      ? `Configured AI providers: ${configuredProviders.join(", ")}`
      : "No AI provider API key is configured.",
  );

  if (source.hotels.length === 0) {
    console.log("No Agoda hotels found. Nothing to generate.");
    return;
  }

  if (configuredProviders.length === 0) {
    console.log("Skipping generation because no AI provider is configured.");
    return;
  }

  const existingPosts = await readExistingPosts();
  const generatedPosts: HotelPost[] = [];
  let successCount = 0;
  let failureCount = 0;
  let validationFailureCount = 0;

  for (const record of source.hotels) {
    let hotel: Hotel;

    try {
      hotel = normalizeHotel(record);
    } catch (error) {
      failureCount += 1;
      console.error(
        "Failed to normalize Agoda hotel:",
        error instanceof Error ? error.message : error,
      );
      continue;
    }

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

      generatedPosts.push(post);
      successCount += 1;
      console.log(`Generated with ${result.provider}: ${post.title}`);
    } catch (error) {
      failureCount += 1;
      console.error(
        `Failed to generate ${hotel.name}:`,
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
