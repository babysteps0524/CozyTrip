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
  bathroom: "욕실",
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
  const [failedImageIds, setFailedImageIds] = useState<Set<string>>(() => new Set());

  if (visibleImages.length === 0) {
    return (
      <section aria-label="호텔 이미지">
        <Container>
          <div className="flex aspect-[16/10] items-center justify-center rounded-card border border-ct-line bg-ct-surface-soft px-6 text-center text-sm text-ct-muted dark:border-ct-dark-line dark:bg-ct-dark-surface-soft dark:text-ct-dark-muted sm:aspect-[16/9]">
            호텔 이미지를 준비 중입니다.
          </div>
        </Container>
      </section>
    );
  }

  const safeIndex = Math.min(selectedIndex, visibleImages.length - 1);
  const selectedImage = visibleImages[safeIndex];
  const hasMultipleImages = visibleImages.length > 1;
  const selectedImageFailed = failedImageIds.has(selectedImage.id);

  const markImageFailed = (imageId: string) => {
    setFailedImageIds((current) => {
      if (current.has(imageId)) return current;
      const next = new Set(current);
      next.add(imageId);
      return next;
    });
  };

  const moveImage = (direction: -1 | 1) => {
    setSelectedIndex(
      (current) => (current + direction + visibleImages.length) % visibleImages.length,
    );
  };

  return (
    <section
      aria-label="호텔 이미지"
      className="bg-ct-surface-soft py-3 dark:bg-ct-dark-surface-soft sm:py-6"
    >
      <Container>
        <div className="overflow-hidden rounded-card border border-ct-line bg-ct-surface shadow-soft dark:border-ct-dark-line dark:bg-ct-dark-surface">
          <div className="relative aspect-[16/8] bg-ct-surface-soft dark:bg-ct-dark-surface-soft sm:aspect-[16/7]">
            {selectedImageFailed ? (
              <div
                className="flex h-full w-full items-center justify-center bg-ct-surface-soft px-4 text-center text-sm text-ct-muted dark:bg-ct-dark-surface-soft dark:text-ct-dark-muted"
                role="img"
                aria-label={selectedImage.alt || "호텔 이미지를 불러올 수 없습니다"}
              >
                호텔 이미지를 불러올 수 없습니다.
              </div>
            ) : selectedImage.sourceUrl ? (
              <a
                href={selectedImage.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="이미지 출처 및 호텔 정보 확인"
                className="block h-full w-full active-scale-99"
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
                  onError={() => markImageFailed(selectedImage.id)}
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
                onError={() => markImageFailed(selectedImage.id)}
              />
            )}

            <div className="absolute left-3 top-3 rounded-full bg-black/65 px-2.5 py-1 text-[11px] font-medium text-white sm:left-4 sm:top-4 sm:px-3 sm:py-1.5 sm:text-xs">
              {IMAGE_TYPE_LABEL[selectedImage.type]}
            </div>

            {hasMultipleImages && (
              <>
                <p
                  aria-live="polite"
                  className="absolute bottom-3 left-3 m-0 rounded-full bg-black/65 px-2.5 py-1 text-[11px] font-medium text-white sm:bottom-4 sm:left-4 sm:px-3 sm:py-1.5 sm:text-xs"
                >
                  {safeIndex + 1} / {visibleImages.length}
                </p>
                <div className="absolute bottom-3 right-3 flex gap-2 sm:bottom-4 sm:right-4">
                  <button
                    type="button"
                    aria-label="이전 호텔 이미지"
                    onClick={() => moveImage(-1)}
                    className="ct-focus flex h-11 w-11 items-center justify-center rounded-full bg-black/65 text-lg text-white hover:bg-black/80 active-scale-95 sm:h-10 sm:w-10"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    aria-label="다음 호텔 이미지"
                    onClick={() => moveImage(1)}
                    className="ct-focus flex h-11 w-11 items-center justify-center rounded-full bg-black/65 text-lg text-white hover:bg-black/80 active-scale-95 sm:h-10 sm:w-10"
                  >
                    ›
                  </button>
                </div>
              </>
            )}
          </div>

          {hasMultipleImages && (
            <div className="border-t border-ct-line p-2.5 dark:border-ct-dark-line sm:p-3">
              <div className="flex gap-2 overflow-x-auto" aria-label="호텔 이미지 목록">
                {visibleImages.map((image, index) => (
                  <button
                    key={image.id}
                    type="button"
                    aria-label={`${index + 1}번째 호텔 이미지 보기`}
                    aria-pressed={index === safeIndex}
                    onClick={() => setSelectedIndex(index)}
                    className={`ct-focus relative h-16 w-22 shrink-0 overflow-hidden rounded-lg border bg-ct-surface active-scale-98 dark:bg-ct-dark-surface sm:h-18 sm:w-24 ${index === safeIndex ? "border-2 border-ct-primary opacity-100" : "border-ct-line opacity-70 hover:opacity-100 dark:border-ct-dark-line"}`}
                  >
                    {failedImageIds.has(image.id) ? (
                      <span className="flex h-full w-full items-center justify-center bg-ct-surface-soft px-2 text-[10px] text-ct-muted dark:bg-ct-dark-surface-soft dark:text-ct-dark-muted">
                        이미지 없음
                      </span>
                    ) : (
                      <img
                        src={image.src}
                        alt=""
                        aria-hidden="true"
                        width={240}
                        height={180}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                        onError={() => markImageFailed(image.id)}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-2 flex items-start justify-between gap-3 px-1 sm:items-center">
          <p className="m-0 shrink-0 text-xs text-ct-muted dark:text-ct-dark-muted">
            {safeIndex + 1} / {visibleImages.length}
          </p>
          <p className="m-0 max-w-[75%] text-right text-[11px] leading-5 text-ct-muted dark:text-ct-dark-muted sm:text-xs">
            {IMAGE_TYPE_LABEL[selectedImage.type]}
            {selectedImage.credit ? ` · ${selectedImage.credit}` : ""}
          </p>
        </div>
      </Container>
    </section>
  );
}
