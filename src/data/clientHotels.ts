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
  tokyo: () => import("./generated/client-hotels/tokyo.json"),
  osaka: () => import("./generated/client-hotels/osaka.json"),
  kyoto: () => import("./generated/client-hotels/kyoto.json"),
  fukuoka: () => import("./generated/client-hotels/fukuoka.json"),
  sapporo: () => import("./generated/client-hotels/sapporo.json"),
  okinawa: () => import("./generated/client-hotels/okinawa.json"),
};

export async function loadClientHotels(
  destinationSlug: string,
): Promise<Hotel[]> {
  const loader = loaders[destinationSlug as DestinationSlug];
  if (!loader) return [];

  const data = await loader();
  return Array.isArray(data.hotels) ? data.hotels : [];
}
