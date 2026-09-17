import type { Hotel } from "../../types";
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
              호텔 예약 정보
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
              <div mt="6" flex="~ wrap" gap="3">
                {affiliateLinks.map((affiliateLink) => (
                  <a
                    key={affiliateLink.provider}
                    href={affiliateLink.url}
                    target="_blank"
                    rel={affiliateLink.rel ?? "sponsored"}
                    className="ct-button"
                    bg="ct-primary"
                    text="white"
                    hover="bg-ct-primary-dark"
                    un-active="scale-0.95"
                  >
                    {affiliateLink.label}
                  </a>
                ))}
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
          </div>
        </div>
      </Container>
    </section>
  );
}
