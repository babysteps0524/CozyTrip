import type { Post } from "../types";

interface ClientPostFile {
  posts?: Post[];
}

export type DestinationSlug =
  | "tokyo"
  | "osaka"
  | "kyoto"
  | "fukuoka"
  | "sapporo"
  | "okinawa";

const destinationLoaders: Record<
  DestinationSlug,
  () => Promise<ClientPostFile>
> = {
  tokyo: async () =>
    (await import("./generated/client-posts/tokyo.json")) as unknown as ClientPostFile,
  osaka: async () =>
    (await import("./generated/client-posts/osaka.json")) as unknown as ClientPostFile,
  kyoto: async () =>
    (await import("./generated/client-posts/kyoto.json")) as unknown as ClientPostFile,
  fukuoka: async () =>
    (await import("./generated/client-posts/fukuoka.json")) as unknown as ClientPostFile,
  sapporo: async () =>
    (await import("./generated/client-posts/sapporo.json")) as unknown as ClientPostFile,
  okinawa: async () =>
    (await import("./generated/client-posts/okinawa.json")) as unknown as ClientPostFile,
};

export async function loadClientPostsByDestination(
  destinationSlug: string,
): Promise<Post[]> {
  const loader =
    destinationLoaders[destinationSlug as DestinationSlug];

  if (!loader) return [];

  const data = await loader();
  return Array.isArray(data.posts) ? data.posts : [];
}

export async function loadClientGuidePosts(): Promise<Post[]> {
  const data = await import("./generated/client-posts/guides.json");
  return Array.isArray(data.posts) ? data.posts : [];
}
