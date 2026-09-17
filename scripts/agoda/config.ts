const requiredEnvNames = [
  "AGODA_BASE_URL",
  "AGODA_TOKEN",
  "AGODA_SITE_ID",
] as const;

export interface AgodaConfig {
  baseUrl: string;
  token: string;
  siteId: string;
}

function getEnv(name: string): string {
  return (process.env[name] ?? "").trim();
}

export function getAgodaConfig(): AgodaConfig {
  const baseUrl = getEnv("AGODA_BASE_URL");

  const token = getEnv("AGODA_TOKEN");

  const siteId = getEnv("AGODA_SITE_ID");

  const missing = requiredEnvNames.filter((name) => !getEnv(name));

  if (missing.length > 0) {
    throw new Error(
      [
        "Agoda API 환경변수가 없습니다.",
        "",
        `필수 환경변수: ${missing.join(", ")}`,
        "",
        "프로젝트 루트의 .env 파일에",
        "Agoda에서 발급받은 값을 설정하세요.",
      ].join("\n"),
    );
  }

  let normalizedBaseUrl: string;

  try {
    const parsed = new URL(baseUrl);

    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      throw new Error("http 또는 https URL이어야 합니다.");
    }

    normalizedBaseUrl = parsed.toString().replace(/\/+$/, "");
  } catch {
    throw new Error(
      [
        "AGODA_BASE_URL이 올바른 URL이 아닙니다.",
        "",
        "예:",
        "https://example.agoda.com",
        "",
        "실제 Base URL은 Agoda에서 발급받은 값을 사용하세요.",
      ].join("\n"),
    );
  }

  return {
    baseUrl: normalizedBaseUrl,

    token,

    siteId,
  };
}
