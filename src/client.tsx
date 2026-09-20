import { StrictMode, type ReactNode } from "react";
import { hydrateRoot } from "react-dom/client";

import { destinations } from "./data/destinations";
import {
  loadClientGuidePosts,
  loadClientPostsByDestination,
} from "./data/clientPosts";
import { loadClientHotels } from "./data/clientHotels";
import type { Destination } from "./types";

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

function getDestinationBySlug(slug: string): Destination | undefined {
  return destinations.find((item) => item.slug === slug);
}

function getPostBySlug(posts: Post[], slug: string): Post | undefined {
  return posts.find((item) => item.slug === slug);
}

function getPostsByHotel(posts: Post[], hotelId: string): Post[] {
  return posts.filter((post) => post.hotelId === hotelId);
}

function createRoute(path: string) {
  const destinationMatch = path.match(/^\/japan\/([^/]+)$/);
  const hotelListMatch = path.match(/^\/japan\/([^/]+)\/hotels$/);
  const hotelDetailMatch = path.match(/^\/japan\/([^/]+)\/hotels\/([^/]+)$/);
  const guideMatch = path.match(/^\/guides\/([^/]+)$/);

  return {
    destinationMatch,
    hotelListMatch,
    hotelDetailMatch,
    guideMatch,
    destinationSlug:
      destinationMatch?.[1] ??
      hotelListMatch?.[1] ??
      hotelDetailMatch?.[1],
    hotelSlug: hotelDetailMatch?.[2],
    guideSlug: guideMatch?.[1],
  };
}

function notFoundElement() {
  return (
    <div min-h="screen" flex="~" items="center" justify="center" px="4" py="20">
      <div text="center">
        <p m="0" text="sm ct-muted dark:ct-dark-muted">404</p>
        <h1 mt="2" mb="0" text="2xl sm:3xl" font="bold">
          페이지를 찾을 수 없습니다.
        </h1>
        <a
          href="/"
          mt="6"
          display="block"
          className="ct-button"
          bg="ct-primary"
          text="white"
          hover="bg-ct-primary-dark"
          active-scale="95"
        >
          홈으로 돌아가기
        </a>
      </div>
    </div>
  );
}

async function start() {
  const rootElement = document.getElementById("root");
  if (!rootElement) throw new Error("Root element not found.");

  const path = normalizePath(window.location.pathname);
  const {
    destinationMatch,
    hotelListMatch,
    hotelDetailMatch,
    guideMatch,
    destinationSlug,
    hotelSlug,
    guideSlug,
  } = createRoute(path);

  let pageKey: string;
  let pageProps: Record<string, unknown> = {};

  if (path === "/") {
    const [hotels, guides] = await Promise.all([
      loadClientHotels("tokyo"),
      loadClientGuidePosts(),
    ]);

    pageKey = "home";
    pageProps = {
      destinations,
      hotels,
      guides: guides.slice(0, 3),
    };
  } else if (path === "/japan") {
    pageKey = "japan";
    pageProps = { destinations };
  } else if (path === "/guides") {
    const guides = await loadClientGuidePosts();

    pageKey = "guides";
    pageProps = { posts: guides };
  } else if (guideMatch && guideSlug) {
    const guides = await loadClientGuidePosts();
    const post = getPostBySlug(guides, guideSlug);

    if (!post || post.category !== "guide") {
      pageKey = "notFound";
    } else {
      pageKey = "guide";
      pageProps = {
        post,
        destination: post.destinationId
          ? destinations.find((item) => item.id === post.destinationId)
          : undefined,
      };
    }
  } else if (destinationSlug) {
    const destination = getDestinationBySlug(destinationSlug);

    if (!destination) {
      pageKey = "notFound";
    } else {
      const [hotels, destinationPosts] = await Promise.all([
        loadClientHotels(destination.slug),
        loadClientPostsByDestination(destination.slug),
      ]);

      if (hotelDetailMatch && hotelSlug) {
        const hotel = hotels.find((item) => item.slug === hotelSlug);

        if (!hotel) {
          pageKey = "notFound";
        } else {
          pageKey = "hotelDetail";
          pageProps = {
            hotel,
            destination,
            hotelPosts: getPostsByHotel(destinationPosts, hotel.id),
            relatedGuides: destinationPosts.filter(
              (post) => post.category === "guide" && post.hotelId !== hotel.id,
            ),
            relatedHotels: hotels.filter((item) => item.id !== hotel.id),
          };
        }
      } else if (hotelListMatch) {
        pageKey = "hotelList";
        pageProps = { destination, hotels };
      } else if (destinationMatch) {
        pageKey = "destination";
        pageProps = {
          destination,
          hotels,
          posts: destinationPosts,
        };
      } else {
        pageKey = "notFound";
      }
    }
  } else {
    pageKey = "notFound";
  }

  if (pageKey === "notFound") {
    hydrateRoot(
      rootElement,
      <StrictMode>{notFoundElement()}</StrictMode>,
    );
    return;
  }

  const module = await pageImports[pageKey]?.();
  if (!module) {
    hydrateRoot(
      rootElement,
      <StrictMode>{notFoundElement()}</StrictMode>,
    );
    return;
  }

  const Page = module.default;
  const pageElement = <Page {...pageProps} />;

  hydrateRoot(
    rootElement,
    <StrictMode>
      <div
        min-h="screen"
        overflow-x="hidden"
        bg="ct-bg"
        text="ct-text"
        dark="bg-ct-dark-bg text-ct-dark-text"
      >
        {pageElement}
      </div>
    </StrictMode>,
  );
}

void start();
