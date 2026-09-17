import type { Hotel, HotelImage, HotelPost, Post, PostBlock } from "../../types";

function toImageMap(images: HotelImage[]): Map<string, HotelImage> {
  return new Map(images.map((image) => [image.id, image]));
}

function addImages(
  blocks: PostBlock[],
  imageIds: string[] | undefined,
  imageMap: Map<string, HotelImage>,
): void {
  for (const imageId of imageIds ?? []) {
    const image = imageMap.get(imageId);
    if (image) {
      blocks.push({ type: "image", image });
    }
  }
}

export function createHotelPostBlocks(
  post: HotelPost,
  images: HotelImage[],
): PostBlock[] {
  const imageMap = toImageMap(images);
  const blocks: PostBlock[] = [];

  if (post.introduction.trim()) {
    blocks.push({
      type: "paragraph",
      text: post.introduction.trim(),
    });
  }

  for (const section of post.sections) {
    blocks.push({
      type: "heading",
      level: 2,
      text: section.heading.trim(),
    });

    for (const paragraph of section.paragraphs) {
      if (paragraph.trim()) {
        blocks.push({
          type: "paragraph",
          text: paragraph.trim(),
        });
      }
    }

    addImages(blocks, section.imageIds, imageMap);
  }

  if (post.faq.length > 0) {
    blocks.push({
      type: "heading",
      level: 2,
      text: "자주 묻는 질문",
    });

    for (const item of post.faq) {
      blocks.push({
        type: "heading",
        level: 3,
        text: item.question.trim(),
      });
      blocks.push({
        type: "paragraph",
        text: item.answer.trim(),
      });
    }
  }

  return blocks;
}

export function hotelPostToPost(
  post: HotelPost,
  hotel: Hotel,
): Post {
  const images = hotel.images;
  const blocks = createHotelPostBlocks(post, images);
  const slug = post.slug.trim() || hotel.slug;

  return {
    id: post.id,
    category: "hotel",
    title: post.title,
    slug,
    description: post.description,
    destinationId: hotel.destinationId,
    hotelId: hotel.id,
    blocks,
    publishedAt: post.publishedAt ?? new Date().toISOString().slice(0, 10),
    updatedAt: post.updatedAt,
    author: "CozyTrip",
    tags: post.tags,
  };
}
