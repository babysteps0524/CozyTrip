import type { Hotel } from "../../types";
import { Container } from "../common";

interface HotelFacilitiesProps {
  hotel: Hotel;
}

export default function HotelFacilities({ hotel }: HotelFacilitiesProps) {
  const facilities = hotel.facilities ?? [];

  if (facilities.length === 0) {
    return null;
  }

  return (
    <section border="t ct-line dark:ct-dark-line">
      <Container>
        <div py="12 sm:16">
          <p
            m="0"
            text="xs ct-primary dark:ct-dark-text-soft"
            font="medium"
            tracking="wide"
          >
            FACILITIES
          </p>

          <h2 mt="2" mb="0" text="2xl sm:3xl" font="bold" tracking="tight">
            주요 시설
          </h2>

          <div mt="8" grid="~ cols-1 sm:2 lg:3" gap="4">
            {facilities.map((facility) => (
              <div
                key={facility.name}
                rounded="xl"
                border="~ ct-line dark:ct-dark-line"
                bg="ct-surface dark:ct-dark-surface"
                p="5"
              >
                <h3 m="0" text="base ct-text dark:ct-dark-text" font="bold">
                  {facility.name}
                </h3>

                {facility.description && (
                  <p
                    mt="2"
                    mb="0"
                    text="sm ct-text-soft dark:ct-dark-text-soft"
                    leading="relaxed"
                  >
                    {facility.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
