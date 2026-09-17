import type { HotelPost } from "../../types";
import type { AIProviderName } from "./types";
import { AIProviderError } from "./types";

function extractJson(text: string): string {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start < 0 || end <= start) {
    throw new Error("AI response does not contain a JSON object.");
  }

  return cleaned.slice(start, end + 1);
}

function isString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === "string")
  );
}

export function parseHotelPost(
  text: string,
  provider: AIProviderName,
  inputHotelId: string,
): HotelPost {
  let value: unknown;

  try {
    value = JSON.parse(extractJson(text));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid JSON response.";
    throw new AIProviderError(provider, message);
  }

  if (!value || typeof value !== "object") {
    throw new AIProviderError(provider, "AI response must be an object.");
  }

  const data = value as Record<string, unknown>;

  if (
    !isString(data.title) ||
    !isString(data.description) ||
    !isString(data.introduction) ||
    !Array.isArray(data.sections) ||
    !Array.isArray(data.faq) ||
    !isStringArray(data.tags) ||
    !isStringArray(data.imageIds)
  ) {
    throw new AIProviderError(
      provider,
      "AI response does not match the HotelPost structure.",
    );
  }

  const sections = data.sections.map((section) => {
    if (!section || typeof section !== "object") {
      throw new AIProviderError(provider, "Invalid hotel post section.");
    }

    const item = section as Record<string, unknown>;

    if (!isString(item.heading) || !isStringArray(item.paragraphs)) {
      throw new AIProviderError(provider, "Invalid hotel post section fields.");
    }

    if (
      item.imageIds !== undefined &&
      !isStringArray(item.imageIds)
    ) {
      throw new AIProviderError(provider, "Invalid section imageIds.");
    }

    return {
      heading: item.heading,
      paragraphs: item.paragraphs,
      imageIds: item.imageIds as string[] | undefined,
    };
  });

  const faq = data.faq.map((item) => {
    if (!item || typeof item !== "object") {
      throw new AIProviderError(provider, "Invalid FAQ item.");
    }

    const faqItem = item as Record<string, unknown>;

    if (!isString(faqItem.question) || !isString(faqItem.answer)) {
      throw new AIProviderError(provider, "Invalid FAQ fields.");
    }

    return {
      question: faqItem.question,
      answer: faqItem.answer,
    };
  });

  return {
    id: `hotel-post-${inputHotelId}`,
    hotelId: inputHotelId,
    slug: "",
    title: data.title,
    description: data.description,
    introduction: data.introduction,
    sections,
    faq,
    tags: data.tags,
    imageIds: data.imageIds,
    generatedBy: provider,
    promptVersion: "hotel-post-v1",
  };
}
