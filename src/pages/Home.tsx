import { Container, Section } from "../components/common";
import { HotelCard } from "../components/hotel";

interface HomeProps {
  destinations: import("../types").Destination[];
  hotels: import("../types").Hotel[];
}

export default function Home({ destinations, hotels }: HomeProps) {
  const featuredHotels = hotels.slice(0, 6);

  return (
    <>
      <section className="border-b border-ct-line dark:border-ct-dark-line">
        <Container>
          <div className="max-w-3xl py-14 sm:py-18">
            <p className="m-0 text-xs font-semibold tracking-[0.16em] text-ct-primary dark:text-ct-dark-text-soft">
              COZYTRIP · JAPAN HOTELS
            </p>
            <h1 className="mt-4 mb-0 text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
              일본 호텔을
              <br />
              쉽게 찾아보세요.
            </h1>
            <p className="mt-5 mb-0 max-w-2xl text-sm leading-7 text-ct-text-soft sm:text-base dark:text-ct-dark-text-soft">
              CozyTrip 코지트립은 일본 호텔의 위치, 객실, 시설과 주변 정보를
              보기 쉽게 정리해 소개합니다.
            </p>
          </div>
        </Container>
      </section>

      <Section>
        <Container>
          <div>
            <h2 className="m-0 text-2xl font-bold tracking-tight sm:text-3xl">
              도시별 호텔
            </h2>
            <p className="mt-2 mb-0 text-sm text-ct-text-soft dark:text-ct-dark-text-soft">
              원하는 도시를 선택해 호텔을 찾아보세요.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {destinations.map((destination) => (
              <a
                key={destination.id}
                href={"/japan/" + destination.slug + "/hotels/"}
                className="ct-focus rounded-xl border border-ct-line bg-ct-surface px-3 py-4 text-center text-sm font-semibold text-ct-text transition-transform hover:-translate-y-0.5 hover:bg-ct-surface-soft dark:border-ct-dark-line dark:bg-ct-dark-surface dark:text-ct-dark-text dark:hover:bg-ct-dark-surface-soft"
                active-scale="98"
              >
                {destination.name} 호텔
              </a>
            ))}
          </div>
        </Container>
      </Section>

      <Section borderTop surface>
        <Container>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="m-0 text-2xl font-bold tracking-tight sm:text-3xl">
                호텔 소개
              </h2>
              <p className="mt-2 mb-0 text-sm text-ct-text-soft dark:text-ct-dark-text-soft">
                일본 호텔 정보를 하나씩 살펴보세요.
              </p>
            </div>
            <a
              href="/japan/tokyo/hotels/"
              className="ct-focus shrink-0 text-sm font-semibold text-ct-primary dark:text-ct-dark-text"
              active-scale="98"
            >
              호텔 전체 보기 →
            </a>
          </div>

          {featuredHotels.length > 0 ? (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featuredHotels.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} />
              ))}
            </div>
          ) : (
            <p className="mt-6 rounded-xl border border-ct-line p-8 text-center text-sm text-ct-muted dark:border-ct-dark-line dark:text-ct-dark-muted">
              호텔 소개를 준비하고 있습니다.
            </p>
          )}
        </Container>
      </Section>
    </>
  );
}
