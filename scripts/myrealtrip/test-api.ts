import {
  autocompleteAccommodationRegions,
  searchAccommodations,
} from "./accommodation";

function printJson(label: string, value: unknown): void {
  console.log(label);
  console.log(JSON.stringify(value, null, 2));
  console.log("");
}

function findTokyoRegionId(value: unknown): number {
  if (!value || typeof value !== "object") {
    throw new Error("지역 자동완성 응답 형식이 올바르지 않습니다.");
  }

  const data = (value as { data?: unknown }).data;
  if (!data || typeof data !== "object") {
    throw new Error("지역 자동완성 응답에 data가 없습니다.");
  }

  const regions = (data as { regions?: unknown }).regions;
  if (!Array.isArray(regions)) {
    throw new Error("지역 자동완성 응답에 regions가 없습니다.");
  }

  const tokyo = regions.find((region) => {
    if (!region || typeof region !== "object") return false;
    const item = region as { name?: unknown; type?: unknown };
    return item.name === "도쿄" && item.type === "CITY";
  });

  if (!tokyo || typeof tokyo !== "object") {
    throw new Error("도쿄 CITY regionId를 찾지 못했습니다.");
  }

  const regionId = (tokyo as { regionId?: unknown }).regionId;
  if (typeof regionId !== "number") {
    throw new Error("도쿄 regionId가 숫자가 아닙니다.");
  }

  return regionId;
}

async function main(): Promise<void> {
  console.log("CozyTrip MyRealTrip Accommodation API 테스트");
  console.log("");
  console.log("API Key 자체는 출력하지 않습니다.");
  console.log("");

  try {
    const regionResult = await autocompleteAccommodationRegions({
      keyword: "도쿄",
      isDomestic: false,
    });

    printJson("[1] 지역 자동완성 응답", regionResult);

    const regionId = findTokyoRegionId(regionResult);
    console.log(`[2] 도쿄 regionId: ${regionId}`);
    console.log("");

    const searchResult = await searchAccommodations({
      regionId,
      checkIn: "2026-10-15",
      checkOut: "2026-10-18",
      adultCount: 2,
      childCount: 0,
    });

    printJson("[3] 숙소 검색 응답", searchResult);
    console.log("다음 단계:");
    console.log("- 숙소 검색 응답의 실제 필드 구조를 확인합니다.");
    console.log("- 확인된 필드를 CozyTrip Hotel 타입으로 변환합니다.");
  } catch (error) {
    console.error("MyRealTrip Accommodation API 테스트 실패");
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

await main();
