import type { Destination } from "../types";
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
  RelatedGuides,
  AffiliateDisclosure,
} from "../components/hotel";
import { PostRenderer } from "../components/post";
import type { Hotel } from "../types";

function formatDate(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long", day: "numeric" }).format(date);
}
import {
  createCanonical,
  createHotelStructuredData,
  createBreadcrumbStructuredData,
  createFaqStructuredData,
} from "../lib/seo";

interface HotelDetailProps {
  hotel: Hotel;
  destination?: Destination;
  hotelPosts: import("../types").Post[];
  relatedGuides: import("../types").Post[];
  relatedHotels: Hotel[];
}

export default function HotelDetail({
  hotel,
  destination,
  hotelPosts,
  relatedGuides,
  relatedHotels,
}: HotelDetailProps) {
  const destinationSlug = destination?.slug ?? hotel.city.toLowerCase();
  const hotelPost = hotelPosts.find(
    (post) => post.category === "hotel" && post.hotelId === hotel.id,
  );
  const articleImage = hotel.images.find(
    (image) => image.rightsConfirmed && Boolean(image.src),
  );

  const articleHeadings = hotelPosts.flatMap((post) =>
    post.blocks
      .map((block, index) => ({ block, index }))
      .filter(({ block }) => block.type === "heading" && block.level === 2)
      .map(({ block, index }) => ({
        text: block.type === "heading" ? block.text : "",
        id: `post-heading-${block.type === "heading" ? block.text.normalize("NFKD").toLowerCase().trim().replace(/[^\\p{Letter}\\p{Number}]+/gu, "-").replace(/^-+|-+$/g, "") : "section"}-${index}`,
      })),
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
            <a href="/" px="1" py="1" rounded="md"
              hover="text-ct-primary dark:text-ct-dark-text bg-ct-surface-soft dark:bg-ct-dark-surface-soft"
              active-scale="98">
              홈
            </a>
            <span px="1" aria-hidden="true">/</span>
            <a href={`/japan/${destinationSlug}/`} px="1" py="1" rounded="md"
              hover="text-ct-primary dark:text-ct-dark-text bg-ct-surface-soft dark:bg-ct-dark-surface-soft"
              active-scale="98">
              {hotel.city}
            </a>
            <span px="1" aria-hidden="true">/</span>
            <a href={`/japan/${destinationSlug}/hotels/`} px="1" py="1" rounded="md"
              hover="text-ct-primary dark:text-ct-dark-text bg-ct-surface-soft dark:bg-ct-dark-surface-soft"
              active-scale="98">
              호텔
            </a>
            <span px="1" aria-hidden="true">/</span>
            <span max-w="full" overflow="hidden" text-overflow="ellipsis" whitespace="nowrap"
              text="ct-text-soft dark:ct-dark-text-soft" aria-current="page">
              {hotel.name}
            </span>
          </nav>
        </Container>
      </section>

      <HotelGallery images={hotel.images} />
      <HotelSummary hotel={hotel} />

      <section
        position="sticky"
        top="0"
        z="20"
        border="b ct-line dark:ct-dark-line"
        bg="ct-surface-soft dark:ct-dark-surface-soft"
      >
        <Container>
          <nav
            py="2.5"
            flex="~"
            items="center"
            gap="2"
            overflow-x="auto"
            whitespace="nowrap"
            text="sm"
            aria-label="호텔 상세 메뉴"
          >
            <span mr="1" shrink="0" text="xs ct-muted dark:ct-dark-muted" font="medium">
              바로가기
            </span>
            <a href="#guide" shrink="0" rounded="full" border="~ ct-line dark:ct-dark-line"
              bg="ct-surface dark:ct-dark-surface" px="3" py="1.5"
              text="ct-text-soft dark:ct-dark-text-soft" hover="text-ct-primary dark:text-ct-dark-text"
              active-scale="98">
              소개
            </a>
            {[
              ...(hotel.rooms?.length ? [["#rooms", "객실"]] : []),
              ...(hotel.facilities?.length ? [["#facilities", "시설"]] : []),
              ...(hotel.restaurants?.length ? [["#dining", "다이닝"]] : []),
              ...(hotelPost?.faq?.length ? [["#faq", "FAQ"]] : []),
              ["#location", "위치"],
              ["#booking", "예약 정보"],
            ].map(([href, label]) => (
              <a key={href} href={href} shrink="0" rounded="full"
                border="~ ct-line dark:ct-dark-line" bg="ct-surface dark:ct-dark-surface"
                px="3" py="1.5" text="ct-text-soft dark:ct-dark-text-soft"
                hover="text-ct-primary dark:text-ct-dark-text" active-scale="98">
                {label}
              </a>
            ))}
          </nav>
        </Container>
      </section>

      <Section id="guide">
        <Container>
          <div>
            <p m="0" text="xs ct-primary dark:ct-dark-text-soft" font="medium" tracking="wide">
              COZYTRIP HOTEL NOTE
            </p>
            <h2 mt="2" mb="0" text="2xl sm:3xl" font="bold" tracking="tight">호텔 소개와 여행 메모</h2>
            <div mt="4" flex="~ wrap" items="center" gap="2 sm:3" text="xs ct-muted dark:ct-dark-muted">
              <span font="medium" text="ct-text-soft dark:ct-dark-text-soft">CozyTrip</span>
              {(() => {
                const publishedLabel = formatDate(hotelPost?.publishedAt ?? hotel.publishedAt);
                const updatedLabel = formatDate(hotelPost?.updatedAt ?? hotel.updatedAt);
                return <>{publishedLabel && <span>작성 {publishedLabel}</span>}{updatedLabel && updatedLabel !== publishedLabel && <span>수정 {updatedLabel}</span>}</>;
              })()}
            </div>
            <p mt="3" mb="0" max-w="3xl" text="sm ct-muted dark:ct-dark-muted" leading="relaxed">
              CozyTrip가 여행자가 호텔을 살펴볼 때 참고할 수 있도록 정리한 정보입니다. 실제 예약 조건은 각 예약 플랫폼에서 다시 확인해 주세요.
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
              <p m="0" text="xs ct-primary dark:ct-dark-text-soft" font="medium" tracking="wide">
                ARTICLE CONTENTS
              </p>
              <h3 mt="1.5" mb="0" text="lg" font="bold">이 글에서 살펴볼 내용</h3>
              <ol mt="4" mb="0" pl="5" space-y="2" text="sm ct-text-soft dark:ct-dark-text-soft">
                {articleHeadings.map((heading, index) => (
                  <li key={`${heading.id}-${index}`}>
                    <a href={`#${heading.id}`} hover="text-ct-primary dark:text-ct-dark-text" active-scale="98">
                      {heading.text}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          <div mt="6" rounded="xl" border="~ ct-line dark:ct-dark-line" bg="ct-surface-soft dark:ct-dark-surface-soft" p="5 sm:6">
            <div flex="~ col sm:row" sm="items-center justify-between" gap="2">
              <div>
                <p m="0" text="xs ct-primary dark:ct-dark-text-soft" font="medium" tracking="wide">CHECKPOINTS</p>
                <h3 mt="1.5" mb="0" text="lg sm:xl" font="bold">살펴볼 핵심 정보</h3>
              </div>
              <span text="xs ct-muted dark:ct-dark-muted">제공된 호텔 정보 기준</span>
            </div>
            <div mt="5" grid="~ cols-1 sm:2 lg:4" gap="3">
              {[
                ["지역", [hotel.city, hotel.area].filter(Boolean).join(" · ")],
                ["숙소 유형", hotel.accommodationType],
                ["가까운 역", hotel.location.nearestStations?.slice(0, 2).join(" · ")],
                ["체크인 · 체크아웃", [hotel.checkIn, hotel.checkOut].filter(Boolean).join(" · ")],
              ].filter(([, value]) => Boolean(value)).map(([label, value]) => (
                <div key={label} rounded="lg" bg="ct-surface dark:ct-dark-surface" p="4">
                  <p m="0" text="xs ct-muted dark:ct-dark-muted">{label}</p>
                  <p mt="1.5" mb="0" text="sm ct-text-soft dark:ct-dark-text-soft" font="medium" leading="relaxed">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {hotelPosts.length > 0 ? (
            <div mt="8">
              {hotelPosts.map((post) => (
                <PostRenderer key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div mt="4" max-w="3xl">
              <p m="0" text="base ct-text-soft dark:ct-dark-text-soft" leading="relaxed">
                {hotel.description}
              </p>

              {articleImage && (
                <AffiliateDisclosure show={articleImage.source === "myrealtrip"} />
              )}

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

                  <figcaption mt="2" text="xs ct-muted dark:ct-dark-muted">
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
            <p m="0" text="xs ct-primary dark:ct-dark-text-soft" font="medium" tracking="wide">ROOMS</p>
            <h2 mt="2" mb="0" text="2xl sm:3xl" font="bold" tracking="tight">객실</h2>
            <div mt="8" grid="~ cols-1 lg:2" gap="5">
              {hotel.rooms.map((room, index) => (
                <HotelRoomCard key={room.id ?? `${room.name}-${index}`} room={room} />
              ))}
            </div>
          </Container>
        </Section>
      )}

      {hotel.facilities && hotel.facilities.length > 0 && <HotelFacilities hotel={hotel} />}

      {hotel.restaurants && hotel.restaurants.length > 0 && (
        <Section id="dining" borderTop>
          <Container>
            <p m="0" text="xs ct-primary dark:ct-dark-text-soft" font="medium" tracking="wide">DINING</p>
            <h2 mt="2" mb="0" text="2xl sm:3xl" font="bold" tracking="tight">다이닝</h2>
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
        <Section id="faq" borderTop>
          <Container>
            <p m="0" text="xs ct-primary dark:ct-dark-text-soft" font="medium" tracking="wide">FAQ</p>
            <h2 mt="2" mb="0" text="2xl sm:3xl" font="bold" tracking="tight">자주 묻는 질문</h2>
            <div mt="8" grid="~ cols-1" gap="4">
              {hotelPost.faq.map((item) => (
                <details key={item.question} rounded="xl"
                  border="~ ct-line dark:ct-dark-line" bg="ct-surface dark:ct-dark-surface" p="5">
                  <summary cursor="pointer" text="base ct-text dark:ct-dark-text" font="bold">
                    {item.question}
                  </summary>
                  <p mt="4" mb="0" text="sm ct-text-soft dark:ct-dark-text-soft" leading="relaxed">
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

      <RelatedGuides posts={relatedGuides} />

      {relatedHotels.length > 0 && (
        <RelatedHotels hotels={relatedHotels} currentHotel={hotel} />
      )}
    </main>
  );
}
