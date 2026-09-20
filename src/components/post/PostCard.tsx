import type { Post } from "../../types";

interface PostCardProps {
  post: Post;
}

const categoryLabel: Record<Post["category"], string> = {
  hotel: "HOTEL",
  guide: "TRAVEL GUIDE",
};

function getPostHref(post: Post): string {
  if (post.category === "hotel" && post.hotelId && post.destinationId) {
    const destinationSlug = post.destinationId.replace("japan-", "");
    return `/japan/${destinationSlug}/hotels/${post.slug}/`;
  }

  return `/guides/${post.slug}/`;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <a
      href={getPostHref(post)}
      aria-label={`${post.title} 읽기`}
      className="ct-focus group block h-full rounded-card border border-ct-line bg-ct-surface p-5 transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-soft active:scale-[0.995] dark:border-ct-dark-line dark:bg-ct-dark-surface"
    >
      <p className="m-0 text-xs font-semibold tracking-wide text-ct-primary dark:text-ct-dark-text-soft">
        {categoryLabel[post.category]}
      </p>

      <h3 className="mt-2 mb-0 line-clamp-3 text-lg font-bold leading-snug text-ct-text dark:text-ct-dark-text">
        {post.title}
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

      <div className="mt-5 flex items-center justify-between border-t border-ct-line pt-4 text-sm font-semibold text-ct-primary dark:border-ct-dark-line dark:text-ct-dark-text-soft">
        <span>{post.category === "hotel" ? "호텔 정보 보기" : "가이드 읽기"}</span>
        <span aria-hidden="true" className="transition-transform duration-150 group-hover:translate-x-0.5">
          →
        </span>
      </div>
    </a>
  );
}
