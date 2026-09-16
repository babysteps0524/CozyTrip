import type { ImgHTMLAttributes } from "react";

interface ImageProps extends Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "src" | "alt" | "width" | "height"
> {
  src: string;
  alt: string;
  width: number;
  height: number;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
  aspectRatio?: string;
}

export default function Image({
  src,
  alt,
  width,
  height,
  loading = "lazy",
  fetchPriority,
  aspectRatio = "auto",
  ...props
}: ImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      fetchPriority={fetchPriority}
      aspect-ratio={aspectRatio}
      w="full"
      h="auto"
      object="cover"
      {...props}
    />
  );
}
