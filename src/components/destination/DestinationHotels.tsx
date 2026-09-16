import type { Destination, Hotel } from "../../types";

import { Container } from "../common";
import { HotelCard } from "../hotel";

interface DestinationHotelsProps {
  destination: Destination;
  hotels: Hotel[];
}

export default function DestinationHotels({
  destination,
  hotels,
}: DestinationHotelsProps) {
  return (
    <section>
      <Container>
        <div py="12 sm:16 lg:20">
          <div
            flex="~ col sm:row"
            items="start sm:end"
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
                {destination.name} 호텔
              </h2>

              <p mt="2" mb="0" text="sm ct-text-soft dark:ct-dark-text-soft">
                {destination.name}에서 찾아볼 수 있는 호텔을 확인해보세요.
              </p>
            </div>

            <a
              href={`/japan/${destination.slug}/hotels/`}
              text="sm ct-primary dark:ct-dark-text"
              font="medium"
              un-active="scale-0.95"
            >
              호텔 전체 보기 →
            </a>
          </div>

          <div mt="8" grid="~ cols-1 sm:2 lg:3" gap="4 lg:6">
            {hotels.length > 0 ? (
              hotels
                .slice(0, 6)
                .map((hotel) => <HotelCard key={hotel.id} hotel={hotel} />)
            ) : (
              <div
                col="span-1 sm:span-2 lg:span-3"
                rounded="card"
                border="~ ct-line dark:ct-dark-line"
                bg="ct-surface dark:ct-dark-surface"
                p="8"
                text="center ct-muted dark:ct-dark-muted"
              >
                {destination.name}의 호텔 정보를 준비하고 있습니다.
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
