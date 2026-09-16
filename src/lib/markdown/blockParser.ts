import type {
  HotelImage,
  PostBlock,
  PostHeadingBlock,
  PostImageBlock,
  PostParagraphBlock,
} from "../../types";

import { resolveImage } from "../images";

function parseImage(line: string): PostImageBlock | null {
  const match = line.match(/^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)$/);

  if (!match) {
    return null;
  }

  const alt = match[1].trim();
  const imageId = match[2].trim();

  const image = resolveImage(imageId);

  if (!image) {
    return createMissingImageBlock(imageId, alt);
  }

  return {
    type: "image",
    image,
  };
}

function createMissingImageBlock(imageId: string, alt: string): PostImageBlock {
  const image: HotelImage = {
    id: imageId,
    src: "",
    alt,
    width: 1200,
    height: 800,
    source: "licensed",
    type: "gallery",
    rightsConfirmed: false,
  };

  return {
    type: "image",
    image,
  };
}

function createHeading(line: string): PostHeadingBlock | null {
  const match = line.match(/^(#{2,3})\s+(.+?)\s*$/);

  if (!match) {
    return null;
  }

  const level = match[1].length as 2 | 3;

  return {
    type: "heading",
    level,
    text: match[2].trim(),
  };
}

function createParagraph(lines: string[]): PostParagraphBlock | null {
  const text = lines.join(" ").replace(/\s+/g, " ").trim();

  if (!text) {
    return null;
  }

  return {
    type: "paragraph",
    text,
  };
}

function isSpecialBlock(line: string): boolean {
  return /^#{2,3}\s+/.test(line) || /^!\[[^\]]*\]\([^)]+\)$/.test(line);
}

export function parsePostBlocks(content: string): PostBlock[] {
  const normalized = content.replace(/\r\n/g, "\n");

  const lines = normalized.split("\n");

  const blocks: PostBlock[] = [];

  let paragraphLines: string[] = [];

  const flushParagraph = () => {
    const paragraph = createParagraph(paragraphLines);

    if (paragraph) {
      blocks.push(paragraph);
    }

    paragraphLines = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      continue;
    }

    const heading = createHeading(line);

    if (heading) {
      flushParagraph();
      blocks.push(heading);
      continue;
    }

    const image = parseImage(line);

    if (image) {
      flushParagraph();
      blocks.push(image);
      continue;
    }

    if (isSpecialBlock(line)) {
      flushParagraph();
      continue;
    }

    paragraphLines.push(line);
  }

  flushParagraph();

  return blocks;
}
