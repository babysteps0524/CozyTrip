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
              href={"/japan/" + destination.slug + "/hotels/"}
              text="sm ct-primary dark:ct-dark-text"
              font="medium"
              active-scale="98"
            >
              호텔 전체 보기 →
            </a>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5 xl:grid-cols-4">
            {hotels.length > 0 ? (
              hotels
                .slice(0, 6)
                .map((hotel) => <HotelCard key={hotel.id} hotel={hotel} />)
            ) : (
              <div
                className="col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-4"
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
