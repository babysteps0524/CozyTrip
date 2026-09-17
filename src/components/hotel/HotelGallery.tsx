import type { Hotel } from "../../types";

import { Image } from "../common";

interface HotelGalleryProps {
  hotel: Hotel;
}

export default function HotelGallery({ hotel }: HotelGalleryProps) {
  const images = hotel.images.filter(
    (image) => image.src && image.rightsConfirmed,
  );

  if (images.length === 0) {
    return (
      <section>
        <div
          min-h="56 sm:80 lg:96"
          flex="~"
          items="center"
          justify="center"
          bg="ct-surface-soft dark:bg-ct-dark-surface-soft"
          text="sm ct-muted dark:ct-dark-muted"
        >
          <div text="center">
            <p m="0" font="medium">
              Hotel Image
            </p>

            <p mt="2" mb="0" text="xs ct-muted dark:ct-dark-muted">
              등록된 호텔 이미지가 없습니다.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const heroImage = images[0];

  const thumbnails = images.slice(1, 5);

  return (
    <section>
      <div grid="~ cols-1 lg:2" gap="2">
        <div
          overflow="hidden"
          bg="ct-surface-soft dark:bg-ct-dark-surface-soft"
          aspect="16/10"
        >
          <Image
            src={heroImage.src}
            alt={heroImage.alt}
            width={heroImage.width}
            height={heroImage.height}
            image={heroImage}
            loading="eager"
            fetchPriority="high"
            aspectRatio="16/10"
          />
        </div>

        {thumbnails.length > 0 && (
          <div grid="~ cols-2" gap="2">
            {thumbnails.map((image) => (
              <div
                key={image.id}
                overflow="hidden"
                bg="ct-surface-soft dark:bg-ct-dark-surface-soft"
                aspect="16/10"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  image={image}
                  aspectRatio="16/10"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
