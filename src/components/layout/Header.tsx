import { Container } from "../common";
import MobileNavigation from "./MobileNavigation";
import Navigation from "./Navigation";

export default function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-ct-line bg-ct-surface/95 backdrop-blur-sm dark:border-ct-dark-line dark:bg-ct-dark-surface/95">
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
            <span className="mt-1 text-xs font-medium sm:text-sm">
              코지트립
            </span>
          </a>

          <div className="ml-auto hidden md:block">
            <Navigation />
          </div>

          <MobileNavigation />
        </div>
      </Container>
    </header>
  );
}
