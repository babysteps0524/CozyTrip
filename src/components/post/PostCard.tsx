import type { Post } from "../../types";

interface PostCardProps {
  post: Post;
}

const categoryLabel: Record<Post["category"], string> = {
  hotel: "HOTEL",
  guide: "TRAVEL GUIDE",
};

export default function PostCard({ post }: PostCardProps) {
  return (
    <a
      href={`/guides/${post.slug}/`}
      display="block"
      h="full"
      rounded="card"
      border="~ ct-line dark:ct-dark-line"
      bg="ct-surface dark:ct-dark-surface"
      p="5"
      transition="transform duration-150"
      hover="shadow-card"
      active-scale="98"
    >
      <p
        m="0"
        text="xs ct-primary dark:ct-dark-text-soft"
        font="medium"
        tracking="wide"
      >
        {categoryLabel[post.category]}
      </p>

      <h3
        mt="2"
        mb="0"
        text="lg ct-text dark:ct-dark-text"
        font="bold"
        leading="snug"
      >
        {post.title}
      </h3>

      <p
        mt="3"
        mb="0"
        text="sm ct-text-soft dark:ct-dark-text-soft"
        leading="relaxed"
      >
        {post.description}
      </p>

      {post.tags && post.tags.length > 0 && (
        <div mt="4" flex="~ wrap" gap="2">
          {post.tags.slice(0, 3).map((tag) => (
            <span key={tag} text="xs ct-muted dark:ct-dark-muted">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </a>
  );
}
