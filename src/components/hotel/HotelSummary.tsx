import type { Hotel } from "../../types";
import { Container } from "../common";

interface HotelSummaryProps { hotel: Hotel; }

function formatRating(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export default function HotelSummary({ hotel }: HotelSummaryProps) {
  const dataSourceLabel =
    hotel.dataSource === "myrealtrip" ? "마이리얼트립 숙소 검색 API" :
    hotel.dataSource === "agoda" ? "Agoda 숙소 데이터" :
    hotel.dataSource === "manual" ? "CozyTrip 수동 입력" : undefined;

  const dataFetchedLabel = hotel.dataFetchedAt
    ? new Date(hotel.dataFetchedAt).toLocaleDateString("ko-KR")
    : undefined;

  const facts = [
    hotel.accommodationType ? ["숙소 유형", hotel.accommodationType] : undefined,
    hotel.starRating !== undefined && hotel.starRating > 0 ? ["등급", `${hotel.starRating}성급`] : undefined,
    hotel.location.nearestStations?.length ? ["가까운 역", hotel.location.nearestStations.slice(0, 2).join(" · ")] : undefined,
    hotel.checkIn || hotel.checkOut ? ["체크인 · 체크아웃", [hotel.checkIn, hotel.checkOut].filter(Boolean).join(" · ")] : undefined,
  ].filter((item): item is [string, string] => Boolean(item));

  return (
    <section className="border-b border-ct-line dark:border-ct-dark-line">
      <Container>
        <div className="grid grid-cols-1 gap-8 py-10 sm:py-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12 lg:py-16">
          <div>
            <p className="m-0 text-sm font-semibold text-ct-primary dark:text-ct-dark-text-soft">
              {hotel.city} · {hotel.area}
            </p>

            <h1 className="mt-2 mb-0 max-w-4xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              {hotel.name}
            </h1>

            {hotel.nameEn && (
              <p className="mt-2 mb-0 text-base text-ct-muted dark:text-ct-dark-muted">{hotel.nameEn}</p>
            )}

            <div className="mt-5 flex flex-wrap gap-2">
              {hotel.accommodationType && <span className="rounded-full bg-ct-surface-soft px-3 py-1.5 text-xs text-ct-text-soft dark:bg-ct-dark-surface-soft dark:text-ct-dark-text-soft">{hotel.accommodationType}</span>}
              {hotel.starRating !== undefined && hotel.starRating > 0 && <span className="rounded-full bg-ct-surface-soft px-3 py-1.5 text-xs text-ct-text-soft dark:bg-ct-dark-surface-soft dark:text-ct-dark-text-soft">{hotel.starRating}성급</span>}
              {hotel.ratingAverage !== undefined && (
                <span className="rounded-full bg-ct-primary-soft px-3 py-1.5 text-xs font-medium text-ct-text dark:bg-ct-dark-surface-soft dark:text-ct-dark-text">
                  평점 {formatRating(hotel.ratingAverage)}
                  {hotel.numberOfReviews !== undefined ? ` · 리뷰 ${hotel.numberOfReviews.toLocaleString("ko-KR")}개` : ""}
                </span>
              )}
            </div>

            {dataSourceLabel && (
              <p className="mt-3 mb-0 text-xs text-ct-muted dark:text-ct-dark-muted">
                데이터 출처: {dataSourceLabel}{dataFetchedLabel ? ` · 조회 기준일 ${dataFetchedLabel}` : ""}
              </p>
            )}

            <p className="mt-6 mb-0 max-w-3xl text-base leading-8 text-ct-text-soft sm:text-lg dark:text-ct-dark-text-soft">
              {hotel.description}
            </p>
          </div>

          <aside className="h-fit rounded-card border border-ct-line bg-ct-surface-soft p-5 sm:p-6 dark:border-ct-dark-line dark:bg-ct-dark-surface-soft">
            <p className="m-0 text-xs font-semibold tracking-wide text-ct-primary dark:text-ct-dark-text-soft">AT A GLANCE</p>
            <h2 className="mt-2 mb-0 text-xl font-bold tracking-tight">호텔 핵심 정보</h2>

            <dl className="mt-5 divide-y divide-ct-line dark:divide-ct-dark-line">
              <div className="py-3 first:pt-0">
                <dt className="text-xs text-ct-muted dark:text-ct-dark-muted">위치</dt>
                <dd className="mt-1 text-sm font-medium text-ct-text dark:text-ct-dark-text">{hotel.location.city} · {hotel.location.area}</dd>
              </div>
              {facts.map(([label, value]) => (
                <div key={label} className="py-3 last:pb-0">
                  <dt className="text-xs text-ct-muted dark:text-ct-dark-muted">{label}</dt>
                  <dd className="mt-1 text-sm font-medium leading-relaxed text-ct-text-soft dark:text-ct-dark-text-soft">{value}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </Container>
    </section>
  );
}
