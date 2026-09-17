import {
  fetchAgodaCities,
  fetchAgodaHotelsByCity,
  fetchAgodaHotelPictures,
  fetchAgodaHotelInfo,
  fetchAgodaHotelDescriptionsByCity,
  fetchAgodaHotelAddressesByCity,
  fetchAgodaHotelFullInformation,
} from "./client";

import type { AgodaCity, AgodaHotelInformation } from "./types";

const TARGET_CITIES = [
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
] as const;

function normalize(value: string | undefined): string {
  return (value ?? "").trim().toLowerCase().replace(/\s+/g, "");
}

function findCity(
  cities: AgodaCity[],
  names: readonly string[],
): AgodaCity | undefined {
  const targets = names.map(normalize);

  return cities.find((city) => {
    const cityName = normalize(city.cityName);

    const translated = normalize(city.cityTranslated);

    return targets.includes(cityName) || targets.includes(translated);
  });
}

function printSection(title: string): void {
  console.log("");
  console.log("========================================");
  console.log(title);
  console.log("========================================");
}

function printSuccess(message: string): void {
  console.log(`✓ ${message}`);
}

function printFailure(message: string): void {
  console.error(`✗ ${message}`);
}

function getFirstHotel(hotels: AgodaHotelInformation[]): AgodaHotelInformation {
  const hotel = hotels[0];

  if (!hotel) {
    throw new Error("해당 도시에서 호텔 데이터를 찾지 못했습니다.");
  }

  return hotel;
}

async function testCities(): Promise<AgodaCity[]> {
  printSection("Feed 3 - Cities");

  const response = await fetchAgodaCities();

  const cities = response.cityFeed?.cities?.city ?? [];

  if (cities.length === 0) {
    throw new Error("Feed 3 응답에 도시 데이터가 없습니다.");
  }

  printSuccess(`전체 도시 ${cities.length}개 조회`);

  for (const target of TARGET_CITIES) {
    const city = findCity(cities, target.names);

    if (city) {
      printSuccess(`${target.key}: ${city.cityName} (${city.cityId})`);
    } else {
      printFailure(`${target.key}: 도시를 찾지 못함`);
    }
  }

  return cities;
}

async function testHotelList(cities: AgodaCity[]): Promise<{
  city: AgodaCity;
  hotel: AgodaHotelInformation;
}> {
  printSection("Feed 5 - Hotels");

  const target = TARGET_CITIES[0];

  const city = findCity(cities, target.names);

  if (!city) {
    throw new Error("도쿄 도시 데이터를 찾지 못했습니다.");
  }

  const response = await fetchAgodaHotelsByCity(city.cityId);

  const hotels =
    response.hotelInformationFeed?.hotelInformations?.hotelInformation ?? [];

  if (hotels.length === 0) {
    throw new Error(`호텔 데이터가 없습니다. cityId=${city.cityId}`);
  }

  printSuccess(`${city.cityName}: 호텔 ${hotels.length}개 조회`);

  const hotel = getFirstHotel(hotels);

  console.log(`  hotelId: ${hotel.hotelId}`);

  console.log(`  hotelName: ${hotel.hotelName}`);

  console.log(`  translatedName: ${hotel.translatedName ?? "-"}`);

  console.log(`  starRating: ${hotel.starRating ?? "-"}`);

  console.log(`  ratingAverage: ${hotel.ratingAverage ?? "-"}`);

  console.log(`  numberOfReviews: ${hotel.numberOfReviews ?? "-"}`);

  console.log(`  accommodationType: ${hotel.accommodationType ?? "-"}`);

  return {
    city,
    hotel,
  };
}

async function testHotelPictures(hotel: AgodaHotelInformation): Promise<void> {
  printSection("Feed 7 - Pictures");

  const response = await fetchAgodaHotelPictures(hotel.hotelId);

  const pictures = response.pictureFeed?.pictures?.picture ?? [];

  printSuccess(`사진 ${pictures.length}개 조회`);

  for (const picture of pictures.slice(0, 3)) {
    console.log(`  pictureId: ${picture.pictureId}`);

    console.log(`  group: ${picture.pictureGroup ?? "-"}`);

    console.log(`  URL: ${picture.URL}`);

    console.log("");
  }
}

async function testHotelInfo(hotel: AgodaHotelInformation): Promise<void> {
  printSection("Feed 10 - Operational Information");

  const response = await fetchAgodaHotelInfo(hotel.hotelId);

  const infos = response.hotelInfoFeed?.hotelInfos?.hotelInfo ?? [];

  printSuccess(`운영정보 ${infos.length}개 조회`);

  for (const info of infos.slice(0, 10)) {
    console.log(`  ${info.propertyTranslatedName ?? info.propertyName ?? "-"}`);

    console.log(`    ${info.propertyDetails ?? "-"}`);
  }
}

