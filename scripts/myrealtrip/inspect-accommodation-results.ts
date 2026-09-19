import {
  autocompleteAccommodationRegions,
  searchAccommodations,
} from "./accommodation";
import {
  findCityRegion,
  getMyRealTripDestinations,
  type MyRealTripAccommodationSearchResponse,
  type MyRealTripRegionAutocompleteResponse,
} from "./normalize";
import { getMyRealTripSearchWindow } from "./search-window";

const { checkIn: CHECK_IN, checkOut: CHECK_OUT, source: SEARCH_WINDOW_SOURCE } =
  getMyRealTripSearchWindow();
const ADULT_COUNT = Number(process.env.MYREALTRIP_ADULT_COUNT ?? "2");
const CHILD_COUNT = Number(process.env.MYREALTRIP_CHILD_COUNT ?? "0");

function assertCounts(): void {
  if (!Number.isInteger(ADULT_COUNT) || ADULT_COUNT <= 0) {
    throw new Error("MYREALTRIP_ADULT_COUNT must be a positive integer.");
  }

  if (!Number.isInteger(CHILD_COUNT) || CHILD_COUNT < 0) {
    throw new Error(
      "MYREALTRIP_CHILD_COUNT must be a non-negative integer.",
    );
  }
}

async function main(): Promise<void> {
  assertCounts();

  console.log("MyRealTrip 숙소 검색 결과 진단");
  console.log("================================");
  console.log(
    `API 조회 기간: ${CHECK_IN} ~ ${CHECK_OUT} (${SEARCH_WINDOW_SOURCE === "rolling" ? "자동 갱신" : "환경변수 지정"})`,
  );
  console.log(`API 조회 인원: 성인 ${ADULT_COUNT}명 / 아동 ${CHILD_COUNT}명`);
  console.log("");

  for (const destination of getMyRealTripDestinations()) {
    console.log(`[지역] ${destination.city}`);

    try {
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
        console.log("  지역 ID를 찾지 못했습니다.");
        console.log("");
        continue;
      }

      const response = (await searchAccommodations({
        regionId: region.regionId,
        checkIn: CHECK_IN,
        checkOut: CHECK_OUT,
        adultCount: ADULT_COUNT,
        childCount: CHILD_COUNT,
      })) as MyRealTripAccommodationSearchResponse;

      const items = response.data?.items ?? [];
      const totalCount =
        response.data?.totalCount ?? response.meta?.totalCount ?? 0;

      console.log(`  regionId: ${region.regionId}`);
      console.log(`  API totalCount: ${totalCount}`);
      console.log(`  응답 items: ${items.length}`);
      console.log(`  response page: ${response.data?.page ?? "없음"}`);
      console.log(`  response size: ${response.data?.size ?? "없음"}`);

      if (totalCount > items.length) {
        console.log(
          `  → 추가 결과가 있을 가능성이 있습니다. 페이지네이션 확인 필요: ${totalCount - items.length}건 이상`,
        );
      } else {
        console.log("  → 현재 응답 범위에서는 추가 결과가 확인되지 않습니다.");
      }
    } catch (error) {
      console.error(
        "  API 조회 실패:",
        error instanceof Error ? error.message : error,
      );
    }

    console.log("");
  }
}

await main();
