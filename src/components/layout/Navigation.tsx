export default function Navigation() {
  return (
    <nav
      un-hidden="~ md:flex"
      items="center"
      gap="5 lg:6"
      text="sm ct-text-soft dark:ct-dark-text-soft"
      whitespace="nowrap"
    >
      <a
        href="/japan/tokyo/"
        px="1"
        py="2"
        hover="text-ct-primary dark:text-ct-dark-text"
        un-active="scale-0.95"
      >
        도쿄
      </a>

      <a
        href="/japan/osaka/"
        px="1"
        py="2"
        hover="text-ct-primary dark:text-ct-dark-text"
        un-active="scale-0.95"
      >
        오사카
      </a>

      <a
        href="/japan/kyoto/"
        px="1"
        py="2"
        hover="text-ct-primary dark:text-ct-dark-text"
        un-active="scale-0.95"
      >
        교토
      </a>

      <a
        href="/japan/fukuoka/"
        px="1"
        py="2"
        hover="text-ct-primary dark:text-ct-dark-text"
        un-active="scale-0.95"
      >
        후쿠오카
      </a>

      <a
        href="/japan/sapporo/"
        px="1"
        py="2"
        hover="text-ct-primary dark:text-ct-dark-text"
        un-active="scale-0.95"
      >
        삿포로
      </a>

      <a
        href="/japan/okinawa/"
        px="1"
        py="2"
        hover="text-ct-primary dark:text-ct-dark-text"
        un-active="scale-0.95"
      >
        오키나와
      </a>

      <a
        href="/guides/"
        px="1"
        py="2"
        hover="text-ct-primary dark:text-ct-dark-text"
        un-active="scale-0.95"
      >
        여행 가이드
      </a>
    </nav>
  );
}