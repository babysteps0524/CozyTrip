import { autocompleteAccommodationRegions } from "./accommodation";

function printJson(label: string, value: unknown): void {
  console.log(label);
  console.log(JSON.stringify(value, null, 2));
  console.log("");
}

async function main(): Promise<void> {
  console.log("CozyTrip MyRealTrip Accommodation API 테스트");
  console.log("");
  console.log("API Key 자체는 출력하지 않습니다.");
  console.log("");

  try {
    const result = await autocompleteAccommodationRegions({
      keyword: "도쿄",
      isDomestic: false,
    });

    printJson("[1] 지역 자동완성 응답", result);
    console.log("다음 단계:");
    console.log("- 위 응답에서 도쿄의 regionId를 확인합니다.");
    console.log("- 확인된 regionId로 숙소 검색 API를 연결합니다.");
  } catch (error) {
    console.error("MyRealTrip Accommodation API 테스트 실패");
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

await main();
