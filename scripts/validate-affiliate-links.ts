import { resolve } from "node:path";
import type { AffiliateLink, AffiliateProvider, Hotel } from "../src/types";

interface HotelsFile {
  hotels: unknown[];
}

const root = resolve(import.meta.dir, "..");
const hotelsPath = resolve(root, "src/data/generated/myrealtrip-hotels.json");

const allowedProviders = new Set<AffiliateProvider>(["myrealtrip"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function isAffiliateProvider(value: unknown): value is AffiliateProvider {
  return typeof value === "string" && allowedProviders.has(value as AffiliateProvider);
}

function isAffiliateLink(value: unknown): value is AffiliateLink {
  return (
    isRecord(value) &&
    isAffiliateProvider(value.provider) &&
    typeof value.url === "string" &&
    typeof value.label === "string"
  );
}

function validateUrl(url: string): string | null {
  try {
    const parsed = new URL(url);

    if (parsed.protocol !== "https:") {
      return "URL은 HTTPS만 허용합니다.";
    }

    if (!parsed.hostname || parsed.hostname === "localhost") {
      return "유효한 외부 호스트가 필요합니다.";
    }

    return null;
  } catch {
    return "유효한 URL이 아닙니다.";
  }
}

async function main(): Promise<void> {
  const file = JSON.parse(await Bun.file(hotelsPath).text()) as HotelsFile;
  const hotels = Array.isArray(file.hotels)
    ? file.hotels.filter((value): value is Hotel => isRecord(value))
    : [];

  let checked = 0;
  let failed = 0;

  for (const hotel of hotels) {
    const links = Array.isArray(hotel.affiliateLinks) ? hotel.affiliateLinks : [];

    for (const value of links) {
      checked += 1;

      if (!isAffiliateLink(value)) {
        failed += 1;
        console.error(`INVALID AFFILIATE LINK [${hotel.id}]: provider/url/label 형식이 올바르지 않습니다.`);
        continue;
      }

      const urlError = validateUrl(value.url);
      if (urlError) {
        failed += 1;
        console.error(`INVALID AFFILIATE URL [${hotel.id}] [${value.provider}]: ${urlError} ${value.url}`);
      }

      if (value.rel && value.rel !== "sponsored" && value.rel !== "nofollow sponsored") {
        failed += 1;
        console.error(`INVALID AFFILIATE REL [${hotel.id}] [${value.provider}]: ${value.rel}`);
      }

      if (!value.label.trim()) {
        failed += 1;
        console.error(`INVALID AFFILIATE LABEL [${hotel.id}] [${value.provider}]: label이 비어 있습니다.`);
      }
    }
  }

  console.log(`Affiliate link validation complete. Hotels: ${hotels.length}, Links: ${checked}, Errors: ${failed}`);

  if (failed > 0) process.exit(1);
}

await main();
