import type { HotelRestaurant } from "../../types";
import { Image } from "../common";

interface HotelRestaurantCardProps {
  restaurant: HotelRestaurant;
}

function getRestaurantImages(restaurant: HotelRestaurant) {
  return (restaurant.images ?? []).filter(
    (image) => Boolean(image.src) && image.rightsConfirmed,
  );
}

export default function HotelRestaurantCard({
  restaurant,
}: HotelRestaurantCardProps) {
  const images = getRestaurantImages(restaurant);
  const mealTypes = restaurant.mealTypes?.filter(Boolean) ?? [];

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
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex h-full flex-col p-5 sm:p-6">
        <div>
          <p className="m-0 text-xs font-semibold tracking-wide text-ct-primary dark:text-ct-dark-text-soft">
            DINING
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h3 className="m-0 text-lg font-bold leading-snug text-ct-text dark:text-ct-dark-text">
              {restaurant.name}
            </h3>

            {restaurant.cuisine && (
              <span className="rounded-full bg-ct-surface-soft px-3 py-1 text-xs text-ct-text-soft dark:bg-ct-dark-surface-soft dark:text-ct-dark-text-soft">
                {restaurant.cuisine}
              </span>
            )}
          </div>

          {mealTypes.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {mealTypes.map((mealType) => (
                <span
                  key={mealType}
                  className="rounded-full border border-ct-line px-3 py-1 text-xs text-ct-text-soft dark:border-ct-dark-line dark:text-ct-dark-text-soft"
                >
                  {mealType}
                </span>
              ))}
            </div>
          )}

          {restaurant.description && (
            <p className="mt-4 mb-0 text-sm leading-7 text-ct-text-soft dark:text-ct-dark-text-soft">
              {restaurant.description}
            </p>
          )}

          {(restaurant.openingHours || restaurant.location) && (
            <dl className="mt-5 grid grid-cols-1 gap-3 border-t border-ct-line pt-4 text-sm dark:border-ct-dark-line sm:grid-cols-2">
              {restaurant.openingHours && (
                <div>
                  <dt className="text-xs text-ct-muted dark:text-ct-dark-muted">
                    운영 시간
                  </dt>
                  <dd className="mt-1 mb-0 leading-6 text-ct-text dark:text-ct-dark-text">
                    {restaurant.openingHours}
                  </dd>
                </div>
              )}

              {restaurant.location && (
                <div>
                  <dt className="text-xs text-ct-muted dark:text-ct-dark-muted">
                    위치
                  </dt>
                  <dd className="mt-1 mb-0 leading-6 text-ct-text dark:text-ct-dark-text">
                    {restaurant.location}
                  </dd>
                </div>
              )}
            </dl>
          )}
        </div>

        {(restaurant.openingHours || restaurant.location) && (
          <p className="mt-5 mb-0 text-xs text-ct-muted dark:text-ct-dark-muted">
            운영 정보는 제공된 호텔 데이터 기준입니다.
          </p>
        )}
      </div>
    </article>
  );
}
