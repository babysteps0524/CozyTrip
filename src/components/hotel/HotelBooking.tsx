import type { Hotel } from "../../types";

import { getAffiliateProviderConfig } from "../../lib/affiliate";
import { Container } from "../common";

interface HotelBookingProps {
  hotel: Hotel;
}

export default function HotelBooking({ hotel }: HotelBookingProps) {
  const affiliateLinks = hotel.affiliateLinks ?? [];

  return (
    <section border="t ct-line dark:ct-dark-line">
      <Container>
        <div py="12 sm:16">
          <div
            rounded="card"
            border="~ ct-line dark:ct-dark-line"
            bg="ct-primary-soft dark:bg-ct-dark-surface-soft"
            p="6 sm:8"
          >
            <p
              m="0"
              text="xs ct-primary dark:ct-dark-text-soft"
              font="medium"
              tracking="wide"
            >
              BOOKING
            </p>

            <h2 mt="2" mb="0" text="2xl sm:3xl" font="bold" tracking="tight">
              {hotel.name} 예약 정보
            </h2>

            <p
              mt="3"
              mb="0"
              max-w="2xl"
              text="sm ct-text-soft dark:ct-dark-text-soft"
              leading="relaxed"
            >
              숙박 요금과 예약 가능 여부는 예약 플랫폼에서 확인해 주세요.
            </p>

            {affiliateLinks.length > 0 ? (
              <div mt="6" grid="~ cols-1 sm:2" gap="3">
                {affiliateLinks.map((affiliateLink) => {
                  const providerConfig = getAffiliateProviderConfig(
                    affiliateLink.provider,
                  );

                  return (
                    <a
                      key={affiliateLink.provider}
                      href={affiliateLink.url}
                      target="_blank"
                      rel={affiliateLink.rel ?? "sponsored nofollow"}
                      min-h="28"
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
                      active="scale-0.95"
                    >
                      <span min-w="0">
                        <span block text="base" font="bold">
                          {affiliateLink.label || providerConfig.name}
                        </span>

                        <span
                          mt="1"
                          block
                          text="sm ct-text-soft dark:ct-dark-text-soft"
                        >
                          {affiliateLink.description || providerConfig.description}
                        </span>
                      </span>

                      <span
                        shrink="0"
                        text="sm ct-primary dark:ct-dark-text-soft"
                        font="bold"
                      >
                        가격 확인 →
                      </span>
                    </a>
                  );
                })}
              </div>
            ) : (
              <p
                mt="6"
                mb="0"
                rounded="xl"
                bg="ct-surface dark:bg-ct-dark-surface"
                px="4"
                py="4"
                text="sm ct-muted dark:ct-dark-muted"
              >
                현재 연결된 예약 플랫폼이 없습니다.
              </p>
            )}

            <p
              mt="5"
              mb="0"
              text="xs ct-muted dark:ct-dark-muted"
              leading="relaxed"
            >
              예약 플랫폼으로 이동하면 해당 사이트에서 최신 요금과 예약 조건을
              확인할 수 있습니다.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
