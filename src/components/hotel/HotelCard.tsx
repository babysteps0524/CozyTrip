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
    <article className="group h-full overflow-hidden rounded-card border border-ct-line bg-ct-surface shadow-card transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-soft dark:border-ct-dark-line dark:bg-ct-dark-surface">
      <a href={hotelPath} className="ct-focus flex h-full flex-col" aria-label={`${hotel.name} 호텔 소개 보기`} active-scale="99">
        {image ? (
          <Image src={image.src} alt={image.alt} width={image.width} height={image.height} image={image} aspectRatio="16/10" />
        ) : (
          <div className="flex aspect-[16/10] items-center justify-center bg-ct-surface-soft text-sm text-ct-muted dark:bg-ct-dark-surface-soft dark:text-ct-dark-muted" aria-label="호텔 이미지 없음">
            호텔 이미지를 준비 중입니다.
          </div>
        )}
      <div className="flex flex-1 flex-col p-4 sm:p-5 lg:p-4">
        {location && <p className="m-0 text-xs font-semibold tracking-wide text-ct-primary dark:text-ct-dark-text-soft">{location}</p>}

        <h2 className="mt-2 mb-0 text-base font-bold leading-snug tracking-tight text-ct-text sm:text-lg dark:text-ct-dark-text">
          {hotel.name}
        </h2>

        {hotel.nameEn && <p className="mt-1 mb-0 truncate text-xs text-ct-muted sm:text-sm dark:text-ct-dark-muted">{hotel.nameEn}</p>}

        {facts.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {facts.map((fact) => (
              <span key={fact} className="rounded-full border border-ct-line bg-ct-surface-soft px-3 py-1 text-xs text-ct-text-soft dark:border-ct-dark-line dark:bg-ct-dark-surface-soft dark:text-ct-dark-text-soft">{fact}</span>
            ))}
          </div>
        )}

        <p className="mt-3 mb-0 line-clamp-2 text-sm leading-6 text-ct-text-soft dark:text-ct-dark-text-soft">{hotel.description}</p>

        <div className="mt-auto pt-4">
          <div className="flex items-center justify-between rounded-xl bg-ct-primary-soft px-4 py-2.5 text-sm font-semibold text-ct-primary transition-colors group-hover:bg-ct-primary group-hover:text-white dark:bg-ct-dark-surface-soft dark:text-ct-dark-text dark:group-hover:bg-ct-dark-line dark:group-hover:text-white">
            <span>호텔 소개 읽기</span><span aria-hidden="true">→</span>
          </div>
        </div>
      </div>
      </a>
    </article>
  );
}
