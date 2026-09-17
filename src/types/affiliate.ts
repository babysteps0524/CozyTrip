export type AffiliateProvider = "rakuten" | "agoda";

export interface AffiliateLink {
  provider: AffiliateProvider;

  url: string;

  label: string;

  description?: string;

  rel?: "sponsored" | "nofollow sponsored";

  external?: boolean;
}
