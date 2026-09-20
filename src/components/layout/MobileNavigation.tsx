import { useEffect, useRef, useState } from "react";

const destinations = [
  { name: "도쿄", href: "/japan/tokyo/hotels/" },
  { name: "오사카", href: "/japan/osaka/hotels/" },
  { name: "후쿠오카", href: "/japan/fukuoka/hotels/" },
  { name: "삿포로", href: "/japan/sapporo/hotels/" },
];

const informationLinks = [
  { name: "여행 가이드", href: "/guides/" },
  { name: "코지트립 소개", href: "/about/" },
  { name: "제휴 및 광고", href: "/affiliate/" },
  { name: "개인정보처리방침", href: "/privacy/" },
  { name: "문의", href: "/contact/" },
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
      if (event.key === "Escape") setOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="relative ml-auto md:hidden">
      <button
        type="button"
        aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
        aria-expanded={open}
        aria-controls="mobile-navigation-menu"
        onClick={() => setOpen((value) => !value)}
        className="ct-focus flex h-10 w-10 items-center justify-center rounded-lg text-ct-text transition-colors duration-150 hover:bg-ct-surface-soft active:scale-95 dark:text-ct-dark-text dark:hover:bg-ct-dark-surface-soft"
      >
        {open ? (
          <span className="text-2xl leading-none" aria-hidden="true">
            ×
          </span>
        ) : (
          <span className="flex flex-col gap-1" aria-hidden="true">
            <span className="h-0.5 w-5 rounded-full bg-current" />
            <span className="h-0.5 w-5 rounded-full bg-current" />
            <span className="h-0.5 w-5 rounded-full bg-current" />
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="메뉴 닫기"
            className="fixed inset-0 z-40 cursor-default bg-black/20"
            onClick={() => setOpen(false)}
          />

          <div
            id="mobile-navigation-menu"
            role="dialog"
            aria-label="모바일 메뉴"
            className="absolute right-0 top-full z-50 mt-2 w-72 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-ct-line bg-ct-surface shadow-lg dark:border-ct-dark-line dark:bg-ct-dark-surface"
          >
            <div className="border-b border-ct-line px-4 py-4 dark:border-ct-dark-line">
              <p className="m-0 text-xs font-medium text-ct-muted dark:text-ct-dark-muted">
                JAPAN DESTINATIONS
              </p>
              <p className="mt-1 mb-0 text-base font-semibold text-ct-text dark:text-ct-dark-text">
                일본 여행지
              </p>
            </div>

            <nav className="p-2" aria-label="일본 여행지">
              {destinations.map((destination) => (
                <a
                  key={destination.href}
                  href={destination.href}
                  onClick={() => setOpen(false)}
                  className="ct-focus flex items-center justify-between rounded-lg px-4 py-3.5 text-sm font-medium text-ct-text-soft transition-colors duration-150 hover:bg-ct-surface-soft hover:text-ct-primary active:scale-[0.98] dark:text-ct-dark-text-soft dark:hover:bg-ct-dark-surface-soft dark:hover:text-ct-dark-text"
                >
                  <span>{destination.name}</span>
                  <span aria-hidden="true">→</span>
                </a>
              ))}
            </nav>

            <div className="border-t border-ct-line px-4 py-3 dark:border-ct-dark-line">
              <p className="m-0 text-xs font-medium text-ct-muted dark:text-ct-dark-muted">
                INFORMATION
              </p>
            </div>

            <nav className="px-2 pb-2" aria-label="사이트 정보">
              {informationLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="ct-focus block rounded-lg px-4 py-3 text-sm text-ct-text-soft transition-colors duration-150 hover:bg-ct-surface-soft hover:text-ct-primary active:scale-[0.98] dark:text-ct-dark-text-soft dark:hover:bg-ct-dark-surface-soft dark:hover:text-ct-dark-text"
                >
                  {link.name}
                </a>
              ))}
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
