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
        <div flex="~ col sm:row" sm="items-end justify-between" gap="3">
          <div>
            <p
              m="0"
              text="xs ct-primary dark:ct-dark-text-soft"
              font="medium"
              tracking="wide"
            >
              RELATED GUIDES
            </p>
            <h2
              mt="2"
              mb="0"
              text="2xl sm:3xl"
              font="bold"
              tracking="tight"
            >
              함께 읽으면 좋은 여행 가이드
            </h2>
          </div>

          <a
            href="/guides/"
            shrink="0"
            self="start sm:end"
            rounded="xl"
            border="~ ct-line dark:ct-dark-line"
            bg="ct-surface dark:ct-dark-surface"
            px="4"
            py="2.5"
            text="sm ct-text-soft dark:ct-dark-text-soft"
            font="semibold"
            hover="border-ct-primary text-ct-primary dark:border-ct-dark-text dark:text-ct-dark-text"
            active-scale="98"
            className="ct-focus"
          >
            여행 가이드 전체 보기
          </a>
        </div>

        <p
          mt="3"
          mb="0"
          max-w="2xl"
          text="sm ct-text-soft dark:ct-dark-text-soft"
          leading="relaxed"
        >
          이 호텔이 위치한 지역의 여행 정보를 함께 살펴볼 수 있습니다.
        </p>

        <div mt="8" grid="~ cols-1 sm:2" gap="5 lg:6">
          {guides.map((post) => {
            const image = getGuideImage(post);

            return (
              <article
                key={post.id}
                overflow="hidden"
                rounded="card"
                border="~ ct-line dark:ct-dark-line"
                bg="ct-surface dark:ct-dark-surface"
                shadow="card"
              >
                <a
                  href={`/guides/${post.slug}/`}
                  display="block"
                  active-scale="99"
                  className="ct-focus"
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
                    <div
                      flex="~"
                      items="center"
                      justify="center"
                      aspect-ratio="16/9"
                      bg="ct-surface-soft dark:bg-ct-dark-surface-soft"
                      text="xs ct-muted dark:ct-dark-muted"
                    >
                      여행 가이드
                    </div>
                  )}
                </a>

                <div p="5 sm:6">
                  <div flex="~" items="center" justify="between" gap="3">
                    <span
                      text="xs ct-primary dark:ct-dark-text-soft"
                      font="medium"
                      tracking="wide"
                    >
                      TRAVEL GUIDE
                    </span>
                    <span
                      text="xs ct-muted dark:ct-dark-muted"
                      whitespace="nowrap"
                    >
                      {formatDate(post.publishedAt)}
                    </span>
                  </div>

                  <h3
                    mt="3"
                    mb="0"
                    text="lg ct-text dark:ct-dark-text"
                    font="bold"
                    leading="snug"
                  >
                    <a
                      href={`/guides/${post.slug}/`}
                      hover="text-ct-primary dark:text-ct-dark-text"
                      active-scale="99"
                      className="ct-focus"
                    >
                      {post.title}
                    </a>
                  </h3>

                  <p
                    mt="3"
                    mb="0"
                    line-clamp="3"
                    text="sm ct-text-soft dark:ct-dark-text-soft"
                    leading="relaxed"
                  >
                    {post.description}
                  </p>

                  {post.tags && post.tags.length > 0 && (
                    <div mt="4" flex="~ wrap" gap="2">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          rounded="full"
                          bg="ct-surface-soft dark:bg-ct-dark-surface-soft"
                          px="2.5"
                          py="1"
                          text="xs ct-muted dark:ct-dark-muted"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <a
                    href={`/guides/${post.slug}/`}
                    mt="5"
                    display="inline-flex"
                    items="center"
                    gap="2"
                    text="sm ct-primary dark:ct-dark-text"
                    font="bold"
                    hover="underline"
                    active-scale="98"
                    className="ct-focus"
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
