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

const { checkIn, checkOut, source } = getMyRealTripSearchWindow();
const adultCount = Number(process.env.MYREALTRIP_ADULT_COUNT ?? "2");
const childCount = Number(process.env.MYREALTRIP_CHILD_COUNT ?? "0");
const TEST_PAGE = 1;
const TEST_SIZE = 20;

function assertCounts(): void {
  if (!Number.isInteger(adultCount) || adultCount <= 0) {
    throw new Error("MYREALTRIP_ADULT_COUNT must be a positive integer.");
  }

  if (!Number.isInteger(childCount) || childCount < 0) {
    throw new Error("MYREALTRIP_CHILD_COUNT must be a non-negative integer.");
  }
}

async function main(): Promise<void> {
  assertCounts();

  const destination = getMyRealTripDestinations()[0];

  console.log("MyRealTrip 페이지네이션 요청 진단");
  console.log("================================");
  console.log(
    `API 조회 기간: ${checkIn} ~ ${checkOut} (${source === "rolling" ? "자동 갱신" : "환경변수 지정"})`,
  );
  console.log(`테스트 요청: page=${TEST_PAGE}, size=${TEST_SIZE}`);
  console.log("");

  const regionResponse =
    (await autocompleteAccommodationRegions({
      keyword: destination.regionKeyword,
      isDomestic: false,
    })) as MyRealTripRegionAutocompleteResponse;

  const region = findCityRegion(regionResponse, destination.city);

  if (!region) {
    throw new Error(`${destination.city} regionId를 찾지 못했습니다.`);
  }

  const response = (await searchAccommodations({
    regionId: region.regionId,
    checkIn,
    checkOut,
    adultCount,
    childCount,
    page: TEST_PAGE,
    size: TEST_SIZE,
  })) as MyRealTripAccommodationSearchResponse;

  const items = response.data?.items ?? [];
  const totalCount =
    response.data?.totalCount ?? response.meta?.totalCount ?? 0;

  console.log(`지역: ${destination.city}`);
  console.log(`regionId: ${region.regionId}`);
  console.log(`API totalCount: ${totalCount}`);
  console.log(`응답 items: ${items.length}`);
  console.log(`response page: ${response.data?.page ?? "없음"}`);
  console.log(`response size: ${response.data?.size ?? "없음"}`);

  if (items.length > 0) {
    console.log("");
    console.log("첫 번째 item:");
    console.log(`  itemId: ${items[0]?.itemId}`);
    console.log(`  itemName: ${items[0]?.itemName}`);
  }

  console.log("");
  console.log(
    "page=1 결과가 정상적으로 반환되면 다음 단계에서 전체 수집 페이지네이션을 적용합니다.",
  );
}

await main();
