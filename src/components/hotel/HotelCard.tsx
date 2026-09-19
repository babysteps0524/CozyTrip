import type { Hotel } from "../../types";
import { Image } from "../common";
import { isDisplayableHotelImage } from "../../lib/image";

interface HotelCardProps {
  hotel: Hotel;
}

function getHotelPath(hotel: Hotel): string {
  const destinationSlug = hotel.destinationId.replace("japan-", "");
  return `/japan/${destinationSlug}/hotels/${hotel.slug}/`;
}

export default function HotelCard({ hotel }: HotelCardProps) {
  const image = hotel.images.find(isDisplayableHotelImage);

  const location = [hotel.city, hotel.area].filter(Boolean).join(" · ");
  const facts = [
    hotel.accommodationType,
    hotel.starRating !== undefined ? `${hotel.starRating}성급` : undefined,
  ].filter(Boolean);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-card border border-ct-line bg-ct-surface shadow-card transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-soft dark:border-ct-dark-line dark:bg-ct-dark-surface">
      <a
        href={getHotelPath(hotel)}
        className="ct-focus block"
        aria-label={`${hotel.name} 호텔 소개 보기`}
        active-scale="99"
      >
        {image ? (
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            image={image}
            aspectRatio="16/10"
          />
        ) : (
          <div
            className="flex aspect-[16/10] items-center justify-center bg-ct-surface-soft text-sm text-ct-muted dark:bg-ct-dark-surface-soft dark:text-ct-dark-muted"
            aria-label="호텔 이미지 없음"
          >
            호텔 이미지를 준비 중입니다.
          </div>
        )}
      </a>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {location && (
          <p className="m-0 text-xs font-semibold tracking-wide text-ct-primary dark:text-ct-dark-text-soft">
            {location}
          </p>
        )}

        <h2 className="mt-2 mb-0 text-lg font-bold leading-snug tracking-tight text-ct-text dark:text-ct-dark-text">
          <a
            href={getHotelPath(hotel)}
            className="ct-focus"
            active-scale="99"
          >
            {hotel.name}
          </a>
        </h2>

        {hotel.nameEn && (
          <p className="mt-1 mb-0 truncate text-sm text-ct-muted dark:text-ct-dark-muted">
            {hotel.nameEn}
          </p>
        )}

        {facts.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {facts.map((fact) => (
              <span
                key={fact}
                className="rounded-full border border-ct-line bg-ct-surface-soft px-3 py-1 text-xs text-ct-text-soft dark:border-ct-dark-line dark:bg-ct-dark-surface-soft dark:text-ct-dark-text-soft"
              >
                {fact}
              </span>
            ))}
          </div>
        )}

        <p className="mt-4 mb-0 line-clamp-3 text-sm leading-7 text-ct-text-soft dark:text-ct-dark-text-soft">
          {hotel.description}
        </p>

        <div className="mt-auto pt-6">
          <a
            href={getHotelPath(hotel)}
            className="ct-focus flex items-center justify-between rounded-xl bg-ct-primary-soft px-4 py-3 text-sm font-semibold text-ct-primary transition-colors hover:bg-ct-primary dark:bg-ct-dark-surface-soft dark:text-ct-dark-text dark:hover:bg-ct-dark-line"
            active-scale="98"
          >
            <span>호텔 소개 읽기</span>
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </article>
  );
}
