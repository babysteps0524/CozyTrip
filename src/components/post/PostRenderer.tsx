import type { Post } from "../../types";

import { Image } from "../common";

function createHeadingId(text: string, index: number): string {
  const slug = text
    .normalize("NFKD")
    .toLowerCase()
    .trim()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

  return `post-heading-${slug || "section"}-${index}`;
}

interface PostRendererProps {
  post: Post;
}

export default function PostRenderer({ post }: PostRendererProps) {
  return (
    <article max-w="3xl" text="base sm:lg ct-text dark:ct-dark-text">
      {post.blocks.map((block, index) => {
        if (block.type === "heading") {
          const headingId = createHeadingId(block.text, index);

          if (block.level === 2) {
            return (
              <h2
                key={index}
                id={headingId}
                mt={index === 0 ? "0" : "12"}
                mb="0"
                text="2xl sm:3xl"
                font="bold"
                tracking="tight"
                leading="tight"
                scroll-mt="24"
              >
                {block.text}
              </h2>
            );
          }

          return (
            <h3
              key={index}
              id={headingId}
              mt="8"
              mb="0"
              text="xl sm:2xl"
              font="bold"
              tracking="tight"
              leading="tight"
              scroll-mt="24"
            >
              {block.text}
            </h3>
          );
        }

        if (block.type === "paragraph") {
          return (
            <p
              key={index}
              mt="5"
              mb="0"
              text="base sm:lg ct-text-soft dark:ct-dark-text-soft"
              leading="relaxed"
            >
              {block.text}
            </p>
          );
        }

        if (block.type === "image") {
          const image = block.image;

          if (!image.src || !image.rightsConfirmed) {
            return null;
          }

          return (
            <figure key={index} mt="8" mb="0" overflow="hidden" rounded="xl">
              <Image
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                image={image}
                aspectRatio={`${image.width}/${image.height}`}
              />

              {image.credit && (
                <figcaption mt="2" text="xs ct-muted dark:ct-dark-muted">
                  {image.credit}
                </figcaption>
              )}
            </figure>
          );
        }

        if (block.type === "gallery") {
          const images = block.images.filter(
            (image) => image.src && image.rightsConfirmed,
          );

          if (images.length === 0) {
            return null;
          }

          return (
            <figure key={index} mt="8" mb="0">
              <div grid="~ cols-2" gap="2">
                {images.map((image) => (
                  <Image
                    key={image.id}
                    src={image.src}
                    alt={image.alt}
                    width={image.width}
                    height={image.height}
                    image={image}
                    aspectRatio={`${image.width}/${image.height}`}
                  />
                ))}
              </div>

              {block.caption && (
                <figcaption mt="2" text="xs ct-muted dark:ct-dark-muted">
                  {block.caption}
                </figcaption>
              )}
            </figure>
          );
        }

        return null;
      })}
    </article>
  );
}
