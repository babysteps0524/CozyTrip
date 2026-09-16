import type {
  MarkdownDocument,
  MarkdownFrontmatter,
} from "../../types/markdown";

function parseValue(value: string): string | string[] | undefined {
  const trimmed = value.trim();

  if (trimmed === "") {
    return undefined;
  }

  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    const inner = trimmed.slice(1, -1);

    return inner
      .split(",")
      .map((item) => item.trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean);
  }

  return trimmed.replace(/^["']|["']$/g, "");
}

function parseFrontmatter(source: string): {
  frontmatter: MarkdownFrontmatter;
  content: string;
} {
  const normalized = source.replace(/\r\n/g, "\n");

  if (!normalized.startsWith("---\n")) {
    throw new Error("Markdown frontmatter가 없습니다.");
  }

  const endMarker = normalized.indexOf("\n---", 4);

  if (endMarker === -1) {
    throw new Error("Markdown frontmatter 종료 구분자가 없습니다.");
  }

  const frontmatterText = normalized.slice(4, endMarker);

  const content = normalized.slice(endMarker + 4).trim();

  const values: Record<string, string | string[] | undefined> = {};

  for (const line of frontmatterText.split("\n")) {
    const trimmed = line.trim();

    if (trimmed === "" || trimmed.startsWith("#")) {
      continue;
    }

    const separator = trimmed.indexOf(":");

    if (separator === -1) {
      continue;
    }

    const key = trimmed.slice(0, separator).trim();

    const value = trimmed.slice(separator + 1).trim();

    values[key] = parseValue(value);
  }

  const requiredFields = [
    "id",
    "category",
    "title",
    "description",
    "slug",
    "publishedAt",
  ];

  for (const field of requiredFields) {
    if (!values[field]) {
      throw new Error(`Markdown frontmatter에 필수 필드가 없습니다: ${field}`);
    }
  }

  if (values.category !== "hotel" && values.category !== "guide") {
    throw new Error(
      `잘못된 Markdown category입니다: ${String(values.category)}`,
    );
  }

  const frontmatter: MarkdownFrontmatter = {
    id: String(values.id),
    category: values.category as "hotel" | "guide",
    title: String(values.title),
    description: String(values.description),
    slug: String(values.slug),
    destinationId: values.destinationId
      ? String(values.destinationId)
      : undefined,
    hotelId: values.hotelId ? String(values.hotelId) : undefined,
    publishedAt: String(values.publishedAt),
    updatedAt: values.updatedAt ? String(values.updatedAt) : undefined,
    author: values.author ? String(values.author) : undefined,
    tags: Array.isArray(values.tags) ? values.tags.map(String) : undefined,
  };

  return {
    frontmatter,
    content,
  };
}

export function parseMarkdown(
  source: string,
  sourcePath = "",
): MarkdownDocument {
  const { frontmatter, content } = parseFrontmatter(source);

  return {
    frontmatter,
    content,
    sourcePath,
  };
}
