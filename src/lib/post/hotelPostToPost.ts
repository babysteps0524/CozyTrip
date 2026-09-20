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
    for (const image of images) addImage(blocks, image.id, imageMap, usedImageIds);
    return;
  }

  blocks.push({ type: "gallery", images });
  for (const image of images) usedImageIds.add(image.id);
}

function getHeroImageId(post: HotelPost, images: HotelImage[]): string | undefined {
  const imageMap = toImageMap(images);
  const heroId = images.find((image) => image.type === "hero")?.id;

  if (heroId && isUsableImage(imageMap.get(heroId))) return heroId;

  return post.imageIds.find((id) => {
    const image = imageMap.get(id);
    return isUsableImage(image) && image.type === "hero";
  });
}

function getSectionImageIds(
  post: HotelPost,
  images: HotelImage[],
): string[][] {
  const imageMap = toImageMap(images);

  return post.sections.map((section) => {
    const assignedIds = (section.imageAssignments ?? [])
      .filter((assignment) => {
        const image = imageMap.get(assignment.imageId);
        return Boolean(
          image &&
            image.type === assignment.imageType &&
            isUsableImage(image),
        );
      })
      .map((assignment) => assignment.imageId);

    if (assignedIds.length > 0) return assignedIds;

    // v5 이전 게시글과 수동 게시글의 기존 imageIds도 계속 지원한다.
    return (section.imageIds ?? []).filter((imageId) =>
      isUsableImage(imageMap.get(imageId)),
    );
  });
}

function getRemainingPostImageIds(
  post: HotelPost,
  imageMap: Map<string, HotelImage>,
  usedImageIds: Set<string>,
): string[] {
  return post.imageIds.filter((imageId) => {
    const image = imageMap.get(imageId);
    return (
      isUsableImage(image) &&
      image.type !== "hero" &&
      !usedImageIds.has(imageId)
    );
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
  const sectionImageIds = getSectionImageIds(post, images);

  for (let index = 0; index < post.sections.length; index += 1) {
    const section = post.sections[index];

    blocks.push({
      type: "heading",
      level: 2,
      text: section.heading.trim(),
    });

    const explicitImages = sectionImageIds[index] ?? [];
    const fallbackImageIds =
      explicitImages.length === 0
        ? index === 0 && heroImageId
          ? [heroImageId]
          : post.imageIds.filter((imageId) => {
              const image = imageMap.get(imageId);
              return (
                isUsableImage(image) &&
                image.type !== "hero" &&
                !usedImageIds.has(imageId)
              );
            }).slice(0, 1)
        : [];
    const requestedImages = [...explicitImages, ...fallbackImageIds];

    for (let paragraphIndex = 0; paragraphIndex < section.paragraphs.length; paragraphIndex += 1) {
      const paragraph = section.paragraphs[paragraphIndex];

      if (paragraph.trim()) {
        blocks.push({
          type: "paragraph",
          text: paragraph.trim(),
        });
      }

      // 첫 문단 바로 뒤에 해당 section과 명시적으로 연결된 이미지를 삽입한다.
      if (paragraphIndex === 0) {
        if (requestedImages.length > 1) {
          addGallery(blocks, requestedImages, imageMap, usedImageIds);
        } else {
          addImage(blocks, requestedImages[0], imageMap, usedImageIds);
        }
      }
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

  return blocks;
}

export function hotelPostToPost(post: HotelPost, hotel: Hotel): Post {
  const blocks = createHotelPostBlocks(post, hotel.images);
  const slug = hotel.slug;
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
    introduction: post.introduction,
    faq: post.faq,
  };
}
