import type { Hotel, HotelImage, HotelPost, Post, PostBlock } from "../../types";

function toImageMap(images: HotelImage[]): Map<string, HotelImage> {
  return new Map(images.map((image) => [image.id, image]));
}

function isUsableImage(image: HotelImage | undefined): image is HotelImage {
  return Boolean(image?.src && image.rightsConfirmed);
}

function addImage(
  blocks: PostBlock[],
  imageId: string | undefined,
  imageMap: Map<string, HotelImage>,
  usedImageIds: Set<string>,
): boolean {
  if (!imageId || usedImageIds.has(imageId)) return false;

  const image = imageMap.get(imageId);

  if (!isUsableImage(image)) return false;

  blocks.push({ type: "image", image });
  usedImageIds.add(imageId);
  return true;
}

function addGallery(
  blocks: PostBlock[],
  imageIds: string[],
  imageMap: Map<string, HotelImage>,
  usedImageIds: Set<string>,
): void {
  const images = imageIds
    .filter((imageId) => !usedImageIds.has(imageId))
    .map((imageId) => imageMap.get(imageId))
    .filter(isUsableImage);

  if (images.length < 2) {
    for (const image of images) {
      addImage(blocks, image.id, imageMap, usedImageIds);
    }
    return;
  }

  blocks.push({ type: "gallery", images });

  for (const image of images) {
    usedImageIds.add(image.id);
  }
}

function getHeroImageId(
  post: HotelPost,
  images: HotelImage[],
): string | undefined {
  const imageMap = toImageMap(images);
  const heroId = images.find((image) => image.type === "hero")?.id;

  if (heroId && isUsableImage(imageMap.get(heroId))) {
    return heroId;
  }

  return post.imageIds.find((id) => isUsableImage(imageMap.get(id)));
}

function getFallbackImageIds(
  images: HotelImage[],
  usedImageIds: Set<string>,
): string[] {
  const preferredTypes = [
    "gallery",
    "room",
    "facility",
    "restaurant",
    "location",
    "attraction",
  ];

  const result: string[] = [];

  for (const type of preferredTypes) {
    for (const image of images) {
      if (
        image.type === type &&
        isUsableImage(image) &&
        !usedImageIds.has(image.id) &&
        !result.includes(image.id)
      ) {
        result.push(image.id);
      }
    }
  }

  return result;
}

function getSectionImageIds(
  post: HotelPost,
  images: HotelImage[],
  usedImageIds: Set<string>,
): string[][] {
  const imageMap = toImageMap(images);
  const fallbackIds = getFallbackImageIds(images, usedImageIds);
  let fallbackIndex = 0;

  return post.sections.map((section) => {
    const requested = (section.imageIds ?? []).filter((id) => {
      return isUsableImage(imageMap.get(id)) && !usedImageIds.has(id);
    });

    if (requested.length > 0) {
      return requested;
    }

    while (
      fallbackIndex < fallbackIds.length &&
      usedImageIds.has(fallbackIds[fallbackIndex])
    ) {
      fallbackIndex += 1;
    }

    if (fallbackIndex >= fallbackIds.length) {
      return [];
    }

    const fallbackId = fallbackIds[fallbackIndex];
    fallbackIndex += 1;
    return [fallbackId];
  });
}

function getRemainingPostImageIds(
  post: HotelPost,
  imageMap: Map<string, HotelImage>,
  usedImageIds: Set<string>,
): string[] {
  return post.imageIds.filter((imageId) => {
    return isUsableImage(imageMap.get(imageId)) && !usedImageIds.has(imageId);
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

  const sectionImageIds = getSectionImageIds(post, images, usedImageIds);

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

    const requestedImages = sectionImageIds[index];

    if (requestedImages.length > 1) {
      addGallery(blocks, requestedImages, imageMap, usedImageIds);
    } else {
      addImage(blocks, requestedImages[0], imageMap, usedImageIds);
    }
  }

  const remainingPostImages = getRemainingPostImageIds(
    post,
    imageMap,
    usedImageIds,
  );

  if (remainingPostImages.length > 1) {
    addGallery(blocks, remainingPostImages, imageMap, usedImageIds);
  } else {
    addImage(blocks, remainingPostImages[0], imageMap, usedImageIds);
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
