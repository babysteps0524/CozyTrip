interface AffiliateDisclosureProps {
  show: boolean;
}

export default function AffiliateDisclosure({
  show,
}: AffiliateDisclosureProps) {
  if (!show) return null;

  return (
    <aside
      mt="5"
      rounded="xl"
      border="~ ct-primary/30 dark:ct-primary/40"
      bg="ct-primary-soft dark:bg-ct-dark-surface-soft"
      px="4"
      py="4"
      text="sm ct-text dark:ct-dark-text"
      leading="relaxed"
      aria-label="경제적 이해관계 안내"
    >
      <p
        m="0"
        text="sm ct-primary dark:ct-dark-text"
        font="bold"
      >
        경제적 이해관계 안내
      </p>
      <p
        mt="2"
        mb="0"
        text="sm ct-text dark:ct-dark-text"
        font="medium"
      >
        마이리얼트립과 함께하는 마케팅 파트너십을 통해 여행자가 구매할 때마다 일정 비율의 수수료를 지급받습니다.
      </p>
    </aside>
  );
}
