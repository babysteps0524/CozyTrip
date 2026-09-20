import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  autocompleteAccommodationRegions,
  searchAccommodations,
} from "./accommodation";
import {
  findCityRegion,
  getMyRealTripDestinations,
  normalizeAccommodationItems,
  type MyRealTripAccommodationSearchResponse,
  type MyRealTripRegionAutocompleteResponse,
} from "./normalize";
import { getMyRealTripSearchWindow } from "./search-window";
import {
  formatHotelValidationFailure,
  validateHotelData,
} from "../lib/validate-hotel-data";
import { getMyRealTripConfig } from "./config";
import type { Hotel } from "../src/types";

const { checkIn: CHECK_IN, checkOut: CHECK_OUT, source: SEARCH_WINDOW_SOURCE } =
  getMyRealTripSearchWindow();
const ADULT_COUNT = Number(process.env.MYREALTRIP_ADULT_COUNT ?? "2");
const CHILD_COUNT = Number(process.env.MYREALTRIP_CHILD_COUNT ?? "0");
const MAX_HOTELS_PER_CITY = Number(
  process.env.MYREALTRIP_MAX_HOTELS ?? "100",
);
const PAGE_SIZE = Number(process.env.MYREALTRIP_PAGE_SIZE ?? "20");
const OUTPUT_PATH = resolve(
  process.cwd(),
  "src/data/generated/myrealtrip-hotels.json",
);

const ALLOWED_DESTINATION_SLUGS = new Set([
  "tokyo",
  "osaka",
  "fukuoka",
  "sapporo",
]);

interface GeneratedHotelFile {
  generatedAt?: string;
  source?: string;
  imageUsageAllowed?: boolean;
  hotelCount?: number;
  hotels?: Hotel[];
}

function assertPositiveInteger(value: number, name: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }
}

async function readExistingHotels(): Promise<Hotel[]> {
  try {
    const raw = await readFile(OUTPUT_PATH, "utf8");
    const parsed = JSON.parse(raw) as GeneratedHotelFile;

    if (!Array.isArray(parsed.hotels)) {
      throw new Error("기존 MyRealTrip 호텔 데이터의 hotels가 배열이 아닙니다.");
    }

    return parsed.hotels.filter((hotel) =>
      ALLOWED_DESTINATION_SLUGS.has(hotel.destinationId.replace("japan-", "")),
    );
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return [];
    }

    throw error;
  }
}

function mergeHotels(
  existingHotels: Hotel[],
  refreshedHotels: Hotel[],
): Hotel[] {
  const hotelMap = new Map<string, Hotel>();

  for (const hotel of existingHotels) {
    hotelMap.set(hotel.id, hotel);
  }

  for (const hotel of refreshedHotels) {
    hotelMap.set(hotel.id, hotel);
  }

  return [...hotelMap.values()];
}

