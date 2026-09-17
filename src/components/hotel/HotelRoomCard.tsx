import type { HotelRoom } from "../../types";

interface HotelRoomCardProps {
  room: HotelRoom;
}

function getRoomImages(room: HotelRoom) {
  return (room.images ?? []).filter((image) => image.rightsConfirmed);
}

export default function HotelRoomCard({ room }: HotelRoomCardProps) {
  const images = getRoomImages(room);

  return (
    <article
      overflow="hidden"
      rounded="card"
      border="~ ct-line dark:ct-dark-line"
      bg="ct-surface dark:ct-dark-surface"
    >
      {images.length > 0 && (
        <div
          grid="~ cols-2"
          gap="1"
          bg="ct-surface-soft dark:ct-dark-surface-soft"
        >
          {images.slice(0, 3).map((image, index) => (
            <img
              key={image.id}
              src={image.src}
              alt={image.alt}
              width={image.width ?? 1200}
              height={image.height ?? 800}
              loading={index === 0 ? "eager" : "lazy"}
              decoding="async"
              w="full"
              h="full"
              min-h="32 sm:40"
              object="cover"
              class={index === 0 && images.length > 1 ? "col-span-2" : undefined}
            />
          ))}
        </div>
      )}

      <div p="5 sm:6">
        <h3 m="0" text="lg ct-text dark:ct-dark-text" font="bold">
          {room.name}
        </h3>

        {room.description && (
          <p
            mt="3"
            mb="0"
            text="sm ct-text-soft dark:ct-dark-text-soft"
            leading="relaxed"
          >
            {room.description}
          </p>
        )}

        {(room.maxOccupancy || room.size || room.bedType) && (
          <div
            mt="5"
            flex="~ wrap"
            gap="2"
            text="xs ct-muted dark:ct-dark-muted"
          >
            {room.maxOccupancy && (
              <span
                rounded="full"
                bg="ct-surface-soft dark:bg-ct-dark-surface-soft"
                px="3"
                py="1.5"
              >
                최대 {room.maxOccupancy}명
              </span>
            )}
            {room.size && (
              <span
                rounded="full"
                bg="ct-surface-soft dark:bg-ct-dark-surface-soft"
                px="3"
                py="1.5"
              >
                {room.size}㎡
              </span>
            )}
            {room.bedType && (
              <span
                rounded="full"
                bg="ct-surface-soft dark:bg-ct-dark-surface-soft"
                px="3"
                py="1.5"
              >
                {room.bedType}
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
