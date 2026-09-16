import type { Hotel } from "../../types";
import { Container } from "../common";

interface HotelSummaryProps {
  hotel: Hotel;
}

export default function HotelSummary({ hotel }: HotelSummaryProps) {
  return (
    <section border="b ct-line dark:ct-dark-line">
      <Container>
        <div py="10 sm:12 lg:16" grid="~ cols-1 lg:3" gap="8 lg:12">
          <div col="span-1 lg:span-2">
            <p m="0" text="sm ct-primary dark:ct-dark-text-soft" font="medium">
              {hotel.city} · {hotel.area}
            </p>

            <h1
              mt="2"
              mb="0"
              text="3xl sm:4xl lg:5xl"
              font="bold"
              tracking="tight"
              leading="tight"
            >
              {hotel.name}
            </h1>

            {hotel.nameEn && (
              <p mt="2" mb="0" text="base ct-muted dark:ct-dark-muted">
                {hotel.nameEn}
              </p>
            )}

            <p
              mt="6"
              mb="0"
              max-w="3xl"
              text="base sm:lg ct-text-soft dark:ct-dark-text-soft"
              leading="relaxed"
            >
              {hotel.description}
            </p>
          </div>

          <div
            rounded="card"
            border="~ ct-line dark:ct-dark-line"
            bg="ct-surface-soft dark:ct-dark-surface-soft"
            p="5"
          >
            <p
              m="0"
              text="xs ct-primary dark:ct-dark-text-soft"
              font="medium"
              tracking="wide"
            >
              LOCATION
            </p>

            <p mt="3" mb="0" text="sm ct-text dark:ct-dark-text" font="medium">
              {hotel.location.city} · {hotel.location.area}
            </p>

            {hotel.location.nearestStations &&
              hotel.location.nearestStations.length > 0 && (
                <div mt="4">
                  <p m="0" text="xs ct-muted dark:ct-dark-muted">
                    가까운 역
                  </p>

                  <ul
                    mt="2"
                    mb="0"
                    pl="5"
                    text="sm ct-text-soft dark:ct-dark-text-soft"
                  >
                    {hotel.location.nearestStations.map((station) => (
                      <li key={station}>{station}</li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        </div>
      </Container>
    </section>
  );
}
