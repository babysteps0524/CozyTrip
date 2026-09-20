import { useEffect, useRef, useState } from "react";

const destinations = [
  { name: "도쿄 호텔", href: "/japan/tokyo/hotels/" },
  { name: "오사카 호텔", href: "/japan/osaka/hotels/" },
  { name: "교토 호텔", href: "/japan/kyoto/hotels/" },
  { name: "후쿠오카 호텔", href: "/japan/fukuoka/hotels/" },
  { name: "삿포로 호텔", href: "/japan/sapporo/hotels/" },
  { name: "오키나와 호텔", href: "/japan/okinawa/hotels/" },
];

export default function MobileNavigation() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={menuRef} un-hidden="lg:hidden" position="relative">
      <button
        type="button"
        aria-label={open ? "메뉴 닫기" : "도시별 호텔 메뉴 열기"}
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
        {open ? (
          <span text="xl" line-height="1" aria-hidden="true">×</span>
        ) : (
          <span flex="~ col" gap="1" aria-hidden="true">
            <span w="5" h="0.5" bg="current" rounded="full" />
            <span w="5" h="0.5" bg="current" rounded="full" />
            <span w="5" h="0.5" bg="current" rounded="full" />
          </span>
        )}
      </button>

      {open && (
        <div
          position="absolute"
          top="full"
          right="0"
          z="50"
          mt="2"
          w="64"
          max-w="calc(100vw - 2rem)"
          overflow="hidden"
          rounded="xl"
          border="~ ct-line dark:ct-dark-line"
          bg="ct-surface dark:ct-dark-surface"
          shadow="soft"
        >
          <nav p="2" flex="~ col" gap="1" aria-label="모바일 도시별 호텔 메뉴">
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
          </nav>
        </div>
      )}
    </div>
  );
}
