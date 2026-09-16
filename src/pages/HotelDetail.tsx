import type { Hotel } from "../types";

import { getHotelsByDestination, getPostsByHotel } from "../data";

import { Container, Section } from "../components/common";

import {
  HotelBooking,
  HotelFacilities,
  HotelGallery,
  HotelLocation,
  HotelSummary,
  RelatedHotels,
} from "../components/hotel";

import { PostCard, PostRenderer } from "../components/post";

interface HotelDetailProps {
  hotel: Hotel;
}

export default function HotelDetail({ hotel }: HotelDetailProps) {
  const relatedHotels = getHotelsByDestination(hotel.destinationId);

  const relatedPosts = getPostsByHotel(hotel.id);

  return (
    <>
      <section>
        <Container>
          <nav
            py="5"
            text="xs sm:sm ct-muted dark:ct-dark-muted"
            aria-label="Breadcrumb"
          >
            <a
              href="/"
              hover="text-ct-primary dark:text-ct-dark-text"
              un-active="scale-0.95"
            >
              홈
            </a>

            <span mx="2" aria-hidden="true">
              /
            </span>

            <a
              href={`/japan/${hotel.destinationId.replace("japan-", "")}/`}
              hover="text-ct-primary dark:text-ct-dark-text"
              un-active="scale-0.95"
            >
              {hotel.city}
            </a>

            <span mx="2" aria-hidden="true">
              /
            </span>

            <a
              href={`/japan/${hotel.destinationId.replace(
                "japan-",
                "",
              )}/hotels/`}
              hover="text-ct-primary dark:text-ct-dark-text"
              un-active="scale-0.95"
            >
              호텔
            </a>

            <span mx="2" aria-hidden="true">
              /
            </span>

            <span text="ct-text-soft dark:ct-dark-text-soft">{hotel.name}</span>
          </nav>
        </Container>
      </section>

      <HotelGallery hotel={hotel} />

      <HotelSummary hotel={hotel} />

      {relatedPosts.length > 0 ? (
        <Section>
          <Container>
            <PostRenderer post={relatedPosts[0]} />
          </Container>
        </Section>
      ) : (
        <Section>
          <Container>
            <article max-w="3xl">
              <p
                m="0"
                text="xs ct-primary dark:ct-dark-text-soft"
                font="medium"
                tracking="wide"
              >
                HOTEL GUIDE
              </p>

              <h2 mt="2" mb="0" text="2xl sm:3xl" font="bold" tracking="tight">
                {hotel.name} 알아보기
              </h2>

              <p
                mt="6"
                mb="0"
                text="base sm:lg ct-text-soft dark:ct-dark-text-soft"
                leading="relaxed"
              >
                {hotel.description}
              </p>
            </article>
          </Container>
        </Section>
      )}

      {hotel.rooms && hotel.rooms.length > 0 && (
        <Section borderTop surface>
          <Container>
            <div>
              <p
                m="0"
                text="xs ct-primary dark:ct-dark-text-soft"
                font="medium"
                tracking="wide"
              >
                ROOMS
              </p>

              <h2 mt="2" mb="0" text="2xl sm:3xl" font="bold" tracking="tight">
                객실 정보
              </h2>
            </div>

            <div mt="8" grid="~ cols-1 md:2" gap="4 lg:6">
              {hotel.rooms.map((room) => (
                <div
                  key={room.name}
                  rounded="card"
                  border="~ ct-line dark:ct-dark-line"
                  bg="ct-surface dark:ct-dark-surface"
                  p="6"
                >
                  <h3 m="0" text="lg ct-text dark:ct-dark-text" font="bold">
                    {room.name}
                  </h3>

                  {room.description && (
                    <p
                      mt="3"
                      mb="0"
                      text="sm ct-text-soft dark:ct-dark-text-soft"
                      leading="relaxed"
                    >
                      {room.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Container>
        </Section>
      )}

      <HotelFacilities hotel={hotel} />

      {hotel.restaurants && hotel.restaurants.length > 0 && (
        <Section>
          <Container>
            <div>
              <p
                m="0"
                text="xs ct-primary dark:ct-dark-text-soft"
                font="medium"
                tracking="wide"
              >
                DINING
              </p>

              <h2 mt="2" mb="0" text="2xl sm:3xl" font="bold" tracking="tight">
                레스토랑 · 다이닝
              </h2>
            </div>

            <div mt="8" grid="~ cols-1 md:2" gap="4 lg:6">
              {hotel.restaurants.map((restaurant) => (
                <div
                  key={restaurant.name}
                  rounded="card"
                  border="~ ct-line dark:ct-dark-line"
                  bg="ct-surface dark:ct-dark-surface"
                  p="6"
                >
                  <h3 m="0" text="lg ct-text dark:ct-dark-text" font="bold">
                    {restaurant.name}
                  </h3>

                  {restaurant.description && (
                    <p
                      mt="3"
                      mb="0"
                      text="sm ct-text-soft dark:ct-dark-text-soft"
                      leading="relaxed"
                    >
                      {restaurant.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {(hotel.checkIn || hotel.checkOut) && (
        <Section borderTop surface>
          <Container>
            <div max-w="3xl">
              <p
                m="0"
                text="xs ct-primary dark:ct-dark-text-soft"
                font="medium"
                tracking="wide"
              >
                USEFUL INFORMATION
              </p>

              <h2 mt="2" mb="0" text="2xl sm:3xl" font="bold" tracking="tight">
                이용 안내
              </h2>

              <div mt="8" grid="~ cols-1 sm:2" gap="4">
                {hotel.checkIn && (
                  <div
                    rounded="xl"
                    border="~ ct-line dark:ct-dark-line"
                    bg="ct-surface dark:ct-dark-surface"
                    p="5"
                  >
                    <p m="0" text="sm ct-muted dark:ct-dark-muted">
                      체크인
                    </p>

                    <p
                      mt="2"
                      mb="0"
                      text="lg ct-text dark:ct-dark-text"
                      font="bold"
                    >
                      {hotel.checkIn}
                    </p>
                  </div>
                )}

                {hotel.checkOut && (
                  <div
                    rounded="xl"
                    border="~ ct-line dark:ct-dark-line"
                    bg="ct-surface dark:ct-dark-surface"
                    p="5"
                  >
                    <p m="0" text="sm ct-muted dark:ct-dark-muted">
                      체크아웃
                    </p>

                    <p
                      mt="2"
                      mb="0"
                      text="lg ct-text dark:ct-dark-text"
                      font="bold"
                    >
                      {hotel.checkOut}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Container>
        </Section>
      )}

      <HotelLocation hotel={hotel} />

      <HotelBooking hotel={hotel} />

      {relatedPosts.length > 1 && (
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
                관련 여행 가이드
              </h2>
            </div>

            <div mt="8" grid="~ cols-1 md:2 lg:3" gap="4 lg:6">
              {relatedPosts.slice(1, 4).map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </Container>
        </Section>
      )}

      <RelatedHotels hotels={relatedHotels} currentHotelId={hotel.id} />
    </>
  );
}
