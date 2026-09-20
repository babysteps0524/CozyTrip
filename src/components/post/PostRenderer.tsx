import type { Post } from "../../types";
import { Image } from "../common";
import { AdSenseSlot } from "../ads";

const IMAGE_SOURCE_LABEL: Record<string, string> = {
  myrealtrip: "마이리얼트립",
  rakuten: "라쿠텐",
  agoda: "Agoda",
  official: "호텔 공식 사이트",
  owned: "CozyTrip 자체 제작",
  licensed: "라이선스 이미지",
};

function getImageSourceLabel(source: string): string {
  return IMAGE_SOURCE_LABEL[source] ?? source;
}

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
  midArticleAdSlot?: string;
}

export default function PostRenderer({ post, midArticleAdSlot }: PostRendererProps) {
  let firstParagraph = true;
  let headingCount = 0;

  return (
    <article className="max-w-3xl text-[17px] text-ct-text dark:text-ct-dark-text sm:text-lg">
      {post.blocks.map((block, index) => {
        if (block.type === "heading") {
          const headingId = createHeadingId(block.text, index);
          headingCount += 1;

          return block.level === 2 ? (
            <section key={index} aria-labelledby={headingId} className="scroll-mt-24">
              {headingCount === 4 && midArticleAdSlot ? (
                <AdSenseSlot slot={midArticleAdSlot} />
              ) : null}
              <h2
                id={headingId}
                className="mb-0 mt-14 border-l-4 border-ct-primary pl-4 text-[1.45rem] font-bold leading-[1.4] tracking-tight first:mt-0 sm:mt-16 sm:text-3xl"
              >
                {block.text}
              </h2>
            </section>
          ) : (
            <h3
              key={index}
              id={headingId}
              className="mb-0 mt-10 scroll-mt-24 text-xl font-bold leading-[1.45] tracking-tight sm:text-2xl"
            >
              {block.text}
            </h3>
          );
        }

        if (block.type === "paragraph") {
          const isLead = firstParagraph;
          firstParagraph = false;

          return (
            <p
              key={index}
              className={
                isLead
                  ? "mb-0 mt-5 text-[1.125rem] font-medium leading-[1.9] text-ct-text-soft sm:text-xl sm:leading-9 dark:text-ct-dark-text-soft"
                  : "mb-0 mt-5 text-[1.0625rem] leading-[1.95] text-ct-text-soft sm:text-lg sm:leading-8 dark:text-ct-dark-text-soft"
              }
            >
              {block.text}
            </p>
          );
        }

        if (block.type === "image") {
          const image = block.image;
          if (!image.src || !image.rightsConfirmed) return null;

          const imageWidth = image.width ?? 1200;
          const imageHeight = image.height ?? 800;
          const imageAspectRatio = `${imageWidth}/${imageHeight}`;

          return (
            <figure
              key={index}
              className="my-10 overflow-hidden rounded-2xl border border-ct-line bg-ct-surface shadow-card dark:border-ct-dark-line dark:bg-ct-dark-surface"
            >
              {image.sourceUrl ? (
                <a
                  href={image.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="숙소 정보 확인"
                  className="block active-scale-99"
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={imageWidth}
                    height={imageHeight}
                    image={image}
                    aspectRatio={imageAspectRatio}
                  />
                </a>
              ) : (
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  image={image}
                  aspectRatio={`${image.width}/${image.height}`}
                />
              )}
              <figcaption className="border-t border-ct-line px-4 py-3 text-xs leading-relaxed text-ct-muted dark:border-ct-dark-line dark:text-ct-dark-muted">
                <span>
                  출처: {getImageSourceLabel(image.source)}
                  {image.credit ? ` · ${image.credit}` : ""}
                </span>
                {image.sourceUrl && (
                  <a
                    href={image.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 underline underline-offset-2 hover:text-ct-text dark:hover:text-ct-dark-text"
                  >
                    원본/숙소 정보
                  </a>
                )}
              </figcaption>
            </figure>
          );
        }

        if (block.type === "gallery") {
          const images = block.images.filter(
            (image) => image.src && image.rightsConfirmed,
          );
          if (images.length === 0) return null;

          return (
            <figure key={index} className="my-10">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="overflow-hidden rounded-xl border border-ct-line bg-ct-surface dark:border-ct-dark-line dark:bg-ct-dark-surface"
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      width={image.width ?? 1200}
                      height={image.height ?? 800}
                      image={image}
                      aspectRatio={
                        image.width && image.height
                          ? `${image.width}/${image.height}`
                          : "3/2"
                      }
                    />
                  </div>
                ))}
              </div>
              <figcaption className="mt-3 text-xs leading-relaxed text-ct-muted dark:text-ct-dark-muted">
                {block.caption && <span>{block.caption} · </span>}
                이미지 출처는 각 이미지의 출처 정보를 따릅니다.
              </figcaption>
            </figure>
          );
        }

        return null;
      })}
    </article>
  );
}
