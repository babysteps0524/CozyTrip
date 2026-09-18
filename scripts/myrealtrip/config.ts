const requiredEnvNames = ["MYREALTRIP_API_KEY"] as const;

export interface MyRealTripConfig {
  apiKey: string;
  baseUrl: string;
}

function getEnv(name: string): string {
  return (process.env[name] ?? "").trim();
}

export function getMyRealTripConfig(): MyRealTripConfig {
  const apiKey = getEnv("MYREALTRIP_API_KEY");
  const baseUrl = getEnv("MYREALTRIP_BASE_URL");

  const missing = requiredEnvNames.filter((name) => !getEnv(name));

  if (missing.length > 0) {
    throw new Error(
      [
        "MyRealTrip Partner API 환경변수가 없습니다.",
        "",
        `필수 환경변수: ${missing.join(", ")}`,
        "",
        "프로젝트 루트의 .env 파일에",
        "마이리얼트립에서 발급받은 API Key를 설정하세요.",
      ].join("\n"),
    );
  }

  if (!baseUrl) {
    throw new Error(
      [
        "MYREALTRIP_BASE_URL이 설정되지 않았습니다.",
        "",
        "마이리얼트립 개발자센터에서 안내받은 Partner API Base URL을",
        ".env에 입력한 뒤 API 호출을 진행하세요.",
      ].join("\n"),
    );
  }

  let normalizedBaseUrl: string;

  try {
    const parsed = new URL(baseUrl);

    if (parsed.protocol !== "https:") {
      throw new Error("HTTPS URL이어야 합니다.");
    }

    normalizedBaseUrl = parsed.toString().replace(/\/+$/, "");
  } catch {
    throw new Error(
      [
        "MYREALTRIP_BASE_URL이 올바른 HTTPS URL이 아닙니다.",
        "",
        "마이리얼트립 개발자센터에서 제공한 실제 Base URL을 사용하세요.",
      ].join("\n"),
    );
  }

  return {
    apiKey,
    baseUrl: normalizedBaseUrl,
  };
}
