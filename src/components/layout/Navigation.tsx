const navigationItems = [
  { name: "도쿄 호텔", href: "/japan/tokyo/hotels/" },
  { name: "오사카 호텔", href: "/japan/osaka/hotels/" },
  { name: "교토 호텔", href: "/japan/kyoto/hotels/" },
  { name: "후쿠오카 호텔", href: "/japan/fukuoka/hotels/" },
  { name: "삿포로 호텔", href: "/japan/sapporo/hotels/" },
  { name: "오키나와 호텔", href: "/japan/okinawa/hotels/" },
];

export default function Navigation() {
  return (
    <nav
      un-hidden="~ lg:flex"
      items="center"
      gap="1"
      text="sm ct-text-soft dark:ct-dark-text-soft"
      whitespace="nowrap"
      aria-label="도시별 호텔 메뉴"
    >
      {navigationItems.map((item) => (
        <a
          key={item.href}
          href={item.href}
          px="2.5"
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
