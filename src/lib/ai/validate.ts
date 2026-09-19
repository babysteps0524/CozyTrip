import type { Hotel, HotelPost } from "../../types";

export interface HotelPostValidationOptions {
  availableImages?: Hotel["images"];
}

function normalize(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase("ko-KR");
}

function assertNonEmpty(value: string, field: string): void {
  if (!value.trim()) {
    throw new Error(`${field} cannot be empty.`);
  }
}

function assertUnique(values: string[], field: string): void {
  const normalized = values.map(normalize);
  if (new Set(normalized).size !== normalized.length) {
    throw new Error(`${field} contains duplicate values.`);
  }
}

export function validateHotelPost(
  post: HotelPost,
  hotel: Hotel,
  options: HotelPostValidationOptions = {},
): HotelPost {
  try {
    if (post.hotelId !== hotel.id) {
      throw new Error("hotelId does not match the source hotel.");
    }

    assertNonEmpty(post.id, "id");
    assertNonEmpty(post.title, "title");
    assertNonEmpty(post.slug, "slug");
    assertNonEmpty(post.description, "description");
    assertNonEmpty(post.introduction, "introduction");

    if (post.sections.length < 4 || post.sections.length > 6) {
      throw new Error("sections must contain 4-6 items.");
    }

    if (post.faq.length < 3 || post.faq.length > 5) {
      throw new Error("faq must contain 3-5 items.");
    }

    if (post.tags.length < 5 || post.tags.length > 8) {
      throw new Error("tags must contain 5-8 items.");
    }

    assertUnique(post.tags, "tags");
    assertUnique(
      post.sections.map((section) => section.heading),
      "section headings",
    );
    assertUnique(
      post.faq.map((item) => item.question),
      "FAQ questions",
    );

    const images = options.availableImages ?? hotel.images;
    const imageMap = new Map(images.map((image) => [image.id, image]));

    // imageIds는 본문 전체에서 사용할 이미지 후보 목록이고,
    // section.imageIds는 실제 배치 위치를 지정한다.
    // 따라서 같은 이미지가 두 배열에 모두 등장하는 것은 정상이다.
    const postImageIds = new Set<string>();

    for (const imageId of post.imageIds) {
      const image = imageMap.get(imageId);

      if (!image) {
        throw new Error(`Unknown post image ID: ${imageId}`);
      }

      if (!image.rightsConfirmed) {
        throw new Error(`Post references an image without confirmed rights: ${imageId}`);
      }

      if (postImageIds.has(imageId)) {
        throw new Error(`Post imageIds contains duplicate values: ${imageId}`);
      }

      postImageIds.add(imageId);
    }

    const sectionImageIds = new Set<string>();

    for (let index = 0; index < post.sections.length; index += 1) {
      const section = post.sections[index];

      if (!section.heading.trim()) {
        throw new Error(`Section ${index + 1} heading cannot be empty.`);
      }

      if (section.paragraphs.length === 0) {
        throw new Error(`Section ${index + 1} must contain a paragraph.`);
      }

      for (const paragraph of section.paragraphs) {
        if (!paragraph.trim()) {
          throw new Error(`Section ${index + 1} contains an empty paragraph.`);
        }
      }

      for (const imageId of section.imageIds ?? []) {
        const image = imageMap.get(imageId);

        if (!image) {
          throw new Error(`Unknown section image ID: ${imageId}`);
        }

        if (!image.rightsConfirmed) {
          throw new Error(
            `Section references an image without confirmed rights: ${imageId}`,
          );
        }

        if (sectionImageIds.has(imageId)) {
          throw new Error(`Image is referenced by more than one section: ${imageId}`);
        }

        sectionImageIds.add(imageId);
      }
    }

    for (const item of post.faq) {
      assertNonEmpty(item.question, "FAQ question");
      assertNonEmpty(item.answer, "FAQ answer");
    }

    return post;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid HotelPost.";
    throw new Error(`HotelPost validation failed: ${message}`);
  }
}
