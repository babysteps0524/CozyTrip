import { Container } from "../common";
import MobileNavigation from "./MobileNavigation";
import Navigation from "./Navigation";

export default function Header() {
  return (
    <header
      position="sticky"
      top="0"
      z="40"
      border="b ct-line/80 dark:ct-dark-line/80"
      bg="ct-surface/95 dark:ct-dark-surface/95"
      backdrop="blur"
    >
      <Container>
        <div min-h="16 sm:18" flex="~" items="center" justify="between" gap="4">
          <a
            href="/"
            flex="~ col"
            shrink="0"
            leading="tight"
            text="ct-primary dark:ct-dark-text"
            font="bold"
            tracking="tight"
            transition="transform duration-100"
            active-scale="98"
            aria-label="CozyTrip 코지트립 홈"
          >
            <span text="lg sm:xl">CozyTrip</span>
            <span text="xs sm:sm ct-text-soft dark:ct-dark-text-soft" font="medium">
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
