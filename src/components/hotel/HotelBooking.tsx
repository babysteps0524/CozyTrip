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
      return (
        url.protocol === "https:" &&
        url.pathname !== "/" &&
        url.pathname !== ""
      );
    } catch {
      return false;
    }
  });

  const hasMyRealTripLink = affiliateLinks.some(
    (link) => link.provider === "myrealtrip",
  );

  return (
    <section id="booking" scroll-mt="24" border="t ct-line dark:ct-dark-line">
      <Container>
        <div py="12 sm:16">
          <div
            rounded="card"
            border="~ ct-line dark:ct-dark-line"
            bg="ct-primary-soft dark:bg-ct-dark-surface-soft"
            p="6 sm:8"
          >
            <p m="0" text="xs ct-primary dark:ct-dark-text-soft" font="medium" tracking="wide">
              BOOKING INFO
            </p>

            <div mt="2" flex="~ col sm:row" sm="items-end justify-between" gap="3">
              <div>
                <h2 m="0" text="2xl sm:3xl" font="bold" tracking="tight">
                  예약 플랫폼에서 확인하기
                </h2>
                <p mt="3" mb="0" max-w="2xl" text="sm ct-text-soft dark:ct-dark-text-soft" leading="relaxed">
                  CozyTrip는 예약을 직접 처리하지 않습니다. 아래 외부 플랫폼에서 최신 요금과 객실 조건을 확인할 수 있습니다.
                </p>
              </div>
            </div>

            <AffiliateDisclosure show={hasMyRealTripLink} />

            {affiliateLinks.length > 0 ? (
              <>
                <div mt="6" grid="~ cols-1 sm:2 lg:3" gap="3">
                  {affiliateLinks.map((affiliateLink) => {
                    const providerConfig = getAffiliateProviderConfig(affiliateLink.provider);
                    const label = affiliateLink.label || providerConfig.defaultLabel;

                    return (
                      <a
                        key={affiliateLink.provider + "-" + affiliateLink.url}
                        href={affiliateLink.url}
                        target="_blank"
                        rel={affiliateLink.rel ?? "sponsored nofollow"}
                        aria-label={label + " - 외부 예약 사이트로 이동"}
                        min-h="30"
                        flex="~"
                        items="center"
                        justify="between"
                        gap="4"
                        rounded="xl"
                        border="~ ct-line dark:ct-dark-line"
                        bg="ct-surface dark:bg-ct-dark-surface"
                        px="5"
                        py="4"
                        text="ct-text dark:ct-dark-text"
                        hover="bg-ct-surface-soft dark:bg-ct-dark-surface-soft"
                        active-scale="98"
                      >
                        <span min-w="0">
                          <span display="block" text="base" font="bold">{label}</span>
                          <span mt="1" display="block" text="sm ct-text-soft dark:ct-dark-text-soft">
                            {affiliateLink.description || providerConfig.description}
                          </span>
                        </span>
                        <span shrink="0" text="sm ct-primary dark:ct-dark-text-soft" font="bold" aria-hidden="true">
                          사이트에서 확인 →
                        </span>
                      </a>
                    );
                  })}
                </div>

                <div mt="5" flex="~ col sm:row" items="start" gap="2" text="xs ct-muted dark:ct-dark-muted" leading="relaxed">
                  <span shrink="0" rounded="full" bg="ct-surface dark:bg-ct-dark-surface" px="2" py="1" font="medium">
                    안내
                  </span>
                  <p m="0">
                    위 링크는 외부 예약 사이트로 연결됩니다. 실제 요금, 객실 재고, 예약 가능 여부와 조건은 이동한 예약 사이트에서 확인해 주세요.
                  </p>
                </div>
              </>
            ) : (
              <div mt="6" rounded="xl" bg="ct-surface dark:bg-ct-dark-surface" px="4" py="4">
                <p m="0" text="sm ct-muted dark:ct-dark-muted">현재 연결된 외부 예약 플랫폼이 없습니다.</p>
              </div>
            )}

            <p mt="5" mb="0" text="xs ct-muted dark:ct-dark-muted" leading="relaxed">
              CozyTrip는 예약 플랫폼의 요금이나 객실 재고를 직접 제공하지 않습니다. 예약 전 최종 정보를 해당 예약 사이트에서 확인해 주세요.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}