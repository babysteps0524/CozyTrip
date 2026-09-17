import type { HotelImage, ResponsiveImageVariant } from "../../types";

export interface ResponsiveImageSources {
  src: string;
  srcSet?: string;
  sizes?: string;
  variants: ResponsiveImageVariant[];
}

function sortVariants(
  variants: ResponsiveImageVariant[],
): ResponsiveImageVariant[] {
  return [...variants].sort((a, b) => a.width - b.width);
}

export function getResponsiveImageSources(
  image: HotelImage,
): ResponsiveImageSources {
  const variants = image.variants ? sortVariants(image.variants) : [];

  if (variants.length === 0) {
    return {
      src: image.src,
      variants: [],
    };
  }

  const srcSet = variants
    .map((variant) => `${variant.src} ${variant.width}w`)
    .join(", ");

  return {
    src: image.src,
    srcSet,
    sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px",
    variants,
  };
}
