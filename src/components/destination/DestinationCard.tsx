import type { Destination } from "../../types";

interface DestinationCardProps {
  destination: Destination;
}

export default function DestinationCard({ destination }: DestinationCardProps) {
  return (
    <a
      href={`/japan/${destination.slug}/`}
      display="block"
      h="full"
      overflow="hidden"
      rounded="card"
      border="~ ct-line dark:ct-dark-line"
      bg="ct-surface dark:ct-dark-surface"
      transition="transform duration-150"
      hover="shadow-card"
      un-active="scale-98"
    >
      <div
        min-h="40"
        flex="~"
        items="end"
        p="5"
        bg="ct-primary-soft dark:ct-dark-surface-soft"
      >
        <div>
          <p
            m="0"
            text="xs ct-primary dark:ct-dark-text-soft"
            font="medium"
            tracking="wide"
          >
            JAPAN
          </p>

          <h3 mt="1" mb="0" text="2xl ct-text dark:ct-dark-text" font="bold">
            {destination.name}
          </h3>

          <p mt="1" mb="0" text="sm ct-muted dark:ct-dark-muted">
            {destination.nameEn}
          </p>
        </div>
      </div>

      <div p="5">
        <p
          m="0"
          text="sm ct-text-soft dark:ct-dark-text-soft"
          leading="relaxed"
        >
          {destination.description}
        </p>

        {destination.popularAreas && destination.popularAreas.length > 0 && (
          <div mt="4" flex="~ wrap" gap="2">
            {destination.popularAreas.slice(0, 3).map((area) => (
              <span
                key={area}
                px="2.5"
                py="1"
                rounded="full"
                bg="ct-surface-soft dark:ct-dark-surface-soft"
                text="xs ct-text-soft dark:ct-dark-text-soft"
              >
                {area}
              </span>
            ))}
          </div>
        )}
      </div>
    </a>
  );
}
