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
  agoda: {
    name: "Agoda",
    description: "호텔 가격 및 예약 확인",
    defaultLabel: "Agoda에서 확인",
  },

  tripcom: {
    name: "Trip.com",
    description: "호텔 가격 및 예약 확인",
    defaultLabel: "Trip.com에서 확인",
  },

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
