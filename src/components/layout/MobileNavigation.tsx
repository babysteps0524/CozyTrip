import { useEffect, useRef, useState } from "react";

const destinations = [
  { name: "도쿄", href: "/japan/tokyo/" },
  { name: "오사카", href: "/japan/osaka/" },
  { name: "교토", href: "/japan/kyoto/" },
  { name: "후쿠오카", href: "/japan/fukuoka/" },
  { name: "삿포로", href: "/japan/sapporo/" },
  { name: "오키나와", href: "/japan/okinawa/" },
];

export default function MobileNavigation() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={menuRef} un-hidden="md:hidden" position="relative">
      <button
        type="button"
        aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        w="10"
        h="10"
        flex="~"
        items="center"
        justify="center"
        rounded="lg"
        border="~ transparent"
        text="ct-text dark:ct-dark-text"
        hover="bg-ct-surface-soft dark:bg-ct-dark-surface-soft"
        active-scale="95"
        className="ct-focus"
      >
        <span un-hidden={open ? "~" : "hidden"} text="xl" line-height="1" aria-hidden="true">
          ×
        </span>

        <span
          un-hidden={open ? "hidden" : "~"}
          flex="~ col"
          gap="1"
          aria-hidden="true"
        >
          <span w="5" h="0.5" bg="current" rounded="full" />
          <span w="5" h="0.5" bg="current" rounded="full" />
          <span w="5" h="0.5" bg="current" rounded="full" />
        </span>
      </button>

      {open && (
        <div
          position="absolute"
          top="full"
          right="0"
          z="50"
          mt="2"
          w="72"
          max-w="calc(100vw - 2rem)"
          overflow="hidden"
          rounded="2xl"
          border="~ ct-line dark:ct-dark-line"
          bg="ct-surface dark:ct-dark-surface"
          shadow="soft"
        >
          <nav p="2" flex="~ col" gap="1" aria-label="모바일 메뉴">
            <a
              href="/"
              px="3"
              py="3"
              rounded="lg"
              text="sm ct-text dark:ct-dark-text"
              hover="bg-ct-surface-soft dark:bg-ct-dark-surface-soft"
              active-scale="98"
              className="ct-focus"
              onClick={() => setOpen(false)}
            >
              홈
            </a>

            <p m="0" px="3" pt="3" pb="1" text="xs ct-muted dark:ct-dark-muted" font="semibold">
              일본 여행지
            </p>

            {destinations.map((destination) => (
              <a
                key={destination.href}
                href={destination.href}
                px="3"
                py="3"
                rounded="lg"
                text="sm ct-text dark:ct-dark-text"
                hover="bg-ct-surface-soft dark:bg-ct-dark-surface-soft"
                active-scale="98"
                className="ct-focus"
                onClick={() => setOpen(false)}
              >
                {destination.name}
              </a>
            ))}

            <div border="t ct-line dark:ct-dark-line" my="1" />

            <a
              href="/guides/"
              px="3"
              py="3"
              rounded="lg"
              text="sm ct-text dark:ct-dark-text"
              hover="bg-ct-surface-soft dark:bg-ct-dark-surface-soft"
              active-scale="98"
              className="ct-focus"
              onClick={() => setOpen(false)}
            >
              여행 가이드
            </a>
          </nav>
        </div>
      )}
    </div>
  );
}
