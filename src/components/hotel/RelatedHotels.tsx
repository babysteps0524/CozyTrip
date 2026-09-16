import type { Hotel } from "../../types";
import { Container } from "../common";
import HotelCard from "./HotelCard";

interface RelatedHotelsProps {
  hotels: Hotel[];
  currentHotelId: string;
}

export default function RelatedHotels({
  hotels,
  currentHotelId,
}: RelatedHotelsProps) {
  const relatedHotels = hotels
    .filter((hotel) => hotel.id !== currentHotelId)
    .slice(0, 3);

  if (relatedHotels.length === 0) {
    return null;
  }

  return (
    <section
      border="t ct-line dark:ct-dark-line"
      bg="ct-surface dark:ct-dark-surface"
    >
      <Container>
        <div py="12 sm:16">
          <p
            m="0"
            text="xs ct-primary dark:ct-dark-text-soft"
            font="medium"
            tracking="wide"
          >
            RELATED HOTELS
          </p>

          <h2 mt="2" mb="0" text="2xl sm:3xl" font="bold" tracking="tight">
            함께 살펴볼 호텔
          </h2>

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