async function fetchDestinationHotels(
  destination: ReturnType<typeof getMyRealTripDestinations>[number],
): Promise<Hotel[]> {
  console.log(`[지역] ${destination.city}`);

  const regionResponse =
    (await autocompleteAccommodationRegions({
      keyword: destination.regionKeyword,
      isDomestic: false,
    })) as MyRealTripRegionAutocompleteResponse;

  let region = findCityRegion(regionResponse, destination.city);

  if (!region && destination.slug === "okinawa") {
    const fallbackResponse =
      (await autocompleteAccommodationRegions({
        keyword: "나하",
        isDomestic: false,
      })) as MyRealTripRegionAutocompleteResponse;
    region = findCityRegion(fallbackResponse, "나하");
  }

  if (!region) {
    console.warn(`  지역을 찾지 못해 ${destination.city} 생성을 건너뜁니다.`);
    console.log("");
    return [];
  }

  if (region.regionId !== destination.regionId) {
    console.log(
      `  저장된 regionId ${destination.regionId} 대신 API에서 확인된 ${region.regionId}를 사용합니다.`,
    );
  }

  const collected = new Map<number, Hotel>();
  let page = 0;
  let totalCount = 0;

  while (collected.size < MAX_HOTELS_PER_CITY) {
    const response = (await searchAccommodations({
      regionId: region.regionId,
      checkIn: CHECK_IN,
      checkOut: CHECK_OUT,
      adultCount: ADULT_COUNT,
      childCount: CHILD_COUNT,
      page,
      size: PAGE_SIZE,
    })) as MyRealTripAccommodationSearchResponse;

    totalCount =
      response.data?.totalCount ?? response.meta?.totalCount ?? totalCount;

    const items = response.data?.items ?? [];

    console.log(
      `  page=${response.data?.page ?? page}: ${items.length}건 (누적 ${collected.size}/${MAX_HOTELS_PER_CITY})`,
    );

    if (items.length === 0) {
      break;
    }

    const normalized = normalizeAccommodationItems(response, {
      ...destination,
      regionId: region.regionId,
    });

    for (const hotel of normalized) {
      const externalId = Number(hotel.externalId);

      if (!Number.isInteger(externalId)) {
        continue;
      }

      if (!collected.has(externalId)) {
        const validation = validateHotelData(hotel);

        if (!validation.valid) {
          console.warn(formatHotelValidationFailure(hotel, validation));
          continue;
        }

        collected.set(externalId, hotel);
      }

      if (collected.size >= MAX_HOTELS_PER_CITY) {
        break;
      }
    }

    const responsePage = response.data?.page ?? page;
    const responseSize = response.data?.size ?? PAGE_SIZE;
    const hasMoreByCount =
      totalCount > 0 && (responsePage + 1) * responseSize < totalCount;

    if (items.length < responseSize || !hasMoreByCount) {
      break;
    }

    page = responsePage + 1;
  }

  const hotels = [...collected.values()];

  console.log(`  API total: ${totalCount}`);
  console.log(`  페이지 수집: ${hotels.length}건`);
  console.log("");

  return hotels;
}

async function main(): Promise<void> {
  assertPositiveInteger(ADULT_COUNT, "MYREALTRIP_ADULT_COUNT");
  assertPositiveInteger(MAX_HOTELS_PER_CITY, "MYREALTRIP_MAX_HOTELS");
  assertPositiveInteger(PAGE_SIZE, "MYREALTRIP_PAGE_SIZE");

  const existingHotels = await readExistingHotels();
  const refreshedHotels: Hotel[] = [];
  const destinations = getMyRealTripDestinations();

  console.log("MyRealTrip 숙소 데이터 생성 시작");
  console.log(
    `API 조회 기간: ${CHECK_IN} ~ ${CHECK_OUT} (${SEARCH_WINDOW_SOURCE === "rolling" ? "자동 갱신" : "환경변수 지정"})`,
  );
  console.log(`API 조회 인원: 성인 ${ADULT_COUNT}명 / 아동 ${CHILD_COUNT}명`);
  console.log(`도시별 최대 수집: ${MAX_HOTELS_PER_CITY}건`);
  console.log(`페이지 크기: ${PAGE_SIZE}건`);
  console.log("※ 위 값은 호텔 정보가 아니라 MyRealTrip 검색 API 조회 조건입니다.");
  console.log("");
  console.log(`기존 호텔: ${existingHotels.length}건`);
  console.log("");

  for (const destination of destinations) {
    const hotels = await fetchDestinationHotels(destination);
    refreshedHotels.push(...hotels);
  }

  const hotels = mergeHotels(existingHotels, refreshedHotels);

  const output = {
    generatedAt: new Date().toISOString(),
    source: "myrealtrip",
    imageUsageAllowed: getMyRealTripConfig().imageUsageAllowed,
    hotelCount: hotels.length,
    hotels,
  };

  await writeFile(OUTPUT_PATH, JSON.stringify(output, null, 2) + "\n", "utf8");

  console.log("================================");
  console.log(`새로 조회한 호텔: ${refreshedHotels.length}건`);
  console.log(`병합 후 전체 호텔: ${hotels.length}건`);
  console.log(`Output: ${OUTPUT_PATH}`);
}

await main();
