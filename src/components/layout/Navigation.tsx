const navigationItems = [
  { name: "도쿄", href: "/japan/tokyo/" },
  { name: "오사카", href: "/japan/osaka/" },
  { name: "후쿠오카", href: "/japan/fukuoka/" },
  { name: "삿포로", href: "/japan/sapporo/" },
];

export default function Navigation() {
  return (
    <nav
      className="flex items-center gap-1 whitespace-nowrap text-sm text-ct-text-soft dark:text-ct-dark-text-soft"
      aria-label="도시별 여행지 메뉴"
    >
      {navigationItems.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className="ct-focus rounded-lg px-3 py-2 font-medium transition-colors duration-150 hover:bg-ct-surface-soft hover:text-ct-primary active:scale-95 dark:hover:bg-ct-dark-surface-soft dark:hover:text-ct-dark-text"
        >
          {item.name}
        </a>
      ))}
    </nav>
  );
}