async function testCityDescriptions(city: AgodaCity): Promise<void> {
  printSection("Feed 17 - Hotel Descriptions");

  const response = await fetchAgodaHotelDescriptionsByCity(city.cityId);

  const descriptions =
    response.hotelDescriptionFeed?.hotelDescriptions?.hotelDescription ?? [];

  printSuccess(`설명 데이터 ${descriptions.length}개 조회`);

  const first = descriptions[0];

  if (first) {
    console.log(`  hotelId: ${first.hotelId}`);

    console.log(
      `  overview: ${first.overview ? first.overview.slice(0, 200) : "-"}`,
    );

    console.log(
      `  snippet: ${first.snippet ? first.snippet.slice(0, 200) : "-"}`,
    );
  }
}

async function testCityAddresses(city: AgodaCity): Promise<void> {
  printSection("Feed 18 - Hotel Addresses");

  const response = await fetchAgodaHotelAddressesByCity(city.cityId);

  const addresses =
    response.hotelAddressFeed?.hotelAddresses?.hotelAddress ?? [];

  printSuccess(`주소 데이터 ${addresses.length}개 조회`);

  const first = addresses[0];

  if (first) {
    console.log(`  hotelId: ${first.hotelId}`);

    console.log(`  addressLine1: ${first.addressLine1 ?? "-"}`);

    console.log(`  addressLine2: ${first.addressLine2 ?? "-"}`);

    console.log(`  city: ${first.city ?? "-"}`);

    console.log(`  country: ${first.country ?? "-"}`);
  }
}

async function testFullInformation(
  hotel: AgodaHotelInformation,
): Promise<void> {
  printSection("Feed 19 - Full Hotel Information");

  const response = await fetchAgodaHotelFullInformation(hotel.hotelId);

  const feed = response.hotelFullFeed;

  if (!feed) {
    throw new Error("Feed 19 응답에 hotelFullFeed가 없습니다.");
  }

  const hotels = feed.hotels?.hotel ?? [];

  const addresses = feed.addresses?.address ?? [];

  const descriptions = feed.descriptions?.description ?? [];

  const facilities = feed.facilities?.facility ?? [];

  const pictures = feed.pictures?.picture ?? [];

  const rooms = feed.roomtypes?.roomtype ?? [];

  printSuccess(`호텔 기본정보: ${hotels.length}개`);

  printSuccess(`주소: ${addresses.length}개`);

  printSuccess(`설명: ${descriptions.length}개`);

  printSuccess(`시설: ${facilities.length}개`);

  printSuccess(`사진: ${pictures.length}개`);

  printSuccess(`객실: ${rooms.length}개`);

  const fullHotel = hotels.find((item) => item.hotelId === hotel.hotelId);

  if (fullHotel) {
    console.log("");

    console.log(`hotelId: ${fullHotel.hotelId}`);

    console.log(`hotelName: ${fullHotel.hotelName}`);

    console.log(`translatedName: ${fullHotel.translatedName ?? "-"}`);

    console.log(`starRating: ${fullHotel.starRating ?? "-"}`);

    console.log(`ratingAverage: ${fullHotel.ratingAverage ?? "-"}`);

    console.log(`numberOfReviews: ${fullHotel.numberOfReviews ?? "-"}`);

    console.log(`accommodationType: ${fullHotel.accommodationType ?? "-"}`);
  }

  const firstRoom = rooms[0];

  if (firstRoom) {
    console.log("");

    console.log("첫 번째 객실:");

    console.log(`  ID: ${firstRoom.hotelRoomtypeId ?? "-"}`);

    console.log(
      `  이름: ${
        firstRoom.standardCaptionTranslated ?? firstRoom.standardCaption ?? "-"
      }`,
    );

    console.log(`  최대 투숙객: ${firstRoom.maxOccupancyPerRoom ?? "-"}`);

    console.log(`  객실 크기: ${firstRoom.sizeOfRoom ?? "-"}`);

    console.log(`  침대: ${firstRoom.bedType ?? "-"}`);
  }
}

async function main(): Promise<void> {
  console.log("");
  console.log("CozyTrip Agoda API 검증");
  console.log("");

  const cities = await testCities();

  const { city, hotel } = await testHotelList(cities);

  await testCityDescriptions(city);

  await testCityAddresses(city);

  await testHotelPictures(hotel);

  await testHotelInfo(hotel);

  await testFullInformation(hotel);

  printSection("검증 완료");

  console.log("모든 Agoda Feed 요청이 정상적으로 완료되었습니다.");
}

main().catch((error) => {
  console.error("");

  printSection("검증 실패");

  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }

  process.exit(1);
});
