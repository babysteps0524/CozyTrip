import type { Hotel } from "../../types";
import { Container } from "../common";

interface HotelLocationProps {
  hotel: Hotel;
}

export default function HotelLocation({ hotel }: HotelLocationProps) {
  const { location } = hotel;

  return (
    <section
      border="t ct-line dark:ct-dark-line"
      bg="ct-surface-soft dark:ct-dark-surface-soft"
    >
      <Container>
        <div py="12 sm:16">
          <p
            m="0"
            text="xs ct-primary dark:ct-dark-text-soft"
            font="medium"
            tracking="wide"
          >
            LOCATION
          </p>

          <h2 mt="2" mb="0" text="2xl sm:3xl" font="bold" tracking="tight">
            위치 정보
          </h2>

          <div mt="8" grid="~ cols-1 lg:2" gap="6 lg:10">
            <div
              rounded="card"
              border="~ ct-line dark:ct-dark-line"
              bg="ct-surface dark:ct-dark-surface"
              p="6"
            >
              <p m="0" text="sm ct-muted dark:ct-dark-muted">
                지역
              </p>

              <p mt="2" mb="0" text="lg ct-text dark:ct-dark-text" font="bold">
                {location.country} · {location.prefecture} · {location.city}
              </p>

              <p mt="1" mb="0" text="sm ct-text-soft dark:ct-dark-text-soft">
                {location.area}
              </p>

              {location.address && (
                <div mt="6">
                  <p m="0" text="sm ct-muted dark:ct-dark-muted">
                    주소
                  </p>

                  <p mt="1" mb="0" text="sm ct-text dark:ct-dark-text">
                    {location.address}
                  </p>
                </div>
              )}
            </div>

            <div
              rounded="card"
              border="~ ct-line dark:ct-dark-line"
              bg="ct-surface dark:ct-dark-surface"
              p="6"
            >
              <p m="0" text="sm ct-muted dark:ct-dark-muted">
                가까운 역
              </p>

              {location.nearestStations &&
              location.nearestStations.length > 0 ? (
                <ul
                  mt="3"
                  mb="0"
                  pl="5"
                  text="sm ct-text dark:ct-dark-text"
                  leading="relaxed"
                >
                  {location.nearestStations.map((station) => (
                    <li key={station}>{station}</li>
                  ))}
                </ul>
              ) : (
                <p mt="3" mb="0" text="sm ct-muted dark:ct-dark-muted">
                  등록된 역 정보가 없습니다.
                </p>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
