import type { HotelRestaurant } from "../../types";

interface HotelRestaurantCardProps {
  restaurant: HotelRestaurant;
}

function getRestaurantImages(restaurant: HotelRestaurant) {
  return (restaurant.images ?? []).filter((image) => image.rightsConfirmed);
}

export default function HotelRestaurantCard({
  restaurant,
}: HotelRestaurantCardProps) {
  const images = getRestaurantImages(restaurant);
  const mealTypes = restaurant.mealTypes?.filter(Boolean) ?? [];

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
          bg="ct-surface-soft dark:bg-ct-dark-surface-soft"
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
              col-span={index === 0 && images.length > 1 ? "2" : undefined}
            />
          ))}
        </div>
      )}

      <div p="5 sm:6">
        <div flex="~ wrap" items="center" gap="2">
          <h3 m="0" text="lg ct-text dark:ct-dark-text" font="bold">
            {restaurant.name}
          </h3>

          {restaurant.cuisine && (
            <span
              rounded="full"
              bg="ct-surface-soft dark:bg-ct-dark-surface-soft"
              px="3"
              py="1"
              text="xs ct-text-soft dark:ct-dark-text-soft"
            >
              {restaurant.cuisine}
            </span>
          )}
        </div>

        {mealTypes.length > 0 && (
          <div mt="3" flex="~ wrap" gap="2">
            {mealTypes.map((mealType) => (
              <span
                key={mealType}
                border="~ ct-line dark:ct-dark-line"
                rounded="full"
                px="3"
                py="1"
                text="xs ct-text-soft dark:ct-dark-text-soft"
              >
                {mealType}
              </span>
            ))}
          </div>
        )}

        {restaurant.description && (
          <p
            mt="4"
            mb="0"
            text="sm ct-text-soft dark:ct-dark-text-soft"
            leading="relaxed"
          >
            {restaurant.description}
          </p>
        )}

        {(restaurant.openingHours || restaurant.location) && (
          <dl
            mt="5"
            pt="4"
            border="t ct-line dark:ct-dark-line"
            grid="~ cols-1 sm:2"
            gap="3"
            text="sm"
          >
            {restaurant.openingHours && (
              <div>
                <dt text="xs ct-muted dark:ct-dark-muted">운영 시간</dt>
                <dd mt="1" mb="0" text="ct-text dark:ct-dark-text">
                  {restaurant.openingHours}
                </dd>
              </div>
            )}

            {restaurant.location && (
              <div>
                <dt text="xs ct-muted dark:ct-dark-muted">위치</dt>
                <dd mt="1" mb="0" text="ct-text dark:ct-dark-text">
                  {restaurant.location}
                </dd>
              </div>
            )}
          </dl>
        )}
      </div>
    </article>
  );
}
