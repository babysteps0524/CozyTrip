import { posts } from "../src/data/posts";

function isImageBlock(
  block: (typeof posts)[number]["blocks"][number],
): block is Extract<(typeof posts)[number]["blocks"][number], { type: "image" | "gallery" }> {
  return block.type === "image" || block.type === "gallery";
}

function countDisplayableImages(post: (typeof posts)[number]): number {
  return post.blocks.reduce((count, block) => {
    if (!isImageBlock(block)) return count;

    if (block.type === "image") {
      return count + Number(Boolean(block.image.src && block.image.rightsConfirmed));
    }

    return (
      count +
      block.images.filter(
        (image) => Boolean(image.src && image.rightsConfirmed),
      ).length
    );
  }, 0);
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
}

console.log("Rendered hotel image validation complete.");
console.log(`Hotel posts: ${hotelPosts.length}`);
console.log(
  `Hotel posts with displayable article images: ${hotelPosts.length - failures.length}`,
);

if (failures.length > 0) {
  for (const failure of failures) console.error(failure);
  process.exit(1);
}

console.log("Rendered hotel image validation passed.");
