import type { ImgHTMLAttributes } from "react";

import type { HotelImage } from "../../types";

import { getResponsiveImageSources, getImageSizes } from "../../lib/images";

interface ImageProps extends Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "src" | "alt" | "width" | "height" | "srcSet" | "sizes"
> {
  src: string;
  alt: string;
  width: number;
  height: number;

  image?: HotelImage;

  loading?: "lazy" | "eager";

  fetchPriority?: "high" | "low" | "auto";

  aspectRatio?: string;

  sizes?: string;
}

export default function Image({
  src,
  alt,
  width,
  height,
  image,
  loading = "lazy",
  fetchPriority,
  aspectRatio = "auto",
  sizes,
  ...props
}: ImageProps) {
  const responsiveSources = image
    ? getResponsiveImageSources(image)
    : undefined;

  const resolvedSrc = responsiveSources?.src ?? src;

  const resolvedSrcSet = responsiveSources?.srcSet;

  const resolvedSizes =
    sizes ?? (image ? getImageSizes(image.type) : undefined);

  return (
    <img
      src={resolvedSrc}
      srcSet={resolvedSrcSet}
      sizes={resolvedSizes}
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
