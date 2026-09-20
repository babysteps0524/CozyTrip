import type { Hotel } from "../../types";
import { Container } from "../common";

interface HotelSummaryProps {
  hotel: Hotel;
}

function formatRating(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function getLocationLabel(city?: string, area?: string): string {
  const values = [city?.trim(), area?.trim()].filter(Boolean) as string[];
  return [...new Set(values)].join(" · ");
}

export default function HotelSummary({ hotel }: HotelSummaryProps) {
  const dataSourceLabel =
    hotel.dataSource === "myrealtrip"
      ? "마이리얼트립 숙소 검색 API"
      : hotel.dataSource === "agoda"
        ? "Agoda 숙소 데이터"
        : hotel.dataSource === "manual"
          ? "CozyTrip 수동 입력"
          : undefined;

  const dataFetchedLabel = hotel.dataFetchedAt
    ? new Date(hotel.dataFetchedAt).toLocaleDateString("ko-KR")
    : undefined;

  const locationLabel = getLocationLabel(hotel.location.city, hotel.location.area);

  const facts = [
    hotel.accommodationType ? ["숙소 유형", hotel.accommodationType] : undefined,
    hotel.starRating !== undefined && hotel.starRating > 0
      ? ["등급", `${hotel.starRating}성급`]
      : undefined,
    hotel.location.nearestStations?.length
      ? ["가까운 역", hotel.location.nearestStations.slice(0, 2).join(" · ")]
      : undefined,
    hotel.checkIn || hotel.checkOut
      ? ["체크인 · 체크아웃", [hotel.checkIn, hotel.checkOut].filter(Boolean).join(" · ")]
      : undefined,
  ].filter((item): item is [string, string] => Boolean(item));

  return (
    <section className="border-b border-ct-line dark:border-ct-dark-line">
      <Container>
        <div className="grid grid-cols-1 gap-7 py-8 sm:gap-8 sm:py-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12 lg:py-16">
          <div>
            {locationLabel && (
              <p className="m-0 text-xs font-semibold text-ct-primary sm:text-sm dark:text-ct-dark-text-soft">
                {locationLabel}
              </p>
            )}

            <h1 className="mt-2 mb-0 max-w-4xl text-[2rem] font-bold leading-[1.15] tracking-tight sm:text-4xl lg:text-5xl">
              {hotel.name}
            </h1>

            {hotel.nameEn && (
              <p className="mt-2 mb-0 text-sm text-ct-muted sm:text-base dark:text-ct-dark-muted">
                {hotel.nameEn}
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-1.5 sm:mt-5 sm:gap-2">
              {hotel.accommodationType && (
                <span className="rounded-full bg-ct-surface-soft px-3 py-1.5 text-xs text-ct-text-soft dark:bg-ct-dark-surface-soft dark:text-ct-dark-text-soft">
                  {hotel.accommodationType}
                </span>
              )}
              {hotel.starRating !== undefined && hotel.starRating > 0 && (
                <span className="rounded-full bg-ct-surface-soft px-3 py-1.5 text-xs text-ct-text-soft dark:bg-ct-dark-surface-soft dark:text-ct-dark-text-soft">
                  {hotel.starRating}성급
                </span>
              )}
              {hotel.ratingAverage !== undefined && (
                <span className="rounded-full bg-ct-primary-soft px-3 py-1.5 text-xs font-medium text-ct-text dark:bg-ct-dark-surface-soft dark:text-ct-dark-text">
                  평점 {formatRating(hotel.ratingAverage)}
                  {hotel.numberOfReviews !== undefined
                    ? ` · 리뷰 ${hotel.numberOfReviews.toLocaleString("ko-KR")}개`
                    : ""}
                </span>
              )}
            </div>

            {dataSourceLabel && (
              <p className="mt-3 mb-0 text-[11px] leading-5 text-ct-muted sm:text-xs dark:text-ct-dark-muted">
                데이터 출처: {dataSourceLabel}
                {dataFetchedLabel ? ` · 조회 기준일 ${dataFetchedLabel}` : ""}
              </p>
            )}

            <p className="mt-5 mb-0 max-w-3xl text-[15px] leading-7 text-ct-text-soft sm:mt-6 sm:text-lg sm:leading-8 dark:text-ct-dark-text-soft">
              {hotel.description}
            </p>
          </div>

          <aside className="h-fit rounded-card border border-ct-line bg-ct-surface-soft p-4 sm:p-6 dark:border-ct-dark-line dark:bg-ct-dark-surface-soft">
            <p className="m-0 text-xs font-semibold tracking-wide text-ct-primary dark:text-ct-dark-text-soft">
              AT A GLANCE
            </p>
            <h2 className="mt-2 mb-0 text-lg font-bold tracking-tight sm:text-xl">
              호텔 핵심 정보
            </h2>

            <dl className="mt-4 divide-y divide-ct-line dark:divide-ct-dark-line sm:mt-5">
              {locationLabel && (
                <div className="py-3 first:pt-0">
                  <dt className="text-xs text-ct-muted dark:text-ct-dark-muted">위치</dt>
                  <dd className="mt-1 text-sm font-medium text-ct-text dark:text-ct-dark-text">
                    {locationLabel}
                  </dd>
                </div>
              )}
              {facts.map(([label, value]) => (
                <div key={label} className="py-3 last:pb-0">
                  <dt className="text-xs text-ct-muted dark:text-ct-dark-muted">{label}</dt>
                  <dd className="mt-1 text-sm font-medium leading-relaxed text-ct-text-soft dark:text-ct-dark-text-soft">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </Container>
    </section>
  );
}
