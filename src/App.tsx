import type { Post } from "./types";
import type { Destination } from "./types";
import type { Hotel } from "./types";
import { Footer, Header } from "./components/layout";
import Home from "./pages/Home";
import Japan from "./pages/Japan";
import Guides from "./pages/Guides";
import DestinationPage from "./pages/Destination";
import HotelList from "./pages/HotelList";
import HotelDetail from "./pages/HotelDetail";
import Guide from "./pages/Guide";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Affiliate from "./pages/Affiliate";
import Contact from "./pages/Contact";

interface AppProps {
  initialPath?: string;
  destinations: Destination[];
  hotels: Hotel[];
  posts: Post[];
}

function normalizePath(pathname: string): string {
  const normalized = (pathname || "/").normalize("NFC");
  return normalized.length > 1 && normalized.endsWith("/")
    ? normalized.slice(0, -1)
    : normalized;
}

function getCurrentPath(): string {
  if (typeof window === "undefined") return "/";
  return normalizePath(window.location.pathname);
}

function getDestinationBySlug(
  destinations: Destination[],
  slug: string,
): Destination | undefined {
  return destinations.find((destination) => destination.slug === slug);
}

function getHotelBySlug(hotels: Hotel[], slug: string): Hotel | undefined {
  const normalizedSlug = slug.normalize("NFC");
  return hotels.find(
    (hotel) => hotel.slug.normalize("NFC") === normalizedSlug,
  );
}

function getPostBySlug(posts: Post[], slug: string): Post | undefined {
  return posts.find((post) => post.slug === slug);
}

function getHotelsByDestination(
  hotels: Hotel[],
  destinationId: string,
): Hotel[] {
  return hotels.filter((hotel) => hotel.destinationId === destinationId);
}

export default function App({
  initialPath,
  destinations,
  hotels,
  posts,
}: AppProps) {
  const path = normalizePath(initialPath ?? getCurrentPath());
  const destinationMatch = path.match(/^\/japan\/([^/]+)$/);
  const hotelListMatch = path.match(/^\/japan\/([^/]+)\/hotels$/);
  const hotelDetailMatch = path.match(/^\/japan\/([^/]+)\/hotels\/([^/]+)$/);
  const guideMatch = path.match(/^\/guides\/([^/]+)$/);

  const destinationSlug =
    destinationMatch?.[1] ?? hotelListMatch?.[1] ?? hotelDetailMatch?.[1];

  const destination = destinationSlug
    ? getDestinationBySlug(destinations, destinationSlug)
    : undefined;

  const hotelSlug = hotelDetailMatch?.[2];
  const hotel = hotelSlug ? getHotelBySlug(hotels, hotelSlug) : undefined;
  const staticPage = path === "/about" ? "about" : path === "/privacy" ? "privacy" : path === "/affiliate" ? "affiliate" : path === "/contact" ? "contact" : undefined;
  const guideSlug = guideMatch?.[1];
  const guide = guideSlug ? getPostBySlug(posts, guideSlug) : undefined;

  const destinationHotels = destination
    ? getHotelsByDestination(hotels, destination.id)
    : [];

  const isHotelDetail = Boolean(
    hotelDetailMatch &&
      destination &&
      hotel &&
      hotel.destinationId === destination.id,
  );
  const isGuide = Boolean(guideMatch && guide && guide.category === "guide");

  const isKnownRoute =
    path === "/" ||
    path === "/japan" ||
    path === "/guides" ||
    Boolean(staticPage) ||
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

      <main pt="20 sm:22">
        {path === "/" && (
          <Home destinations={destinations} hotels={hotels} />
        )}

        {path === "/japan" && <Japan destinations={destinations} />}

        {staticPage === "about" && <About />}
        {staticPage === "privacy" && <Privacy />}
        {staticPage === "affiliate" && <Affiliate />}
        {staticPage === "contact" && <Contact />}

        {path === "/guides" && (
          <Guides posts={posts.filter((post) => post.category === "guide")} />
        )}

        {destinationMatch && destination && (
          <DestinationPage
            destination={destination}
            hotels={destinationHotels}
            posts={[]}
          />
        )}

        {hotelListMatch && destination && (
          <HotelList destination={destination} hotels={destinationHotels} />
        )}

        {isHotelDetail && hotel && (
          <HotelDetail
            hotel={hotel}
            destination={destination}
            hotelPosts={posts.filter((post) => post.hotelId === hotel.id)}
            relatedGuides={[]}
            relatedHotels={getHotelsByDestination(hotels, hotel.destinationId).filter(
              (item) => item.id !== hotel.id,
            )}
          />
        )}

        {isGuide && guide && (
          <Guide
            post={guide}
            destination={
              guide.destinationId
                ? destinations.find((item) => item.id === guide.destinationId)
                : undefined
            }
          />
        )}

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
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
