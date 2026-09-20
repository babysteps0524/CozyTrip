import type { HotelImage, HotelPost } from "../../types";

const BODY_IMAGE_TYPES: HotelImage["type"][] = [
  "gallery",
  "room",
  "bathroom",
  "facility",
  "restaurant",
  "location",
  "attraction",
];

function getSectionText(section: HotelPost["sections"][number]): string {
  return [section.heading, ...section.paragraphs].join(" ").toLocaleLowerCase("ko-KR");
}

function getPreferredTypes(section: HotelPost["sections"][number]): HotelImage["type"][] {
  const text = getSectionText(section);

  if (text.includes("객실") || text.includes("룸") || text.includes("침실")) {
    return ["room", "gallery", "facility"];
  }

  if (text.includes("욕실") || text.includes("화장실") || text.includes("샤워")) {
    return ["bathroom", "facility", "gallery"];
  }

  if (
    text.includes("조식") ||
    text.includes("레스토랑") ||
    text.includes("다이닝") ||
    text.includes("식사")
  ) {
    return ["restaurant", "facility", "gallery"];
  }

  if (
    text.includes("시설") ||
    text.includes("편의") ||
    text.includes("라운지") ||
    text.includes("수영장") ||
    text.includes("피트니스")
  ) {
    return ["facility", "gallery"];
  }

  if (
    text.includes("위치") ||
    text.includes("주변") ||
    text.includes("교통") ||
    text.includes("역")
  ) {
    return ["location", "attraction", "gallery"];
  }

  return ["gallery", "facility", "room", "bathroom", "restaurant"];
}

function assignmentFor(image: HotelImage): {
  imageId: string;
  imageType: HotelImage["type"];
} {
  return {
    imageId: image.id,
    imageType: image.type,
  };
}

/**
 * AI가 본문 이미지를 선택하지 않았을 때 실제로 제공된
 * rightsConfirmed 이미지를 결정적으로 배치한다.
 *
 * 본문용 이미지가 있으면 hero보다 우선한다.
 * 본문용 이미지가 전혀 없을 때만 hero를 1장 fallback으로 사용한다.
 */
export function ensureHotelPostImages(
  post: HotelPost,
  images: HotelImage[],
): HotelPost {
  const confirmedImages = images.filter(
    (image) => image.rightsConfirmed && image.src.trim(),
  );

  const bodyImages = confirmedImages.filter(
    (image) => image.type !== "hero" && BODY_IMAGE_TYPES.includes(image.type),
  );

  const imageMap = new Map(confirmedImages.map((image) => [image.id, image]));

  const referencedIds = new Set<string>();
  for (const section of post.sections) {
    for (const imageId of section.imageIds ?? []) {
      if (imageMap.has(imageId)) referencedIds.add(imageId);
    }
    for (const assignment of section.imageAssignments ?? []) {
      if (imageMap.has(assignment.imageId)) referencedIds.add(assignment.imageId);
    }
  }

  if (referencedIds.size > 0) {
    return {
      ...post,
      imageIds: [...referencedIds],
      sections: post.sections.map((section) => ({
        ...section,
        imageIds: [...(section.imageIds ?? [])],
        imageAssignments: [...(section.imageAssignments ?? [])],
      })),
    };
  }

  const usedIds = new Set<string>();
  const sections = post.sections.map((section) => ({
    ...section,
    imageIds: [...(section.imageIds ?? [])],
    imageAssignments: [...(section.imageAssignments ?? [])],
  }));

  for (const section of sections) {
    const preferredTypes = getPreferredTypes(section);
    const candidate = bodyImages.find(
      (image) =>
        !usedIds.has(image.id) && preferredTypes.includes(image.type),
    );

    if (!candidate) continue;

    usedIds.add(candidate.id);
    section.imageIds = [candidate.id];
    section.imageAssignments = [assignmentFor(candidate)];
  }

  if (usedIds.size < bodyImages.length) {
    for (const section of sections) {
      if (usedIds.size >= bodyImages.length) break;
      if ((section.imageIds ?? []).length > 0) continue;

      const candidate = bodyImages.find((image) => !usedIds.has(image.id));
      if (!candidate) break;

      usedIds.add(candidate.id);
      section.imageIds = [candidate.id];
      section.imageAssignments = [assignmentFor(candidate)];
    }
  }

  if (usedIds.size === 0) {
    const hero = confirmedImages.find((image) => image.type === "hero");

    if (hero && sections.length > 0) {
      const target =
        sections.find(
          (section) =>
            section.heading.includes("호텔") ||
            section.heading.includes("기본"),
        ) ?? sections[0];

      target.imageIds = [hero.id];
      target.imageAssignments = [assignmentFor(hero)];
      usedIds.add(hero.id);
    }
  }

  return {
    ...post,
    sections,
    imageIds: [...usedIds],
  };
}
