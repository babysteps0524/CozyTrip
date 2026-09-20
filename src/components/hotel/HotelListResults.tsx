import { useEffect, useMemo, useState } from "react";
import type { Hotel } from "../../types";
import HotelCard from "./HotelCard";

interface HotelListResultsProps {
  hotels: Hotel[];
}

type SortOption = "name" | "star-desc" | "star-asc";
type StarFilter = "all" | "5" | "4" | "3" | "2";

const PAGE_SIZE = 16;

function getAreaSearchText(hotel: Hotel): string {
  return [
    hotel.area,
    hotel.location?.area,
    hotel.name,
    hotel.nameEn,
    hotel.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("ko-KR");
}

function getAreaOptions(hotels: Hotel[]): string[] {
  return Array.from(
    new Set(hotels.map((hotel) => hotel.area.trim()).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b, "ko"));
}

function compareHotels(a: Hotel, b: Hotel, sort: SortOption): number {
  if (sort === "star-desc") {
    return (
      (b.starRating ?? -1) - (a.starRating ?? -1) ||
      a.name.localeCompare(b.name, "ko")
    );
  }

  if (sort === "star-asc") {
    return (
      (a.starRating ?? 99) - (b.starRating ?? 99) ||
      a.name.localeCompare(b.name, "ko")
    );
  }

  return a.name.localeCompare(b.name, "ko");
}

function buildListUrl(
  query: string,
  area: string,
  star: StarFilter,
  sort: SortOption,
  page: number,
): string {
  const params = new URLSearchParams();

  if (query.trim()) params.set("q", query.trim());
  if (area !== "all") params.set("area", area);
  if (star !== "all") params.set("star", star);
  if (sort !== "name") params.set("sort", sort);
  if (page > 1) params.set("page", String(page));

  const queryString = params.toString();
  return queryString
    ? `${window.location.pathname}?${queryString}`
    : window.location.pathname;
}

function updateListUrl(
  query: string,
  area: string,
  star: StarFilter,
  sort: SortOption,
  page: number,
): void {
  window.history.replaceState(
    null,
    "",
    buildListUrl(query, city, area, star, sort, page),
  );
}

function getPageNumbers(currentPage: number, totalPages: number): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([
    1,
    totalPages,
    currentPage,
    currentPage - 1,
    currentPage + 1,
  ]);

  const sorted = Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);

  const result: Array<number | "ellipsis"> = [];

  sorted.forEach((page, index) => {
    const previous = sorted[index - 1];

    if (previous !== undefined && page - previous > 1) {
      result.push("ellipsis");
    }

    result.push(page);
  });

  return result;
}

