import { useState } from "react";
import type { HotelImage } from "../../types";

interface ImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  image?: HotelImage;
  aspectRatio?: string;
  loading?: "lazy" | "eager";
  decoding?: "async" | "sync" | "auto";
  fetchPriority?: "high" | "low" | "auto";
  className?: string;
}

export default function Image({
  src,
  alt,
  width,
  height,
  aspectRatio,
  loading = "lazy",
  decoding = "async",
  fetchPriority = "auto",
  className,
}: ImageProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className="w-full overflow-hidden"
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {failed ? (
        <div
          className="flex h-full min-h-32 w-full items-center justify-center bg-ct-surface-soft px-4 text-center text-sm text-ct-muted dark:bg-ct-dark-surface-soft dark:text-ct-dark-muted"
          role="img"
          aria-label={alt || "이미지를 불러올 수 없습니다"}
        >
          이미지를 불러올 수 없습니다.
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          width={width || 1200}
          height={height || 800}
          loading={loading}
          decoding={decoding}
          fetchPriority={fetchPriority}
          className={`w-full h-full object-cover ${className ?? ""}`}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
