const navigationItems = [
  { name: "홈", href: "/" },
  { name: "도쿄", href: "/japan/tokyo/" },
  { name: "오사카", href: "/japan/osaka/" },
  { name: "교토", href: "/japan/kyoto/" },
  { name: "후쿠오카", href: "/japan/fukuoka/" },
  { name: "삿포로", href: "/japan/sapporo/" },
  { name: "오키나와", href: "/japan/okinawa/" },
  { name: "여행 가이드", href: "/guides/" },
];

export default function Navigation() {
  return (
    <nav
      un-hidden="~ md:flex"
      items="center"
      gap="1 lg:2"
      text="sm ct-text-soft dark:ct-dark-text-soft"
      whitespace="nowrap"
      aria-label="주요 메뉴"
    >
      {navigationItems.map((item) => (
        <a
          key={item.href}
          href={item.href}
          px="2"
          py="2"
          rounded="lg"
          hover="bg-ct-surface-soft text-ct-primary dark:bg-ct-dark-surface-soft dark:text-ct-dark-text"
          transition="colors duration-150"
          active-scale="98"
          className="ct-focus"
        >
          {item.name}
        </a>
      ))}
    </nav>
  );
}
