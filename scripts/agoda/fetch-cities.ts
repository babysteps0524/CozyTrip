import { fetchAgodaCities } from "./client";
import type { AgodaCity } from "./types";

interface TargetCity {
  key: string;
  names: string[];
}

const targetCities: TargetCity[] = [
  {
    key: "tokyo",
    names: ["Tokyo", "東京", "도쿄"],
  },
  {
    key: "osaka",
    names: ["Osaka", "大阪", "오사카"],
  },
  {
    key: "kyoto",
    names: ["Kyoto", "京都", "교토"],
  },
  {
    key: "fukuoka",
    names: ["Fukuoka", "福岡", "후쿠오카"],
  },
  {
    key: "sapporo",
    names: ["Sapporo", "札幌", "삿포로"],
  },
  {
    key: "okinawa",
    names: ["Okinawa", "沖縄", "오키나와"],
  },
];

function normalize(value: string | undefined): string {
  return (value ?? "").trim().toLowerCase().replace(/\s+/g, "");
}

function findMatchingCity(
  cities: AgodaCity[],
  target: TargetCity,
): AgodaCity | undefined {
  const names = target.names.map(normalize);

  return cities.find((city) => {
    const cityName = normalize(city.cityName);
    const translatedName = normalize(city.cityTranslated);

    return names.includes(cityName) || names.includes(translatedName);
  });
}

function printCity(target: TargetCity, city: AgodaCity | undefined): void {
  if (!city) {
    console.log(`❌ ${target.key}: 찾지 못함`);
    return;
  }

  console.log(
    [
      `✅ ${target.key}`,
      `   cityId       : ${city.cityId}`,
      `   cityName     : ${city.cityName}`,
      `   translated   : ${city.cityTranslated ?? "-"}`,
      `   countryId    : ${city.countryId}`,
      `   activeHotels : ${city.activeHotels ?? "-"}`,
      `   latitude     : ${city.latitude ?? "-"}`,
      `   longitude    : ${city.longitude ?? "-"}`,
    ].join("\n"),
  );
}

async function main(): Promise<void> {
  console.log("Agoda Cities Feed 조회 시작...\n");

  const response = await fetchAgodaCities();

  const cities = response.cityFeed?.cities?.city ?? [];

  if (cities.length === 0) {
    throw new Error("Agoda Cities Feed에서 도시 데이터를 찾지 못했습니다.");
  }

  console.log(`전체 도시 수: ${cities.length}\n`);

  for (const target of targetCities) {
    const city = findMatchingCity(cities, target);

    printCity(target, city);

    console.log("");
  }
}

main().catch((error) => {
  console.error("\nAgoda Cities Feed 조회 실패.");

  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }

  process.exit(1);
});
