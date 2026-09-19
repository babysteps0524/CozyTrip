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
import { getMyRealTripSearchWindow } from "./search-window";
import {
  formatHotelValidationFailure,
  validateHotelData,
} from "../lib/validate-hotel-data";

const { checkIn: CHECK_IN, checkOut: CHECK_OUT, source: SEARCH_WINDOW_SOURCE } =
  getMyRealTripSearchWindow();
const ADULT_COUNT = Number(process.env.MYREALTRIP_ADULT_COUNT ?? "2");
const CHILD_COUNT = Number(process.env.MYREALTRIP_CHILD_COUNT ?? "0");
const MAX_HOTELS = Number(process.env.MYREALTRIP_MAX_HOTELS ?? "20");

function assertPositiveInteger(value: number, name: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }
}

async function main(): Promise<void> {
  assertPositiveInteger(ADULT_COUNT, "MYREALTRIP_ADULT_COUNT");
  assertPositiveInteger(MAX_HOTELS, "MYREALTRIP_MAX_HOTELS");
  if (!Number.isInteger(CHILD_COUNT) || CHILD_COUNT < 0) {
    throw new Error("MYREALTRIP_CHILD_COUNT must be a non-negative integer.");
  }

  const hotels = [];
  const destinations = getMyRealTripDestinations();

  console.log("MyRealTrip 숙소 데이터 생성 시작");
  console.log(
    `API 조회 기간: ${CHECK_IN} ~ ${CHECK_OUT} (${SEARCH_WINDOW_SOURCE === "rolling" ? "자동 갱신" : "환경변수 지정"})`,
  );
  console.log(`API 조회 인원: 성인 ${ADULT_COUNT}명 / 아동 ${CHILD_COUNT}명`);
  console.log("※ 위 값은 호텔 정보가 아니라 MyRealTrip 검색 API 조회 조건입니다.");
  console.log("");

  for (const destination of destinations) {
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
      continue;
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

    let validCount = 0;

    for (const hotel of normalized) {
      const validation = validateHotelData(hotel);

      if (!validation.valid) {
        console.warn(formatHotelValidationFailure(hotel, validation));
        continue;
      }

      hotels.push(hotel);
      validCount += 1;
    }

    console.log(
      `  API total: ${response.data?.totalCount ?? response.meta?.totalCount ?? 0}`,
    );
    console.log(`  저장: ${validCount}건`);
    console.log("");
  }

  const output = {
    generatedAt: new Date().toISOString(),
    source: "myrealtrip",
    imageUsageAllowed:
      process.env.MYREALTRIP_IMAGE_USAGE_ALLOWED?.trim().toLowerCase() === "true",
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
