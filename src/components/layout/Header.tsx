import { Container } from "../common";
import MobileNavigation from "./MobileNavigation";
import Navigation from "./Navigation";

export default function Header() {
  return (
    <header
      border="b ct-line dark:ct-dark-line"
      bg="ct-surface dark:ct-dark-surface"
    >
      <Container>
        <div min-h="16" flex="~" items="center" justify="between" gap="4">
          <a
            href="/"
            flex="~"
            shrink="0"
            items="center"
            text="xl sm:2xl ct-primary dark:ct-dark-text"
            font="bold"
            tracking="tight"
            transition="transform duration-100"
            active-scale="0.95"
            aria-label="CozyTrip 홈"
          >
            CozyTrip
          </a>

          <Navigation />

          <MobileNavigation />
        </div>
      </Container>
    </header>
  );
}
