import { Container } from "../common";
import MobileNavigation from "./MobileNavigation";
import Navigation from "./Navigation";

const destinations = [
  { name: "도쿄", href: "/japan/tokyo/" },
  { name: "오사카", href: "/japan/osaka/" },
  { name: "후쿠오카", href: "/japan/fukuoka/" },
  { name: "삿포로", href: "/japan/sapporo/" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-ct-line bg-ct-surface/95 backdrop-blur-sm dark:border-ct-dark-line dark:bg-ct-dark-surface/95">
      <Container>
        <div className="flex min-h-16 items-center gap-4 sm:min-h-18">
          <a
            href="/"
            aria-label="CozyTrip 코지트립 홈"
            className="ct-focus flex shrink-0 flex-col leading-none text-[#245b63] transition-transform duration-100 active:scale-95 dark:text-[#edf2f2]"
          >
            <span className="text-lg font-bold tracking-tight sm:text-xl">
              CozyTrip
            </span>
            <span className="mt-1 text-xs font-medium sm:text-sm">코지트립</span>
          </a>

          <nav
            aria-label="주요 여행지"
            className="hidden min-w-0 flex-1 items-center justify-center md:flex"
          >
            <div className="flex items-center gap-1 rounded-full border border-ct-line bg-ct-bg p-1 dark:border-ct-dark-line dark:bg-ct-dark-bg">
              {destinations.map((destination) => (
                <a
                  key={destination.href}
                  href={destination.href}
                  className="ct-focus rounded-full px-4 py-2 text-sm font-medium text-ct-text-soft transition-colors duration-150 hover:bg-ct-surface hover:text-ct-primary active:scale-95 dark:text-ct-dark-text-soft dark:hover:bg-ct-dark-surface dark:hover:text-ct-dark-text"
                >
                  {destination.name}
                </a>
              ))}
            </div>
          </nav>

          <div className="hidden shrink-0 lg:block">
            <Navigation />
          </div>

          <MobileNavigation />
        </div>
      </Container>
    </header>
  );
}
