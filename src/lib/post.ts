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

function findImage(
  imageId: string,
  imagesById: Map<string, HotelImage>,
): HotelImage | undefined {
  return imagesById.get(imageId);
}

function getSectionImageIds(section: HotelPost["sections"][number]): string[] {
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

    for (const paragraph of section.paragraphs) {
      const text = paragraph.trim();

      if (!text) continue;

      blocks.push({
        type: "paragraph",
        text,
      });
    }

    for (const imageId of getSectionImageIds(section)) {
      if (usedImageIds.has(imageId)) continue;

      const image = findImage(imageId, imagesById);

      if (!image) continue;

      usedImageIds.add(imageId);

      blocks.push({
        type: "image",
        image,
      });
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
