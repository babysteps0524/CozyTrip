function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}`,
    );
  }

  return value;
}

export function getRakutenConfig() {
  return {
    applicationId: getRequiredEnv("RAKUTEN_APPLICATION_ID"),
    affiliateId: process.env.RAKUTEN_AFFILIATE_ID ?? "",
    endpoint: getRequiredEnv("RAKUTEN_API_ENDPOINT"),
  };
}