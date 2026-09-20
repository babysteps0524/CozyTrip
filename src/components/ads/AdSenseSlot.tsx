import { useEffect } from "react";

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

  useEffect(() => {
    if (!isAdsenseConfigured() || !clientId || !slot) return;

    const existing = document.querySelector(
      'script[data-cozytrip-adsense="true"]',
    );

    const pushAd = () => {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {
        // AdSense can reject a second push while an ad slot is still loading.
      }
    };

    if (existing) {
      pushAd();
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.crossOrigin = "anonymous";
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(clientId)}`;
    script.dataset.cozytripAdsense = "true";
    script.addEventListener("load", pushAd, { once: true });
    document.head.appendChild(script);

    return () => {
      script.removeEventListener("load", pushAd);
    };
  }, [clientId, slot]);

  if (!isAdsenseConfigured() || !clientId || !slot) {
    return null;
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
