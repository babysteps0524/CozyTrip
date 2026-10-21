/**
 * Agoda API 자동화에 사용되는 공통 타입 정의
 */

/** Agoda API 에서 반환하는 원시 호텔 데이터 */
export interface RawAgodaHotel {
  hotelId: string | number;
  name: string;
  city: string;
  area?: string;
  country: string;
  address?: string;
  summary?: string;
  description?: string;
  image?: string;
  images?: string[];
  type?: '도시 호텔' | '리조트' | '료칸' | '아파트' | string;
  starRating?: number;
  reviewScore?: number;
  reviewCount?: number;
  priceMin?: number;
  currency?: string;
  officialUrl?: string;
  affiliateUrl?: string;
  tags?: string[];
  amenities?: string[];
  checkInTime?: string;
  checkOutTime?: string;
  cancellationPolicy?: string;
  sources?: Array<{ label: string; url: string; checkedAt: string }>;
  facts?: Array<{
    label: string;
    value: string;
    sourceUrl?: string;
    verified?: boolean;
  }>;
  imageRights?: 'unknown' | 'needs_review' | 'owned' | 'licensed' | 'approved_feed';
  fetchedAt?: string;
}

/** 정규화된 호텔 데이터 (마크다운 생성 전) */
export interface NormalizedHotel {
  slug: string;
  name: string;
  city: string;
  area?: string;
  summary: string;
  officialUrl?: string;
  affiliateUrl?: string;
  image?: string;
  type?: string;
  starRating?: number;
  reviewScore?: number;
  reviewCount?: number;
  priceMin?: number;
  currency?: string;
  tags: string[];
  sources: Array<{ label: string; url: string; checkedAt: string }>;
  facts: Array<{ label: string; value: string; sourceUrl?: string; verified: boolean }>;
  imageRights: 'unknown' | 'needs_review' | 'owned' | 'licensed' | 'approved_feed';
  sourceNote?: string;
  fetchedAt: string;
}

/** 마크다운 생성 결과 */
export interface MarkdownGenerationResult {
  slug: string;
  filename: string;
  content: string;
  frontmatter: Record<string, unknown>;
}

/** 파이프라인 실행 결과 */
export interface PipelineResult {
  success: boolean;
  processed: number;
  created: number;
  skipped: number;
  failed: number;
  errors: Array<{ slug: string; error: string }>;
  files: string[];
}

/** 검증 오류 */
export interface ValidationError {
  field: string;
  message: string;
}
