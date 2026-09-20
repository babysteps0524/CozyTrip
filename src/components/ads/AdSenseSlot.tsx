interface AdSenseSlotProps {
  slot: string;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

function isAdsenseConfigured(): boolean {
  return Boolean(
    import.meta.env.VITE_ADSENSE_CLIENT_ID &&
      import.meta.env.VITE_ADSENSE_ENABLED === "true",
  );
}

export default function AdSenseSlot({
  slot,
  className = "",
}: AdSenseSlotProps) {
  const clientId = import.meta.env.VITE_ADSENSE_CLIENT_ID;

  if (!isAdsenseConfigured() || !clientId || !slot) {
    return null;
  }

  if (typeof window !== "undefined") {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense may not be ready during hydration.
    }
  }

  return (
    <aside
      className={`my-8 overflow-hidden rounded-lg border border-ct-line/70 bg-ct-surface-soft/40 dark:border-ct-dark-line/70 dark:bg-ct-dark-surface-soft/40 ${className}`}
      aria-label="광고"
    >
      <div className="px-2 pt-2 text-center text-[10px] leading-4 text-ct-muted dark:text-ct-dark-muted">
        광고
      </div>
      <ins
        className="adsbygoogle block min-h-[100px] w-full"
        style={{ display: "block" }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
