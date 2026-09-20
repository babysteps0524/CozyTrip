import { Container } from "../common";

const destinations = [
  { name: "도쿄", href: "/japan/tokyo/" },
  { name: "오사카", href: "/japan/osaka/" },
  { name: "후쿠오카", href: "/japan/fukuoka/" },
  { name: "삿포로", href: "/japan/sapporo/" },
];

export default function Footer() {
  return (
    <footer
      mt="16 sm:20"
      border="t ct-line dark:ct-dark-line"
      bg="ct-surface dark:ct-dark-surface"
    >
      <Container>
        <div py="12 sm:14 lg:16" grid="~ cols-1 md:3" gap="10 md:8">
          <div>
            <a
              href="/"
              flex="~ col"
              w="fit"
              leading="tight"
              text="ct-primary dark:ct-dark-text"
              font="bold"
              tracking="tight"
              active-scale="98"
              className="ct-focus"
            >
              <span text="lg">CozyTrip</span>
              <span text="xs ct-text-soft dark:ct-dark-text-soft" font="medium">
                코지트립
              </span>
            </a>

            <p mt="3" mb="0" max-w="sm" text="sm ct-muted dark:ct-dark-muted" leading="7">
              일본 호텔과 여행 정보를 소개하는 여행 정보 사이트입니다.
            </p>
          </div>

          <div>
            <h2 m="0" text="sm ct-text dark:ct-dark-text" font="semibold">
              일본 여행지
            </h2>

            <nav mt="3" flex="~ wrap" gap="x-4 y-2" text="sm ct-text-soft dark:ct-dark-text-soft" aria-label="여행지 링크">
              {destinations.map((destination) => (
                <a
                  key={destination.href}
                  href={destination.href}
                  hover="text-ct-primary dark:text-ct-dark-text"
                  transition="colors duration-150"
                  active-scale="98"
                  className="ct-focus"
                >
                  {destination.name}
                </a>
              ))}
            </nav>
          </div>

          <div>
            <h2 m="0" text="sm ct-text dark:ct-dark-text" font="semibold">
              여행 정보
            </h2>

            <nav
              mt="3"
              flex="~ wrap"
              gap="x-4 y-2"
              text="sm ct-text-soft dark:ct-dark-text-soft"
              aria-label="사이트 정보 링크"
            >
              <a
                href="/guides/"
                hover="text-ct-primary dark:text-ct-dark-text"
                transition="colors duration-150"
                active-scale="98"
                className="ct-focus"
              >
                여행 가이드
              </a>
              <a
                href="/about/"
                hover="text-ct-primary dark:text-ct-dark-text"
                transition="colors duration-150"
                active-scale="98"
                className="ct-focus"
              >
                코지트립 소개
              </a>
              <a
                href="/affiliate/"
                hover="text-ct-primary dark:text-ct-dark-text"
                transition="colors duration-150"
                active-scale="98"
                className="ct-focus"
              >
                제휴 및 광고
              </a>
              <a
                href="/privacy/"
                hover="text-ct-primary dark:text-ct-dark-text"
                transition="colors duration-150"
                active-scale="98"
                className="ct-focus"
              >
                개인정보처리방침
              </a>
              <a
                href="/contact/"
                hover="text-ct-primary dark:text-ct-dark-text"
                transition="colors duration-150"
                active-scale="98"
                className="ct-focus"
              >
                문의
              </a>
            </nav>
          </div>
        </div>

        <div border="t ct-line dark:ct-dark-line" py="5" text="xs ct-muted dark:ct-dark-muted">
          <p m="0">© {new Date().getFullYear()} CozyTrip 코지트립. All rights reserved.</p>
        </div>
      </Container>
    </footer>
  );
}
