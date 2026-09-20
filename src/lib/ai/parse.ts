import type { HotelPost, HotelPostImageAssignment, ImageType } from "../../types";
import type { AIProviderName } from "./types";
import { AIProviderError } from "./types";

const MIN_SECTIONS = 4;
const MAX_SECTIONS = 6;
const MIN_FAQ = 3;
const MAX_FAQ = 5;
const MIN_TAGS = 5;
const MAX_TAGS = 8;
const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 220;
const MAX_INTRODUCTION_LENGTH = 700;
const MAX_SECTION_HEADING_LENGTH = 100;
const MAX_PARAGRAPH_LENGTH = 1_500;
const MAX_FAQ_QUESTION_LENGTH = 200;
const MAX_FAQ_ANSWER_LENGTH = 700;
const MAX_TAG_LENGTH = 40;

const IMAGE_TYPES: ImageType[] = [
  "hero",
  "gallery",
  "room",
  "facility",
  "restaurant",
  "location",
  "attraction",
];

function extractJson(text: string): string {
  const cleaned = text.trim().replace(/^\`\`\`(?:json)?\s*/i, "").replace(/\s*\`\`\`$/i, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("AI response does not contain a JSON object.");
  return cleaned.slice(start, end + 1);
}

function isString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function cleanString(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function uniqueStrings(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const cleaned = cleanString(value);
    const key = cleaned.toLocaleLowerCase("ko-KR");
    if (!cleaned || seen.has(key)) continue;
    seen.add(key);
    result.push(cleaned);
  }
  return result;
}

function validateLength(value: string, max: number, field: string, provider: AIProviderName): string {
  const cleaned = cleanString(value);
  if (!cleaned) throw new AIProviderError(provider, `${field} cannot be empty.`);
  if (cleaned.length > max) throw new AIProviderError(provider, `${field} is too long (maximum ${max} characters).`);
  return cleaned;
}

function validateImageIds(imageIds: string[], availableImageIds: Set<string>, provider: AIProviderName, field: string): string[] {
  const uniqueIds = uniqueStrings(imageIds);
  const invalidIds = uniqueIds.filter((id) => !availableImageIds.has(id));
  if (invalidIds.length > 0) {
    throw new AIProviderError(provider, `${field} contains unknown image ID(s): ${invalidIds.join(", ")}`);
  }
  return uniqueIds;
}

function validateImageType(value: unknown, provider: AIProviderName, field: string): ImageType {
  if (typeof value !== "string" || !IMAGE_TYPES.includes(value as ImageType)) {
    throw new AIProviderError(provider, `${field} must be a valid image type.`);
  }
  return value as ImageType;
}

export function parseHotelPost(text: string, provider: AIProviderName, inputHotelId: string, availableImageIds: string[] = []): HotelPost {
  let value: unknown;
  try {
    value = JSON.parse(extractJson(text));
  } catch (error) {
    throw new AIProviderError(provider, error instanceof Error ? error.message : "Invalid JSON response.");
  }

  if (!value || typeof value !== "object") {
    throw new AIProviderError(provider, "AI response must be an object.");
  }

  const data = value as Record<string, unknown>;
  if (!isString(data.title) || !isString(data.description) || !isString(data.introduction) ||
      !Array.isArray(data.sections) || !Array.isArray(data.faq) ||
      !isStringArray(data.tags) || !isStringArray(data.imageIds)) {
    throw new AIProviderError(provider, "AI response does not match the HotelPost structure.");
  }

  if (data.sections.length < MIN_SECTIONS || data.sections.length > MAX_SECTIONS) {
    throw new AIProviderError(provider, `HotelPost must contain ${MIN_SECTIONS}-${MAX_SECTIONS} sections.`);
  }
  if (data.faq.length < MIN_FAQ || data.faq.length > MAX_FAQ) {
    throw new AIProviderError(provider, `HotelPost must contain ${MIN_FAQ}-${MAX_FAQ} FAQ items.`);
  }

  const tags = uniqueStrings(data.tags);
  if (tags.length < MIN_TAGS || tags.length > MAX_TAGS) {
    throw new AIProviderError(provider, `HotelPost must contain ${MIN_TAGS}-${MAX_TAGS} unique tags.`);
  }
  for (const tag of tags) {
    if (tag.length > MAX_TAG_LENGTH) throw new AIProviderError(provider, "A tag is too long.");
  }

  const availableIds = new Set(availableImageIds);
  const imageIds = validateImageIds(data.imageIds, availableIds, provider, "imageIds");

  const sections = data.sections.map((section, index) => {
    if (!section || typeof section !== "object") {
      throw new AIProviderError(provider, `Invalid hotel post section ${index + 1}.`);
    }

    const item = section as Record<string, unknown>;
    if (!isString(item.heading) || !isStringArray(item.paragraphs)) {
      throw new AIProviderError(provider, `Invalid hotel post section ${index + 1} fields.`);
    }
    if (item.paragraphs.length === 0) {
      throw new AIProviderError(provider, `Hotel post section ${index + 1} must contain a paragraph.`);
    }

    if (item.imageIds !== undefined && !isStringArray(item.imageIds)) {
      throw new AIProviderError(provider, "Invalid section imageIds.");
    }

    if (item.imageAssignments !== undefined && !Array.isArray(item.imageAssignments)) {
      throw new AIProviderError(provider, "Invalid section imageAssignments.");
    }

    const heading = validateLength(item.heading, MAX_SECTION_HEADING_LENGTH, `Section ${index + 1} heading`, provider);
    const paragraphs = item.paragraphs.map((paragraph, paragraphIndex) =>
      validateLength(paragraph, MAX_PARAGRAPH_LENGTH, `Section ${index + 1} paragraph ${paragraphIndex + 1}`, provider),
    );

    const legacyIds = validateImageIds(
      (item.imageIds as string[] | undefined) ?? [],
      availableIds,
      provider,
      `Section ${index + 1} imageIds`,
    );

    const assignments: HotelPostImageAssignment[] = [];
    for (const [assignmentIndex, raw] of ((item.imageAssignments as unknown[] | undefined) ?? []).entries()) {
      if (!raw || typeof raw !== "object") {
        throw new AIProviderError(provider, `Invalid section ${index + 1} image assignment ${assignmentIndex + 1}.`);
      }
      const assignment = raw as Record<string, unknown>;
      if (!isString(assignment.imageId)) {
        throw new AIProviderError(provider, `Section ${index + 1} image assignment requires imageId.`);
      }
      const imageId = validateImageIds(
        [assignment.imageId],
        availableIds,
        provider,
        `Section ${index + 1} image assignment`,
      )[0];
      const imageType = validateImageType(
        assignment.imageType,
        provider,
        `Section ${index + 1} image assignment imageType`,
      );
      if (imageType === "hero") {
        throw new AIProviderError(
          provider,
          `Section ${index + 1} cannot assign a hero image.`,
        );
      }
      assignments.push({
        imageId,
        imageType,
      });
    }

    return {
      heading,
      paragraphs,
      imageIds: legacyIds,
      imageAssignments: assignments,
    };
  });

  const assignedImageIds = new Set<string>();
  for (const section of sections) {
    for (const assignment of section.imageAssignments ?? []) {
      if (assignedImageIds.has(assignment.imageId)) {
        throw new AIProviderError(provider, `Image ID is assigned to more than one section: ${assignment.imageId}`);
      }
      assignedImageIds.add(assignment.imageId);
    }
  }

  if (uniqueStrings(sections.map((section) => section.heading)).length !== sections.length) {
    throw new AIProviderError(provider, "Hotel post section headings must be unique.");
  }

  const faq = data.faq.map((item, index) => {
    if (!item || typeof item !== "object") throw new AIProviderError(provider, `Invalid FAQ item ${index + 1}.`);
    const faqItem = item as Record<string, unknown>;
    if (!isString(faqItem.question) || !isString(faqItem.answer)) {
      throw new AIProviderError(provider, `Invalid FAQ ${index + 1} fields.`);
    }
    return {
      question: validateLength(faqItem.question, MAX_FAQ_QUESTION_LENGTH, `FAQ ${index + 1} question`, provider),
      answer: validateLength(faqItem.answer, MAX_FAQ_ANSWER_LENGTH, `FAQ ${index + 1} answer`, provider),
    };
  });

  if (uniqueStrings(faq.map((item) => item.question)).length !== faq.length) {
    throw new AIProviderError(provider, "FAQ questions must be unique.");
  }

  return {
    id: `hotel-post-${inputHotelId}`,
    hotelId: inputHotelId,
    slug: "",
    title: validateLength(data.title, MAX_TITLE_LENGTH, "Title", provider),
    description: validateLength(data.description, MAX_DESCRIPTION_LENGTH, "Description", provider),
    introduction: validateLength(data.introduction, MAX_INTRODUCTION_LENGTH, "Introduction", provider),
    sections,
    faq,
    tags,
    imageIds,
    generatedBy: provider,
    promptVersion: "hotel-post-v6",
  };
}
