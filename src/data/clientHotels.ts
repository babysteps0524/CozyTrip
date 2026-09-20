import type { Hotel } from "../types";
interface ClientHotelFile {
  hotels?: Hotel[];
}

interface ClientHotelModule {
  default?: ClientHotelFile;
}

export type DestinationSlug =
  | "tokyo"
  | "osaka"
  | "fukuoka"
  | "sapporo"
;

const loaders: Record<
  DestinationSlug,
  () => Promise<ClientHotelFile>
> = {
  tokyo: async () => (await import("./generated/client-hotels/tokyo.json")) as unknown as ClientHotelFile,
  osaka: async () => (await import("./generated/client-hotels/osaka.json")) as unknown as ClientHotelFile,
  fukuoka: async () => (await import("./generated/client-hotels/fukuoka.json")) as unknown as ClientHotelFile,
  sapporo: async () => (await import("./generated/client-hotels/sapporo.json")) as unknown as ClientHotelFile,
};

export async function loadClientHotels(
  destinationSlug: string,
): Promise<Hotel[]> {
  const loader = loaders[destinationSlug as DestinationSlug];
  if (!loader) return [];

  try {
    const module = (await loader()) as unknown as ClientHotelModule;
    const data = module.default ?? (module as unknown as ClientHotelFile);
    return Array.isArray(data.hotels) ? (data.hotels as Hotel[]) : [];
  } catch (error) {
    console.warn(
      `Client hotel chunk is unavailable for ${destinationSlug}.`,
      error,
    );
    return [];

  }
}
