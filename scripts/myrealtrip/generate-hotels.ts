import { writeFile } from "node:fs/promises";
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
import {
  formatHotelValidationFailure,
  validateHotelData,
} from "../lib/validate-hotel-data";

const CHECK_IN = process.env.MYREALTRIP_CHECK_IN?.trim() || "2026-10-15";
const CHECK_OUT = process.env.MYREALTRIP_CHECK_OUT?.trim() || "2026-10-18";
const ADULT_COUNT = Number(process.env.MYREALTRIP_ADULT_COUNT ?? "2");
const CHILD_COUNT = Number(process.env.MYREALTRIP_CHILD_COUNT ?? "0");
const MAX_HOTELS = Number(process.env.MYREALTRIP_MAX_HOTELS ?? "20");

function assertPositiveInteger(value: number, name: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }
}

function assertDateRange(): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(CHECK_IN) || !/^\d{4}-\d{2}-\d{2}$/.test(CHECK_OUT)) {
    throw new Error("MYREALTRIP_CHECK_IN / MYREALTRIP_CHECK_OUT must use YYYY-MM-DD.");
  }

  if (CHECK_IN >= CHECK_OUT) {
    throw new Error("MYREALTRIP_CHECK_OUT must be later than MYREALTRIP_CHECK_IN.");
  }
}

async function main(): Promise<void> {
  assertPositiveInteger(ADULT_COUNT, "MYREALTRIP_ADULT_COUNT");
  assertPositiveInteger(MAX_HOTELS, "MYREALTRIP_MAX_HOTELS");
  if (!Number.isInteger(CHILD_COUNT) || CHILD_COUNT < 0) {
    throw new Error("MYREALTRIP_CHILD_COUNT must be a non-negative integer.");
  }
  assertDateRange();

  const hotels = [];
  const destinations = getMyRealTripDestinations();

  console.log("MyRealTrip 숙소 데이터 생성 시작");
  console.log(`숙박: ${CHECK_IN} ~ ${CHECK_OUT}`);
  console.log(`인원: 성인 ${ADULT_COUNT}명 / 아동 ${CHILD_COUNT}명`);
  console.log("");

  for (const destination of destinations) {
    console.log(`[지역] ${destination.city}`);

    const regionResponse =
      (await autocompleteAccommodationRegions({
        keyword: destination.regionKeyword,
        isDomestic: false,
      })) as MyRealTripRegionAutocompleteResponse;

    const region = findCityRegion(regionResponse, destination.city);

    if (!region) {
      throw new Error(`${destination.city} CITY region을 찾지 못했습니다.`);
    }

    if (region.regionId !== destination.regionId) {
      console.log(
        `  저장된 regionId ${destination.regionId} 대신 API에서 확인된 ${region.regionId}를 사용합니다.`,
      );
    }

    const response = (await searchAccommodations({
      regionId: region.regionId,
      checkIn: CHECK_IN,
      checkOut: CHECK_OUT,
      adultCount: ADULT_COUNT,
      childCount: CHILD_COUNT,
    })) as MyRealTripAccommodationSearchResponse;

    const normalized = normalizeAccommodationItems(response, {
      ...destination,
      regionId: region.regionId,
    }).slice(0, MAX_HOTELS);

    for (const hotel of normalized) {
      const validation = validateHotelData(hotel);

      if (!validation.valid) {
        console.warn(formatHotelValidationFailure(hotel, validation));
        continue;
      }

      hotels.push(hotel);
    }

    console.log(`  API total: ${response.data?.totalCount ?? response.meta?.totalCount ?? 0}`);
    console.log(`  저장: ${normalized.length}건`);
    console.log("");
  }

  const output = {
    generatedAt: new Date().toISOString(),
    source: "myrealtrip",
    search: {
      checkIn: CHECK_IN,
      checkOut: CHECK_OUT,
      adultCount: ADULT_COUNT,
      childCount: CHILD_COUNT,
    },
    hotelCount: hotels.length,
    hotels,
  };

  const outputPath = resolve(
    process.cwd(),
    "src/data/generated/myrealtrip-hotels.json",
  );

  await writeFile(outputPath, JSON.stringify(output, null, 2) + "\n", "utf8");

  console.log(`MyRealTrip hotel data generated: ${hotels.length} hotel(s)`);
  console.log(`Output: ${outputPath}`);
}

await main();
