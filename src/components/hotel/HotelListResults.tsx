import { useMemo, useState } from "react";
import type { Hotel } from "../../types";
import { HotelCard } from "../hotel";

interface HotelListResultsProps {
  hotels: Hotel[];
}

type SortOption = "name" | "star-desc" | "star-asc";

function getAreaOptions(hotels: Hotel[]): string[] {
  return Array.from(new Set(hotels.map((hotel) => hotel.area.trim()).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b, "ko"),
  );
}

function compareHotels(a: Hotel, b: Hotel, sort: SortOption): number {
  if (sort === "star-desc") {
    return (b.starRating ?? -1) - (a.starRating ?? -1) || a.name.localeCompare(b.name, "ko");
  }

  if (sort === "star-asc") {
    return (a.starRating ?? 99) - (b.starRating ?? 99) || a.name.localeCompare(b.name, "ko");
  }

  return a.name.localeCompare(b.name, "ko");
}

export default function HotelListResults({ hotels }: HotelListResultsProps) {
  const [query, setQuery] = useState("");
  const [area, setArea] = useState("all");
  const [sort, setSort] = useState<SortOption>("name");

  const areas = useMemo(() => getAreaOptions(hotels), [hotels]);

  const filteredHotels = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return hotels
      .filter((hotel) => {
        const matchesArea = area === "all" || hotel.area === area;

        if (!normalizedQuery) {
          return matchesArea;
        }

        const searchableText = [
          hotel.name,
          hotel.nameEn,
          hotel.city,
          hotel.area,
          hotel.accommodationType,
          hotel.description,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return matchesArea && searchableText.includes(normalizedQuery);
      })
      .sort((a, b) => compareHotels(a, b, sort));
  }, [area, hotels, query, sort]);

  return (
    <>
      <div
        mt="8"
        rounded="2xl"
        border="~ ct-line dark:ct-dark-line"
        bg="ct-surface-soft dark:bg-ct-dark-surface-soft"
        p="4 sm:5"
      >
        <div grid="~ cols-1 lg:3" gap="3">
          <label>
            <span display="block" mb="2" text="xs ct-muted dark:ct-dark-muted" font="medium">
              호텔 검색
            </span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              type="search"
              placeholder="호텔명, 지역, 숙소 유형"
              aria-label="호텔 검색"
              w="full"
              min-h="11"
              rounded="xl"
              border="~ ct-line dark:ct-dark-line"
              bg="ct-surface dark:bg-ct-dark-surface"
              px="4"
              py="2.5"
              text="sm ct-text dark:ct-dark-text"
              outline="none"
              focus="border-ct-primary"
            />
          </label>

          <label>
            <span display="block" mb="2" text="xs ct-muted dark:ct-dark-muted" font="medium">
              지역
            </span>
            <select
              value={area}
              onChange={(event) => setArea(event.target.value)}
              aria-label="호텔 지역 필터"
              w="full"
              min-h="11"
              rounded="xl"
              border="~ ct-line dark:ct-dark-line"
              bg="ct-surface dark:bg-ct-dark-surface"
              px="4"
              py="2.5"
              text="sm ct-text dark:ct-dark-text"
              outline="none"
              focus="border-ct-primary"
            >
              <option value="all">전체 지역</option>
              {areas.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span display="block" mb="2" text="xs ct-muted dark:ct-dark-muted" font="medium">
              정렬
            </span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortOption)}
              aria-label="호텔 정렬"
              w="full"
              min-h="11"
              rounded="xl"
              border="~ ct-line dark:ct-dark-line"
              bg="ct-surface dark:bg-ct-dark-surface"
              px="4"
              py="2.5"
              text="sm ct-text dark:ct-dark-text"
              outline="none"
              focus="border-ct-primary"
            >
              <option value="name">호텔명 순</option>
              <option value="star-desc">성급 높은 순</option>
              <option value="star-asc">성급 낮은 순</option>
            </select>
          </label>
        </div>

        <div mt="4" flex="~ wrap" items="center" justify="between" gap="3">
          <p m="0" text="sm ct-text-soft dark:ct-dark-text-soft">
            검색 결과 <strong text="ct-text dark:ct-dark-text">{filteredHotels.length}</strong>곳
          </p>

          {(query || area !== "all" || sort !== "name") && (
            <button
              type="button"
              border="0"
              bg="transparent"
              p="0"
              text="sm ct-primary dark:ct-dark-text"
              font="medium"
              cursor="pointer"
              active-scale="98"
              onClick={() => {
                setQuery("");
                setArea("all");
                setSort("name");
              }}
            >
              필터 초기화
            </button>
          )}
        </div>
      </div>

      {filteredHotels.length > 0 ? (
        <div mt="8" grid="~ cols-1 sm:2 lg:3" gap="4 lg:6">
          {filteredHotels.map((hotel) => (
            <HotelCard key={hotel.id} hotel={hotel} />
          ))}
        </div>
      ) : (
        <div
          mt="8"
          rounded="card"
          border="~ ct-line dark:ct-dark-line"
          bg="ct-surface dark:ct-dark-surface"
          px="6"
          py="12"
          text="center"
        >
          <p m="0" text="base ct-text dark:ct-dark-text" font="medium">
            조건에 맞는 호텔이 없습니다.
          </p>
          <p mt="2" mb="0" text="sm ct-muted dark:ct-dark-muted">
            검색어나 지역을 변경해 다시 확인해 주세요.
          </p>
        </div>
      )}
    </>
  );
}
