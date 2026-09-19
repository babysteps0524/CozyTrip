import { useState } from "react";
import type { HotelImage } from "../../types";
import { Container } from "../common";
import { getDisplayableHotelImages } from "../../lib/image";

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

function getInitialIndex(images: HotelImage[]): number {
  const index = images.findIndex((image) => image.type === "hero");
  return index >= 0 ? index : 0;
}

export default function HotelGallery({ images }: HotelGalleryProps) {
  const visibleImages = getDisplayableHotelImages(images);
  const [selectedIndex, setSelectedIndex] = useState(() => getInitialIndex(visibleImages));

  if (visibleImages.length === 0) {
    return (
      <section aria-label="호텔 이미지">
        <Container>
          <div className="flex aspect-[16/9] items-center justify-center rounded-card border border-ct-line bg-ct-surface-soft text-sm text-ct-muted dark:border-ct-dark-line dark:bg-ct-dark-surface-soft dark:text-ct-dark-muted">
            호텔 이미지를 준비 중입니다.
          </div>
        </Container>
      </section>
    );
  }

  const safeIndex = Math.min(selectedIndex, visibleImages.length - 1);
  const selectedImage = visibleImages[safeIndex];
  const hasMultipleImages = visibleImages.length > 1;

  const moveImage = (direction: -1 | 1) => {
    setSelectedIndex((current) => (current + direction + visibleImages.length) % visibleImages.length);
  };

  return (
    <section aria-label="호텔 이미지" className="bg-ct-surface-soft py-4 sm:py-6 dark:bg-ct-dark-surface-soft">
      <Container>
        <div className="overflow-hidden rounded-card border border-ct-line bg-ct-surface shadow-soft dark:border-ct-dark-line dark:bg-ct-dark-surface">
          <div className="relative aspect-[16/10] bg-ct-surface-soft dark:bg-ct-dark-surface-soft sm:aspect-[16/9]">
            {selectedImage.sourceUrl ? (
              <a
                href={selectedImage.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="이미지 출처 및 호텔 정보 확인"
                className="block h-full w-full"
                active-scale="99"
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
                  className="h-full w-full object-cover"
                />
              </a>
            ) : (
              <img
                key={selectedImage.id}
                src={selectedImage.src}
                alt={selectedImage.alt}
                width={selectedImage.width || 1600}
                height={selectedImage.height || 1000}
                loading={safeIndex === 0 ? "eager" : "lazy"}
                decoding="async"
                fetchPriority={safeIndex === 0 ? "high" : "auto"}
                className="h-full w-full object-cover"
              />
            )}

            <div className="absolute left-4 top-4 rounded-full bg-black/65 px-3 py-1.5 text-xs font-medium text-white">
              {IMAGE_TYPE_LABEL[selectedImage.type]}
            </div>

            {hasMultipleImages && (
              <div className="absolute bottom-4 right-4 flex gap-2">
                <button type="button" aria-label="이전 호텔 이미지" onClick={() => moveImage(-1)}
                  className="ct-focus flex h-10 w-10 items-center justify-center rounded-full bg-black/65 text-lg text-white hover:bg-black/80"
                  active-scale="95">‹</button>
                <button type="button" aria-label="다음 호텔 이미지" onClick={() => moveImage(1)}
                  className="ct-focus flex h-10 w-10 items-center justify-center rounded-full bg-black/65 text-lg text-white hover:bg-black/80"
                  active-scale="95">›</button>
              </div>
            )}
          </div>

          {hasMultipleImages && (
            <div className="flex gap-2 overflow-x-auto p-3" aria-label="호텔 이미지 목록">
              {visibleImages.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  aria-label={`${index + 1}번째 호텔 이미지 보기`}
                  aria-pressed={index === safeIndex}
                  onClick={() => setSelectedIndex(index)}
                  className={`ct-focus relative h-18 w-24 shrink-0 overflow-hidden rounded-lg border bg-ct-surface dark:bg-ct-dark-surface ${index === safeIndex ? "border-2 border-ct-primary opacity-100" : "border-ct-line opacity-70 hover:opacity-100 dark:border-ct-dark-line"}`}
                  active-scale="98"
                >
                  <img src={image.src} alt="" aria-hidden="true" width={240} height={180}
                    loading="lazy" decoding="async" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between gap-3 px-1">
          <p className="m-0 text-xs text-ct-muted dark:text-ct-dark-muted">
            {safeIndex + 1} / {visibleImages.length}
          </p>
          <p className="m-0 text-right text-xs text-ct-muted dark:text-ct-dark-muted">
            {IMAGE_TYPE_LABEL[selectedImage.type]}{selectedImage.credit ? ` · ${selectedImage.credit}` : ""}
          </p>
        </div>
      </Container>
    </section>
  );
}
