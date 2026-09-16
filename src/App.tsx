import {
  getDestinationBySlug,
  getHotelBySlug,
  getHotelsByDestination,
  getPostBySlug,
} from "./data";

import { Footer, Header } from "./components/layout";

import Home from "./pages/Home";
import Destination from "./pages/Destination";
import HotelList from "./pages/HotelList";
import HotelDetail from "./pages/HotelDetail";
import Guide from "./pages/Guide";

function getCurrentPath() {
  const path = window.location.pathname;

  if (path.length > 1 && path.endsWith("/")) {
    return path.slice(0, -1);
  }

  return path;
}

export default function App() {
  const path = getCurrentPath();

  const destinationMatch = path.match(/^\/japan\/([^/]+)$/);

  const hotelListMatch = path.match(/^\/japan\/([^/]+)\/hotels$/);

  const hotelDetailMatch = path.match(/^\/japan\/([^/]+)\/hotels\/([^/]+)$/);

  const guideMatch = path.match(/^\/guides\/([^/]+)$/);

  const destinationSlug =
    destinationMatch?.[1] ?? hotelListMatch?.[1] ?? hotelDetailMatch?.[1];

  const destination = destinationSlug
    ? getDestinationBySlug(destinationSlug)
    : undefined;

  const hotelSlug = hotelDetailMatch?.[2];

  const hotel = hotelSlug ? getHotelBySlug(hotelSlug) : undefined;

  const guideSlug = guideMatch?.[1];

  const guide = guideSlug ? getPostBySlug(guideSlug) : undefined;

  const hotels = destination ? getHotelsByDestination(destination.id) : [];

  const isHotelDetail = Boolean(
    hotelDetailMatch &&
    destination &&
    hotel &&
    hotel.destinationId === destination.id,
  );

  const isGuide = Boolean(guideMatch && guide && guide.category === "guide");

  const isKnownRoute =
    path === "/" ||
    Boolean(destinationMatch && destination) ||
    Boolean(hotelListMatch && destination) ||
    isHotelDetail ||
    isGuide;

  return (
    <div
      min-h="screen"
      overflow-x="hidden"
      bg="ct-bg"
      text="ct-text"
      dark="bg-ct-dark-bg text-ct-dark-text"
    >
      <Header />

      <main>
        {path === "/" && <Home />}

        {destinationMatch && destination && (
          <Destination destination={destination} />
        )}

        {hotelListMatch && destination && (
          <HotelList destination={destination} hotels={hotels} />
        )}

        {isHotelDetail && hotel && <HotelDetail hotel={hotel} />}

        {isGuide && guide && <Guide post={guide} />}

        {!isKnownRoute && (
          <section>
            <div
              min-h="screen"
              flex="~"
              items="center"
              justify="center"
              px="4"
              py="20"
            >
              <div text="center">
                <p m="0" text="sm ct-muted dark:ct-dark-muted">
                  404
                </p>

                <h1 mt="2" mb="0" text="2xl sm:3xl" font="bold">
                  페이지를 찾을 수 없습니다.
                </h1>

                <a
                  href="/"
                  mt="6"
                  inline="block"
                  ct-button
                  bg="ct-primary"
                  text="white"
                  hover="bg-ct-primary-dark"
                  un-active="scale-0.95"
                >
                  홈으로 돌아가기
                </a>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
