import type { Post } from "../../types";
import { Container, Image, Section } from "../common";
import { isDisplayableHotelImage } from "../../lib/image";

interface RelatedGuidesProps {
  posts: Post[];
}

function getGuideImage(post: Post) {
  for (const block of post.blocks) {
    if (block.type === "image" && isDisplayableHotelImage(block.image)) {
      return block.image;
    }

    if (block.type === "gallery") {
      const image = block.images.find(isDisplayableHotelImage);
      if (image) return image;
    }
  }

  return undefined;
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export default function RelatedGuides({ posts }: RelatedGuidesProps) {
  const guides = posts
    .filter((post) => post.category === "guide")
    .sort((a, b) => {
      const dateOrder =
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();

      if (!Number.isNaN(dateOrder) && dateOrder !== 0) {
        return dateOrder;
      }

      return a.title.localeCompare(b.title, "ko");
    })
    .slice(0, 4);

  if (guides.length === 0) return null;

  return (
    <Section borderTop>
      <Container>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="m-0 text-xs font-medium tracking-[0.16em] text-ct-primary dark:text-ct-dark-text-soft">
              RELATED GUIDES
            </p>
            <h2 className="mt-2 mb-0 text-2xl font-bold tracking-tight sm:text-3xl">
              함께 읽으면 좋은 여행 가이드
            </h2>
          </div>

          <a
            href="/guides/"
            className="ct-focus inline-flex min-h-11 shrink-0 items-center justify-center self-start rounded-xl border border-ct-line bg-ct-surface px-4 py-2.5 text-sm font-semibold text-ct-text-soft transition-colors hover:border-ct-primary hover:text-ct-primary active-scale-98 dark:border-ct-dark-line dark:bg-ct-dark-surface dark:text-ct-dark-text-soft dark:hover:border-ct-dark-text dark:hover:text-ct-dark-text sm:self-end"
          >
            여행 가이드 전체 보기
          </a>
        </div>

        <p className="mt-3 mb-0 max-w-2xl text-sm leading-7 text-ct-text-soft dark:text-ct-dark-text-soft">
          이 호텔이 위치한 지역의 여행 정보를 함께 살펴볼 수 있습니다.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:gap-6">
          {guides.map((post) => {
            const image = getGuideImage(post);

            return (
              <article
                key={post.id}
                className="flex h-full min-w-0 flex-col overflow-hidden rounded-card border border-ct-line bg-ct-surface shadow-card dark:border-ct-dark-line dark:bg-ct-dark-surface"
              >
                <a
                  href={`/guides/${post.slug}/`}
                  className="ct-focus block shrink-0 active-scale-99"
                  aria-label={`${post.title} 여행 가이드 읽기`}
                >
                  {image ? (
                    <Image
                      src={image.src}
                      alt={image.alt}
                      width={image.width}
                      height={image.height}
                      image={image}
                      aspectRatio="16/9"
                    />
                  ) : (
                    <div className="flex aspect-[16/9] items-center justify-center bg-ct-surface-soft text-xs text-ct-muted dark:bg-ct-dark-surface-soft dark:text-ct-dark-muted">
                      여행 가이드
                    </div>
                  )}
                </a>

                <div className="flex flex-1 flex-col p-4 sm:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-medium tracking-[0.12em] text-ct-primary dark:text-ct-dark-text-soft">
                      TRAVEL GUIDE
                    </span>
                    <time
                      dateTime={post.publishedAt}
                      className="shrink-0 whitespace-nowrap text-xs text-ct-muted dark:text-ct-dark-muted"
                    >
                      {formatDate(post.publishedAt)}
                    </time>
                  </div>

                  <h3 className="mt-3 mb-0 text-lg font-bold leading-snug">
                    <a
                      href={`/guides/${post.slug}/`}
                      className="ct-focus text-ct-text hover:text-ct-primary dark:text-ct-dark-text dark:hover:text-ct-dark-text active-scale-99"
                    >
                      {post.title}
                    </a>
                  </h3>

                  <p className="mt-3 mb-0 line-clamp-3 text-sm leading-7 text-ct-text-soft dark:text-ct-dark-text-soft">
                    {post.description}
                  </p>

                  {post.tags && post.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-ct-surface-soft px-2.5 py-1 text-xs text-ct-muted dark:bg-ct-dark-surface-soft dark:text-ct-dark-muted"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <a
                    href={`/guides/${post.slug}/`}
                    className="ct-focus mt-auto pt-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-ct-primary hover:underline dark:text-ct-dark-text active-scale-98"
                  >
                    가이드 읽기
                    <span aria-hidden="true">→</span>
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
