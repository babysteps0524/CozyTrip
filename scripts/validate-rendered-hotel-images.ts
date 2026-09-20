import { posts } from "../src/data/posts";

function isImageBlock(
  block: (typeof posts)[number]["blocks"][number],
): block is Extract<
  (typeof posts)[number]["blocks"][number],
  { type: "image" | "gallery" }
> {
  return block.type === "image" || block.type === "gallery";
}

function countDisplayableImages(post: (typeof posts)[number]): number {
  return post.blocks.reduce((count, block) => {
    if (!isImageBlock(block)) return count;

    if (block.type === "image") {
      return count + Number(
        Boolean(block.image.src && block.image.rightsConfirmed),
      );
    }

    return (
      count +
      block.images.filter(
        (image) => Boolean(image.src && image.rightsConfirmed),
      ).length
    );
  }, 0);
}

function validateSectionImagePlacement(
  post: (typeof posts)[number],
): string[] {
  const failures: string[] = [];
  const blocks = post.blocks;

  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index];

    if (block.type !== "heading") continue;

    const sectionBlocks: typeof blocks = [];

    for (let next = index + 1; next < blocks.length; next += 1) {
      const nextBlock = blocks[next];
      if (nextBlock.type === "heading") break;
      sectionBlocks.push(nextBlock);
    }

    const hasDisplayableImage = sectionBlocks.some((sectionBlock) =>
      sectionBlock.type === "image"
        ? Boolean(sectionBlock.image.src && sectionBlock.image.rightsConfirmed)
        : sectionBlock.type === "gallery"
          ? sectionBlock.images.some(
              (image) => Boolean(image.src && image.rightsConfirmed),
            )
          : false,
    );

    if (!hasDisplayableImage) continue;

    const firstSectionBlock = sectionBlocks[0];

    if (
      !firstSectionBlock ||
      (firstSectionBlock.type !== "image" &&
        firstSectionBlock.type !== "gallery")
    ) {
      failures.push(
        `[${post.id}] section "${block.text}" has an article image, but the first section block is not an image.`,
      );
    }
  }

  return failures;
}

const hotelPosts = posts.filter((post) => post.category === "hotel");
const failures: string[] = [];

for (const post of hotelPosts) {
  const imageCount = countDisplayableImages(post);

  if (imageCount === 0) {
    failures.push(
      `[${post.id}] rendered hotel post has no rights-confirmed image block.`,
    );
  }

  failures.push(...validateSectionImagePlacement(post));
}

console.log("Rendered hotel image validation complete.");
console.log(`Hotel posts: ${hotelPosts.length}`);
console.log(
  `Hotel posts with displayable article images: ${hotelPosts.filter(
    (post) => countDisplayableImages(post) > 0,
  ).length}`,
);

if (failures.length > 0) {
  for (const failure of failures) console.error(failure);
  process.exit(1);
}

console.log("Rendered hotel image validation passed.");
