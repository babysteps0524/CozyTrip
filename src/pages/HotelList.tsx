import type { Destination, Hotel } from "../types";

import { Container, Section } from "../components/common";
import { HotelCard } from "../components/hotel";

interface HotelListProps {
  destination: Destination;
  hotels: Hotel[];
}

export default function HotelList({ destination, hotels }: HotelListProps) {
  return (
    <>
      <section
        bg="ct-primary-soft dark:ct-dark-surface-soft"
        border="b ct-line dark:ct-dark-line"
      >
        <Container>
          <div py="12 sm:16 lg:20" max-w="4xl">
            <p
              m="0"
              text="xs ct-primary dark:ct-dark-text-soft"
              font="medium"
              tracking="wide"
            >
              JAPAN · {destination.nameEn.toUpperCase()} · HOTELS
            </p>

            <h1
              mt="3"
              mb="0"
              text="4xl sm:5xl lg:6xl ct-text dark:ct-dark-text"
              font="bold"
              tracking="tight"
              leading="tight"
            >
              {destination.name} 호텔
            </h1>

            <p
              mt="5"
              mb="0"
              max-w="2xl"
              text="base sm:lg ct-text-soft dark:ct-dark-text-soft"
              leading="relaxed"
            >
              {destination.name}에서 찾아볼 수 있는 호텔 정보를 살펴보세요.
            </p>
          </div>
        </Container>
      </section>

      <Section>
        <Container>
          <div
            flex="~ col sm:row"
            items="start sm:center"
            justify="between"
            gap="4"
          >
            <div>
              <p
                m="0"
                text="xs ct-primary dark:ct-dark-text-soft"
                font="medium"
                tracking="wide"
              >
                HOTELS
              </p>

              <h2 mt="2" mb="0" text="2xl sm:3xl" font="bold" tracking="tight">
                {destination.name}의 호텔
              </h2>

              <p mt="2" mb="0" text="sm ct-text-soft dark:ct-dark-text-soft">
                현재 등록된 호텔 {hotels.length}곳
              </p>
            </div>

            <a
              href={`/japan/${destination.slug}/`}
              text="sm ct-primary dark:ct-dark-text"
              font="medium"
              un-active="scale-0.95"
            >
              {destination.name} 여행지 보기 →
            </a>
          </div>

          {hotels.length > 0 ? (
            <div mt="8" grid="~ cols-1 sm:2 lg:3" gap="4 lg:6">
              {hotels.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} />
              ))}
            </div>
          ) : (
            <div
              mt="8"
              rounded="card"
              border="~ ct-line dark:ct-dark-line"
              bg="ct-surface dark:ct-dark-surface"
              px="6"
              py="12"
              text="center"
            >
              <p m="0" text="base ct-text dark:ct-dark-text" font="medium">
                아직 등록된 호텔이 없습니다.
              </p>

              <p mt="2" mb="0" text="sm ct-muted dark:ct-dark-muted">
                새로운 호텔 정보를 준비하고 있습니다.
              </p>
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}
