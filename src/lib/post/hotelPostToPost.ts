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

    const explicitImages = (sectionImageIds[index] ?? []).filter(
      (imageId) => {
        const image = imageMap.get(imageId);
        return isUsableImage(image) && !usedImageIds.has(imageId);
      },
    );

    let requestedImages = explicitImages;

    // AI가 이미지 ID를 기록했더라도 렌더링 시점에 이미 사용되었거나
    // 사용할 수 없는 이미지라면, 해당 섹션의 이미지가 사라지지 않도록
    // 사용 가능한 이미지로 다시 채운다.
    if (requestedImages.length === 0) {
      const fallbackImageIds =
        index === 0 && heroImageId && !usedImageIds.has(heroImageId)
          ? [heroImageId]
          : post.imageIds
              .filter((imageId) => {
                const image = imageMap.get(imageId);
                return (
                  isUsableImage(image) &&
                  !usedImageIds.has(imageId) &&
                  (index === 0 || image.type !== "hero")
                );
              })
              .slice(0, 1);

      requestedImages = fallbackImageIds;
    }

    // 섹션 제목 바로 다음에 이미지를 배치해, 본문 시작 전에 시각적으로
    // 해당 섹션의 내용을 보여준다. 이후 첫 문단부터 본문을 이어간다.
    if (requestedImages.length > 1) {
      addGallery(blocks, requestedImages, imageMap, usedImageIds);
    } else {
      addImage(blocks, requestedImages[0], imageMap, usedImageIds);
    }

    for (const paragraph of section.paragraphs) {
      if (!paragraph.trim()) continue;

      blocks.push({
        type: "paragraph",
        text: paragraph.trim(),
      });
    }
  }

  // 최종 안전장치: 각 섹션에서 이미지가 선택되었다면 반드시
  // 해당 섹션 heading 바로 다음에 오도록 블록 순서를 정규화한다.
  // 이 단계는 향후 이미지 선택 로직이 변경되어도 렌더링 검증 조건을 보장한다.
  const normalizedBlocks: PostBlock[] = [];

  for (let index = 0; index < blocks.length; ) {
    const block = blocks[index];

    if (block.type !== "heading") {
      normalizedBlocks.push(block);
      index += 1;
      continue;
    }

    normalizedBlocks.push(block);
    index += 1;

    const sectionBlocks: PostBlock[] = [];
    while (index < blocks.length && blocks[index].type !== "heading") {
      sectionBlocks.push(blocks[index]);
      index += 1;
    }

    const firstImageIndex = sectionBlocks.findIndex(
      (sectionBlock) =>
        sectionBlock.type === "image" || sectionBlock.type === "gallery",
    );

    if (firstImageIndex > 0) {
      const [imageBlock] = sectionBlocks.splice(firstImageIndex, 1);
      if (imageBlock) sectionBlocks.unshift(imageBlock);
    }

    normalizedBlocks.push(...sectionBlocks);
  }

  blocks.length = 0;
  blocks.push(...normalizedBlocks);

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
  if (post.status !== "published") {
    throw new Error(`Cannot convert unpublished hotel post: ${post.id}`);
  }

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
