import {
  fetchAgodaHotelAddressesByCity,
  fetchAgodaHotelDescriptionsByCity,
  fetchAgodaHotelInfo,
  fetchAgodaHotelPictures,
} from "./client";

import { fetchAgodaFullHotelInformation } from "./full-information";

import {
  normalizeFacilities,
  normalizeFullPictures,
  normalizeRooms,
} from "./normalize-full";

import type {
  AgodaHotelAddress,
  AgodaHotelDescription,
  AgodaHotelInfo,
  AgodaHotelInformation,
  AgodaHotelPicture,
} from "./types";

import { normalizeAgodaHotel } from "./normalize";

export interface AgodaHotelFetchResult {
  hotel: ReturnType<typeof normalizeAgodaHotel>;

  pictures: AgodaHotelPicture[];

  infos: AgodaHotelInfo[];
}

function getInfoValue(
  infos: AgodaHotelInfo[],
  names: string[],
): string | undefined {
  const normalizedNames = names.map((name) => name.trim().toLowerCase());

  const item = infos.find((info) => {
    const propertyName = (info.propertyName ?? "").trim().toLowerCase();

    const translatedName = (info.propertyTranslatedName ?? "")
      .trim()
      .toLowerCase();

    return (
      normalizedNames.includes(propertyName) ||
      normalizedNames.includes(translatedName)
    );
  });

  return item?.propertyDetails?.trim() || undefined;
}

export async function buildAgodaHotel(context: {
  hotel: AgodaHotelInformation;

  cityName: string;

  cityTranslated?: string;

  cityId?: string;

  description?: AgodaHotelDescription;

  address?: AgodaHotelAddress;
}): Promise<AgodaHotelFetchResult> {
  const hotelId = context.hotel.hotelId;

  /*
   * Feed 7 / Feed 10 / Feed 19
   *
   * Feed 19에는 대부분의 핵심 정보가
   * 포함되지만, Feed 10의 운영정보도
   * 별도로 가져온다.
   */
  const [pictureResponse, infoResponse, fullInformation] = await Promise.all([
    fetchAgodaHotelPictures(hotelId),

    fetchAgodaHotelInfo(hotelId),

    fetchAgodaFullHotelInformation(hotelId),
  ]);

  const pictures = pictureResponse.pictureFeed?.pictures?.picture ?? [];

  const infos = infoResponse.hotelInfoFeed?.hotelInfos?.hotelInfo ?? [];

  const fullHotel = fullInformation.hotel;

  const fullAddress = fullInformation.address;

  const fullDescription = fullInformation.description;

  const facilities = normalizeFacilities(fullInformation.facilities);

  const rooms = normalizeRooms(fullInformation.rooms);

  /*
   * Feed 19 사진을 우선 사용한다.
   * Feed 19에 사진이 없다면 Feed 7 사용.
   */
  const fullPictures = normalizeFullPictures(
    fullInformation.pictures,
    hotelId,
    context.hotel.translatedName || context.hotel.hotelName,
  );

  const mergedPictures =
    fullPictures.length > 0
      ? fullPictures
      : pictures.map((picture, index) => ({
          id: `agoda-${hotelId}-${picture.pictureId}`,

          src: picture.URL,

          alt:
            picture.captionTranslated ||
            picture.caption ||
            `${context.hotel.hotelName} 호텔 이미지`,

          source: "agoda" as const,

          type: index === 0 ? ("hero" as const) : ("gallery" as const),

          hotelId,

          credit: "Agoda",

          sourceUrl: context.hotel.hotelUrl,

          rightsConfirmed: false,
        }));

  const checkIn = getInfoValue(infos, [
    "check-in from",
    "check-in time",
    "체크인 시작",
  ]);

  const checkInUntil = getInfoValue(infos, ["check-in until"]);

  const checkOut = getInfoValue(infos, [
    "check-out until",
    "check-out time",
    "체크아웃 시간",
  ]);

  const normalizedHotel = normalizeAgodaHotel({
    hotel: {
      ...context.hotel,

      ...(fullHotel
        ? {
            hotelName: fullHotel.hotelName || context.hotel.hotelName,

            translatedName:
              fullHotel.translatedName || context.hotel.translatedName,

            starRating: fullHotel.starRating ?? context.hotel.starRating,

            ratingAverage:
              fullHotel.ratingAverage ?? context.hotel.ratingAverage,

            numberOfReviews:
              fullHotel.numberOfReviews ?? context.hotel.numberOfReviews,

            accommodationType:
              fullHotel.accommodationType ?? context.hotel.accommodationType,

            latitude: fullHotel.latitude ?? context.hotel.latitude,

            longitude: fullHotel.longitude ?? context.hotel.longitude,

            hotelUrl: fullHotel.hotelUrl ?? context.hotel.hotelUrl,
          }
        : {}),
    },

    pictures: pictures,

    cityName: context.cityName,

    cityTranslated: context.cityTranslated,

    cityId: context.cityId,

    description:
      fullDescription?.overview ??
      fullDescription?.snippet ??
      context.description?.overview ??
      context.description?.snippet,

    address: fullAddress ?? context.address,

    checkIn: checkInUntil
      ? `${checkIn ?? ""}${checkIn ? " - " : ""}${checkInUntil}`
      : checkIn,

    checkOut,
  });

  /*
   * Feed 19에서 가져온 데이터를
   * 최종 Hotel 모델에 병합한다.
   */
  normalizedHotel.images = mergedPictures;

  normalizedHotel.rooms = rooms;

  normalizedHotel.facilities = facilities;

  normalizedHotel.description =
    fullDescription?.overview ??
    fullDescription?.snippet ??
    normalizedHotel.description;

  normalizedHotel.accommodationType =
    fullHotel?.accommodationType ?? context.hotel.accommodationType;

  normalizedHotel.starRating =
    fullHotel?.starRating ?? context.hotel.starRating;

  normalizedHotel.ratingAverage =
    fullHotel?.ratingAverage ?? context.hotel.ratingAverage;

  normalizedHotel.numberOfReviews =
    fullHotel?.numberOfReviews ?? context.hotel.numberOfReviews;

  return {
    hotel: normalizedHotel,

    pictures,

    infos,
  };
}

export async function loadCityContent(cityId: string): Promise<{
  descriptions: Map<string, AgodaHotelDescription>;

  addresses: Map<string, AgodaHotelAddress>;
}> {
  const [descriptionResponse, addressResponse] = await Promise.all([
    fetchAgodaHotelDescriptionsByCity(cityId),

    fetchAgodaHotelAddressesByCity(cityId),
  ]);

  const descriptions =
    descriptionResponse.hotelDescriptionFeed?.hotelDescriptions
      ?.hotelDescription ?? [];

  const addresses =
    addressResponse.hotelAddressFeed?.hotelAddresses?.hotelAddress ?? [];

  return {
    descriptions: new Map(descriptions.map((item) => [item.hotelId, item])),

    addresses: new Map(addresses.map((item) => [item.hotelId, item])),
  };
}
