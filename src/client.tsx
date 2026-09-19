import { StrictMode, type ReactNode } from "react";
import { Footer, Header } from "./components/layout";
import { hydrateRoot } from "react-dom/client";

import type { Destination, Hotel, Post } from "./types";

interface AppProps {
  destinations: Destination[];
  hotels: Hotel[];
  posts: Post[];
}

type PageModule = { default: (props: any) => ReactNode };

const pageImports: Record<string, () => Promise<PageModule>> = {
  home: () => import("./pages/Home"),
  japan: () => import("./pages/Japan"),
  guides: () => import("./pages/Guides"),
  destination: () => import("./pages/Destination"),
  hotelList: () => import("./pages/HotelList"),
  hotelDetail: () => import("./pages/HotelDetail"),
  guide: () => import("./pages/Guide"),
};

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) return pathname.slice(0, -1);
  return pathname || "/";
}

function resolveRoute(path: string, props: AppProps) {
  const destinationMatch = path.match(/^\/japan\/([^/]+)$/);
  const hotelListMatch = path.match(/^\/japan\/([^/]+)\/hotels$/);
  const hotelDetailMatch = path.match(/^\/japan\/([^/]+)\/hotels\/([^/]+)$/);
  const guideMatch = path.match(/^\/guides\/([^/]+)$/);

  const destinationSlug =
    destinationMatch?.[1] ?? hotelListMatch?.[1] ?? hotelDetailMatch?.[1];
  const destination = destinationSlug
    ? props.destinations.find((item) => item.slug === destinationSlug)
    : undefined;
  const hotelSlug = hotelDetailMatch?.[2];
  const hotel = hotelSlug
    ? props.hotels.find((item) => item.slug === hotelSlug)
    : undefined;
  const guideSlug = guideMatch?.[1];
  const guide = guideSlug ? props.posts.find((item) => item.slug === guideSlug) : undefined;
  const destinationHotels = destination
    ? props.hotels.filter((item) => item.destinationId === destination.id)
    : [];

  if (path === "/") return { key: "home", props: {} };
  if (path === "/japan") return { key: "japan", props: {} };
  if (path === "/guides") return { key: "guides", props: {} };
  if (destinationMatch && destination) return { key: "destination", props: { destination } };
  if (hotelListMatch && destination) return { key: "hotelList", props: { destination, hotels: destinationHotels } };
  if (hotelDetailMatch && destination && hotel && hotel.destinationId === destination.id) {
    return { key: "hotelDetail", props: { hotel } };
  }
  if (guideMatch && guide && guide.category === "guide") return { key: "guide", props: { post: guide } };
  return { key: "notFound", props: {} };
}

async function start() {
  const rootElement = document.getElementById("root");
  if (!rootElement) throw new Error("Root element not found.");

  const path = normalizePath(window.location.pathname);
  const { destinations, hotels, posts } = await import("./data");
  const route = resolveRoute(path, { destinations, hotels, posts });
  const module = await pageImports[route.key]?.();

  if (!module) {
    hydrateRoot(
      rootElement,
      <StrictMode>
        <div min-h="screen" flex="~" items="center" justify="center" px="4" py="20">
          <div text="center">
            <p m="0" text="sm ct-muted dark:ct-dark-muted">404</p>
            <h1 mt="2" mb="0" text="2xl sm:3xl" font="bold">페이지를 찾을 수 없습니다.</h1>
            <a href="/" mt="6" display="block" className="ct-button" bg="ct-primary" text="white" hover="bg-ct-primary-dark" active-scale="95">홈으로 돌아가기</a>
          </div>
        </div>
      </StrictMode>,
    );
    return;
  }

  const Page = module.default;
  const pageElement = <Page {...route.props} />;

  hydrateRoot(
    rootElement,
    <StrictMode>
      <div min-h="screen" overflow-x="hidden" bg="ct-bg" text="ct-text" dark="bg-ct-dark-bg text-ct-dark-text">
        {pageElement}
      </div>
    </StrictMode>,
  );
}

void start();
