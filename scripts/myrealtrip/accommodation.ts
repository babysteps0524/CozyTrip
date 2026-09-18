import { fetchMyRealTrip } from "./client";

export const MYREALTRIP_ACCOMMODATION_ENDPOINTS = {
  regionAutocomplete: "/v1/products/accommodation/region-autocomplete",
  search: "/v1/products/accommodation/search",
} as const;

export interface AccommodationRegionAutocompleteRequest {
  keyword: string;
  isDomestic: boolean;
}

export interface AccommodationSearchRequest {
  regionId: number;
  checkIn: string;
  checkOut: string;
  adultCount: number;
  childCount: number;
}

export async function autocompleteAccommodationRegions(
  request: AccommodationRegionAutocompleteRequest,
): Promise<unknown> {
  return fetchMyRealTrip(MYREALTRIP_ACCOMMODATION_ENDPOINTS.regionAutocomplete, {
    method: "POST",
    body: request,
  });
}

export async function searchAccommodations(
  request: AccommodationSearchRequest,
): Promise<unknown> {
  return fetchMyRealTrip(MYREALTRIP_ACCOMMODATION_ENDPOINTS.search, {
    method: "POST",
    body: request,
  });
}
