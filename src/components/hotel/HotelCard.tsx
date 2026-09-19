import type { Hotel } from "../../types";

import { Image } from "../common";
import { isDisplayableHotelImage } from "../../lib/image";

interface HotelCardProps {
  hotel: Hotel;
}

function getHotelPath(hotel: Hotel): string {
  const destinationSlug = hotel.destinationId.replace("japan-", "");

  return `/japan/${destinationSlug}/hotels/${hotel.slug}/`;
}

export default function HotelCard({ hotel }: HotelCardProps) {
  const image = hotel.images.find(isDisplayableHotelImage);

  return (
    <a
      href={getHotelPath(hotel)}
      display="block"
      h="full"
      overflow="hidden"
      rounded="card"
      border="~ ct-line dark:ct-dark-line"
      bg="ct-surface dark:ct-dark-surface"
      transition="transform duration-150"
      hover="shadow-card"
      active-scale="98"
    >
      {image ? (
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          image={image}
          aspectRatio="16/10"
        />
      ) : (
        <div
          aspect="16/10"
          flex="~"
          items="center"
          justify="center"
          bg="ct-surface-soft dark:bg-ct-dark-surface-soft"
          text="sm ct-muted dark:ct-dark-muted"
        >
          호텔 이미지를 준비 중입니다.
        </div>
      )}

      <div p="5">
        <p m="0" text="xs ct-primary dark:ct-dark-text-soft" font="medium">
          {hotel.city} · {hotel.area}
        </p>

        <h2
          mt="2"
          mb="0"
          text="lg ct-text dark:ct-dark-text"
          font="bold"
          leading="snug"
        >
          {hotel.name}
        </h2>

        {hotel.nameEn && (
          <p mt="1" mb="0" text="sm ct-muted dark:ct-dark-muted">
            {hotel.nameEn}
          </p>
        )}

        <div mt="4" flex="~ wrap" items="center" gap="2">
          {hotel.accommodationType && (
            <span
              rounded="full"
              border="~ ct-line dark:ct-dark-line"
              bg="ct-surface-soft dark:bg-ct-dark-surface-soft"
              px="3"
              py="1"
              text="xs ct-text-soft dark:ct-dark-text-soft"
            >
              {hotel.accommodationType}
            </span>
          )}

          {hotel.starRating !== undefined && (
            <span
              rounded="full"
              border="~ ct-line dark:ct-dark-line"
              bg="ct-surface-soft dark:bg-ct-dark-surface-soft"
              px="3"
              py="1"
              text="xs ct-text-soft dark:ct-dark-text-soft"
            >
              {hotel.starRating}성급
            </span>
          )}
        </div>

        <p
          mt="4"
          mb="0"
          line-clamp="3"
          text="sm ct-text-soft dark:ct-dark-text-soft"
          leading="relaxed"
        >
          {hotel.description}
        </p>

        <div
          mt="5"
          flex="~"
          items="center"
          justify="between"
          gap="3"
          text="sm ct-primary dark:ct-dark-text"
          font="medium"
        >
          <span>호텔 자세히 보기</span>

          <span aria-hidden="true" text="lg">
            →
          </span>
        </div>
      </div>
    </a>
  );
}
