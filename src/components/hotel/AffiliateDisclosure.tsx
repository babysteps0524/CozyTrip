interface AffiliateDisclosureProps {
  show: boolean;
}

export default function AffiliateDisclosure({
  show,
}: AffiliateDisclosureProps) {
  if (!show) return null;

  return (
    <aside
      className="mt-6 rounded-xl border border-ct-primary/30 bg-ct-primary-soft px-4 py-4 text-sm leading-7 text-ct-text dark:border-ct-primary/40 dark:bg-ct-dark-surface-soft dark:text-ct-dark-text"
      aria-label="경제적 이해관계 안내"
    >
      <p className="m-0 text-sm font-bold text-ct-primary dark:text-ct-dark-text">
        경제적 이해관계 안내
      </p>
      <p className="mt-2 mb-0 text-sm font-medium text-ct-text dark:text-ct-dark-text">
        이 글에는 마이리얼트립 마케팅 파트너십을 통한 광고 링크가 포함되어 있습니다.
        여행자가 해당 링크를 통해 구매하면 CozyTrip는 마이리얼트립으로부터 일정 비율의
        수수료를 지급받습니다.
      </p>
    </aside>
  );
}
