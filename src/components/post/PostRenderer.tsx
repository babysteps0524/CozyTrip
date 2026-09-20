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
    <article className="max-w-3xl text-[17px] text-ct-text dark:text-ct-dark-text sm:text-lg">
      {post.blocks.map((block, index) => {
        if (block.type === "heading") {
          const headingId = createHeadingId(block.text, index);

          return block.level === 2 ? (
            <h2
              key={index}
              id={headingId}
              className="mb-0 mt-12 scroll-mt-24 text-[1.45rem] font-bold leading-[1.35] tracking-tight first:mt-0 sm:text-3xl"
            >
              {block.text}
            </h2>
          ) : (
            <h3
              key={index}
              id={headingId}
              className="mb-0 mt-9 scroll-mt-24 text-xl font-bold leading-[1.4] tracking-tight sm:text-2xl"
            >
              {block.text}
            </h3>
          );
        }

        if (block.type === "paragraph") {
          return (
            <p
              key={index}
              className="mb-0 mt-5 text-[1.0625rem] leading-[1.9] text-ct-text-soft sm:text-lg sm:leading-8 dark:text-ct-dark-text-soft"
            >
              {block.text}
            </p>
          );
        }

        if (block.type === "image") {
          const image = block.image;
          if (!image.src || !image.rightsConfirmed) return null;

          return (
            <figure key={index} className="my-9 overflow-hidden rounded-2xl border border-ct-line bg-ct-surface shadow-card dark:border-ct-dark-line dark:bg-ct-dark-surface">
              <Image
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                image={image}
                aspectRatio={`${image.width}/${image.height}`}
              />
              {image.credit && (
                <figcaption className="px-4 py-3 text-xs leading-relaxed text-ct-muted dark:text-ct-dark-muted">
                  {image.credit}
                </figcaption>
              )}
            </figure>
          );
        }

        if (block.type === "gallery") {
          const images = block.images.filter((image) => image.src && image.rightsConfirmed);
          if (images.length === 0) return null;

          return (
            <figure key={index} className="my-9">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {images.map((image) => (
                  <div key={image.id} className="overflow-hidden rounded-xl border border-ct-line bg-ct-surface dark:border-ct-dark-line dark:bg-ct-dark-surface">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      width={image.width}
                      height={image.height}
                      image={image}
                      aspectRatio={`${image.width}/${image.height}`}
                    />
                  </div>
                ))}
              </div>
              {block.caption && (
                <figcaption className="mt-2 text-xs leading-relaxed text-ct-muted dark:text-ct-dark-muted">
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
