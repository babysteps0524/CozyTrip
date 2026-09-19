import { Container, Section } from "../components/common";
import { DestinationCard } from "../components/destination";
import { HotelCard } from "../components/hotel";
import { PostCard } from "../components/post";

interface HomeProps {
  destinations: import("../types").Destination[];
  hotels: import("../types").Hotel[];
  guides: import("../types").Post[];
}

export default function Home({ destinations, hotels, guides }: HomeProps) {
  const featuredDestinations = destinations.slice(0, 6);
  const featuredHotels = hotels.slice(0, 6);
  const featuredGuides = guides.slice(0, 3);

  return (
    <>
      <section className="border-b border-ct-line dark:border-ct-dark-line">
        <Container>
          <div className="max-w-4xl py-16 sm:py-20 lg:py-24">
            <p className="m-0 text-xs font-semibold tracking-[0.18em] text-ct-primary dark:text-ct-dark-text-soft">
              COZYTRIP · HOTEL GUIDE
            </p>

            <h1 className="mt-5 mb-0 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-ct-text sm:text-5xl lg:text-6xl dark:text-ct-dark-text">
              일본 호텔을 알아보고
              <br />
              여행에 맞는 숙소를 찾아보세요.
            </h1>

            <p className="mt-6 mb-0 max-w-2xl text-base leading-8 text-ct-text-soft sm:text-lg dark:text-ct-dark-text-soft">
              CozyTrip 코지트립은 일본 호텔 정보를 읽기 쉽게 정리해 소개합니다.
              호텔의 위치, 객실, 시설, 식음료와 같은 제공 정보를 확인하고
              예약 사이트로 이동할 수 있습니다.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="/japan/tokyo/hotels/"
                className="ct-button ct-focus bg-ct-primary text-white hover:bg-ct-primary-dark"
                active-scale="95"
              >
                도쿄 호텔 보기
              </a>
              <a
                href="/japan/"
                className="ct-button ct-focus border border-ct-line bg-ct-surface text-ct-text hover:bg-ct-surface-soft dark:border-ct-dark-line dark:bg-ct-dark-surface dark:text-ct-dark-text dark:hover:bg-ct-dark-surface-soft"
                active-scale="95"
              >
                일본 여행지 보기
              </a>
            </div>
          </div>
        </Container>
      </section>

      <Section>
        <Container>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="m-0 text-xs font-semibold tracking-[0.16em] text-ct-primary dark:text-ct-dark-text-soft">
                DESTINATIONS
              </p>
              <h2 className="mt-2 mb-0 text-2xl font-bold tracking-tight sm:text-3xl">
                일본 여행지
              </h2>
              <p className="mt-2 mb-0 text-sm text-ct-text-soft dark:text-ct-dark-text-soft">
                도시별 호텔 소개와 여행 정보를 확인하세요.
              </p>
            </div>
            <a
              href="/japan/"
              className="ct-focus text-sm font-medium text-ct-primary dark:text-ct-dark-text"
              active-scale="98"
            >
              전체 여행지 보기 →
            </a>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {featuredDestinations.map((destination) => (
              <DestinationCard key={destination.id} destination={destination} />
            ))}
          </div>
        </Container>
      </Section>

      <Section borderTop surface>
        <Container>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="m-0 text-xs font-semibold tracking-[0.16em] text-ct-primary dark:text-ct-dark-text-soft">
                HOTEL STORIES
              </p>
              <h2 className="mt-2 mb-0 text-2xl font-bold tracking-tight sm:text-3xl">
                최근 호텔 소개
              </h2>
              <p className="mt-2 mb-0 text-sm text-ct-text-soft dark:text-ct-dark-text-soft">
                실제 제공 데이터에 기반해 호텔의 주요 정보를 정리했습니다.
              </p>
            </div>
            <a
              href="/japan/tokyo/hotels/"
              className="ct-focus text-sm font-medium text-ct-primary dark:text-ct-dark-text"
              active-scale="98"
            >
              호텔 둘러보기 →
            </a>
          </div>

          {featuredHotels.length > 0 ? (
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {featuredHotels.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} />
              ))}
            </div>
          ) : (
            <p className="mt-8 rounded-card border border-ct-line bg-ct-surface p-8 text-center text-sm text-ct-muted dark:border-ct-dark-line dark:bg-ct-dark-surface dark:text-ct-dark-muted">
              호텔 소개를 준비하고 있습니다.
            </p>
          )}
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="m-0 text-xs font-semibold tracking-[0.16em] text-ct-primary dark:text-ct-dark-text-soft">
                TRAVEL GUIDES
              </p>
              <h2 className="mt-2 mb-0 text-2xl font-bold tracking-tight sm:text-3xl">
                일본 여행 가이드
              </h2>
              <p className="mt-2 mb-0 text-sm text-ct-text-soft dark:text-ct-dark-text-soft">
                호텔과 여행지를 살펴볼 때 참고할 수 있는 정보를 모았습니다.
              </p>
            </div>
            <a
              href="/guides/"
              className="ct-focus text-sm font-medium text-ct-primary dark:text-ct-dark-text"
              active-scale="98"
            >
              전체 가이드 보기 →
            </a>
          </div>

          {featuredGuides.length > 0 ? (
            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {featuredGuides.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <p className="mt-8 text-sm text-ct-muted dark:text-ct-dark-muted">
              여행 가이드를 준비하고 있습니다.
            </p>
          )}
        </Container>
      </Section>

      <Section borderTop surface>
        <Container>
          <div className="max-w-2xl">
            <p className="m-0 text-xs font-semibold tracking-[0.16em] text-ct-primary dark:text-ct-dark-text-soft">
              EXPLORE BY AREA
            </p>
            <h2 className="mt-2 mb-0 text-2xl font-bold tracking-tight sm:text-3xl">
              지역별로 찾아보기
            </h2>
            <p className="mt-2 mb-0 text-sm text-ct-text-soft dark:text-ct-dark-text-soft">
              호텔 데이터에 등록된 주요 지역을 살펴볼 수 있습니다.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {destinations
              .flatMap((destination) => destination.popularAreas ?? [])
              .slice(0, 12)
              .map((area, index) => (
                <a
                  key={`${area}-${index}`}
                  href="/japan/"
                  className="ct-focus flex min-h-24 items-center justify-center rounded-xl border border-ct-line bg-ct-surface px-3 py-4 text-center text-sm text-ct-text transition-transform hover:bg-ct-surface-soft dark:border-ct-dark-line dark:bg-ct-dark-surface dark:text-ct-dark-text dark:hover:bg-ct-dark-surface-soft"
                  active-scale="98"
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
