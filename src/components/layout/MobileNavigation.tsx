import { useState } from "react";

const destinations = [
  {
    name: "도쿄",
    href: "/japan/tokyo/",
  },
  {
    name: "오사카",
    href: "/japan/osaka/",
  },
  {
    name: "교토",
    href: "/japan/kyoto/",
  },
  {
    name: "후쿠오카",
    href: "/japan/fukuoka/",
  },
  {
    name: "삿포로",
    href: "/japan/sapporo/",
  },
  {
    name: "오키나와",
    href: "/japan/okinawa/",
  },
];

export default function MobileNavigation() {
  const [open, setOpen] = useState(false);

  return (
    <div un-hidden="md:hidden" position="relative">
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
        text="ct-text dark:ct-dark-text"
        hover="bg-ct-surface-soft dark:bg-ct-dark-surface-soft"
        un-active="scale-98"
      >
        <span un-hidden={open ? "" : "~"} text="xl" aria-hidden="true">
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
          w="64"
          max-w="calc(100vw - 2rem)"
          overflow="hidden"
          rounded="xl"
          border="~ ct-line dark:ct-dark-line"
          bg="ct-surface dark:ct-dark-surface"
          shadow="soft"
        >
          <nav p="2" flex="~ col" gap="1">
            {destinations.map((destination) => (
              <a
                key={destination.href}
                href={destination.href}
                px="3"
                py="3"
                rounded="lg"
                text="sm ct-text dark:ct-dark-text"
                hover="bg-ct-surface-soft dark:bg-ct-dark-surface-soft"
                un-active="scale-98"
                onClick={() => setOpen(false)}
              >
                {destination.name}
              </a>
            ))}

            <a
              href="/guides/"
              px="3"
              py="3"
              rounded="lg"
              text="sm ct-text dark:ct-dark-text"
              hover="bg-ct-surface-soft dark:bg-ct-dark-surface-soft"
              un-active="scale-98"
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
