import type { Hotel } from "../../types";

import generatedData from "./agoda-hotels.json";

interface AgodaGeneratedFile {
  generatedAt: string;
  source: "agoda";
  hotelCount: number;
  hotels: Hotel[];
}

const data = generatedData as AgodaGeneratedFile;

export const agodaGeneratedAt = data.generatedAt;

export const agodaHotels: Hotel[] = Array.isArray(data.hotels)
  ? data.hotels
  : [];

export function getAgodaHotels(): Hotel[] {
  return agodaHotels;
}

export function getAgodaHotelById(
  id: string,
): Hotel | undefined {
  return agodaHotels.find((hotel) => hotel.id === id);
}

export function getAgodaHotelBySlug(
  slug: string,
): Hotel | undefined {
  return agodaHotels.find((hotel) => hotel.slug === slug);
}

export function getAgodaHotelsByDestination(
  destinationId: string,
): Hotel[] {
  return agodaHotels.filter(
    (hotel) => hotel.destinationId === destinationId,
  );
}