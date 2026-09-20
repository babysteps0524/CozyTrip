import type { AffiliateProvider } from "../types";

export interface AffiliateProviderConfig {
  name: string;
  description: string;
  defaultLabel: string;
}

export const affiliateProviders: Record<
  AffiliateProvider,
  AffiliateProviderConfig
> = {
  myrealtrip: {
    name: "마이리얼트립",
    description: "호텔 예약 및 여행 정보 확인",
    defaultLabel: "마이리얼트립에서 확인",
  },
};

export function getAffiliateProviderConfig(
  provider: AffiliateProvider,
): AffiliateProviderConfig {
  return affiliateProviders[provider];
}
