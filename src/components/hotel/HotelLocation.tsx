import type { Hotel } from "../../types";
import { Container } from "../common";

interface HotelLocationProps {
  hotel: Hotel;
}

function getMapUrl(latitude?: number, longitude?: number, address?: string): string | null {
  if (latitude !== undefined && longitude !== undefined) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${latitude},${longitude}`)}`;
  }

  if (address?.trim()) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  }

  return null;
}

export default function HotelLocation({ hotel }: HotelLocationProps) {
  const { location } = hotel;
  const mapUrl = getMapUrl(location.latitude, location.longitude, location.address);

  return (
    <section
      id="location"
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

                  <p mt="1" mb="0" text="sm ct-text dark:ct-dark-text" leading="relaxed">
                    {location.address}
                  </p>
                </div>
              )}

              {mapUrl && (
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  mt="6"
                  display="inline-flex"
                  items="center"
                  justify="center"
                  min-h="11"
                  rounded="xl"
                  bg="ct-text dark:bg-ct-dark-text"
                  px="5"
                  py="3"
                  text="sm ct-surface dark:text-ct-dark-bg"
                  font="bold"
                  hover="opacity-85"
                  active-scale="98"
                >
                  지도에서 위치 확인
                </a>
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

              {location.nearestStations && location.nearestStations.length > 0 ? (
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

              <p mt="6" mb="0" text="xs ct-muted dark:ct-dark-muted" leading="relaxed">
                역과 이동 정보는 실제 예약 전 최신 안내를 함께 확인해 주세요.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
