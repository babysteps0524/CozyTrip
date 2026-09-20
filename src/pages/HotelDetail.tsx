import type { Destination, Hotel, Post } from "../types";
import { Container, Section } from "../components/common";
import {
  HotelBooking,
  HotelGallery,
  HotelSummary,
  RelatedHotels,
} from "../components/hotel";
import { PostRenderer } from "../components/post";
import AffiliateDisclosure from "../components/hotel/AffiliateDisclosure";

interface HotelDetailProps {
  hotel: Hotel;
  destination?: Destination;
  hotelPosts: Post[];
  relatedGuides: Post[];
  relatedHotels: Hotel[];
}

function formatDate(value: string | undefined): string | undefined {
  if (!value) return undefined;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function getDestinationSlug(hotel: Hotel, destination?: Destination): string {
  return destination?.slug ?? hotel.city.toLowerCase();
}

export default function HotelDetail({
  hotel,
  destination,
  hotelPosts,
  relatedHotels,
}: HotelDetailProps) {
  const destinationSlug = getDestinationSlug(hotel, destination);
  const hotelPost = hotelPosts.find(
    (post) => post.category === "hotel" && post.hotelId === hotel.id,
  );

  const publishedLabel = formatDate(
    hotelPost?.publishedAt ?? hotel.publishedAt,
  );
  const updatedLabel = formatDate(
    hotelPost?.updatedAt ?? hotel.updatedAt,
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
              className="ct-focus"
            >
              홈
            </a>
            <span px="1" aria-hidden="true">/</span>
            <a
              href={`/japan/${destinationSlug}/hotels/`}
              px="1"
              py="1"
              rounded="md"
              hover="text-ct-primary dark:text-ct-dark-text bg-ct-surface-soft dark:bg-ct-dark-surface-soft"
              active-scale="0.95"
              className="ct-focus"
            >
              {hotel.city} 호텔
            </a>
            <span px="1" aria-hidden="true">/</span>
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

      <Section id="guide">
        <Container>
          <div className="mx-auto max-w-3xl">
            <p className="m-0 text-xs font-semibold tracking-[0.16em] text-ct-primary dark:text-ct-dark-text-soft">
              COZYTRIP HOTEL NOTE
            </p>

            <h2 className="mt-2 mb-0 text-2xl font-bold tracking-tight sm:text-3xl">
              {hotelPost?.title ?? `${hotel.name} 호텔 이야기`}
            </h2>

            {(publishedLabel || updatedLabel) && (
              <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ct-muted dark:text-ct-dark-muted">
                {publishedLabel && <span>작성 {publishedLabel}</span>}
                {updatedLabel && updatedLabel !== publishedLabel && (
                  <span>수정 {updatedLabel}</span>
                )}
              </div>
            )}

            {hotelPost ? (
              <article className="mt-8">
                <p className="m-0 text-base font-medium leading-8 text-ct-text-soft dark:text-ct-dark-text-soft sm:text-lg sm:leading-9">
                  {hotelPost.introduction}
                </p>

                <AffiliateDisclosure
                  show={Boolean(
                    hotel.affiliateLinks?.some(
                      (link) => link.provider === "myrealtrip",
                    ),
                  )}
                />

                <div className="mt-8">
                  <PostRenderer post={hotelPost} />
                </div>

                {(hotelPost.faq?.length ?? 0) > 0 && (
                  <section
                    mt="12"
                    rounded="2xl"
                    border="~ ct-line dark:ct-dark-line"
                    bg="ct-surface-soft dark:ct-dark-surface-soft"
                    p="5 sm:6"
                    aria-labelledby={`hotel-faq-${hotelPost.id}`}
                  >
                    <p
                      m="0"
                      text="xs ct-primary dark:ct-dark-text-soft"
                      font="semibold"
                      tracking="wide"
                    >
                      FAQ
                    </p>
                    <h3
                      id={`hotel-faq-${hotelPost.id}`}
                      mt="2"
                      mb="0"
                      text="xl sm:2xl"
                      font="bold"
                    >
                      자주 묻는 내용
                    </h3>

                    <div
                      mt="5"
                      divide-y="~ ct-line dark:ct-dark-line"
                    >
                      {hotelPost.faq?.map((item) => (
                        <details key={item.question} py="4" first="pt-0" last="pb-0">
                          <summary className="ct-focus cursor-pointer text-base font-semibold leading-7">
                            {item.question}
                          </summary>
                          <p className="mt-3 mb-0 text-sm leading-7 text-ct-text-soft dark:text-ct-dark-text-soft">
                            {item.answer}
                          </p>
                        </details>
                      ))}
                    </div>
                  </section>
                )}

                {(hotelPost.tags?.length ?? 0) > 0 && (
                  <div mt="8" flex="~ wrap" items="center" gap="2">
                    <span
                      mr="1"
                      text="xs ct-muted dark:ct-dark-muted"
                      font="semibold"
                    >
                      TAGS
                    </span>
                    {hotelPost.tags?.map((tag) => (
                      <span
                        key={tag}
                        rounded="full"
                        border="~ ct-line dark:ct-dark-line"
                        bg="ct-surface-soft dark:ct-dark-surface-soft"
                        px="3"
                        py="1.5"
                        text="xs ct-text-soft dark:ct-dark-text-soft"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            ) : (
              <div className="mt-8">
                <p className="m-0 text-base leading-8 text-ct-text-soft dark:text-ct-dark-text-soft">
                  {hotel.description}
                </p>
              </div>
            )}
          </div>
        </Container>
      </Section>

      <HotelBooking hotel={hotel} />

      {relatedHotels.length > 0 && (
        <RelatedHotels hotels={relatedHotels} currentHotel={hotel} />
      )}
    </main>
  );
}
