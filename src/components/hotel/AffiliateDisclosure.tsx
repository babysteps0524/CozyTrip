interface AffiliateDisclosureProps {
  show: boolean;
}

const MYREALTRIP_DISCLOSURE_IMAGE =
  "https://dry7pvlp22cox.cloudfront.net/mrt-images-prod/2024/12/02/F8Hc/GPgE8DOyg5.png";

export default function AffiliateDisclosure({
  show,
}: AffiliateDisclosureProps) {
  if (!show) return null;

  return (
    <aside
      className="mt-6 overflow-hidden rounded-xl border border-ct-line bg-ct-surface-soft dark:border-ct-dark-line dark:bg-ct-dark-surface-soft"
      aria-label="경제적 이해관계 안내"
    >
      <img
        src={MYREALTRIP_DISCLOSURE_IMAGE}
        alt="마이리얼트립과 함께하는 마케팅 파트너십을 통해 여행자가 구매할 때마다 일정 비율의 수수료를 지급받습니다."
        width={1200}
        height={180}
        loading="lazy"
        decoding="async"
        className="block h-auto w-full max-h-24 object-contain object-left sm:max-h-28 lg:max-h-20"
      />
    </aside>
  );
}
