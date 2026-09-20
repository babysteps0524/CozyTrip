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

function getPreferredImageTypes(heading: string): HotelImage["type"][] {
  const text = heading.toLowerCase();

  if (/(객실|룸|room|숙박)/u.test(text)) {
    return ["room", "gallery", "hero"];
  }

  if (/(시설|편의|수영장|피트니스|부대시설|facility|pool)/u.test(text)) {
    return ["facility", "gallery", "hero"];
  }

  if (/(조식|레스토랑|다이닝|식사|restaurant|dining|breakfast)/u.test(text)) {
    return ["restaurant", "facility", "gallery"];
  }

  if (/(위치|교통|역|주변|location|access)/u.test(text)) {
    return ["location", "attraction", "hero"];
  }

  return ["hero", "gallery", "room", "facility", "restaurant", "location", "attraction"];
}

function selectFallbackImage(
  heading: string,
  images: HotelImage[],
  usedImageIds: Set<string>,
): HotelImage | undefined {
  const preferredTypes = getPreferredImageTypes(heading);

  for (const type of preferredTypes) {
    const image = images.find(
      (candidate) =>
        candidate.type === type && !usedImageIds.has(candidate.id),
    );

    if (image) return image;
  }

  return images.find((image) => !usedImageIds.has(image.id));
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
    let hasRenderedImage = false;

    for (const imageId of explicitImageIds) {
      if (usedImageIds.has(imageId)) continue;

      const image = imagesById.get(imageId);

      if (!image) continue;

      usedImageIds.add(imageId);
      hasRenderedImage = true;

      blocks.push({
        type: "image",
        image,
      });
    }

    if (!hasRenderedImage && heading) {
      const fallbackImage = selectFallbackImage(
        heading,
        usableImages,
        usedImageIds,
      );

      if (fallbackImage) {
        usedImageIds.add(fallbackImage.id);
        hasRenderedImage = true;

        blocks.push({
          type: "image",
          image: fallbackImage,
        });
      }
    }

    for (const paragraph of section.paragraphs) {
      const text = paragraph.trim();

      if (!text) continue;

      blocks.push({
        type: "paragraph",
        text,
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
