import { getAgodaConfig } from "./config";

import type {
  AgodaCityResponse,
  AgodaHotelAddressResponse,
  AgodaHotelDescriptionResponse,
  AgodaHotelFullInformationResponse,
  AgodaHotelInfoResponse,
  AgodaHotelInformationResponse,
  AgodaHotelPictureResponse,
  AgodaHotelFacilityResponse,
  AgodaRoomTypeResponse,
} from "./types";

export interface AgodaFeedRequest {
  feedId: number;

  params?: Record<string, string | number | undefined>;
}

function buildAgodaFeedUrl(
  baseUrl: string,
  feedId: number,
  token: string,
  siteId: string,
  params: Record<string, string | number | undefined> = {},
): string {
  const url = new URL(`${baseUrl}/datafeeds/feed/getfeed`);

  url.searchParams.set("feed_id", String(feedId));

  url.searchParams.set("token", token);

  url.searchParams.set("site_id", siteId);

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") {
      continue;
    }

    url.searchParams.set(key, String(value));
  }

  return url.toString();
}

export async function fetchAgodaFeed<T>(request: AgodaFeedRequest): Promise<T> {
  const config = getAgodaConfig();

  const url = buildAgodaFeedUrl(
    config.baseUrl,
    request.feedId,
    config.token,
    config.siteId,
    request.params,
  );

  const response = await fetch(url, {
    method: "GET",

    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");

    throw new Error(
      [
        "Agoda Content API request failed.",
        `Status: ${response.status} ${response.statusText}`,
        body ? `Response: ${body.slice(0, 500)}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.toLowerCase().includes("application/json")) {
    throw new Error(
      [
        "Agoda Content API returned",
        "an unexpected content type:",
        contentType,
      ].join(" "),
    );
  }

  return response.json() as Promise<T>;
}

export async function fetchAgodaCities(
  countryId?: string,
): Promise<AgodaCityResponse> {
  return fetchAgodaFeed<AgodaCityResponse>({
    feedId: 3,

    params: {
      ocountry_id: countryId,
    },
  });
}

export async function fetchAgodaHotelsByCity(
  cityId: string,
): Promise<AgodaHotelInformationResponse> {
  return fetchAgodaFeed<AgodaHotelInformationResponse>({
    feedId: 5,

    params: {
      mcity_id: cityId,
    },
  });
}

export async function fetchAgodaHotelPictures(
  hotelId: string,
): Promise<AgodaHotelPictureResponse> {
  return fetchAgodaFeed<AgodaHotelPictureResponse>({
    feedId: 7,

    params: {
      mhotel_id: hotelId,
    },
  });
}

export async function fetchAgodaHotelFacilities(
  hotelId: string,
): Promise<AgodaHotelFacilityResponse> {
  return fetchAgodaFeed<AgodaHotelFacilityResponse>({
    feedId: 9,

    params: {
      mhotel_id: hotelId,
    },
  });
}

export async function fetchAgodaHotelRoomTypes(
  hotelId: string,
): Promise<AgodaRoomTypeResponse> {
  return fetchAgodaFeed<AgodaRoomTypeResponse>({
    feedId: 6,

    params: {
      mhotel_id: hotelId,
    },
  });
}

export async function fetchAgodaHotelInfo(
  hotelId: string,
): Promise<AgodaHotelInfoResponse> {
  return fetchAgodaFeed<AgodaHotelInfoResponse>({
    feedId: 10,

    params: {
      mhotel_id: hotelId,
    },
  });
}

export async function fetchAgodaHotelDescriptionsByCity(
  cityId: string,
): Promise<AgodaHotelDescriptionResponse> {
  return fetchAgodaFeed<AgodaHotelDescriptionResponse>({
    feedId: 17,

    params: {
      mcity_id: cityId,
    },
  });
}

export async function fetchAgodaHotelAddressesByCity(
  cityId: string,
): Promise<AgodaHotelAddressResponse> {
  return fetchAgodaFeed<AgodaHotelAddressResponse>({
    feedId: 18,

    params: {
      mcity_id: cityId,
    },
  });
}

/**
 * Agoda Feed 19
 *
 * 호텔 전체 정보를 가져온다.
 *
 * 호텔 기본정보
 * 주소
 * 설명
 * 시설
 * 사진
 * 객실
 */
export async function fetchAgodaHotelFullInformation(
  hotelId: string,
): Promise<AgodaHotelFullInformationResponse> {
  return fetchAgodaFeed<AgodaHotelFullInformationResponse>({
    feedId: 19,

    params: {
      mhotel_id: hotelId,
    },
  });
}
