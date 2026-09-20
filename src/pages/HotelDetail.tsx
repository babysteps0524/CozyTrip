import type { Destination, Hotel, Post } from "../types";
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
  RelatedGuides,
  RelatedHotels,
} from "../components/hotel";
import { PostRenderer } from "../components/post";
import { isDisplayableHotelImage } from "../lib/image";

interface HotelDetailProps {
  hotel: Hotel;
  destination?: Destination;
  hotelPosts: Post[];
  relatedGuides: Post[];
  relatedHotels: Hotel[];
}

interface ArticleHeading {
  text: string;
  id: string;
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

function createHeadingId(text: string, index: number): string {
  const slug = text
    .normalize("NFKD")
    .toLowerCase()
    .trim()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

  return `post-heading-${slug || "section"}-${index}`;
}

function getArticleHeadings(posts: Post[]): ArticleHeading[] {
  return posts.flatMap((post) =>
    post.blocks.flatMap((block, index) =>
      block.type === "heading" && block.level === 2
        ? [{ text: block.text, id: createHeadingId(block.text, index) }]
        : [],
    ),
  );
}

function getDestinationSlug(hotel: Hotel, destination?: Destination): string {
  return destination?.slug ?? hotel.city.toLowerCase();
}

function getDateLabels(hotel: Hotel, hotelPost?: Post) {
  const publishedLabel = formatDate(
    hotelPost?.publishedAt ?? hotel.publishedAt,
  );
  const updatedLabel = formatDate(hotelPost?.updatedAt ?? hotel.updatedAt);

  return { publishedLabel, updatedLabel };
}

function getCheckpoints(hotel: Hotel): Array<[string, string]> {
  const checkpoints: Array<[string, string]> = [
    ["지역", [hotel.city, hotel.area].filter(Boolean).join(" · ")],
    ["숙소 유형", hotel.accommodationType ?? ""],
    [
      "가까운 역",
      hotel.location.nearestStations?.slice(0, 2).filter(Boolean).join(" · ") ?? "",
    ],
    [
      "체크인 · 체크아웃",
      [hotel.checkIn, hotel.checkOut].filter(Boolean).join(" · "),
    ],
  ];

  return checkpoints.filter(([, value]) => Boolean(value));
}

export default function HotelDetail({
  hotel,
  destination,
  hotelPosts,
  relatedGuides,
  relatedHotels,
}: HotelDetailProps) {
  const destinationSlug = getDestinationSlug(hotel, destination);
  const hotelPost = hotelPosts.find(
    (post) => post.category === "hotel" && post.hotelId === hotel.id,
  );
  const articleImage = hotel.images.find(isDisplayableHotelImage);
  const articleHeadings = getArticleHeadings(hotelPosts);
  const { publishedLabel, updatedLabel } = getDateLabels(hotel, hotelPost);
  const checkpoints = getCheckpoints(hotel);

  const sectionLinks = [
    { href: "#guide", label: "소개" },
    ...(hotel.rooms?.length ? [{ href: "#rooms", label: "객실" }] : []),
    ...(hotel.facilities?.length
      ? [{ href: "#facilities", label: "시설" }]
      : []),
    ...(hotel.restaurants?.length
      ? [{ href: "#dining", label: "다이닝" }]
      : []),
    { href: "#stay-info", label: "숙소 정보" },
    { href: "#location", label: "위치" },
    { href: "#booking", label: "예약 정보" },
  ];

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
              active-scale="98"
              className="ct-focus"
            >
              홈
            </a>
            <span px="1" aria-hidden="true">/</span>
            <a
              href={`/japan/${destinationSlug}/`}
              px="1"
              py="1"
              rounded="md"
              hover="text-ct-primary dark:text-ct-dark-text bg-ct-surface-soft dark:bg-ct-dark-surface-soft"
              active-scale="98"
              className="ct-focus"
            >
              {hotel.city}
            </a>
            <span px="1" aria-hidden="true">/</span>
            <a
              href={`/japan/${destinationSlug}/hotels/`}
              px="1"
              py="1"
              rounded="md"
              hover="text-ct-primary dark:text-ct-dark-text bg-ct-surface-soft dark:bg-ct-dark-surface-soft"
              active-scale="98"
              className="ct-focus"
            >
              호텔
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

      <section className="sticky top-0 z-20 border-b border-ct-line bg-ct-surface-soft/95 backdrop-blur dark:border-ct-dark-line dark:bg-ct-dark-surface-soft/95">
        <Container>
          <nav
            className="flex flex-wrap items-center gap-2 py-2.5 text-sm"
            aria-label="호텔 상세 메뉴"
          >
            <span className="mr-1 shrink-0 basis-full text-xs font-medium text-ct-muted dark:text-ct-dark-muted sm:basis-auto">
              바로가기
            </span>
            {sectionLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="ct-focus shrink-0 rounded-full border border-ct-line bg-ct-surface px-3 py-1.5 text-xs text-ct-text-soft hover:border-ct-primary hover:text-ct-primary active-scale-98 dark:border-ct-dark-line dark:bg-ct-dark-surface dark:text-ct-dark-text-soft dark:hover:border-ct-dark-text dark:hover:text-ct-dark-text sm:text-sm"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </Container>
      </section>

      <Section id="guide">
        <Container>
          <div>
            <p
              m="0"
              text="xs ct-primary dark:ct-dark-text-soft"
              font="medium"
              tracking="wide"
            >
              COZYTRIP HOTEL NOTE
            </p>
            <h2
              mt="2"
              mb="0"
              text="2xl sm:3xl"
              font="bold"
              tracking="tight"
            >
              호텔 소개와 여행 메모
            </h2>

            {(publishedLabel || updatedLabel) && (
              <div
                mt="4"
                flex="~ wrap"
                items="center"
                gap="2 sm:3"
                text="xs ct-muted dark:ct-dark-muted"
              >
                <span font="medium" text="ct-text-soft dark:ct-dark-text-soft">
                  CozyTrip
                </span>
                {publishedLabel && <span>작성 {publishedLabel}</span>}
                {updatedLabel && updatedLabel !== publishedLabel && (
                  <span>수정 {updatedLabel}</span>
                )}
              </div>
            )}

            <p
              mt="3"
              mb="0"
              max-w="3xl"
              text="sm ct-muted dark:ct-dark-muted"
              leading="relaxed"
            >
              CozyTrip가 여행자가 호텔을 살펴볼 때 참고할 수 있도록 정리한
              정보입니다. 실제 예약 조건은 각 예약 플랫폼에서 다시 확인해
              주세요.
            </p>
          </div>

          {articleHeadings.length > 1 && (
            <nav
              mt="6"
              rounded="xl"
              border="~ ct-line dark:ct-dark-line"
              bg="ct-surface-soft dark:ct-dark-surface-soft"
              p="5"
              aria-label="호텔 글 목차"
            >
              <p
                m="0"
                text="xs ct-primary dark:ct-dark-text-soft"
                font="medium"
                tracking="wide"
              >
                ARTICLE CONTENTS
              </p>
              <h3 mt="1.5" mb="0" text="lg" font="bold">
                이 글에서 살펴볼 내용
              </h3>
              <ol
                mt="4"
                mb="0"
                pl="5"
                space-y="2"
                text="sm ct-text-soft dark:ct-dark-text-soft"
              >
                {articleHeadings.map((heading) => (
                  <li key={heading.id}>
                    <a
                      href={`#${heading.id}`}
                      hover="text-ct-primary dark:text-ct-dark-text"
                      active-scale="98"
                      className="ct-focus"
                    >
                      {heading.text}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          {checkpoints.length > 0 && (
            <div
              mt="6"
              rounded="xl"
              border="~ ct-line dark:ct-dark-line"
              bg="ct-surface-soft dark:ct-dark-surface-soft"
              p="5 sm:6"
            >
              <div
                flex="~ col sm:row"
                sm="items-center justify-between"
                gap="2"
              >
                <div>
                  <p
                    m="0"
                    text="xs ct-primary dark:ct-dark-text-soft"
                    font="medium"
                    tracking="wide"
                  >
                    CHECKPOINTS
                  </p>
                  <h3 mt="1.5" mb="0" text="lg sm:xl" font="bold">
                    살펴볼 핵심 정보
                  </h3>
                </div>
                <span text="xs ct-muted dark:ct-dark-muted">
                  제공된 호텔 정보 기준
                </span>
              </div>

              <div mt="5" grid="~ cols-1 sm:2 lg:4" gap="3">
                {checkpoints.map(([label, value]) => (
                  <div
                    key={label}
                    rounded="lg"
                    bg="ct-surface dark:ct-dark-surface"
                    p="4"
                  >
                    <p m="0" text="xs ct-muted dark:ct-dark-muted">
                      {label}
                    </p>
                    <p
                      mt="1.5"
                      mb="0"
                      text="sm ct-text-soft dark:ct-dark-text-soft"
                      font="medium"
                      leading="relaxed"
                    >
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hotelPosts.length > 0 ? (
            <div className="mt-10 max-w-3xl">
              {hotelPosts.map((post) => (
                <article
                  key={post.id}
                  aria-labelledby={`hotel-article-title-${post.id}`}
                >
                  <header className="rounded-2xl border border-ct-line bg-ct-surface-soft p-5 sm:p-7 dark:border-ct-dark-line dark:bg-ct-dark-surface-soft">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="m-0 text-xs font-semibold tracking-[0.16em] text-ct-primary dark:text-ct-dark-text-soft">
                        HOTEL ARTICLE
                      </p>
                      {post.publishedAt && (
                        <time
                          dateTime={post.publishedAt}
                          className="text-xs text-ct-muted dark:text-ct-dark-muted"
                        >
                          {formatDate(post.publishedAt)}
                        </time>
                      )}
                    </div>

                    <h3
                      id={`hotel-article-title-${post.id}`}
                      className="mt-3 mb-0 text-2xl font-bold leading-[1.35] tracking-tight sm:text-3xl"
                    >
                      {post.title}
                    </h3>

                    <p className="mt-4 mb-0 text-base leading-8 text-ct-text-soft dark:text-ct-dark-text-soft">
                      {post.introduction}
                    </p>
                  </header>

                  <div className="mt-10">
                    <PostRenderer post={post} />
                  </div>

                  {(post.faq?.length ?? 0) > 0 && (
                    <section
                      className="mt-12 rounded-2xl border border-ct-line bg-ct-surface-soft p-5 sm:p-6 dark:border-ct-dark-line dark:bg-ct-dark-surface-soft"
                      aria-labelledby={`hotel-faq-${post.id}`}
                    >
                      <p className="m-0 text-xs font-semibold tracking-[0.16em] text-ct-primary dark:text-ct-dark-text-soft">
                        FAQ
                      </p>
                      <h3
                        id={`hotel-faq-${post.id}`}
                        className="mt-2 mb-0 text-xl font-bold tracking-tight sm:text-2xl"
                      >
                        자주 묻는 내용
                      </h3>
                      <div className="mt-6 divide-y divide-ct-line dark:divide-ct-dark-line">
                        {post.faq?.map((item) => (
                          <details
                            key={item.question}
                            className="group py-4 first:pt-0 last:pb-0"
                          >
                            <summary className="ct-focus cursor-pointer pr-8 text-base font-semibold leading-7 text-ct-text dark:text-ct-dark-text">
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

                  <footer className="mt-8 border-t border-ct-line pt-6 dark:border-ct-dark-line">
                    {(post.tags?.length ?? 0) > 0 && (
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="mr-1 text-xs font-semibold tracking-[0.12em] text-ct-muted dark:text-ct-dark-muted">
                            TAGS
                          </span>
                          {post.tags?.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-ct-line bg-ct-surface px-3 py-1.5 text-xs font-medium text-ct-text-soft dark:border-ct-dark-line dark:bg-ct-dark-surface dark:text-ct-dark-text-soft"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-5 rounded-xl bg-ct-surface-soft px-4 py-4 dark:bg-ct-dark-surface-soft">
                      <p className="m-0 text-xs font-semibold text-ct-text-soft dark:text-ct-dark-text-soft">
                        정보 확인 안내
                      </p>
                      <p className="mt-1.5 mb-0 text-xs leading-6 text-ct-muted dark:text-ct-dark-muted">
                        이 글은 제공된 호텔 정보와 확인 가능한 이미지 자료를 바탕으로 작성되었습니다.
                        요금, 객실 재고와 예약 조건은 외부 예약 플랫폼에서 최종 확인해 주세요.
                      </p>
                    </div>
                  </footer>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-4 max-w-3xl">
              <p className="m-0 text-base leading-relaxed text-ct-text-soft dark:text-ct-dark-text-soft">
                {hotel.description}
              </p>

              {articleImage && (
                <figure mt="8" mb="0">
                  {articleImage.sourceUrl ? (
                    <a
                      href={articleImage.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      active-scale="98"
                      display="block"
                      rounded="2xl"
                      overflow="hidden"
                      border="~ ct-line dark:ct-dark-line"
                      bg="ct-surface dark:ct-dark-surface"
                      className="ct-focus"
                    >
                      <img
                        src={articleImage.src}
                        alt={articleImage.alt}
                        width={articleImage.width ?? 1200}
                        height={articleImage.height ?? 800}
                        loading="lazy"
                        decoding="async"
                        w="full"
                        h="auto"
                        display="block"
                      />
                    </a>
                  ) : (
                    <img
                      src={articleImage.src}
                      alt={articleImage.alt}
                      width={articleImage.width ?? 1200}
                      height={articleImage.height ?? 800}
                      loading="lazy"
                      decoding="async"
                      w="full"
                      h="auto"
                      display="block"
                      rounded="2xl"
                      border="~ ct-line dark:ct-dark-line"
                    />
                  )}

                  <figcaption
                    mt="2"
                    text="xs ct-muted dark:ct-dark-muted"
                  >
                    {articleImage.credit ?? "호텔 이미지"}
                  </figcaption>
                </figure>
              )}
            </div>
          )}
        </Container>
      </Section>

      {hotel.rooms && hotel.rooms.length > 0 && (
        <Section id="rooms" borderTop>
          <Container>
            <p
              m="0"
              text="xs ct-primary dark:ct-dark-text-soft"
              font="medium"
              tracking="wide"
            >
              ROOMS
            </p>
            <h2
              mt="2"
              mb="0"
              text="2xl sm:3xl"
              font="bold"
              tracking="tight"
            >
              객실
            </h2>
            <div mt="8" grid="~ cols-1 lg:2" gap="5">
              {hotel.rooms.map((room, index) => (
                <HotelRoomCard
                  key={room.id ?? `${room.name}-${index}`}
                  room={room}
                />
              ))}
            </div>
          </Container>
        </Section>
      )}

      {hotel.facilities && hotel.facilities.length > 0 && (
        <HotelFacilities hotel={hotel} />
      )}

      {hotel.restaurants && hotel.restaurants.length > 0 && (
        <Section id="dining" borderTop>
          <Container>
            <p
              m="0"
              text="xs ct-primary dark:ct-dark-text-soft"
              font="medium"
              tracking="wide"
            >
              DINING
            </p>
            <h2
              mt="2"
              mb="0"
              text="2xl sm:3xl"
              font="bold"
              tracking="tight"
            >
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
      <HotelLocation hotel={hotel} />
      <HotelBooking hotel={hotel} />
      <RelatedGuides posts={relatedGuides} />

      {relatedHotels.length > 0 && (
        <RelatedHotels hotels={relatedHotels} currentHotel={hotel} />
      )}
    </main>
  );
}
