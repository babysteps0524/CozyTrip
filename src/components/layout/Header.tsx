import { Container } from "../common";
import MobileNavigation from "./MobileNavigation";
import Navigation from "./Navigation";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-ct-line bg-ct-surface dark:border-ct-dark-line dark:bg-ct-dark-surface">
      <Container>
        <div className="flex min-h-16 items-center justify-between gap-4 sm:min-h-18">
          <a
            href="/"
            aria-label="CozyTrip 코지트립 홈"
            className="ct-focus flex shrink-0 flex-col leading-none text-[#245b63] transition-transform duration-100 active:scale-98 dark:text-[#edf2f2]"
          >
            <span className="block text-lg font-bold tracking-tight sm:text-xl">
              CozyTrip
            </span>
            <span className="mt-1 block text-xs font-medium sm:text-sm">
              코지트립
            </span>
          </a>

          <Navigation />
          <MobileNavigation />
        </div>
      </Container>
    </header>
  );
}
