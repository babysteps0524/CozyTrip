import { Container } from "../common";

export default function Footer() {
  return (
    <footer
      border="t ct-line dark:ct-dark-line"
      bg="ct-surface dark:ct-dark-surface"
    >
      <Container>
        <div py="10 sm:12" flex="~ col" gap="6">
          <div>
            <a
              href="/"
              text="lg ct-primary dark:ct-dark-text"
              font="bold"
              tracking="tight"
              un-active="scale-98"
            >
              CozyTrip
            </a>

            <p mt="2" mb="0" max-w="md" text="sm ct-muted dark:ct-dark-muted">
              일본 호텔과 여행 정보를 소개하는 여행 정보 사이트입니다.
            </p>
          </div>

          <div
            flex="~ wrap"
            gap="4"
            text="sm ct-text-soft dark:ct-dark-text-soft"
          >
            <a
              href="/japan/tokyo/"
              hover="text-ct-primary"
              un-active="scale-98"
            >
              도쿄
            </a>

            <a
              href="/japan/osaka/"
              hover="text-ct-primary"
              un-active="scale-98"
            >
              오사카
            </a>

            <a
              href="/japan/kyoto/"
              hover="text-ct-primary"
              un-active="scale-98"
            >
              교토
            </a>

            <a href="/guides/" hover="text-ct-primary" un-active="scale-98">
              여행 가이드
            </a>
          </div>

          <div
            border="t ct-line dark:ct-dark-line"
            pt="6"
            text="xs ct-muted dark:ct-dark-muted"
          >
            <p m="0">
              © {new Date().getFullYear()} CozyTrip. All rights reserved.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
