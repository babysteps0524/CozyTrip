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
  tokyo: () => import("./generated/client-posts/tokyo.json"),
  osaka: () => import("./generated/client-posts/osaka.json"),
  kyoto: () => import("./generated/client-posts/kyoto.json"),
  fukuoka: () => import("./generated/client-posts/fukuoka.json"),
  sapporo: () => import("./generated/client-posts/sapporo.json"),
  okinawa: () => import("./generated/client-posts/okinawa.json"),
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
