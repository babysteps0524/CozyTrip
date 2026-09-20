import type { Hotel } from "../../types";
import { Container } from "../common";
import HotelCard from "./HotelCard";

interface RelatedHotelsProps {
  hotels: Hotel[];
  currentHotel: Hotel;
}

function getRelationLabel(hotel: Hotel, currentHotel: Hotel): string {
  if (hotel.area && currentHotel.area && hotel.area === currentHotel.area) {
    return "같은 지역";
  }

  if (
    hotel.accommodationType &&
    currentHotel.accommodationType &&
    hotel.accommodationType === currentHotel.accommodationType
  ) {
    return "같은 숙소 유형";
  }

  return "같은 지역의 다른 호텔";
}

export default function RelatedHotels({
  hotels,
  currentHotel,
}: RelatedHotelsProps) {
  const relatedHotels = hotels
    .filter((hotel) => hotel.id !== currentHotel.id)
    .map((hotel, index) => ({
      hotel,
      index,
    }))
    .sort((a, b) => {
      const aSameArea =
        a.hotel.area && currentHotel.area && a.hotel.area === currentHotel.area ? 1 : 0;
      const bSameArea =
        b.hotel.area && currentHotel.area && b.hotel.area === currentHotel.area ? 1 : 0;

      if (aSameArea !== bSameArea) {
        return bSameArea - aSameArea;
      }

      const aSameType =
        a.hotel.accommodationType &&
        currentHotel.accommodationType &&
        a.hotel.accommodationType === currentHotel.accommodationType
          ? 1
          : 0;
      const bSameType =
        b.hotel.accommodationType &&
        currentHotel.accommodationType &&
        b.hotel.accommodationType === currentHotel.accommodationType
          ? 1
          : 0;

      if (aSameType !== bSameType) {
        return bSameType - aSameType;
      }

      const nameOrder = a.hotel.name.localeCompare(b.hotel.name, "ko");
      return nameOrder !== 0 ? nameOrder : a.index - b.index;
    })
    .slice(0, 3)
    .map(({ hotel }) => hotel);

  if (relatedHotels.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="related-hotels-title" className="border-t border-ct-line bg-ct-surface dark:border-ct-dark-line dark:bg-ct-dark-surface">
      <Container>
        <div className="py-12 sm:py-16 lg:py-20">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p
                m="0"
                text="xs ct-primary dark:ct-dark-text-soft"
                font="medium"
                tracking="wide"
              >
                RELATED HOTELS
              </p>
              <h2
                id="related-hotels-title"
                mt="2"
                mb="0"
                text="2xl sm:3xl"
                font="bold"
                tracking="tight"
              >
                함께 살펴볼 호텔
              </h2>
            </div>

            <a
              href={`/japan/${currentHotel.destinationId.replace("japan-", "")}/hotels/`}
              className="ct-focus shrink-0 self-start rounded-xl border border-ct-line bg-ct-surface px-4 py-2.5 text-sm font-semibold text-ct-text-soft transition-colors hover:border-ct-primary hover:text-ct-primary dark:border-ct-dark-line dark:bg-ct-dark-surface dark:text-ct-dark-text-soft dark:hover:border-ct-dark-text dark:hover:text-ct-dark-text"
              active-scale="98"
            >
              지역 호텔 전체 보기
            </a>
          </div>

          <p
            mt="3"
            mb="0"
            max-w="2xl"
            text="sm ct-text-soft dark:ct-dark-text-soft"
            leading="relaxed"
          >
            현재 호텔과 같은 지역 또는 숙소 유형을 기준으로 함께 살펴볼 수 있는 호텔입니다.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {relatedHotels.map((hotel) => (
              <div key={hotel.id} className="flex h-full flex-col">
                <div
                  mb="2"
                  px="1"
                  text="xs ct-muted dark:ct-dark-muted"
                  font="medium"
                >
                  {getRelationLabel(hotel, currentHotel)}
                </div>
                <div className="flex-1">
                  <HotelCard hotel={hotel} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
