import { resolve } from "node:path";
import type { Hotel, HotelPost, HotelPostStatus } from "../src/types";

interface GeneratedHotelPostsFile {
  posts: HotelPost[];
}

interface MyRealTripHotelsFile {
  hotels: Hotel[];
}

interface FailedHotelPost {
  hotelId: string;
  status: "retrying" | "retry-exhausted";
  attemptCount: number;
  reason: string;
}

interface FailedHotelPostFile {
  failures: FailedHotelPost[];
}

type InventoryStatus =
  | HotelPostStatus
  | "pending"
  | "retrying"
  | "retry-exhausted";

const root = resolve(import.meta.dir, "..");
const postsPath = resolve(root, "src/data/generated/hotel-posts.generated.json");
const hotelsPath = resolve(root, "src/data/generated/myrealtrip-hotels.json");
const failuresPath = resolve(
  root,
  "src/data/generated/hotel-post-failures.generated.json",
);

function getOption(name: string): string | undefined {
  const prefix = `--${name}=`;
  const argument = process.argv.find((item) => item.startsWith(prefix));
  return argument?.slice(prefix.length).trim() || undefined;
}

function getBodyLength(post: HotelPost): number {
  return post.sections
    .flatMap((section) => section.paragraphs)
    .join(" ")
    .trim().length;
}

function getImageSummary(post: HotelPost, hotel: Hotel | undefined): string {
  const imageIds = post.imageIds.length;
  if (!hotel) return `${imageIds}개`;

  const rightsConfirmed = hotel.images.filter(
    (image) => post.imageIds.includes(image.id) && image.rightsConfirmed,
  ).length;

  return `${imageIds}개 / 권리확인 ${rightsConfirmed}개`;
}

function printDetail(post: HotelPost, hotel: Hotel | undefined): void {
  console.log("");
  console.log("========================================");
  console.log(`호텔: ${hotel?.name ?? post.hotelId}`);
  console.log(`ID: ${post.hotelId}`);
  console.log(`상태: ${post.status}`);
  console.log(`제목: ${post.title}`);
  console.log(`지역: ${hotel?.city ?? "-"}`);
  console.log(`본문: ${getBodyLength(post).toLocaleString("ko-KR")}자`);
  console.log(`섹션: ${post.sections.length}개`);
  console.log(`FAQ: ${post.faq.length}개`);
  console.log(`이미지: ${getImageSummary(post, hotel)}`);
  console.log(`생성: ${post.generatedBy ?? "-"} / ${post.promptVersion ?? "-"}`);
  console.log(`수정: ${post.updatedAt ?? "-"}`);
  console.log("");
  console.log("섹션");
  for (const [index, section] of post.sections.entries()) {
    console.log(`  ${index + 1}. ${section.heading} (${section.paragraphs.length}문단)`);
  }
}

async function readFailures(): Promise<Map<string, FailedHotelPost>> {
  const file = Bun.file(failuresPath);
  if (!(await file.exists())) return new Map();

  const source = JSON.parse(await file.text()) as FailedHotelPostFile;
  return new Map(
    (Array.isArray(source.failures) ? source.failures : []).map((item) => [
      item.hotelId,
      item,
    ]),
  );
}

function getInventoryStatus(
  hotel: Hotel,
  post: HotelPost | undefined,
  failure: FailedHotelPost | undefined,
): InventoryStatus {
  if (post?.status) return post.status;
  if (failure?.status) return failure.status;
  return "pending";
}

