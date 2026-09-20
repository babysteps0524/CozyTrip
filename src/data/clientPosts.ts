import type { Post } from "../types";
interface ClientPostFile {
  posts?: Post[];
}

interface ClientPostModule {
  default?: ClientPostFile;
}

export type DestinationSlug =
  | "tokyo"
  | "osaka"
  | "fukuoka"
  | "sapporo"
;

const destinationLoaders: Record<
  DestinationSlug,
  () => Promise<ClientPostFile>
> = {
  tokyo: async () =>
    (await import("./generated/client-posts/tokyo.json")) as unknown as ClientPostFile,
  osaka: async () =>
    (await import("./generated/client-posts/osaka.json")) as unknown as ClientPostFile,
  fukuoka: async () =>
    (await import("./generated/client-posts/fukuoka.json")) as unknown as ClientPostFile,
  sapporo: async () =>
    (await import("./generated/client-posts/sapporo.json")) as unknown as ClientPostFile,
};

export async function loadClientPostsByDestination(
  destinationSlug: string,
): Promise<Post[]> {
  const loader =
    destinationLoaders[destinationSlug as DestinationSlug];

  if (!loader) return [];

  try {
    const module = (await loader()) as unknown as ClientPostModule;
    const data = module.default ?? (module as unknown as ClientPostFile);
    return Array.isArray(data.posts) ? data.posts : [];
  } catch (error) {
    console.warn(
      `Client post chunk is unavailable for ${destinationSlug}.`,
      error,
    );
    return [];
  }
}

export async function loadClientGuidePosts(): Promise<Post[]> {
  try {
    const module = await import("./generated/client-posts/guides.json");
    const data = module.default as ClientPostFile;
    return Array.isArray(data.posts) ? data.posts : [];
  } catch (error) {
    console.warn("Client guide chunk is unavailable.", error);
    return [];
  }
}
