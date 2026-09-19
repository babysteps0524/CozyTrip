import { Container, Section } from "../components/common";

import { DestinationCard } from "../components/destination";

import type { Destination } from "../types";

interface JapanProps {
  destinations: Destination[];
}

export default function Japan({ destinations }: JapanProps) {
  return (
    <>
      <Section>
        <Container>
          <div max-w="3xl" py="8 sm:12 lg:16">
            <p
              m="0"
              text="sm ct-primary dark:ct-dark-text-soft"
              font="medium"
              tracking="wide"
            >
              JAPAN DESTINATIONS
            </p>

            <h1
              mt="3"
              mb="0"
              text="4xl sm:5xl"
              font="bold"
              tracking="tight"
              leading="tight"
            >
              일본 여행지
            </h1>

            <p
              mt="5"
              mb="0"
              max-w="2xl"
              text="base sm:lg ct-text-soft dark:ct-dark-text-soft"
              leading="relaxed"
            >
              일본 주요 도시의 여행 정보와 호텔을 살펴보고 여행 목적에 맞는
              지역을 찾아보세요.
            </p>
          </div>
        </Container>
      </Section>

      <Section borderTop surface>
        <Container>
          <div
            flex="~ col sm:row"
            items="start sm:center"
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
                DESTINATIONS
              </p>

              <h2 mt="2" mb="0" text="2xl sm:3xl" font="bold" tracking="tight">
                주요 여행지
              </h2>

              <p mt="2" mb="0" text="sm ct-text-soft dark:ct-dark-text-soft">
                도쿄부터 오키나와까지 주요 여행지를 확인하세요.
              </p>
            </div>
          </div>

          <div mt="8" grid="~ cols-1 sm:2 lg:3" gap="4 lg:6">
            {destinations.map((destination) => (
              <DestinationCard key={destination.id} destination={destination} />
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