async function main(): Promise<void> {
  const postsFile = JSON.parse(
    await Bun.file(postsPath).text(),
  ) as GeneratedHotelPostsFile;
  const hotelsFile = JSON.parse(
    await Bun.file(hotelsPath).text(),
  ) as MyRealTripHotelsFile;
  const failures = await readFailures();

  const posts = Array.isArray(postsFile.posts) ? postsFile.posts : [];
  const hotels = Array.isArray(hotelsFile.hotels) ? hotelsFile.hotels : [];
  const postsByHotelId = new Map(posts.map((post) => [post.hotelId, post]));

  const requestedStatus = getOption("status") as InventoryStatus | undefined;
  const requestedHotelId = getOption("hotel-id");

  const validStatuses: InventoryStatus[] = [
    "draft",
    "review",
    "published",
    "pending",
    "retrying",
    "retry-exhausted",
  ];

  if (requestedStatus && !validStatuses.includes(requestedStatus)) {
    throw new Error(
      `Invalid status: ${requestedStatus}. Use draft, review, published, pending, retrying, or retry-exhausted.`,
    );
  }

  const inventory = hotels
    .map((hotel) => ({
      hotel,
      post: postsByHotelId.get(hotel.id),
      failure: failures.get(hotel.id),
      status: getInventoryStatus(
        hotel,
        postsByHotelId.get(hotel.id),
        failures.get(hotel.id),
      ),
    }))
    .filter((item) => !requestedStatus || item.status === requestedStatus)
    .filter((item) => !requestedHotelId || item.hotel.id === requestedHotelId)
    .sort(
      (a, b) =>
        a.hotel.city.localeCompare(b.hotel.city, "ko") ||
        a.hotel.name.localeCompare(b.hotel.name, "ko"),
    );

  const counts = new Map<InventoryStatus, number>();
  for (const item of hotels.map((hotel) => ({
    status: getInventoryStatus(
      hotel,
      postsByHotelId.get(hotel.id),
      failures.get(hotel.id),
    ),
  }))) {
    counts.set(item.status, (counts.get(item.status) ?? 0) + 1);
  }

  console.log("");
  console.log("CozyTrip 호텔 게시글 검수 현황");
  console.log("========================================");
  console.log(`전체 호텔       : ${hotels.length}`);
  console.log(`PUBLISHED       : ${counts.get("published") ?? 0}`);
  console.log(`REVIEW          : ${counts.get("review") ?? 0}`);
  console.log(`DRAFT           : ${counts.get("draft") ?? 0}`);
  console.log(`PENDING         : ${counts.get("pending") ?? 0}`);
  console.log(`RETRYING        : ${counts.get("retrying") ?? 0}`);
  console.log(`RETRY-EXHAUSTED : ${counts.get("retry-exhausted") ?? 0}`);
  console.log("");

  if (inventory.length === 0) {
    console.log("조건에 맞는 호텔이 없습니다.");
    return;
  }

  console.log("STATUS           | 지역     | HOTEL ID                    | 호텔명");
  console.log("----------------------------------------");

  for (const item of inventory) {
    console.log(
      [
        item.status.padEnd(16),
        item.hotel.city.padEnd(8),
        item.hotel.id.padEnd(28),
        item.hotel.name,
      ].join(" | "),
    );
  }

  const reviewItems = inventory.filter((item) => item.status === "review");
  if (reviewItems.length > 0) {
    console.log("");
    console.log("REVIEW 상세");
    for (const item of reviewItems) {
      if (item.post) printDetail(item.post, item.hotel);
    }
  }

  const retryItems = inventory.filter(
    (item) => item.status === "retrying" || item.status === "retry-exhausted",
  );
  if (retryItems.length > 0) {
    console.log("");
    console.log("실패/재시도 상세");
    for (const item of retryItems) {
      const failure = item.failure;
      console.log(
        `- ${item.hotel.id}: ${item.status}, attempts=${failure?.attemptCount ?? 0}, reason=${failure?.reason ?? "-"}`,
      );
    }
  }

  console.log("");
  console.log("검수 글은 published 전환 전까지 공개 사이트에 포함되지 않습니다.");
  console.log("공개:");
  console.log("bun scripts/publish-hotel-post.ts --hotel-id=<HOTEL_ID>");
}

if (import.meta.main) {
  await main();
}
