import { fetchAgodaHotelFullInformation } from "./client";

import type {
  AgodaFullAddress,
  AgodaFullDescription,
  AgodaFullFacility,
  AgodaFullHotel,
  AgodaFullPicture,
  AgodaFullRoomType,
} from "./types";

export interface AgodaFullHotelResult {
  hotel?: AgodaFullHotel;

  address?: AgodaFullAddress;

  description?: AgodaFullDescription;

  facilities: AgodaFullFacility[];

  pictures: AgodaFullPicture[];

  rooms: AgodaFullRoomType[];
}

export async function fetchAgodaFullHotelInformation(
  hotelId: string,
): Promise<AgodaFullHotelResult> {
  const response = await fetchAgodaHotelFullInformation(hotelId);

  const feed = response.hotelFullFeed;

  const hotel = feed?.hotels?.hotel?.find((item) => item.hotelId === hotelId);

  const address = feed?.addresses?.address?.find(
    (item) => item.hotelId === hotelId,
  );

  const description = feed?.descriptions?.description?.find(
    (item) => item.hotelId === hotelId,
  );

  const facilities =
    feed?.facilities?.facility?.filter((item) => item.hotelId === hotelId) ??
    [];

  const pictures =
    feed?.pictures?.picture?.filter((item) => item.hotelId === hotelId) ?? [];

  const rooms =
    feed?.roomtypes?.roomtype?.filter((item) => item.hotelId === hotelId) ?? [];

  return {
    hotel,

    address,

    description,

    facilities,

    pictures,

    rooms,
  };
}
