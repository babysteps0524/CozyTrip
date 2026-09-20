import { resolve } from "node:path";
import type { Hotel, HotelPost, HotelPostStatus } from "../src/types";

interface GeneratedHotelPostsFile {
  posts: HotelPost[];
}

interface MyRealTripHotelsFile {
  hotels: Hotel[];
}

const root = resolve(import.meta.dir, "..");
const postsPath = resolve(root, "src/data/generated/hotel-posts.generated.json");
const hotelsPath = resolve(root, "src/data/generated/myrealtrip-hotels.json");

const statusLabels: Record<HotelPostStatus, string> = {
  draft: "DRAFT",
  review: "REVIEW",
  published: "PUBLISHED",
};

function getOption(name: string): string | undefined {
  const prefix = `--${name}=`;
  const argument = process.argv.find((item) => item.startsWith(prefix));
  return argument?.slice(prefix.length).trim() || undefined;
}

function printRow(
  status: string,
  hotel: Hotel | undefined,
  post: HotelPost,
): void {
  const destination = hotel?.city ?? hotel?.prefecture ?? "-";
  console.log(
    [
      status.padEnd(9),
      destination.padEnd(8),
      post.hotelId.padEnd(28),
      post.title,
    ].join(" | "),
  );
}

async function main(): Promise<void> {
  const postsFile = JSON.parse(
    await Bun.file(postsPath).text(),
  ) as GeneratedHotelPostsFile;
  const hotelsFile = JSON.parse(
    await Bun.file(hotelsPath).text(),
  ) as MyRealTripHotelsFile;

  const hotelsById = new Map(
    hotelsFile.hotels.map((hotel) => [hotel.id, hotel]),
  );

  const requestedStatus = getOption("status") as HotelPostStatus | undefined;
  const requestedHotelId = getOption("hotel-id");

  if (
    requestedStatus &&
    !Object.prototype.hasOwnProperty.call(statusLabels, requestedStatus)
  ) {
    throw new Error(
      `Invalid status: ${requestedStatus}. Use draft, review, or published.`,
    );
  }

  const posts = postsFile.posts
    .filter((post) => !requestedStatus || post.status === requestedStatus)
    .filter((post) => !requestedHotelId || post.hotelId === requestedHotelId)
    .sort((a, b) => {
      const destinationA = hotelsById.get(a.hotelId)?.city ?? "";
      const destinationB = hotelsById.get(b.hotelId)?.city ?? "";
      return destinationA.localeCompare(destinationB, "ko") ||
        a.title.localeCompare(b.title, "ko");
    });

  const counts = {
    draft: postsFile.posts.filter((post) => post.status === "draft").length,
    review: postsFile.posts.filter((post) => post.status === "review").length,
    published: postsFile.posts.filter((post) => post.status === "published").length,
  };

  console.log("");
  console.log("CozyTrip 호텔 게시글 검수 현황");
  console.log("----------------------------------------");
  console.log(`DRAFT: ${counts.draft}`);
  console.log(`REVIEW: ${counts.review}`);
  console.log(`PUBLISHED: ${counts.published}`);
  console.log(`TOTAL: ${postsFile.posts.length}`);
  console.log("");

  if (posts.length === 0) {
    console.log("조건에 맞는 게시글이 없습니다.");
    return;
  }

  console.log("STATUS    | 지역     | HOTEL ID                    | TITLE");
  console.log("----------------------------------------");

  for (const post of posts) {
    printRow(statusLabels[post.status], hotelsById.get(post.hotelId), post);
  }

  console.log("");
  console.log("검수 대상 글은 실제 사이트에 공개되지 않습니다.");
  console.log("검수가 끝난 글은 다음 명령으로 공개할 수 있습니다:");
  console.log("bun scripts/publish-hotel-post.ts --hotel-id=<HOTEL_ID>");
}

if (import.meta.main) {
  await main();
}
