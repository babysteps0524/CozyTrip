import type { Destination as DestinationType } from "../types";

import { getHotelsByDestination, getPostsByDestination } from "../data";

import { Container, Section } from "../components/common";
import { DestinationHero } from "../components/destination";
import { DestinationHotels } from "../components/destination";
import { PostCard } from "../components/post";

interface DestinationProps {
  destination: DestinationType;
}

export default function Destination({ destination }: DestinationProps) {
  const hotels = getHotelsByDestination(destination.id);

  const posts = getPostsByDestination(destination.id);

  return (
    <>
      <DestinationHero destination={destination} />

      <Section>
        <Container>
          <div grid="~ cols-1 lg:2" gap="10 lg:16">
            <div>
              <p
                m="0"
                text="xs ct-primary dark:ct-dark-text-soft"
                font="medium"
                tracking="wide"
              >
                POPULAR AREAS
              </p>

              <h2 mt="2" mb="0" text="2xl sm:3xl" font="bold" tracking="tight">
                인기 지역
              </h2>

              <p
                mt="3"
                mb="0"
                text="sm ct-text-soft dark:ct-dark-text-soft"
                leading="relaxed"
              >
                {destination.name}에서 숙박 지역을 선택할 때 참고할 수 있는 주요
                지역입니다.
              </p>

              <div mt="6" grid="~ cols-2" gap="3">
                {(destination.popularAreas ?? []).map((area) => (
                  <div
                    key={area}
                    min-h="16"
                    flex="~"
                    items="center"
                    rounded="xl"
                    border="~ ct-line dark:ct-dark-line"
                    bg="ct-surface dark:ct-dark-surface"
                    px="4"
                    py="3"
                    text="sm ct-text dark:ct-dark-text"
                  >
                    {area}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p
                m="0"
                text="xs ct-primary dark:ct-dark-text-soft"
                font="medium"
                tracking="wide"
              >
                ATTRACTIONS
              </p>

              <h2 mt="2" mb="0" text="2xl sm:3xl" font="bold" tracking="tight">
                주요 관광지
              </h2>

              <p
                mt="3"
                mb="0"
                text="sm ct-text-soft dark:ct-dark-text-soft"
                leading="relaxed"
              >
                여행 일정을 계획할 때 참고할 수 있는 주요 관광지를 확인해보세요.
              </p>

              <div mt="6" flex="~ wrap" gap="2">
                {(destination.popularAttractions ?? []).map((attraction) => (
                  <span
                    key={attraction}
                    px="3"
                    py="2"
                    rounded="full"
                    bg="ct-surface-soft dark:ct-dark-surface-soft"
                    text="sm ct-text-soft dark:ct-dark-text-soft"
                  >
                    {attraction}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section borderTop surface>
        <DestinationHotels destination={destination} hotels={hotels} />
      </Section>

      {posts.length > 0 && (
        <Section>
          <Container>
            <div>
              <p
                m="0"
                text="xs ct-primary dark:ct-dark-text-soft"
                font="medium"
                tracking="wide"
              >
                TRAVEL GUIDES
              </p>

              <h2 mt="2" mb="0" text="2xl sm:3xl" font="bold" tracking="tight">
                {destination.name} 여행 가이드
              </h2>
            </div>

            <div mt="8" grid="~ cols-1 md:2 lg:3" gap="4 lg:6">
              {posts.slice(0, 6).map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </Container>
        </Section>
      )}
    </>
  );
}