export default function HotelListResults({ hotels }: HotelListResultsProps) {
  const [query, setQuery] = useState("");
  const [area, setArea] = useState("all");
  const [star, setStar] = useState<StarFilter>("all");
  const [sort, setSort] = useState<SortOption>("name");
  const [page, setPage] = useState(1);
  const [isUrlInitialized, setIsUrlInitialized] = useState(false);

  const areas = useMemo(() => getAreaOptions(hotels), [hotels]);

  useEffect(() => {
    const readUrlState = () => {
      const params = new URLSearchParams(window.location.search);
      const nextQuery = params.get("q") ?? "";
      const nextArea = params.get("area") ?? "all";
      const nextStar = params.get("star");
      const nextSort = params.get("sort");
      const nextPage = Number(params.get("page"));

      setQuery(nextQuery);
      setArea(nextArea);

      if (
        nextStar === "5" ||
        nextStar === "4" ||
        nextStar === "3" ||
        nextStar === "2"
      ) {
        setStar(nextStar);
      } else {
        setStar("all");
      }

      if (
        nextSort === "name" ||
        nextSort === "star-desc" ||
        nextSort === "star-asc"
      ) {
        setSort(nextSort);
      } else {
        setSort("name");
      }

      setPage(Number.isInteger(nextPage) && nextPage > 0 ? nextPage : 1);
      setIsUrlInitialized(true);
    };

    readUrlState();
    window.addEventListener("popstate", readUrlState);

    return () => window.removeEventListener("popstate", readUrlState);
  }, []);

  useEffect(() => {
    if (area !== "all" && !areas.includes(area)) setArea("all");
  }, [area, areas]);

  const filteredHotels = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return hotels
      .filter((hotel) => {
        const areaText = getAreaSearchText(hotel);
        const matchesArea = area === "all" || hotel.area === area || areaText.includes(area.toLocaleLowerCase("ko-KR"));
        const matchesStar =
          star === "all" || hotel.starRating === Number(star);

        if (!normalizedQuery) {
          return matchesArea && matchesStar;
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

        return (
          matchesArea &&
          matchesStar &&
          searchableText.includes(normalizedQuery)
        );
      })
      .sort((a, b) => compareHotels(a, b, sort));
  }, [area, hotels, query, sort, star]);

  const totalPages = Math.max(1, Math.ceil(filteredHotels.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedHotels = filteredHotels.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  useEffect(() => {
    if (!isUrlInitialized) return;
    setPage(1);
  }, [area, city, query, sort, star, isUrlInitialized]);

  useEffect(() => {
    if (!isUrlInitialized) return;
    updateListUrl(query, area, star, sort, currentPage);
  }, [area, currentPage, isUrlInitialized, query, sort, star]);

  const goToPage = (nextPage: number) => {
    const safePage = Math.min(Math.max(nextPage, 1), totalPages);
    if (safePage === currentPage) return;

    window.history.pushState(
      null,
      "",
      buildListUrl(query, area, star, sort, safePage),
    );
    setPage(safePage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const hasFilters = query.trim() !== "" || area !== "all" || star !== "all" || sort !== "name";
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <>
      <div className="mt-8 max-w-5xl rounded-2xl border border-ct-line bg-ct-surface-soft p-4 dark:border-ct-dark-line dark:bg-ct-dark-surface-soft sm:p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label>
            <span
              display="block"
              mb="2"
              text="xs ct-muted dark:ct-dark-muted"
              font="medium"
            >
              호텔 검색
            </span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              type="search"
              placeholder="호텔명, 지역, 숙소 유형"
              aria-label="호텔 검색"
              className="h-11 w-full rounded-xl border border-ct-line bg-ct-surface px-4 py-2.5 text-sm text-ct-text outline-none transition-colors focus:border-ct-primary dark:border-ct-dark-line dark:bg-ct-dark-surface dark:text-ct-dark-text"
            />
          </label>

          <label>
            <span
              display="block"
              mb="2"
              text="xs ct-muted dark:ct-dark-muted"
              font="medium"
            >
              지역
            </span>
            <select
              value={area}
              onChange={(event) => setArea(event.target.value)}
              aria-label="호텔 지역 필터"
              className="h-11 w-full rounded-xl border border-ct-line bg-ct-surface px-4 py-2.5 text-sm text-ct-text outline-none transition-colors focus:border-ct-primary dark:border-ct-dark-line dark:bg-ct-dark-surface dark:text-ct-dark-text"
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
            <span
              display="block"
              mb="2"
              text="xs ct-muted dark:ct-dark-muted"
              font="medium"
            >
              성급
            </span>
            <select
              value={star}
              onChange={(event) => setStar(event.target.value as StarFilter)}
              aria-label="호텔 성급 필터"
              className="h-11 w-full rounded-xl border border-ct-line bg-ct-surface px-4 py-2.5 text-sm text-ct-text outline-none transition-colors focus:border-ct-primary dark:border-ct-dark-line dark:bg-ct-dark-surface dark:text-ct-dark-text"
            >
              <option value="all">전체 성급</option>
              <option value="5">5성급</option>
              <option value="4">4성급</option>
              <option value="3">3성급</option>
              <option value="2">2성급</option>
            </select>
          </label>

          <label>
            <span
              display="block"
              mb="2"
              text="xs ct-muted dark:ct-dark-muted"
              font="medium"
            >
              정렬
            </span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortOption)}
              aria-label="호텔 정렬"
              className="h-11 w-full rounded-xl border border-ct-line bg-ct-surface px-4 py-2.5 text-sm text-ct-text outline-none transition-colors focus:border-ct-primary dark:border-ct-dark-line dark:bg-ct-dark-surface dark:text-ct-dark-text"
            >
              <option value="name">호텔명 순</option>
              <option value="star-desc">성급 높은 순</option>
              <option value="star-asc">성급 낮은 순</option>
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-ct-line pt-4 dark:border-ct-dark-line">
          <p m="0" text="sm ct-text-soft dark:ct-dark-text-soft">
            검색 결과{" "}
            <strong text="ct-text dark:ct-dark-text">
              {filteredHotels.length}
            </strong>
            곳
          </p>

          {hasFilters && (
            <button
              type="button"
              border="0"
              bg="transparent"
              p="0"
              text="sm ct-primary dark:ct-dark-text"
              font="medium"
              cursor="pointer"
              active-scale="0.95"
              onClick={() => {
                setQuery("");
                setArea("all");
                setStar("all");
                setSort("name");
              }}
            >
              필터 초기화
            </button>
          )}
        </div>
      </div>

      {filteredHotels.length > 0 ? (
        <>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5 xl:grid-cols-4">
            {pagedHotels.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </div>

          {totalPages > 1 && (
            <nav
              mt="10"
              flex="~ wrap"
              items="center"
              justify="center"
              gap="2"
              aria-label="호텔 목록 페이지 이동"
            >
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => goToPage(currentPage - 1)}
                min-w="11"
                min-h="11"
                rounded="xl"
                border="~ ct-line dark:ct-dark-line"
                bg="ct-surface dark:bg-ct-dark-surface"
                px="4"
                py="2.5"
                text="sm ct-text dark:ct-dark-text"
                disabled-opacity="50"
                active-scale="0.95"
              >
                이전
              </button>

              <div flex="~ wrap" items="center" justify="center" gap="2">
                {pageNumbers.map((pageNumber, index) =>
                  pageNumber === "ellipsis" ? (
                    <span
                      key={`ellipsis-${index}`}
                      min-w="11"
                      min-h="11"
                      flex="~"
                      items="center"
                      justify="center"
                      text="sm ct-muted dark:ct-dark-muted"
                      aria-hidden="true"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={pageNumber}
                      type="button"
                      aria-label={`${pageNumber}페이지`}
                      aria-current={pageNumber === currentPage ? "page" : undefined}
                      onClick={() => goToPage(pageNumber)}
                      min-w="11"
                      min-h="11"
                      rounded="xl"
                      border="~ ct-line dark:ct-dark-line"
                      bg={pageNumber === currentPage ? "ct-primary" : "ct-surface dark:bg-ct-dark-surface"}
                      text={pageNumber === currentPage ? "white" : "sm ct-text dark:ct-dark-text"}
                      font="medium"
                      active-scale="0.95"
                    >
                      {pageNumber}
                    </button>
                  )
                )}
              </div>

              <span className="sr-only" aria-live="polite">
                현재 {currentPage}페이지, 전체 {totalPages}페이지
              </span>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => goToPage(currentPage + 1)}
                min-w="11"
                min-h="11"
                rounded="xl"
                border="~ ct-line dark:ct-dark-line"
                bg="ct-surface dark:bg-ct-dark-surface"
                px="4"
                py="2.5"
                text="sm ct-text dark:ct-dark-text"
                disabled-opacity="50"
                active-scale="0.95"
              >
                다음
              </button>
            </nav>
          )}
        </>
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
            검색어나 지역 또는 성급을 변경해 다시 확인해 주세요.
          </p>
        </div>
      )}
    </>
  );
}
