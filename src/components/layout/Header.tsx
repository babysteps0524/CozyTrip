import { Container } from "../common";
import MobileNavigation from "./MobileNavigation";
import Navigation from "./Navigation";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-ct-line/80 bg-ct-surface/95 backdrop-blur dark:border-ct-dark-line/80 dark:bg-ct-dark-surface/95">
      <Container>
        <div className="flex min-h-16 items-center justify-between gap-4 sm:min-h-18">
          <a
            href="/"
            className="ct-focus flex shrink-0 flex-col leading-tight text-ct-primary transition-transform duration-100 active:scale-98 dark:text-ct-dark-text"
            aria-label="CozyTrip 코지트립 홈"
          >
            <span className="text-lg font-bold tracking-tight sm:text-xl">
              CozyTrip
            </span>
            <span className="text-xs font-medium text-ct-text-soft sm:text-sm dark:text-ct-dark-text-soft">
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
