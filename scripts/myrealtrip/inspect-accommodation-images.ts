import {
  autocompleteAccommodationRegions,
  searchAccommodations,
} from "./accommodation";
import {
  findCityRegion,
  getMyRealTripDestinations,
  type MyRealTripRegionAutocompleteResponse,
} from "./normalize";
import { getMyRealTripSearchWindow } from "./search-window";

interface JsonObject {
  [key: string]: unknown;
}

const { checkIn: CHECK_IN, checkOut: CHECK_OUT } = getMyRealTripSearchWindow();
const ADULT_COUNT = Number(process.env.MYREALTRIP_ADULT_COUNT ?? "2");
const CHILD_COUNT = Number(process.env.MYREALTRIP_CHILD_COUNT ?? "0");

const IMAGE_KEY_PATTERN =
  /(image|images|photo|photos|picture|pictures|thumbnail|gallery|media|url)/i;

const IMAGE_TYPE_PATTERN =
  /(hero|room|facility|restaurant|location|attraction|gallery|breakfast|bathroom|lobby|pool|exterior)/i;

function isObject(value: unknown): value is JsonObject {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function looksLikeUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.length < 8) return false;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function summarizeValue(value: unknown): string {
  if (looksLikeUrl(value)) return "[URL]";
  if (Array.isArray(value)) return `[array:${value.length}]`;
  if (isObject(value)) return "{object}";
  if (typeof value === "string") {
    return value.length > 120 ? value.slice(0, 120) + "…" : value;
  }
  return String(value);
}

function collectImageCandidates(
  value: unknown,
  path: string,
  output: string[],
  depth = 0,
): void {
  if (depth > 5 || output.length >= 100) return;

  if (Array.isArray(value)) {
    for (let index = 0; index < Math.min(value.length, 20); index += 1) {
      collectImageCandidates(value[index], `${path}[${index}]`, output, depth + 1);
    }
    return;
  }

  if (!isObject(value)) return;

  for (const [key, child] of Object.entries(value)) {
    const childPath = path ? `${path}.${key}` : key;

    if (IMAGE_KEY_PATTERN.test(key)) {
      output.push(`${childPath} = ${summarizeValue(child)}`);
    }

    if (isObject(child) || Array.isArray(child)) {
      collectImageCandidates(child, childPath, output, depth + 1);
    }
  }
}

function collectTypedImageHints(
  value: unknown,
  path: string,
  output: string[],
  depth = 0,
): void {
  if (depth > 5 || output.length >= 100) return;

  if (Array.isArray(value)) {
    for (let index = 0; index < Math.min(value.length, 20); index += 1) {
      collectTypedImageHints(
        value[index],
        `${path}[${index}]`,
        output,
        depth + 1,
      );
    }
    return;
  }

  if (!isObject(value)) return;

  const typeEntries = Object.entries(value).filter(
    ([key, child]) =>
      /type|category|kind/i.test(key) &&
      typeof child === "string" &&
      IMAGE_TYPE_PATTERN.test(child),
  );

  const urlEntries = Object.entries(value).filter(
    ([key, child]) => /url|src|image/i.test(key) && looksLikeUrl(child),
  );

  if (typeEntries.length > 0 || urlEntries.length > 0) {
    output.push(
      [
        path || "$",
        ...typeEntries.map(([key, child]) => `${key}=${String(child)}`),
        ...urlEntries.map(([key]) => `${key}=[URL]`),
      ].join(" "),
    );
  }

  for (const [key, child] of Object.entries(value)) {
    if (isObject(child) || Array.isArray(child)) {
      collectTypedImageHints(
        child,
        path ? `${path}.${key}` : key,
        output,
        depth + 1,
      );
    }
  }
}

async function main(): Promise<void> {
  console.log("MyRealTrip 숙소 이미지 필드 진단");
  console.log("================================");
  console.log(`조회 기간: ${CHECK_IN} ~ ${CHECK_OUT}`);
  console.log(`인원: 성인 ${ADULT_COUNT}명 / 아동 ${CHILD_COUNT}명`);
  console.log("");

  const destination = getMyRealTripDestinations()[0];

  const regionResponse =
    (await autocompleteAccommodationRegions({
      keyword: destination.regionKeyword,
      isDomestic: false,
    })) as MyRealTripRegionAutocompleteResponse;

  const region = findCityRegion(regionResponse, destination.city);

  if (!region) {
    throw new Error(`${destination.city} regionId를 찾지 못했습니다.`);
  }

  const response = await searchAccommodations({
    regionId: region.regionId,
    checkIn: CHECK_IN,
    checkOut: CHECK_OUT,
    adultCount: ADULT_COUNT,
    childCount: CHILD_COUNT,
    page: 0,
    size: 3,
  });

  if (!isObject(response)) {
    throw new Error("숙소 검색 응답이 객체가 아닙니다.");
  }

  const data = response.data;
  if (!isObject(data)) {
    throw new Error("숙소 검색 응답의 data가 객체가 아닙니다.");
  }

  const items = data.items;
  if (!Array.isArray(items) || items.length === 0) {
    console.log("첫 페이지에 숙소가 없습니다.");
    return;
  }

  console.log(`샘플 숙소: ${items.length}건`);
  console.log("");

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];

    console.log(`[숙소 ${index + 1}]`);
    console.log("이미지 관련 필드:");

    const imageCandidates: string[] = [];
    collectImageCandidates(item, "item", imageCandidates);

    if (imageCandidates.length === 0) {
      console.log("  없음");
    } else {
      for (const candidate of imageCandidates) {
        console.log(`  - ${candidate}`);
      }
    }

    console.log("명시적 이미지 타입 후보:");
    const typedHints: string[] = [];
    collectTypedImageHints(item, "item", typedHints);

    if (typedHints.length === 0) {
      console.log("  없음");
    } else {
      for (const hint of typedHints) {
        console.log(`  - ${hint}`);
      }
    }

    console.log("");
  }

  console.log("판단 기준:");
  console.log("- 실제 API 응답에 있는 필드만 확인합니다.");
  console.log("- imageUrl 하나만 있다면 객실/시설/조식 이미지를 임의로 분류하지 않습니다.");
  console.log("- provider가 명시한 이미지 타입이 확인될 때만 HotelImage.type으로 연결합니다.");
}

await main();
