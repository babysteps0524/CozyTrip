import type { HotelPost, Post } from "../types";
import { hotelPostToPost } from "../lib/post/hotelPostToPost";
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

  try {
    const data = await loader();
    return Array.isArray(data.posts) ? data.posts : [];
  } catch (error) {
    try {
      const [hotelsFile, postsFile] = await Promise.all([
        import("./generated/myrealtrip-hotels.json"),
        import("./generated/hotel-posts.generated.json"),
      ]);
      const hotels = Array.isArray(hotelsFile.hotels)
        ? (hotelsFile.hotels as import("../types").Hotel[])
        : [];
      const posts = Array.isArray(postsFile.posts)
        ? (postsFile.posts as HotelPost[])
        : [];
      const hotelsById = new Map(hotels.map((hotel) => [hotel.id, hotel]));

      console.warn(
        `Client post chunk is unavailable for ${destinationSlug}; using source post data fallback.`,
        error,
      );

      return posts.flatMap((post) => {
        const hotel = hotelsById.get(post.hotelId);
        if (!hotel || hotel.destinationId !== `japan-${destinationSlug}`) {
          return [];
        }
        return [hotelPostToPost(post, hotel)];
      });
    } catch (fallbackError) {
      console.warn(
        `Client post fallback is unavailable for ${destinationSlug}.`,
        fallbackError,
      );
      return [];
    }
  }
}

export async function loadClientGuidePosts(): Promise<Post[]> {
  try {
    const data = await import("./generated/client-posts/guides.json");
    return Array.isArray(data.posts) ? data.posts : [];
  } catch (error) {
    console.warn("Client guide chunk is unavailable.", error);
    return [];
  }
}
