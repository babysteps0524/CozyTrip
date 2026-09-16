import type { Destination } from "../../types";
import { Container } from "../common";

interface DestinationHeroProps {
  destination: Destination;
}

export default function DestinationHero({ destination }: DestinationHeroProps) {
  return (
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
            JAPAN · {destination.nameEn.toUpperCase()}
          </p>

          <h1
            mt="3"
            mb="0"
            text="4xl sm:5xl lg:6xl ct-text dark:ct-dark-text"
            font="bold"
            tracking="tight"
            leading="tight"
          >
            {destination.name}
          </h1>

          <p mt="2" mb="0" text="lg ct-text-soft dark:ct-dark-text-soft">
            {destination.nameEn}
          </p>

          <p
            mt="6"
            mb="0"
            max-w="2xl"
            text="base sm:lg ct-text-soft dark:ct-dark-text-soft"
            leading="relaxed"
          >
            {destination.description}
          </p>
        </div>
      </Container>
    </section>
  );
}
