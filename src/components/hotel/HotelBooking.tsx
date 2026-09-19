import type { Hotel } from "../../types";
import { getAffiliateProviderConfig } from "../../lib/affiliate";
import { Container } from "../common";
import AffiliateDisclosure from "./AffiliateDisclosure";

interface HotelBookingProps {
  hotel: Hotel;
}

export default function HotelBooking({ hotel }: HotelBookingProps) {
  const affiliateLinks = (hotel.affiliateLinks ?? []).filter((link) => {
    try {
      const url = new URL(link.url);
      return url.protocol === "https:" && url.pathname !== "/" && url.pathname !== "";
    } catch {
      return false;
    }
  });

  const hasMyRealTripLink = affiliateLinks.some((link) => link.provider === "myrealtrip");

  return (
    <section id="booking" className="scroll-mt-24 border-t border-ct-line dark:border-ct-dark-line">
      <Container>
        <div className="py-12 sm:py-16">
          <div className="overflow-hidden rounded-card border border-ct-line bg-ct-primary-soft dark:border-ct-dark-line dark:bg-ct-dark-surface-soft">
            <div className="p-6 sm:p-8">
              <p className="m-0 text-xs font-semibold tracking-wide text-ct-primary dark:text-ct-dark-text-soft">
                BOOKING INFO
              </p>
              <h2 className="mt-2 mb-0 text-2xl font-bold tracking-tight sm:text-3xl">
                이 호텔의 예약 정보 확인하기
              </h2>
              <p className="mt-3 mb-0 max-w-2xl text-sm leading-7 text-ct-text-soft dark:text-ct-dark-text-soft">
                객실 요금과 예약 가능 여부는 예약 플랫폼에서 날짜와 조건을 입력해 확인할 수 있습니다.
              </p>

              <AffiliateDisclosure show={hasMyRealTripLink} />

              {affiliateLinks.length > 0 ? (
                <>
                  <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {affiliateLinks.map((affiliateLink) => {
                      const config = getAffiliateProviderConfig(affiliateLink.provider);
                      const label = affiliateLink.label || config.defaultLabel;

                      return (
                        <a
                          key={affiliateLink.provider + "-" + affiliateLink.url}
                          href={affiliateLink.url}
                          target="_blank"
                          rel={affiliateLink.rel ?? "sponsored nofollow"}
                          aria-label={label + " - 외부 예약 사이트에서 확인"}
                          className="ct-focus flex min-h-30 items-center justify-between gap-4 rounded-2xl border border-ct-line bg-ct-surface px-5 py-4 text-ct-text shadow-card transition-transform duration-150 hover:-translate-y-0.5 hover:bg-ct-surface-soft dark:border-ct-dark-line dark:bg-ct-dark-surface dark:text-ct-dark-text dark:hover:bg-ct-dark-surface-soft"
                          active-scale="98"
                        >
                          <span className="min-w-0">
                            <span className="block text-base font-bold">{label}</span>
                            <span className="mt-1 block text-sm leading-6 text-ct-text-soft dark:text-ct-dark-text-soft">
                              {affiliateLink.description || config.description}
                            </span>
                          </span>
                          <span className="shrink-0 text-sm font-bold text-ct-primary dark:text-ct-dark-text-soft" aria-hidden="true">
                            확인 →
                          </span>
                        </a>
                      );
                    })}
                  </div>

                  <div className="mt-5 rounded-xl bg-ct-surface px-4 py-3 dark:bg-ct-dark-surface">
                    <p className="m-0 text-xs leading-6 text-ct-muted dark:text-ct-dark-muted">
                      실제 요금, 객실 재고, 예약 가능 여부와 세부 조건은 선택한 예약 플랫폼에서 확인해 주세요.
                    </p>
                  </div>
                </>
              ) : (
                <div className="mt-6 rounded-xl bg-ct-surface px-4 py-4 dark:bg-ct-dark-surface">
                  <p className="m-0 text-sm text-ct-muted dark:text-ct-dark-muted">
                    현재 연결된 외부 예약 플랫폼이 없습니다.
                  </p>
                </div>
              )}
            </div>

            <div className="border-t border-ct-line bg-ct-surface/70 px-6 py-4 dark:border-ct-dark-line dark:bg-ct-dark-surface/70 sm:px-8">
              <p className="m-0 text-xs leading-6 text-ct-muted dark:text-ct-dark-muted">
                CozyTrip는 예약을 직접 처리하지 않습니다. 예약 전 최종 요금과 조건은 외부 예약 사이트에서 확인해 주세요.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
