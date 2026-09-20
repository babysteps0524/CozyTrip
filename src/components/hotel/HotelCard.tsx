import type { Hotel } from "../../types";
import { Image } from "../common";
import { isDisplayableHotelImage } from "../../lib/image";

interface HotelCardProps {
  hotel: Hotel;
}

function getLocationLabel(city?: string, area?: string): string {
  const values = [city?.trim(), area?.trim()].filter(Boolean) as string[];
  return [...new Set(values)].join(" · ");
}

export default function HotelCard({ hotel }: HotelCardProps) {
  const image = hotel.images.find(isDisplayableHotelImage);
  const location = getLocationLabel(hotel.city, hotel.area);
  const facts = [
    hotel.accommodationType,
    hotel.starRating !== undefined ? `${hotel.starRating}성급` : undefined,
  ].filter(Boolean);

  const hotelPath = `/japan/${hotel.destinationId.replace("japan-", "")}/hotels/${hotel.slug}/`;

  return (
    <article className="h-full overflow-hidden rounded-2xl border border-ct-line bg-ct-surface transition-transform duration-150 hover:-translate-y-0.5 dark:border-ct-dark-line dark:bg-ct-dark-surface">
      <a
        href={hotelPath}
        aria-label={`${hotel.name} 호텔 소개 보기`}
        className="group flex h-full flex-col active:scale-[0.95]"
      >
        {image ? (
          <div className="relative overflow-hidden">
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              image={image}
              aspectRatio="16/10"
            />
            <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white">
              {hotel.city}
            </span>
          </div>
        ) : (
          <div
            className="flex aspect-[16/10] items-center justify-center bg-ct-surface-soft px-4 text-center text-sm text-ct-muted dark:bg-ct-dark-surface-soft dark:text-ct-dark-muted"
            aria-label="호텔 이미지 없음"
          >
            호텔 이미지를 준비 중입니다.
          </div>
        )}

        <div className="flex flex-1 flex-col p-4">
          {location && (
            <p className="m-0 text-xs font-semibold text-ct-primary dark:text-ct-dark-text-soft">
              {location}
            </p>
          )}

          <h2 className="mt-2 mb-0 line-clamp-2 text-lg font-bold leading-snug tracking-tight text-ct-text dark:text-ct-dark-text">
            {hotel.name}
          </h2>

          {hotel.nameEn && (
            <p className="mt-1 mb-0 truncate text-xs text-ct-muted dark:text-ct-dark-muted">
              {hotel.nameEn}
            </p>
          )}

          {facts.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {facts.map((fact) => (
                <span
                  key={fact}
                  className="rounded-full bg-ct-surface-soft px-2.5 py-1 text-[11px] font-medium text-ct-text-soft dark:bg-ct-dark-surface-soft dark:text-ct-dark-text-soft"
                >
                  {fact}
                </span>
              ))}
            </div>
          )}

          <p className="mt-3 mb-0 line-clamp-2 text-sm leading-6 text-ct-text-soft dark:text-ct-dark-text-soft">
            {hotel.description}
          </p>

          <span className="mt-auto pt-4 text-sm font-semibold text-ct-primary dark:text-ct-dark-text-soft">
            호텔 정보 보기 →
          </span>
        </div>
      </a>
    </article>
  );
}
