import type { Hotel } from "../../types";
import { Container } from "../common";
import HotelCard from "./HotelCard";

interface RelatedHotelsProps {
  hotels: Hotel[];
  currentHotel: Hotel;
}

export default function RelatedHotels({ hotels, currentHotel }: RelatedHotelsProps) {
  const relatedHotels = hotels
    .filter((hotel) => hotel.id !== currentHotel.id)
    .sort((a, b) => {
      const aSameArea = a.area === currentHotel.area ? 1 : 0;
      const bSameArea = b.area === currentHotel.area ? 1 : 0;

      if (aSameArea !== bSameArea) return bSameArea - aSameArea;

      const aSameType =
        currentHotel.accommodationType &&
        a.accommodationType === currentHotel.accommodationType
          ? 1
          : 0;
      const bSameType =
        currentHotel.accommodationType &&
        b.accommodationType === currentHotel.accommodationType
          ? 1
          : 0;

      if (aSameType !== bSameType) return bSameType - aSameType;

      return a.name.localeCompare(b.name);
    })
    .slice(0, 3);

  if (relatedHotels.length === 0) return null;

  return (
    <section
      aria-labelledby="related-hotels-title"
      border="t ct-line dark:ct-dark-line"
      bg="ct-surface dark:ct-dark-surface"
    >
      <Container>
        <div py="12 sm:16">
          <p m="0" text="xs ct-primary dark:ct-dark-text-soft" font="medium" tracking="wide">
            RELATED HOTELS
          </p>

          <h2
            id="related-hotels-title"
            mt="2"
            mb="0"
            text="2xl sm:3xl"
            font="bold"
            tracking="tight"
          >
            함께 살펴볼 호텔
          </h2>

          <p
            mt="3"
            mb="0"
            max-w="2xl"
            text="sm ct-text-soft dark:ct-dark-text-soft"
            leading="relaxed"
          >
            같은 지역에서 함께 비교해 볼 수 있는 호텔을 확인해 보세요.
          </p>

          <div mt="8" grid="~ cols-1 sm:2 lg:3" gap="4 lg:6">
            {relatedHotels.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
