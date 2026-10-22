/**
 * 호텔 데이터 검증 스키마 (Zod)
 *
 * 아고다 API에서 수집한 원시 데이터를 정규화하고,
 * 마크다운 파일로 저장하기 전에 검증합니다.
 */

import { z } from 'zod';

/** 출처 항목 스키마 */
export const SourceSchema = z.object({
  label: z.string().min(1, '출처 이름은 필수입니다.'),
  url: z.string().url('유효한 URL이어야 합니다.'),
  checkedAt: z.string().optional(),
});

/** 확인 사실 항목 스키마 */
export const FactSchema = z.object({
  label: z.string().min(1, '사실 항목 이름은 필수입니다.'),
  value: z.string().min(1, '사실 값은 필수입니다.'),
  sourceUrl: z.string().url('유효한 URL이어야 합니다.').optional().nullable(),
  verified: z.boolean().default(false),
});

/** 호텔 데이터 검증 스키마 */
export const HotelSchema = z.object({
  slug: z.string().min(1, 'slug는 필수입니다.'),
  name: z.string().min(1, '호텔명은 필수입니다.'),
  city: z.string().min(1, '도시/지역은 필수입니다.'),
  area: z.string().optional(),
  summary: z.string().min(40, '소개 요약은 40자 이상이어야 합니다.'),
  officialUrl: z
    .string()
    .url('공식 URL 형식이 올바르지 않습니다.')
    .optional()
    .nullable(),
  affiliateUrl: z
    .string()
    .url('제휴 URL 형식이 올바르지 않습니다.')
    .optional()
    .nullable(),
  image: z.string().url('이미지 URL 형식이 올바르지 않습니다.').optional().nullable(),
  type: z.string().optional(),
  starRating: z.number().min(0).max(5).optional().nullable(),
  reviewScore: z.number().min(0).max(10).optional().nullable(),
  reviewCount: z.number().min(0).optional().nullable(),
  priceMin: z.number().min(0).optional().nullable(),
  currency: z.string().optional(),
  tags: z.array(z.string()).default([]),
  sources: z.array(SourceSchema).default([]),
  facts: z.array(FactSchema).default([]),
  imageRights: z
    .enum(['unknown', 'needs_review', 'owned', 'licensed', 'approved_feed'])
    .default('unknown'),
  sourceNote: z.string().optional(),
  fetchedAt: z.string().datetime('ISO 8601 datetime 형식이어야 합니다.'),

  // 아고다 Affiliate Lite API 추가 필드
  roomtypeName: z.string().optional(),
  crossedOutRate: z.number().min(0).optional().nullable(),
  discountPercent: z.number().min(0).max(100).optional().nullable(),
  includeBreakfast: z.boolean().default(false),
  freeWifi: z.boolean().default(false),
});

export type HotelInput = z.infer<typeof HotelSchema>;

/**
 * 호텔 데이터를 검증하고 정규화된 객체를 반환합니다.
 * 검증 실패 시 ValidationError[]를 반환합니다.
 */
export function validateHotelData(
  data: unknown,
): { success: true; data: HotelInput } | { success: false; errors: z.ZodIssue[] } {
  const result = HotelSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error.issues };
}
