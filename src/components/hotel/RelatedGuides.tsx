import type { Post } from "../../types";
import { Container, Section } from "../common";

interface RelatedGuidesProps {
  posts: Post[];
}

export default function RelatedGuides({ posts }: RelatedGuidesProps) {
  const guides = posts.filter((post) => post.category === "guide").slice(0, 4);

  if (guides.length === 0) return null;

  return (
    <Section borderTop>
      <Container>
        <p m="0" text="xs ct-primary dark:ct-dark-text-soft" font="medium" tracking="wide">
          RELATED GUIDES
        </p>
        <h2 mt="2" mb="0" text="2xl sm:3xl" font="bold" tracking="tight">
          함께 읽으면 좋은 글
        </h2>
        <div mt="8" grid="~ cols-1 sm:2" gap="5">
          {guides.map((post) => (
            <a
              key={post.id}
              href={`/guides/${post.slug}/`}
              display="block"
              h="full"
              rounded="xl"
              border="~ ct-line dark:ct-dark-line"
              bg="ct-surface dark:ct-dark-surface"
              p="5"
              transition="transform duration-150"
              hover="shadow-card border-ct-primary dark:border-ct-dark-line"
              active-scale="98"
            >
              <div flex="~" items="center" justify="between" gap="3">
                <span text="xs ct-primary dark:ct-dark-text-soft" font="medium" tracking="wide">
                  TRAVEL GUIDE
                </span>
                <span aria-hidden="true" text="lg ct-muted dark:text-ct-dark-muted">→</span>
              </div>
              <h3 mt="3" mb="0" text="lg ct-text dark:ct-dark-text" font="bold" leading="snug">
                {post.title}
              </h3>
              <p mt="3" mb="0" line-clamp="3" text="sm ct-text-soft dark:ct-dark-text-soft" leading="relaxed">
                {post.description}
              </p>
              {post.tags && post.tags.length > 0 && (
                <div mt="4" flex="~ wrap" gap="2">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span key={tag} text="xs ct-muted dark:ct-dark-muted">#{tag}</span>
                  ))}
                </div>
              )}
            </a>
          ))}
        </div>
      </Container>
    </Section>
  );
}
