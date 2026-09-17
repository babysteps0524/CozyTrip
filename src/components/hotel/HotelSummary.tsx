import type { Hotel } from "../../types";
import { Container } from "../common";

interface HotelSummaryProps {
  hotel: Hotel;
}

function formatRating(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export default function HotelSummary({ hotel }: HotelSummaryProps) {
  const hasRating = hotel.ratingAverage !== undefined;
  const hasStayInfo = Boolean(hotel.checkIn || hotel.checkOut);

  return (
    <section border="b ct-line dark:ct-dark-line">
      <Container>
        <div py="10 sm:12 lg:16" grid="~ cols-1 lg:3" gap="8 lg:12">
          <div col="span-1 lg:span-2">
            <p m="0" text="sm ct-primary dark:ct-dark-text-soft" font="medium">
              {hotel.city} · {hotel.area}
            </p>

            <h1
              mt="2"
              mb="0"
              text="3xl sm:4xl lg:5xl"
              font="bold"
              tracking="tight"
              leading="tight"
            >
              {hotel.name}
            </h1>

            {hotel.nameEn && (
              <p mt="2" mb="0" text="base ct-muted dark:ct-dark-muted">
                {hotel.nameEn}
              </p>
            )}

            <div mt="5" flex="~ wrap" items="center" gap="2 sm:3">
              {hotel.accommodationType && (
                <span
                  rounded="full"
                  bg="ct-surface-soft dark:bg-ct-dark-surface-soft"
                  px="3"
                  py="1.5"
                  text="xs sm:sm ct-text-soft dark:ct-dark-text-soft"
                >
                  {hotel.accommodationType}
                </span>
              )}

              {hotel.starRating !== undefined && hotel.starRating > 0 && (
                <span
                  rounded="full"
                  bg="ct-surface-soft dark:bg-ct-dark-surface-soft"
                  px="3"
                  py="1.5"
                  text="xs sm:sm ct-text-soft dark:ct-dark-text-soft"
                >
                  {hotel.starRating}성급
                </span>
              )}

              {hasRating && (
                <span
                  rounded="full"
                  bg="ct-primary-soft dark:bg-ct-dark-surface-soft"
                  px="3"
                  py="1.5"
                  text="xs sm:sm ct-text dark:ct-dark-text"
                  font="medium"
                >
                  평점 {formatRating(hotel.ratingAverage!)}
                  {hotel.numberOfReviews !== undefined &&
                    ` · 리뷰 ${hotel.numberOfReviews.toLocaleString("ko-KR")}개`}
                </span>
              )}
            </div>

            <p
              mt="6"
              mb="0"
              max-w="3xl"
              text="base sm:lg ct-text-soft dark:ct-dark-text-soft"
              leading="relaxed"
            >
              {hotel.description}
            </p>
          </div>

          <aside
            rounded="card"
            border="~ ct-line dark:ct-dark-line"
            bg="ct-surface-soft dark:bg-ct-dark-surface-soft"
            p="5 sm:6"
          >
            <p
              m="0"
              text="xs ct-primary dark:ct-dark-text-soft"
              font="medium"
              tracking="wide"
            >
              HOTEL INFO
            </p>

            <div mt="4" grid="~ cols-1 sm:2 lg:cols-1" gap="4">
              <div>
                <p m="0" text="xs ct-muted dark:ct-dark-muted">
                  위치
                </p>
                <p mt="1.5" mb="0" text="sm ct-text dark:ct-dark-text" font="medium">
                  {hotel.location.city} · {hotel.location.area}
                </p>
              </div>

              {hotel.location.nearestStations &&
                hotel.location.nearestStations.length > 0 && (
                  <div>
                    <p m="0" text="xs ct-muted dark:ct-dark-muted">
                      가까운 역
                    </p>
                    <p
                      mt="1.5"
                      mb="0"
                      text="sm ct-text-soft dark:ct-dark-text-soft"
                      leading="relaxed"
                    >
                      {hotel.location.nearestStations.slice(0, 2).join(" · ")}
                    </p>
                  </div>
                )}

              {hasStayInfo && (
                <div grid="~ cols-2" gap="3" sm="col-span-2" lg="col-span-1">
                  {hotel.checkIn && (
                    <div>
                      <p m="0" text="xs ct-muted dark:ct-dark-muted">
                        체크인
                      </p>
                      <p mt="1.5" mb="0" text="sm ct-text dark:ct-dark-text" font="medium">
                        {hotel.checkIn}
                      </p>
                    </div>
                  )}

                  {hotel.checkOut && (
                    <div>
                      <p m="0" text="xs ct-muted dark:ct-dark-muted">
                        체크아웃
                      </p>
                      <p mt="1.5" mb="0" text="sm ct-text dark:ct-dark-text" font="medium">
                        {hotel.checkOut}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </aside>
        </div>
      </Container>
    </section>
  );
}
