import type { Hotel } from "../types";
interface ClientHotelFile {
  hotels?: Hotel[];
}

export type DestinationSlug =
  | "tokyo"
  | "osaka"
  | "kyoto"
  | "fukuoka"
  | "sapporo"
  | "okinawa";

const loaders: Record<
  DestinationSlug,
  () => Promise<ClientHotelFile>
> = {
  tokyo: async () => (await import("./generated/client-hotels/tokyo.json")) as unknown as ClientHotelFile,
  osaka: async () => (await import("./generated/client-hotels/osaka.json")) as unknown as ClientHotelFile,
  kyoto: async () => (await import("./generated/client-hotels/kyoto.json")) as unknown as ClientHotelFile,
  fukuoka: async () => (await import("./generated/client-hotels/fukuoka.json")) as unknown as ClientHotelFile,
  sapporo: async () => (await import("./generated/client-hotels/sapporo.json")) as unknown as ClientHotelFile,
  okinawa: async () => (await import("./generated/client-hotels/okinawa.json")) as unknown as ClientHotelFile,
};

export async function loadClientHotels(
  destinationSlug: string,
): Promise<Hotel[]> {
  const loader = loaders[destinationSlug as DestinationSlug];
  if (!loader) return [];

  try {
    const data = await loader();
    return Array.isArray(data.hotels) ? (data.hotels as Hotel[]) : [];
  } catch (error) {
    try {
      const source = (await import("./generated/myrealtrip-hotels.json")) as unknown as {
        hotels?: Hotel[];
      };
      const fallbackHotels = Array.isArray(source.hotels) ? source.hotels : [];

      console.warn(
        `Client hotel chunk is unavailable for ${destinationSlug}; using source hotel data fallback.`,
        error,
      );

      return fallbackHotels.filter(
        (hotel) => hotel.destinationId === `japan-${destinationSlug}`,
      );
    } catch (fallbackError) {
      console.warn(
        `Client hotel fallback is unavailable for ${destinationSlug}.`,
        fallbackError,
      );
      return []; 
    }
  }
}
