import type { Destination as DestinationType, Hotel } from "../types";

import { Container, Section } from "../components/common";
import { DestinationHotels } from "../components/destination";

interface DestinationProps {
  destination: DestinationType;
  hotels: Hotel[];
  posts: import("../types").Post[];
}

export default function Destination({
  destination,
  hotels,
}: DestinationProps) {
  return (
    <>
      <section className="border-b border-ct-line dark:border-ct-dark-line">
        <Container>
          <div className="max-w-3xl py-12 sm:py-16">
            <p className="m-0 text-xs font-semibold tracking-[0.16em] text-ct-primary dark:text-ct-dark-text-soft">
              COZYTRIP · {destination.nameEn.toUpperCase()} HOTELS
            </p>
            <h1 className="mt-3 mb-0 text-3xl font-bold tracking-tight sm:text-5xl">
              {destination.name} 호텔
            </h1>
            <p className="mt-4 mb-0 max-w-2xl text-sm leading-7 text-ct-text-soft sm:text-base dark:text-ct-dark-text-soft">
              {destination.name}에서 찾을 수 있는 호텔을 확인해보세요.
              호텔별 상세 정보와 객실, 시설, 위치 정보를 살펴볼 수 있습니다.
            </p>
            <a
              href={"/japan/" + destination.slug + "/hotels/"}
              mt="6"
              inline-flex="~"
              items="center"
              rounded="lg"
              bg="ct-primary"
              px="4"
              py="3"
              text="sm white"
              font="semibold"
              hover="bg-ct-primary-dark"
              active-scale="95"
              className="ct-focus"
            >
              {destination.name} 호텔 전체 보기
            </a>
          </div>
        </Container>
      </section>

      <Section>
        <Container>
          <div flex="~ col sm:row" items="start sm:end" justify="between" gap="4">
            <div>
              <h2 m="0" text="2xl sm:3xl" font="bold" tracking="tight">
                {destination.name} 호텔 소개
              </h2>
              <p mt="2" mb="0" text="sm ct-text-soft dark:ct-dark-text-soft">
                현재 등록된 호텔 {hotels.length}곳
              </p>
            </div>
            <a
              href={"/japan/" + destination.slug + "/hotels/"}
              text="sm ct-primary dark:ct-dark-text"
              font="semibold"
              active-scale="98"
            >
              전체 호텔 보기 →
            </a>
          </div>

          <div mt="6">
            <DestinationHotels destination={destination} hotels={hotels.slice(0, 6)} />
          </div>
        </Container>
      </Section>
    </>
  );
}
