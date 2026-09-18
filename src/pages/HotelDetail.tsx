import { getHotelPostByHotel, getHotelsByDestination, getPostsByHotel } from "../data";
import { getDestinationById } from "../data/destinations";
import { Container, Section } from "../components/common";
import {
  HotelBooking,
  HotelFacilities,
  HotelGallery,
  HotelLocation,
  HotelRestaurantCard,
  HotelRoomCard,
  HotelStayInfo,
  HotelSummary,
  RelatedHotels,
} from "../components/hotel";
import { PostRenderer } from "../components/post";
import type { Hotel } from "../types";
import { createCanonical, createHotelStructuredData, createBreadcrumbStructuredData, createFaqStructuredData } from "../lib/seo";

interface HotelDetailProps {
  hotel: Hotel;
}

export default function HotelDetail({ hotel }: HotelDetailProps) {
  const destination = getDestinationById(hotel.destinationId);
  const destinationSlug = destination?.slug ?? hotel.city.toLowerCase();
  const relatedPosts = getPostsByHotel(hotel.id);
  const hotelPost = getHotelPostByHotel(hotel.id);
  const relatedHotels = getHotelsByDestination(hotel.destinationId).filter(
    (item) => item.id !== hotel.id,
  );

  return (
    <main>
      <section border="b ct-line dark:ct-dark-line">
        <Container>
          <nav
            py="3"
            flex="~ wrap"
            items="center"
            gap="1"
            text="xs ct-muted dark:ct-dark-muted"
            aria-label="Breadcrumb"
          >
            <a
              href="/"
              px="1"
              py="1"
              rounded="md"
              hover="text-ct-primary dark:text-ct-dark-text bg-ct-surface-soft dark:bg-ct-dark-surface-soft"
              active-scale="0.95"
            >
              홈
            </a>
            <span px="1" aria-hidden="true">
              /
            </span>
            <a
              href={`/japan/${destinationSlug}/`}
              px="1"
              py="1"
              rounded="md"
              hover="text-ct-primary dark:text-ct-dark-text bg-ct-surface-soft dark:bg-ct-dark-surface-soft"
              active-scale="0.95"
            >
              {hotel.city}
            </a>
            <span px="1" aria-hidden="true">
              /
            </span>
            <a
              href={`/japan/${destinationSlug}/hotels/`}
              px="1"
              py="1"
              rounded="md"
              hover="text-ct-primary dark:text-ct-dark-text bg-ct-surface-soft dark:bg-ct-dark-surface-soft"
              active-scale="0.95"
            >
              호텔
            </a>
            <span px="1" aria-hidden="true">
              /
            </span>
            <span
              max-w="full"
              overflow="hidden"
              text-overflow="ellipsis"
              whitespace="nowrap"
              text="ct-text-soft dark:ct-dark-text-soft"
              aria-current="page"
            >
              {hotel.name}
            </span>
          </nav>
        </Container>
      </section>

      <HotelGallery images={hotel.images} />
      <HotelSummary hotel={hotel} />

      {relatedPosts.length > 0 ? (
        <Section>
          <Container>
            <div>
              <p
                m="0"
                text="xs ct-primary dark:ct-dark-text-soft"
                font="medium"
                tracking="wide"
              >
                HOTEL GUIDE
              </p>
              <h2 mt="2" mb="0" text="2xl sm:3xl" font="bold" tracking="tight">
                호텔 소개
              </h2>
            </div>
            <div mt="8">
              {relatedPosts.map((post) => (
                <PostRenderer key={post.id} post={post} />
              ))}
            </div>
          </Container>
        </Section>
      ) : (
        <Section>
          <Container>
            <p
              m="0"
              text="xs ct-primary dark:ct-dark-text-soft"
              font="medium"
              tracking="wide"
            >
              HOTEL GUIDE
            </p>
            <h2 mt="2" mb="0" text="2xl sm:3xl" font="bold" tracking="tight">
              호텔 소개
            </h2>
            <p
              mt="4"
              mb="0"
              max-w="3xl"
              text="base ct-text-soft dark:ct-dark-text-soft"
              leading="relaxed"
            >
              {hotel.description}
            </p>
          </Container>
        </Section>
      )}

      {hotel.rooms && hotel.rooms.length > 0 && (
        <Section borderTop>
          <Container>
            <p
              m="0"
              text="xs ct-primary dark:ct-dark-text-soft"
              font="medium"
              tracking="wide"
            >
              ROOMS
            </p>
            <h2 mt="2" mb="0" text="2xl sm:3xl" font="bold" tracking="tight">
              객실
            </h2>
            <div mt="8" grid="~ cols-1 lg:2" gap="5">
              {hotel.rooms.map((room, index) => (
                <HotelRoomCard key={room.id ?? `${room.name}-${index}`} room={room} />
              ))}
            </div>
          </Container>
        </Section>
      )}

      {hotel.facilities && hotel.facilities.length > 0 && (
        <HotelFacilities facilities={hotel.facilities} />
      )}

      {hotel.restaurants && hotel.restaurants.length > 0 && (
        <Section borderTop>
          <Container>
            <p
              m="0"
              text="xs ct-primary dark:ct-dark-text-soft"
              font="medium"
              tracking="wide"
            >
              DINING
            </p>
            <h2 mt="2" mb="0" text="2xl sm:3xl" font="bold" tracking="tight">
              다이닝
            </h2>
            <div mt="8" grid="~ cols-1 lg:2" gap="5">
              {hotel.restaurants.map((restaurant, index) => (
                <HotelRestaurantCard
                  key={restaurant.id ?? `${restaurant.name}-${index}`}
                  restaurant={restaurant}
                />
              ))}
            </div>
          </Container>
        </Section>
      )}

      <HotelStayInfo hotel={hotel} />

      {hotelPost?.faq && hotelPost.faq.length > 0 && (
        <Section borderTop>
          <Container>
            <p
              m="0"
              text="xs ct-primary dark:ct-dark-text-soft"
              font="medium"
              tracking="wide"
            >
              FAQ
            </p>
            <h2 mt="2" mb="0" text="2xl sm:3xl" font="bold" tracking="tight">
              자주 묻는 질문
            </h2>
            <div mt="8" grid="~ cols-1" gap="4">
              {hotelPost.faq.map((item) => (
                <details
                  key={item.question}
                  rounded="xl"
                  border="~ ct-line dark:ct-dark-line"
                  bg="ct-surface dark:ct-dark-surface"
                  p="5"
                >
                  <summary
                    cursor="pointer"
                    text="base ct-text dark:ct-dark-text"
                    font="bold"
                  >
                    {item.question}
                  </summary>
                  <p
                    mt="4"
                    mb="0"
                    text="sm ct-text-soft dark:ct-dark-text-soft"
                    leading="relaxed"
                  >
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </Container>
        </Section>
      )}

      <HotelLocation hotel={hotel} />
      <HotelBooking hotel={hotel} />

      {relatedPosts.length > 0 && (
        <Section borderTop>
          <Container>
            <p
              m="0"
              text="xs ct-primary dark:ct-dark-text-soft"
              font="medium"
              tracking="wide"
            >
              RELATED GUIDES
            </p>
            <h2 mt="2" mb="0" text="2xl sm:3xl" font="bold" tracking="tight">
              함께 읽으면 좋은 글
            </h2>
            <div mt="8" grid="~ cols-1 sm:2" gap="5">
              {relatedPosts.slice(0, 4).map((post) => (
                <a
                  key={post.id}
                  href={`/guides/${post.slug}/`}
                  rounded="xl"
                  border="~ ct-line dark:ct-dark-line"
                  bg="ct-surface dark:ct-dark-surface"
                  p="5"
                  hover="border-ct-primary dark:border-ct-dark-line"
                  active-scale="0.98"
                >
                  <h3 m="0" text="base ct-text dark:ct-dark-text" font="bold">
                    {post.title}
                  </h3>
                  <p
                    mt="2"
                    mb="0"
                    text="sm ct-text-soft dark:ct-dark-text-soft"
                    leading="relaxed"
                  >
                    {post.description}
                  </p>
                </a>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {relatedHotels.length > 0 && (
        <RelatedHotels hotels={relatedHotels.slice(0, 6)} />
      )}
    </main>
  );
}
