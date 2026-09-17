import { destinations, getHotelsByCity, getPostsByCategory } from "../data";

import { Container, Section } from "../components/common";

import { DestinationCard } from "../components/destination";
import { HotelCard } from "../components/hotel";
import { PostCard } from "../components/post";

export default function Home() {
  const featuredDestinations = destinations.slice(0, 6);

  const featuredHotels = getHotelsByCity("도쿄").slice(0, 3);

  const guides = getPostsByCategory("guide").slice(0, 3);

  return (
    <>
      <Section>
        <Container>
          <div max-w="4xl" py="8 sm:12 lg:16">
            <p
              mb="4"
              text="sm ct-primary dark:ct-dark-text-soft"
              font="medium"
              tracking="wide"
            >
              TRAVEL · HOTELS · JAPAN
            </p>

            <h1
              m="0"
              text="4xl sm:5xl lg:6xl"
              font="bold"
              tracking="tight"
              leading="tight"
            >
              일본 여행을
              <br />
              조금 더 편안하게
            </h1>

            <p
              mt="6"
              max-w="2xl"
              text="base sm:lg ct-text-soft dark:ct-dark-text-soft"
              leading="relaxed"
            >
              일본의 여행지와 호텔을 살펴보고 여행 목적에 맞는 숙소를
              찾아보세요.
            </p>

            <div mt="8" flex="~ wrap" gap="3">
              <a
                href="/japan/tokyo/hotels/"
                className="ct-button"
                bg="ct-primary"
                text="white"
                hover="bg-ct-primary-dark"
                un-active="scale-0.95"
              >
                도쿄 호텔 보기
              </a>

              <a
                href="/guides/"
                className="ct-button"
                border="~ ct-line dark:ct-dark-line"
                bg="ct-surface dark:ct-dark-surface"
                text="ct-text dark:ct-dark-text"
                hover="bg-ct-surface-soft dark:bg-ct-dark-surface-soft"
                un-active="scale-0.95"
              >
                여행 가이드
              </a>
            </div>
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
                인기 여행지
              </h2>

              <p mt="2" mb="0" text="sm ct-text-soft dark:ct-dark-text-soft">
                일본에서 많이 찾는 주요 여행지를 살펴보세요.
              </p>
            </div>

            <a
              href="/japan/"
              text="sm ct-primary dark:ct-dark-text"
              font="medium"
              un-active="scale-0.95"
            >
              전체 여행지 보기 →
            </a>
          </div>

          <div mt="8" grid="~ cols-1 sm:2 lg:3" gap="4 lg:6">
            {featuredDestinations.map((destination) => (
              <DestinationCard key={destination.id} destination={destination} />
            ))}
          </div>
        </Container>
      </Section>

      <Section>
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
                FEATURED HOTELS
              </p>

              <h2 mt="2" mb="0" text="2xl sm:3xl" font="bold" tracking="tight">
                추천 호텔
              </h2>

              <p mt="2" mb="0" text="sm ct-text-soft dark:ct-dark-text-soft">
                여행 목적에 맞는 호텔을 찾아보세요.
              </p>
            </div>

            <a
              href="/japan/tokyo/hotels/"
              text="sm ct-primary dark:ct-dark-text"
              font="medium"
              un-active="scale-0.95"
            >
              도쿄 호텔 전체 보기 →
            </a>
          </div>

          <div mt="8" grid="~ cols-1 sm:2 lg:3" gap="4 lg:6">
            {featuredHotels.length > 0 ? (
              featuredHotels.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} />
              ))
            ) : (
              <div
                col="span-1 sm:span-2 lg:span-3"
                rounded="card"
                border="~ ct-line dark:ct-dark-line"
                bg="ct-surface dark:ct-dark-surface"
                p="8"
                text="center sm:left ct-muted dark:ct-dark-muted"
              >
                추천 호텔을 준비하고 있습니다.
              </div>
            )}
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
                TRAVEL GUIDES
              </p>

              <h2 mt="2" mb="0" text="2xl sm:3xl" font="bold" tracking="tight">
                일본 여행 가이드
              </h2>

              <p mt="2" mb="0" text="sm ct-text-soft dark:ct-dark-text-soft">
                호텔과 여행지를 선택할 때 필요한 정보를 확인하세요.
              </p>
            </div>

            <a
              href="/guides/"
              text="sm ct-primary dark:ct-dark-text"
              font="medium"
              un-active="scale-0.95"
            >
              전체 가이드 보기 →
            </a>
          </div>

          <div mt="8" grid="~ cols-1 md:2 lg:3" gap="4 lg:6">
            {guides.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div max-w="2xl">
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

            <p mt="2" mb="0" text="sm ct-text-soft dark:ct-dark-text-soft">
              여행 목적에 따라 숙박 지역을 선택해보세요.
            </p>
          </div>

          <div mt="8" grid="~ cols-2 sm:3 lg:6" gap="3">
            {destinations
              .flatMap((destination) => destination.popularAreas ?? [])
              .slice(0, 12)
              .map((area, index) => (
                <a
                  key={`${area}-${index}`}
                  href="/japan/"
                  min-h="24"
                  flex="~"
                  items="center"
                  justify="center"
                  rounded="xl"
                  border="~ ct-line dark:ct-dark-line"
                  bg="ct-surface dark:ct-dark-surface"
                  px="3"
                  py="4"
                  text="sm center ct-text dark:ct-dark-text"
                  hover="bg-ct-surface-soft dark:bg-ct-dark-surface-soft"
                  un-active="scale-0.95"
                >
                  {area}
                </a>
              ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
