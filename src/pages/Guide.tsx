import type { Post } from "../types";

import { getDestinationById } from "../data";

import { Container, Section } from "../components/common";

import { PostRenderer } from "../components/post";

interface GuideProps {
  post: Post;
}

export default function Guide({ post }: GuideProps) {
  const destination = post.destinationId
    ? getDestinationById(post.destinationId)
    : undefined;

  return (
    <>
      <section
        border="b ct-line dark:ct-dark-line"
        bg="ct-surface-soft dark:ct-dark-surface-soft"
      >
        <Container>
          <div py="10 sm:14 lg:16" max-w="4xl">
            <nav
              mb="6"
              text="xs sm:sm ct-muted dark:ct-dark-muted"
              aria-label="Breadcrumb"
            >
              <a
                href="/"
                hover="text-ct-primary dark:text-ct-dark-text"
                un-active="scale-98"
              >
                홈
              </a>

              <span mx="2" aria-hidden="true">
                /
              </span>

              <a
                href="/guides/"
                hover="text-ct-primary dark:text-ct-dark-text"
                un-active="scale-98"
              >
                여행 가이드
              </a>

              {destination && (
                <>
                  <span mx="2" aria-hidden="true">
                    /
                  </span>

                  <span>{destination.name}</span>
                </>
              )}
            </nav>

            <p
              m="0"
              text="xs ct-primary dark:ct-dark-text-soft"
              font="medium"
              tracking="wide"
            >
              TRAVEL GUIDE
            </p>

            <h1
              mt="3"
              mb="0"
              text="3xl sm:5xl lg:6xl"
              font="bold"
              tracking="tight"
              leading="tight"
            >
              {post.title}
            </h1>

            <p
              mt="5"
              mb="0"
              max-w="3xl"
              text="base sm:lg ct-text-soft dark:ct-dark-text-soft"
              leading="relaxed"
            >
              {post.description}
            </p>

            <div
              mt="6"
              flex="~ wrap"
              items="center"
              gap="3"
              text="xs sm:sm ct-muted dark:ct-dark-muted"
            >
              <time dateTime={post.publishedAt}>{post.publishedAt}</time>

              {post.updatedAt && (
                <>
                  <span aria-hidden="true">·</span>

                  <time dateTime={post.updatedAt}>수정 {post.updatedAt}</time>
                </>
              )}
            </div>

            {post.tags && post.tags.length > 0 && (
              <div mt="5" flex="~ wrap" gap="2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    px="3"
                    py="1.5"
                    rounded="full"
                    bg="ct-surface dark:ct-dark-surface"
                    text="xs ct-text-soft dark:ct-dark-text-soft"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Container>
      </section>

      <Section>
        <Container>
          <PostRenderer post={post} />
        </Container>
      </Section>
    </>
  );
}
