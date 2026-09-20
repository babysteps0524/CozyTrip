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
  return [section.heading, ...section.paragraphs]
    .join(" ")
    .toLocaleLowerCase("ko-KR");
}

function getPreferredTypes(
  section: HotelPost["sections"][number],
): HotelImage["type"][] {
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

function assignmentFor(image: HotelImage) {
  return {
    imageId: image.id,
    imageType: image.type,
  };
}

function addImageToSection(
  section: HotelPost["sections"][number],
  image: HotelImage,
): void {
  const imageIds = new Set(section.imageIds ?? []);
  const assignments = section.imageAssignments ?? [];

  if (!imageIds.has(image.id)) {
    section.imageIds = [...(section.imageIds ?? []), image.id];
  }

  if (!assignments.some((assignment) => assignment.imageId === image.id)) {
    section.imageAssignments = [...assignments, assignmentFor(image)];
  }
}

function removeImageFromSection(
  section: HotelPost["sections"][number],
  imageId: string,
): void {
  section.imageIds = (section.imageIds ?? []).filter((id) => id !== imageId);
  section.imageAssignments = (section.imageAssignments ?? []).filter(
    (assignment) => assignment.imageId !== imageId,
  );
}

/**
 * AI가 선택한 이미지 참조를 정규화하고,
 * room/bathroom 이미지는 반드시 "객실과 숙박 정보" section으로 이동시킨다.
 */
export function ensureHotelPostImages(
  post: HotelPost,
  images: HotelImage[],
): HotelPost {
  const confirmedImages = images.filter(
    (image) => image.rightsConfirmed && image.src.trim(),
  );
  const bodyImages = confirmedImages.filter(
    (image) =>
      image.type !== "hero" && BODY_IMAGE_TYPES.includes(image.type),
  );
  const imageMap = new Map(confirmedImages.map((image) => [image.id, image]));

  const sections = post.sections.map((section) => ({
    ...section,
    imageIds: [...(section.imageIds ?? [])],
    imageAssignments: [...(section.imageAssignments ?? [])],
  }));

  // AI가 지정한 이미지를 먼저 보존하되, 잘못된/중복 ID는 제거한다.
  const usedIds = new Set<string>();
  for (const section of sections) {
    const nextIds: string[] = [];
    const nextAssignments: HotelPost["sections"][number]["imageAssignments"] = [];

    for (const imageId of [
      ...(section.imageIds ?? []),
      ...(section.imageAssignments ?? []).map((assignment) => assignment.imageId),
    ]) {
      if (usedIds.has(imageId)) continue;

      const image = imageMap.get(imageId);
      if (!image) continue;

      usedIds.add(imageId);
      nextIds.push(imageId);
      nextAssignments.push(assignmentFor(image));
    }

    section.imageIds = nextIds;
    section.imageAssignments = nextAssignments;
  }

  const lodgingSection = sections[1];

  // room/bathroom은 다른 section에 있더라도 반드시 두 번째 H2로 이동한다.
  for (const requiredType of ["room", "bathroom"] as const) {
    const requiredImage = bodyImages.find((image) => image.type === requiredType);

    if (!requiredImage) continue;

    for (const section of sections) {
      if (section !== lodgingSection) {
        removeImageFromSection(section, requiredImage.id);
      }
    }

    addImageToSection(lodgingSection, requiredImage);
    usedIds.add(requiredImage.id);
  }

  // AI가 이미지 하나도 선택하지 않았거나 추가 이미지가 남아 있으면
  // 내용과 가장 잘 맞는 section에 결정적으로 배치한다.
  for (const section of sections) {
    if ((section.imageIds ?? []).length > 0) continue;

    const preferredTypes = getPreferredTypes(section);
    const candidate = bodyImages.find(
      (image) => !usedIds.has(image.id) && preferredTypes.includes(image.type),
    );

    if (!candidate) continue;

    usedIds.add(candidate.id);
    addImageToSection(section, candidate);
  }

  // 아직 사용하지 않은 본문 이미지는 빈 section에 순서대로 배치한다.
  for (const image of bodyImages) {
    if (usedIds.has(image.id)) continue;

    const target = sections.find(
      (section) => (section.imageIds ?? []).length === 0,
    );

    if (!target) break;

    usedIds.add(image.id);
    addImageToSection(target, image);
  }

  // 본문용 이미지가 전혀 없을 때만 hero를 fallback으로 사용한다.
  if (usedIds.size === 0) {
    const hero = confirmedImages.find((image) => image.type === "hero");

    if (hero && sections.length > 0) {
      const target =
        sections.find(
          (section) =>
            section.heading.includes("호텔") ||
            section.heading.includes("기본"),
        ) ?? sections[0];

      addImageToSection(target, hero);
      usedIds.add(hero.id);
    }
  }

  return {
    ...post,
    sections,
    imageIds: [...usedIds],
  };
}
