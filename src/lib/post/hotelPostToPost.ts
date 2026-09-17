import type { Hotel, HotelImage, HotelPost, Post, PostBlock } from "../../types";

function toImageMap(images: HotelImage[]): Map<string, HotelImage> {
  return new Map(images.map((image) => [image.id, image]));
}

function addImages(
  blocks: PostBlock[],
  imageIds: string[] | undefined,
  imageMap: Map<string, HotelImage>,
  usedImageIds: Set<string>,
): void {
  for (const imageId of imageIds ?? []) {
    if (usedImageIds.has(imageId)) continue;

    const image = imageMap.get(imageId);

    if (!image || !image.rightsConfirmed) continue;

    blocks.push({ type: "image", image });
    usedImageIds.add(imageId);
  }
}

function getFallbackImageIds(
  post: HotelPost,
  images: HotelImage[],
): string[] {
  const imageMap = toImageMap(images);
  const preferredIds = [
    ...post.imageIds,
    ...images.filter((image) => image.type === "hero").map((image) => image.id),
  ];

  return preferredIds.filter((id) => {
    const image = imageMap.get(id);
    return Boolean(image?.rightsConfirmed);
  });
}

export function createHotelPostBlocks(
  post: HotelPost,
  images: HotelImage[],
): PostBlock[] {
  const imageMap = toImageMap(images);
  const blocks: PostBlock[] = [];
  const usedImageIds = new Set<string>();

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

    addImages(blocks, section.imageIds, imageMap, usedImageIds);
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

  const requestedImageCount = post.imageIds.length;

  if (requestedImageCount > 0 && usedImageIds.size === 0) {
    addImages(
      blocks,
      getFallbackImageIds(post, images),
      imageMap,
      usedImageIds,
    );
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
  const publishedAt = post.publishedAt ?? hotel.publishedAt ?? "1970-01-01";

  return {
    id: post.id,
    category: "hotel",
    title: post.title,
    slug,
    description: post.description,
    destinationId: hotel.destinationId,
    hotelId: hotel.id,
    blocks,
    publishedAt,
    updatedAt: post.updatedAt,
    author: "CozyTrip",
    tags: post.tags,
  };
}
