export type AffiliateProvider = "agoda" | "tripcom" | "myrealtrip";

export interface AffiliateLink {
  provider: AffiliateProvider;

  url: string;

  label: string;

  description?: string;

  rel?: "sponsored" | "nofollow sponsored";

  external?: boolean;
}
