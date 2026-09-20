import type {
  Hotel,
  HotelImage,
  HotelPost,
  Post,
  PostBlock,
} from "../types";

function getUsableImages(hotel: Hotel): HotelImage[] {
  return hotel.images.filter(
    (image) => image.rightsConfirmed && Boolean(image.src.trim()),
  );
}

function getExplicitImageIds(
  section: HotelPost["sections"][number],
): string[] {
  if (section.imageAssignments && section.imageAssignments.length > 0) {
    return section.imageAssignments.map((assignment) => assignment.imageId);
  }

  return section.imageIds ?? [];
}

export function hotelPostToPost(
  hotelPost: HotelPost,
  hotel: Hotel,
): Post {
  const usableImages = getUsableImages(hotel);
  const imagesById = new Map(
    usableImages.map((image) => [image.id, image]),
  );
  const usedImageIds = new Set<string>();
  const blocks: PostBlock[] = [];

  const introduction = hotelPost.introduction.trim();

  if (introduction) {
    blocks.push({
      type: "paragraph",
      text: introduction,
    });
  }

  for (const section of hotelPost.sections) {
    const heading = section.heading.trim();

    if (heading) {
      blocks.push({
        type: "heading",
        level: 2,
        text: heading,
      });
    }

    const explicitImageIds = getExplicitImageIds(section);
    const sectionImages: HotelImage[] = [];

    for (const imageId of explicitImageIds) {
      if (usedImageIds.has(imageId)) continue;

      const image = imagesById.get(imageId);
      if (!image) continue;

      usedImageIds.add(imageId);
      sectionImages.push(image);
    }

    const paragraphs = section.paragraphs
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);

    for (let paragraphIndex = 0; paragraphIndex < paragraphs.length; paragraphIndex += 1) {
      blocks.push({
        type: "paragraph",
        text: paragraphs[paragraphIndex],
      });

      if (paragraphIndex === 0) {
        for (const image of sectionImages) {
          blocks.push({
            type: "image",
            image,
          });
        }
      }
    }

    if (paragraphs.length === 0) {
      for (const image of sectionImages) {
        blocks.push({
          type: "image",
          image,
        });
      }
    }
  }

  return {
    id: hotelPost.id,
    category: "hotel",
    title: hotelPost.title,
    slug: hotelPost.slug,
    description: hotelPost.description,
    destinationId: hotel.destinationId,
    hotelId: hotel.id,
    blocks,
    publishedAt:
      hotelPost.publishedAt ??
      hotel.updatedAt ??
      hotel.publishedAt ??
      new Date().toISOString(),
    updatedAt: hotelPost.updatedAt ?? hotel.updatedAt,
    tags: hotelPost.tags,
    introduction: hotelPost.introduction,
    faq: hotelPost.faq,
  };
}
