import type { AffiliateProvider } from "../../types";
import { getAffiliateProviderConfig } from "../../lib/affiliate";

interface AffiliateDisclosureProps {
  show: boolean;
  providers?: AffiliateProvider[];
}

export default function AffiliateDisclosure({
  show,
  providers = [],
}: AffiliateDisclosureProps) {
  if (!show) return null;

  const providerNames = Array.from(
    new Set(
      providers
        .map((provider) => getAffiliateProviderConfig(provider)?.name)
        .filter(Boolean),
    ),
  );

  const providerLabel =
    providerNames.length > 0
      ? providerNames.join(", ")
      : "외부 예약 플랫폼";

  return (
    <aside
      className="mt-5 rounded-xl border border-ct-primary/30 bg-ct-primary-soft px-4 py-4 text-sm leading-relaxed text-ct-text dark:border-ct-primary/40 dark:bg-ct-dark-surface-soft dark:text-ct-dark-text"
      aria-label="경제적 이해관계 안내"
    >
      <p className="m-0 text-sm font-bold text-ct-primary dark:text-ct-dark-text">
        경제적 이해관계 안내
      </p>
      <p className="mt-2 mb-0 text-sm font-medium text-ct-text dark:text-ct-dark-text">
        이 페이지의 {providerLabel} 예약 링크를 통해 예약이 발생하면 CozyTrip에
        제휴 수수료가 지급될 수 있습니다.
      </p>
    </aside>
  );
}
