import {
  mkdir,
  writeFile,
} from "node:fs/promises";

import { resolve } from "node:path";

import {
  fetchAgodaCities,
  fetchAgodaHotelsByCity,
} from "./client";

import {
  buildAgodaHotel,
  loadCityContent,
} from "./fetch-hotel";

import type {
  AgodaCity,
} from "./types";

const TARGET_CITIES = [
  {
    key: "tokyo",
    names: [
      "Tokyo",
      "東京",
      "도쿄",
    ],
  },
  {
    key: "osaka",
    names: [
      "Osaka",
      "大阪",
      "오사카",
    ],
  },
  {
    key: "kyoto",
    names: [
      "Kyoto",
      "京都",
      "교토",
    ],
  },
  {
    key: "fukuoka",
    names: [
      "Fukuoka",
      "福岡",
      "후쿠오카",
    ],
  },
  {
    key: "sapporo",
    names: [
      "Sapporo",
      "札幌",
      "삿포로",
    ],
  },
  {
    key: "okinawa",
    names: [
      "Okinawa",
      "沖縄",
      "오키나와",
    ],
  },
] as const;

interface TargetCity {
  key: string;
  names: readonly string[];
}

interface GeneratedHotelFile {
  generatedAt: string;
  source: "agoda";
  hotelCount: number;
  hotels: Awaited<
    ReturnType<typeof buildAgodaHotel>
  >["hotel"][];
}

function normalizeName(
  value: string | undefined,
): string {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
}

function findTargetCity(
  cities: AgodaCity[],
  target: TargetCity,
): AgodaCity | undefined {
  const names =
    target.names.map(normalizeName);

  return cities.find((city) => {
    const cityName =
      normalizeName(city.cityName);

    const translatedName =
      normalizeName(
        city.cityTranslated,
      );

    return (
      names.includes(cityName) ||
      names.includes(translatedName)
    );
  });
}

function getMaxHotels(): number {
  const value = Number(
    process.env.AGODA_MAX_HOTELS ??
      "5",
  );

  if (
    !Number.isFinite(value) ||
    value < 1
  ) {
    return 5;
  }

  return Math.floor(value);
}

async function generateCityHotels(
  target: TargetCity,
  city: AgodaCity,
  maxHotels: number,
) {
  console.log("");
  console.log(
    `========== ${target.key} ==========`,
  );

  console.log(
    `도시: ${city.cityName}`,
  );

  console.log(
    `cityId: ${city.cityId}`,
  );

  /*
   * Feed 17:
   * 호텔 설명
   *
   * Feed 18:
   * 호텔 주소
   */
  console.log(
    "도시 호텔 설명/주소 데이터 조회 중...",
  );

  const {
    descriptions,
    addresses,
  } = await loadCityContent(
    city.cityId,
  );

  console.log(
    `설명 데이터: ${descriptions.size}`,
  );

  console.log(
    `주소 데이터: ${addresses.size}`,
  );

  /*
   * Feed 5:
   * 해당 도시의 호텔 목록
   */
  console.log(
    "호텔 목록 조회 중...",
  );

  const response =
    await fetchAgodaHotelsByCity(
      city.cityId,
    );

  const hotels =
    response
      .hotelInformationFeed
      ?.hotelInformations
      ?.hotelInformation ?? [];

  console.log(
    `전체 호텔: ${hotels.length}`,
  );

  const selectedHotels =
    hotels.slice(
      0,
      maxHotels,
    );

  console.log(
    `이번 실행 대상: ${selectedHotels.length}`,
  );

  const results: Awaited<
    ReturnType<typeof buildAgodaHotel>
  >["hotel"][] = [];

  for (
    let index = 0;
    index < selectedHotels.length;
    index += 1
  ) {
    const hotel =
      selectedHotels[index];

    console.log("");
    console.log(
      `[${index + 1}/${selectedHotels.length}] ${hotel.hotelName}`,
    );

    try {
      const result =
        await buildAgodaHotel({
          hotel,

          cityName:
            city.cityName,

          cityTranslated:
            city.cityTranslated,

          cityId:
            city.cityId,

          description:
            descriptions.get(
              hotel.hotelId,
            ),

          address:
            addresses.get(
              hotel.hotelId,
            ),
        });

      results.push(
        result.hotel,
      );

      console.log(
        `  이미지: ${result.pictures.length}`,
      );

      console.log(
        `  주소: ${
          result.hotel.location.address ||
          "-"
        }`,
      );

      console.log(
        `  설명: ${
          result.hotel.description
            ? "있음"
            : "없음"
        }`,
      );

      console.log(
        `  체크인: ${
          result.hotel.checkIn ||
          "-"
        }`,
      );

      console.log(
        `  체크아웃: ${
          result.hotel.checkOut ||
          "-"
        }`,
      );
    } catch (error) {
      console.error(
        `  수집 실패: ${hotel.hotelName}`,
      );

      if (error instanceof Error) {
        console.error(
          `  ${error.message}`,
        );
      } else {
        console.error(error);
      }
    }
  }

  return results;
}

async function main(): Promise<void> {
  console.log(
    "========================================",
  );

  console.log(
    "CozyTrip Agoda 호텔 데이터 생성",
  );

  console.log(
    "========================================",
  );

  const maxHotels =
    getMaxHotels();

  console.log(
    `도시별 최대 호텔 수: ${maxHotels}`,
  );

  console.log(
    "\nAgoda Cities Feed 조회 중...",
  );

  const cityResponse =
    await fetchAgodaCities();

  const cities =
    cityResponse
      .cityFeed
      ?.cities
      ?.city ?? [];

  if (cities.length === 0) {
    throw new Error(
      "Agoda Cities Feed에서 도시 데이터를 찾지 못했습니다.",
    );
  }

  console.log(
    `전체 도시 수: ${cities.length}`,
  );

  const allHotels: Awaited<
    ReturnType<typeof buildAgodaHotel>
  >["hotel"][] = [];

  for (
    const target of TARGET_CITIES
  ) {
    const city =
      findTargetCity(
        cities,
        target,
      );

    if (!city) {
      console.warn(
        `도시를 찾지 못했습니다: ${target.key}`,
      );

      continue;
    }

    const hotels =
      await generateCityHotels(
        target,
        city,
        maxHotels,
      );

    allHotels.push(
      ...hotels,
    );
  }

  const uniqueHotels =
    new Map(
      allHotels.map((hotel) => [
        hotel.id,
        hotel,
      ]),
    );

  const output:
    GeneratedHotelFile = {
    generatedAt:
      new Date().toISOString(),

    source:
      "agoda",

    hotelCount:
      uniqueHotels.size,

    hotels:
      Array.from(
        uniqueHotels.values(),
      ),
  };

  const outputDir =
    resolve(
      process.cwd(),
      "src/data/generated",
    );

  const outputPath =
    resolve(
      outputDir,
      "agoda-hotels.json",
    );

  await mkdir(
    outputDir,
    {
      recursive: true,
    },
  );

  await writeFile(
    outputPath,
    JSON.stringify(
      output,
      null,
      2,
    ),
    "utf8",
  );

  console.log("");
  console.log(
    "========================================",
  );

  console.log(
    `총 호텔: ${uniqueHotels.size}`,
  );

  console.log(
    `저장 위치: ${outputPath}`,
  );

  console.log(
    "========================================",
  );
}

main().catch((error) => {
  console.error("");
  console.error(
    "Agoda 호텔 데이터 생성 실패.",
  );

  if (error instanceof Error) {
    console.error(
      error.message,
    );
  } else {
    console.error(error);
  }

  process.exit(1);
});