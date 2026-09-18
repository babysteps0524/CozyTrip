import { getAgodaConfig } from "./config";

function main(): void {
  console.log("CozyTrip Agoda API 상태 확인");
  console.log("");

  try {
    const config = getAgodaConfig();

    console.log("Agoda API 환경변수가 설정되어 있습니다.");
    console.log(`Base URL: ${config.baseUrl}`);
    console.log(`Site ID: ${config.siteId}`);
    console.log("");
    console.log("다음 단계:");
    console.log("  bun run agoda:test");
    console.log("  bun run agoda:generate");
  } catch (error) {
    console.log("Agoda API 자격정보가 아직 설정되지 않았습니다.");
    console.log("");
    console.log("현재 CozyTrip은 Agoda 승인/API 발급 전 상태이므로");
    console.log("이 상태에서는 API를 호출하지 않고 샘플 호텔 데이터로 개발을 계속합니다.");
    console.log("");

    if (error instanceof Error) {
      console.log(error.message);
    }
  }
}

main();
