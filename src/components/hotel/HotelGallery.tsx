import { useState } from "react";

import type { HotelImage } from "../../types";

interface HotelGalleryProps {
  images: HotelImage[];
}

function getVisibleImages(images: HotelImage[]): HotelImage[] {
  return images.filter((image) => {
    return image.rightsConfirmed && Boolean(image.src);
  });
}

function getImageAspectRatio(image: HotelImage): string {
  if (image.width && image.height && image.width > 0 && image.height > 0) {
    return `${image.width} / ${image.height}`;
  }

  return "16 / 10";
}

export default function HotelGallery({ images }: HotelGalleryProps) {
  const visibleImages = getVisibleImages(images);

  const [selectedIndex, setSelectedIndex] = useState(0);

  if (visibleImages.length === 0) {
    return (
      <section
        aria-label="호텔 이미지"
        bg="ct-surface-soft dark:bg-ct-dark-surface-soft"
      >
        <div
          aspect="[16/10]"
          flex="~"
          items="center"
          justify="center"
          rounded="card"
          border="~ ct-line dark:ct-dark-line"
          bg="ct-surface dark:bg-ct-dark-surface"
          text="sm ct-muted dark:ct-dark-muted"
        >
          호텔 이미지를 준비 중입니다.
        </div>
      </section>
    );
  }

  const selectedImage =
    visibleImages[Math.min(selectedIndex, visibleImages.length - 1)];

  return (
    <section aria-label="호텔 이미지">
      <div
        overflow="hidden"
        rounded="card"
        border="~ ct-line dark:ct-dark-line"
        bg="ct-surface dark:bg-ct-dark-surface"
      >
        <div
          relative
          overflow="hidden"
          bg="ct-surface-soft dark:bg-ct-dark-surface-soft"
          style={{
            aspectRatio: getImageAspectRatio(selectedImage),
          }}
        >
          <img
            src={selectedImage.src}
            alt={selectedImage.alt}
            width={selectedImage.width || 1600}
            height={selectedImage.height || 1000}
            loading={selectedIndex === 0 ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={selectedIndex === 0 ? "high" : "auto"}
            w="full"
            h="full"
            object="cover"
          />
        </div>
      </div>

      {visibleImages.length > 1 && (
        <div
          mt="3"
          flex="~"
          gap="2"
          overflow-x="auto"
          pb="1"
          snap="x mandatory"
        >
          {visibleImages.map((image, index) => {
            const selected = index === selectedIndex;

            return (
              <button
                key={image.id}
                type="button"
                aria-label={`${index + 1}번째 호텔 이미지 보기`}
                aria-pressed={selected}
                onClick={() => setSelectedIndex(index)}
                shrink="0"
                w="24"
                h="18"
                overflow="hidden"
                rounded="lg"
                border={
                  selected ? "~ 2 ct-primary" : "~ ct-line dark:ct-dark-line"
                }
                bg="ct-surface dark:bg-ct-dark-surface"
                opacity={selected ? "100" : "70"}
                hover="opacity-100"
                un-active="scale-0.95"
                snap="start"
              >
                <img
                  src={image.src}
                  alt=""
                  aria-hidden="true"
                  width={image.width || 160}
                  height={image.height || 120}
                  loading="lazy"
                  decoding="async"
                  w="full"
                  h="full"
                  object="cover"
                />
              </button>
            );
          })}
        </div>
      )}

      <p mt="2" mb="0" text="xs ct-muted dark:ct-dark-muted">
        {selectedIndex + 1} / {visibleImages.length}
      </p>
    </section>
  );
}
