import type { Post } from "../types";

import { Container, Section } from "../components/common";
import { PostRenderer } from "../components/post";

interface GuideProps {
  post: Post;
  destination?: import("../types").Destination;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export default function Guide({ post, destination }: GuideProps) {
  return (
    <>
      <section className="border-b border-ct-line bg-ct-surface-soft dark:border-ct-dark-line dark:bg-ct-dark-surface-soft">
        <Container>
          <div className="max-w-4xl py-10 sm:py-14 lg:py-16">
            <nav className="mb-6 flex flex-wrap items-center gap-1 text-xs text-ct-muted sm:text-sm dark:text-ct-dark-muted" aria-label="Breadcrumb">
              <a href="/" className="ct-focus rounded-md px-1 py-1 hover:text-ct-primary dark:hover:text-ct-dark-text">홈</a>
              <span className="px-1" aria-hidden="true">/</span>
              <a href="/guides/" className="ct-focus rounded-md px-1 py-1 hover:text-ct-primary dark:hover:text-ct-dark-text">여행 가이드</a>
              {destination && (
                <>
                  <span className="px-1" aria-hidden="true">/</span>
                  <a
                    href={`/japan/${destination.slug}/`}
                    className="ct-focus rounded-md px-1 py-1 hover:text-ct-primary dark:hover:text-ct-dark-text"
                  >
                    {destination.name}
                  </a>
                </>
              )}
            </nav>

            <p className="m-0 text-xs font-semibold tracking-[0.16em] text-ct-primary dark:text-ct-dark-text-soft">
              TRAVEL GUIDE
            </p>

            <h1 className="mt-3 mb-0 max-w-4xl text-3xl font-bold leading-tight tracking-tight text-ct-text sm:text-5xl lg:text-6xl dark:text-ct-dark-text">
              {post.title}
            </h1>

            <p className="mt-5 mb-0 max-w-3xl text-base leading-8 text-ct-text-soft sm:text-lg dark:text-ct-dark-text-soft">
              {post.description}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-ct-muted sm:text-sm dark:text-ct-dark-muted">
              <span className="font-medium text-ct-text-soft dark:text-ct-dark-text-soft">CozyTrip</span>
              <span aria-hidden="true">·</span>
              <time dateTime={post.publishedAt}>작성 {formatDate(post.publishedAt)}</time>
              {post.updatedAt && (
                <>
                  <span aria-hidden="true">·</span>
                  <time dateTime={post.updatedAt}>수정 {formatDate(post.updatedAt)}</time>
                </>
              )}
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-ct-surface px-3 py-1.5 text-xs text-ct-text-soft dark:bg-ct-dark-surface dark:text-ct-dark-text-soft"
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
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-14">
            <PostRenderer post={post} />

            {post.tags && post.tags.length > 0 && (
              <aside className="hidden lg:block">
                <div className="sticky top-24 rounded-2xl border border-ct-line bg-ct-surface-soft p-5 dark:border-ct-dark-line dark:bg-ct-dark-surface-soft">
                  <p className="m-0 text-xs font-semibold tracking-wide text-ct-primary dark:text-ct-dark-text-soft">
                    ARTICLE
                  </p>
                  <p className="mt-2 mb-0 text-sm font-semibold text-ct-text dark:text-ct-dark-text">
                    이 글의 핵심 키워드
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-ct-surface px-2.5 py-1 text-xs text-ct-muted dark:bg-ct-dark-surface dark:text-ct-dark-muted">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </aside>
            )}
          </div>
        </Container>
      </Section>
    </>
  );
}
