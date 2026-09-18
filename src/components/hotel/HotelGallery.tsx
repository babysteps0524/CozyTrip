import { useState } from "react";

import type { HotelImage } from "../../types";

import { Container } from "../common";

interface HotelGalleryProps {
  images: HotelImage[];
}

const IMAGE_TYPE_LABEL: Record<HotelImage["type"], string> = {
  hero: "대표 이미지",
  gallery: "호텔 전경",
  room: "객실",
  facility: "시설",
  restaurant: "다이닝",
  location: "위치",
  attraction: "주변 명소",
};

function getVisibleImages(images: HotelImage[]): HotelImage[] {
  return images.filter((image) => image.rightsConfirmed && Boolean(image.src));
}

function getImageAspectRatio(image: HotelImage): string {
  if (image.width && image.height && image.width > 0 && image.height > 0) {
    return `${image.width} / ${image.height}`;
  }

  return "16 / 10";
}

function getInitialIndex(images: HotelImage[]): number {
  const heroIndex = images.findIndex((image) => image.type === "hero");
  return heroIndex >= 0 ? heroIndex : 0;
}

export default function HotelGallery({ images }: HotelGalleryProps) {
  const visibleImages = getVisibleImages(images);
  const [selectedIndex, setSelectedIndex] = useState(() =>
    getInitialIndex(visibleImages),
  );

  if (visibleImages.length === 0) {
    return (
      <section aria-label="호텔 이미지" bg="ct-surface-soft dark:bg-ct-dark-surface-soft">
        <Container>
          <div
            aspect="[16/10]"
            flex="~"
            items="center"
            justify="center"
            rounded="card"
            border="~ ct-line dark:ct-dark-line"
            bg="ct-surface dark:ct-dark-surface"
            text="sm ct-muted dark:ct-dark-muted"
          >
            호텔 이미지를 준비 중입니다.
          </div>
        </Container>
      </section>
    );
  }

  const safeIndex = Math.min(selectedIndex, visibleImages.length - 1);
  const selectedImage = visibleImages[safeIndex];
  const hasMultipleImages = visibleImages.length > 1;

  const selectImage = (index: number) => {
    setSelectedIndex(Math.min(Math.max(index, 0), visibleImages.length - 1));
  };

  const moveImage = (direction: -1 | 1) => {
    const nextIndex =
      (safeIndex + direction + visibleImages.length) % visibleImages.length;
    setSelectedIndex(nextIndex);
  };

  return (
    <section aria-label="호텔 이미지">
      <div
        grid="~ cols-1 lg:3"
        gap="3"
        overflow="hidden"
        rounded="card"
        border="~ ct-line dark:ct-dark-line"
        bg="ct-surface dark:ct-dark-surface"
      >
        <div
          relative
          overflow="hidden"
          bg="ct-surface-soft dark:bg-ct-dark-surface-soft"
          lg="col-span-2"
          style={{ aspectRatio: getImageAspectRatio(selectedImage) }}
        >
          <img
            key={selectedImage.id}
            src={selectedImage.src}
            alt={selectedImage.alt}
            width={selectedImage.width || 1600}
            height={selectedImage.height || 1000}
            loading={safeIndex === 0 ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={safeIndex === 0 ? "high" : "auto"}
            w="full"
            h="full"
            object="cover"
          />

          <div
            absolute
            top="4"
            left="4"
            rounded="full"
            bg="black/65"
            px="3"
            py="1.5"
            text="xs white"
            font="medium"
          >
            {IMAGE_TYPE_LABEL[selectedImage.type]}
          </div>

          {hasMultipleImages && (
            <div absolute right="4" bottom="4" flex="~" gap="2">
              <button
                type="button"
                aria-label="이전 호텔 이미지"
                onClick={() => moveImage(-1)}
                w="10"
                h="10"
                flex="~"
                items="center"
                justify="center"
                rounded="full"
                bg="black/65"
                text="lg white"
                hover="bg-black/80"
                active-scale="98"
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="다음 호텔 이미지"
                onClick={() => moveImage(1)}
                w="10"
                h="10"
                flex="~"
                items="center"
                justify="center"
                rounded="full"
                bg="black/65"
                text="lg white"
                hover="bg-black/80"
                active-scale="98"
              >
                ›
              </button>
            </div>
          )}
        </div>

        {hasMultipleImages && (
          <div
            lg="col-span-1 block"
            display="none lg:block"
            p="3"
            bg="ct-surface dark:bg-ct-dark-surface"
          >
            <div grid="~ cols-2" gap="2" max-h="full" overflow-y="auto">
              {visibleImages.slice(0, 6).map((image, index) => {
                const selected = index === safeIndex;

                return (
                  <button
                    key={image.id}
                    type="button"
                    aria-label={`${index + 1}번째 호텔 이미지 보기`}
                    aria-pressed={selected}
                    onClick={() => selectImage(index)}
                    relative
                    aspect="[4/3]"
                    overflow="hidden"
                    rounded="lg"
                    border={selected ? "~ 2 ct-primary" : "~ ct-line dark:ct-dark-line"}
                    bg="ct-surface-soft dark:ct-dark-surface-soft"
                    opacity={selected ? "100" : "75"}
                    hover="opacity-100"
                    active-scale="98"
                  >
                    <img
                      src={image.src}
                      alt=""
                      aria-hidden="true"
                      width={image.width || 400}
                      height={image.height || 300}
                      loading="lazy"
                      decoding="async"
                      w="full"
                      h="full"
                      object="cover"
                    />
                    <span
                      absolute
                      left="2"
                      bottom="2"
                      rounded="full"
                      bg="black/65"
                      px="2"
                      py="1"
                      text="[10px] white"
                      leading="none"
                    >
                      {IMAGE_TYPE_LABEL[image.type]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {hasMultipleImages && (
        <div
          mt="3"
          flex="~"
          gap="2"
          overflow-x="auto"
          pb="1"
          snap="x mandatory"
          lg="hidden"
          aria-label="호텔 이미지 목록"
        >
          {visibleImages.map((image, index) => {
            const selected = index === safeIndex;

            return (
              <button
                key={image.id}
                type="button"
                aria-label={`${index + 1}번째 호텔 이미지 보기`}
                aria-pressed={selected}
                onClick={() => selectImage(index)}
                relative
                shrink="0"
                w="24"
                h="18"
                overflow="hidden"
                rounded="lg"
                border={selected ? "~ 2 ct-primary" : "~ ct-line dark:ct-dark-line"}
                bg="ct-surface dark:bg-ct-dark-surface"
                opacity={selected ? "100" : "70"}
                hover="opacity-100"
                active-scale="98"
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

      <div mt="2" flex="~" items="center" justify="between" gap="3">
        <p m="0" text="xs ct-muted dark:ct-dark-muted">
          {safeIndex + 1} / {visibleImages.length}
        </p>
        <p m="0" text="xs ct-muted dark:ct-dark-muted">
          {IMAGE_TYPE_LABEL[selectedImage.type]}
          {selectedImage.credit ? ` · ${selectedImage.credit}` : ""}
        </p>
      </div>
    </section>
  );
}
