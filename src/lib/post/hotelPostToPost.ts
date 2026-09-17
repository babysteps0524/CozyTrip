import type { Hotel, HotelImage, HotelPost, Post, PostBlock } from "../../types";

function toImageMap(images: HotelImage[]): Map<string, HotelImage> {
  return new Map(images.map((image) => [image.id, image]));
}

function addImage(
  blocks: PostBlock[],
  imageId: string | undefined,
  imageMap: Map<string, HotelImage>,
  usedImageIds: Set<string>,
): boolean {
  if (!imageId || usedImageIds.has(imageId)) return false;

  const image = imageMap.get(imageId);

  if (!image || !image.src || !image.rightsConfirmed) return false;

  blocks.push({ type: "image", image });
  usedImageIds.add(imageId);
  return true;
}

function addImages(
  blocks: PostBlock[],
  imageIds: string[] | undefined,
  imageMap: Map<string, HotelImage>,
  usedImageIds: Set<string>,
): void {
  for (const imageId of imageIds ?? []) {
    addImage(blocks, imageId, imageMap, usedImageIds);
  }
}

function getHeroImageId(
  post: HotelPost,
  images: HotelImage[],
): string | undefined {
  const imageMap = toImageMap(images);
  const candidates = [
    ...post.imageIds,
    ...images.filter((image) => image.type === "hero").map((image) => image.id),
    ...images.map((image) => image.id),
  ];

  return candidates.find((id) => {
    const image = imageMap.get(id);
    return Boolean(image?.src && image.rightsConfirmed);
  });
}

function getSectionImageIds(
  post: HotelPost,
  images: HotelImage[],
): string[][] {
  const imageMap = toImageMap(images);
  const preferredByType = new Map<string, string[]>();

  for (const image of images) {
    if (!image.rightsConfirmed || !image.src) continue;
    const current = preferredByType.get(image.type) ?? [];
    current.push(image.id);
    preferredByType.set(image.type, current);
  }

  return post.sections.map((section, index) => {
    const requested = (section.imageIds ?? []).filter((id) => imageMap.has(id));
    if (requested.length > 0) return requested;

    const preferredTypes = ["gallery", "room", "facility", "restaurant", "location"];
    const preferredType = preferredTypes[index % preferredTypes.length];
    return preferredByType.get(preferredType) ?? [];
  });
}

export function createHotelPostBlocks(
  post: HotelPost,
  images: HotelImage[],
): PostBlock[] {
  const imageMap = toImageMap(images);
  const blocks: PostBlock[] = [];
  const usedImageIds = new Set<string>();

  const heroImageId = getHeroImageId(post, images);

  if (heroImageId) {
    addImage(blocks, heroImageId, imageMap, usedImageIds);
  }

  if (post.introduction.trim()) {
    blocks.push({
      type: "paragraph",
      text: post.introduction.trim(),
    });
  }

  const sectionImageIds = getSectionImageIds(post, images);

  for (let index = 0; index < post.sections.length; index += 1) {
    const section = post.sections[index];

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

    addImages(blocks, sectionImageIds[index], imageMap, usedImageIds);
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

export function hotelPostToPost(post: HotelPost, hotel: Hotel): Post {
  const blocks = createHotelPostBlocks(post, hotel.images);
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
