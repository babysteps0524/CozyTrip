import type { HotelRoom } from "../../types";
import { Image } from "../common";

interface HotelRoomCardProps {
  room: HotelRoom;
}

function getRoomImages(room: HotelRoom) {
  return (room.images ?? []).filter(
    (image) => Boolean(image.src) && image.rightsConfirmed,
  );
}

export default function HotelRoomCard({ room }: HotelRoomCardProps) {
  const images = getRoomImages(room);
  const facts = [
    room.maxOccupancy ? `최대 ${room.maxOccupancy}명` : undefined,
    room.size ? `${room.size}㎡` : undefined,
    room.bedType || undefined,
  ].filter(Boolean) as string[];

  return (
    <article className="ct-card h-full">
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-1 bg-ct-surface-soft dark:bg-ct-dark-surface-soft">
          {images.slice(0, 3).map((image, index) => (
            <div
              key={image.id}
              className={`${index === 0 && images.length > 1 ? "col-span-2" : ""} aspect-[16/10] overflow-hidden sm:aspect-[3/2]`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                width={image.width ?? 1200}
                height={image.height ?? 800}
                image={image}
                aspectRatio="16/10"
                loading={index === 0 ? "lazy" : "lazy"}
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex h-full flex-col p-5 sm:p-6">
        <div>
          <p className="m-0 text-xs font-semibold tracking-wide text-ct-primary dark:text-ct-dark-text-soft">
            ROOM
          </p>
          <h3 className="mt-2 mb-0 text-lg font-bold leading-snug text-ct-text dark:text-ct-dark-text">
            {room.name}
          </h3>

          {facts.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {facts.map((fact) => (
                <span
                  key={fact}
                  className="rounded-full border border-ct-line bg-ct-surface-soft px-3 py-1 text-xs text-ct-text-soft dark:border-ct-dark-line dark:bg-ct-dark-surface-soft dark:text-ct-dark-text-soft"
                >
                  {fact}
                </span>
              ))}
            </div>
          )}

          {room.description && (
            <p className="mt-4 mb-0 text-sm leading-7 text-ct-text-soft dark:text-ct-dark-text-soft">
              {room.description}
            </p>
          )}
        </div>

        {facts.length > 0 && (
          <p className="mt-5 mb-0 border-t border-ct-line pt-4 text-xs text-ct-muted dark:border-ct-dark-line dark:text-ct-dark-muted">
            객실 정보는 제공된 호텔 데이터 기준입니다.
          </p>
        )}
      </div>
    </article>
  );
}
