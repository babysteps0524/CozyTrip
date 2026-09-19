import type { Hotel, HotelPost } from "../../types";

export interface HotelPostFactWarning {
  scope: "content" | "numeric";
  message: string;
}

function normalize(value: string): string {
  return value.toLocaleLowerCase("ko-KR").replace(/\s+/g, "").replace(/[.,!?·()「」『』"']/g, "");
}

function allText(post: HotelPost): string {
  return [post.title, post.description, post.introduction, ...post.sections.flatMap((section) => [section.heading, ...section.paragraphs]), ...post.faq.flatMap((item) => [item.question, item.answer])].join("\n");
}

function hasUnconfirmedPhrase(text: string): boolean {
  return /확인되지않습니다|정보가없습니다|제공되지않습니다|알수없습니다/.test(normalize(text));
}

function sourceText(hotel: Hotel): string {
  return [hotel.name, hotel.nameEn, hotel.country, hotel.prefecture, hotel.city, hotel.area, hotel.description, hotel.location.address, ...(hotel.location.nearestStations ?? []), hotel.accommodationType, hotel.starRating?.toString(), hotel.checkIn, hotel.checkOut, ...(hotel.facilities ?? []).flatMap((item) => [item.name, item.description]), ...(hotel.restaurants ?? []).flatMap((item) => [item.name, item.description, item.cuisine, ...(item.mealTypes ?? []), item.openingHours])].filter(Boolean).join("\n");
}

export function validateHotelPostFacts(post: HotelPost, hotel: Hotel): HotelPostFactWarning[] {
  const warnings: HotelPostFactWarning[] = [];
  const rawText = allText(post);
  const text = normalize(rawText);
  const source = normalize(sourceText(hotel));

  const groups = [
    { terms: ["온천", "노천탕", "대욕장"], label: "온천/목욕 시설" },
    { terms: ["수영장"], label: "수영장" },
    { terms: ["헬스장", "피트니스"], label: "피트니스 시설" },
    { terms: ["스파"], label: "스파" },
    { terms: ["사우나"], label: "사우나" },
  ];

  for (const group of groups) {
    const matched = group.terms.find((term) => text.includes(term));
    if (!matched || hasUnconfirmedPhrase(rawText)) continue;
    if (!source.includes(normalize(matched))) {
      warnings.push({ scope: "content", message: `"${matched}" 관련 내용이 원본 호텔 데이터에서 확인되지 않습니다. (${group.label})` });
    }
  }

  const evaluationTerms = ["주요관광지와가깝", "관광지와가깝", "명소와가깝", "교통이편리", "접근성이좋", "이동이편리", "매우편리", "인기있는", "추천할만", "최고", "가장"];
  for (const term of evaluationTerms) {
    if (text.includes(term) && !hasUnconfirmedPhrase(rawText)) {
      warnings.push({ scope: "content", message: `"${term}"과 같은 평가/접근성 표현은 원본 데이터의 직접 근거를 확인해야 합니다.` });
    }
  }

  const numericPatterns = [/\d+(?:\.\d+)?\s*(?:km|킬로미터|미터|m)\b/iu, /\d+\s*분(?:\s*(?:거리|도보|도보거리))?/u, /\d+\s*시간(?:\s*거리)?/u, /\d{1,3}(?:,\d{3})*\s*(?:원|엔|달러)/u, /\d+\s*%/u];
  for (const pattern of numericPatterns) {
    const match = rawText.match(pattern);
    if (match) warnings.push({ scope: "numeric", message: `수치 "${match[0]}"가 포함되어 있습니다. 원본 호텔 데이터의 근거를 확인해야 합니다.` });
  }

  return warnings;
}