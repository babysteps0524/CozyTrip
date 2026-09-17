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
  return (
    <div
      w="full"
      overflow="hidden"
      style={
        aspectRatio
          ? {
              aspectRatio,
            }
          : undefined
      }
    >
      <img
        src={src}
        alt={alt}
        width={width || 1200}
        height={height || 800}
        loading={loading}
        decoding={decoding}
        fetchPriority={fetchPriority}
        className={className}
        w="full"
        h="full"
        object="cover"
      />
    </div>
  );
}
