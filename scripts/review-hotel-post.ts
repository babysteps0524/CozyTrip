import { resolve } from "node:path";
import type { Hotel, HotelPost } from "../src/types";
import { validateHotelPost } from "../src/lib/ai/validate";

interface GeneratedHotelPostsFile {
  posts: HotelPost[];
}

interface MyRealTripHotelsFile {
  hotels: Hotel[];
}

const root = resolve(import.meta.dir, "..");
const postsPath = resolve(root, "src/data/generated/hotel-posts.generated.json");
const hotelsPath = resolve(root, "src/data/generated/myrealtrip-hotels.json");

function getOption(name: string): string | undefined {
  const prefix = `--${name}=`;
  const argument = process.argv.find((item) => item.startsWith(prefix));
  return argument?.slice(prefix.length).trim() || undefined;
}

function getBodyText(post: HotelPost): string {
  return post.sections.flatMap((section) => section.paragraphs).join(" ").trim();
}

function printPost(post: HotelPost, hotel: Hotel): void {
  const bodyText = getBodyText(post);
  const rightsImages = hotel.images.filter(
    (image) => post.imageIds.includes(image.id) && image.rightsConfirmed,
  );

  console.log("");
  console.log("============================================================");
  console.log("CozyTrip 호텔 게시글 최종 검수");
  console.log("============================================================");
  console.log(`호텔명       : ${hotel.name}`);
  console.log(`호텔 ID      : ${hotel.id}`);
  console.log(`지역         : ${hotel.city} / ${hotel.prefecture}`);
  console.log(`상태         : ${post.status}`);
  console.log(`제목         : ${post.title}`);
  console.log(`설명         : ${post.description}`);
  console.log(`본문         : ${bodyText.length.toLocaleString("ko-KR")}자`);
  console.log(`섹션         : ${post.sections.length}개`);
  console.log(`FAQ          : ${post.faq.length}개`);
  console.log(`이미지       : ${post.imageIds.length}개`);
  console.log(`권리확인 이미지: ${rightsImages.length}개`);
  console.log(`생성자       : ${post.generatedBy ?? "-"}`);
  console.log(`프롬프트     : ${post.promptVersion ?? "-"}`);
  console.log("");

  console.log("------------------------------------------------------------");
  console.log("본문");
  console.log("------------------------------------------------------------");
  console.log(post.introduction);
  console.log("");

  for (const [index, section] of post.sections.entries()) {
    console.log(`## ${index + 1}. ${section.heading}`);
    for (const paragraph of section.paragraphs) {
      console.log(paragraph);
      console.log("");
    }

    if (section.imageIds?.length) {
      console.log(`[이미지: ${section.imageIds.join(", ")}]`);
      console.log("");
    }
  }

  console.log("------------------------------------------------------------");
  console.log("FAQ");
  console.log("------------------------------------------------------------");
  for (const item of post.faq) {
    console.log(`Q. ${item.question}`);
    console.log(`A. ${item.answer}`);
    console.log("");
  }

  console.log("------------------------------------------------------------");
  console.log("이미지");
  console.log("------------------------------------------------------------");
  for (const imageId of post.imageIds) {
    const image = hotel.images.find((item) => item.id === imageId);
    console.log(`ID: ${imageId}`);
    console.log(`URL: ${image?.src ?? "NOT FOUND"}`);
    console.log(`Alt: ${image?.alt ?? "NOT FOUND"}`);
    console.log(`권리확인: ${image?.rightsConfirmed ? "YES" : "NO"}`);
    console.log(`출처: ${image?.source ?? "NOT FOUND"}`);
    console.log("");
  }
}

async function main(): Promise<void> {
  const hotelId = getOption("hotel-id");
  if (!hotelId) {
    throw new Error(
      "Usage: bun scripts/review-hotel-post.ts --hotel-id=myrealtrip-123",
    );
  }

  const postsFile = JSON.parse(
    await Bun.file(postsPath).text(),
  ) as GeneratedHotelPostsFile;
  const hotelsFile = JSON.parse(
    await Bun.file(hotelsPath).text(),
  ) as MyRealTripHotelsFile;

  const post = postsFile.posts.find((item) => item.hotelId === hotelId);
  if (!post) throw new Error(`Hotel post not found: ${hotelId}`);

  const hotel = hotelsFile.hotels.find((item) => item.id === hotelId);
  if (!hotel) throw new Error(`Source hotel not found: ${hotelId}`);

  try {
    validateHotelPost(post, hotel, {
      availableImages: hotel.images.filter((image) => image.rightsConfirmed),
      strictFacts: true,
    });
    console.log("");
    console.log("VALIDATION: PASS");
  } catch (error) {
    console.error("");
    console.error("VALIDATION: FAIL");
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }

  printPost(post, hotel);

  if (post.status === "published") {
    console.log("현재 상태: 이미 published 상태입니다.");
  } else if (post.status === "review") {
    console.log("현재 상태: review");
    console.log("검수가 완료되었다면 다음 명령으로 공개할 수 있습니다:");
    console.log(`bun scripts/publish-hotel-post.ts --hotel-id=${hotelId}`);
  } else {
    console.log(`현재 상태: ${post.status}`);
    console.log("review 상태로 확인한 뒤 공개하세요.");
  }
}

if (import.meta.main) {
  await main();
}
