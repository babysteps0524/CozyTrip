import { getMyRealTripConfig } from "./config";

function main(): void {
  console.log("CozyTrip MyRealTrip Partner API 상태 확인");
  console.log("");

  try {
    const config = getMyRealTripConfig();

    console.log("MyRealTrip API Key가 설정되어 있습니다.");
    console.log(`Base URL: ${config.baseUrl}`);
    console.log("API Key: 설정됨");
    console.log("");
    console.log("다음 단계:");
    console.log("  bun run myrealtrip:test");
    console.log("  bun run myrealtrip:generate");
  } catch (error) {
    console.log("MyRealTrip API 설정이 아직 완료되지 않았습니다.");
    console.log("");
    console.log("API Key 자체는 정상적으로 보유하고 있더라도");
    console.log("실제 호출에는 마이리얼트립 개발자센터에서 안내한");
    console.log("Partner API Base URL과 엔드포인트 정보가 필요합니다.");
    console.log("");

    if (error instanceof Error) {
      console.log(error.message);
    }
  }
}

main();
