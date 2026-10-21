/**
 * Astro Content Collections 설정
 *
 * src/content/hotels/*.md 파일의 스키마를 정의합니다.
 * 아고다 API 자동화 파이프라인이 생성하는 MD 파일을 타입 안전하게 소비합니다.
 */

import { defineCollection } from 'astro:content';
import { z } from 'zod';

const hotels = defineCollection({
  type: 'content',
  schema: z.object({
    status: z.enum(['draft', 'needs_review', 'published']).default('needs_review'),
    publish: z.boolean().default(false),
    name: z.string().min(1),
    city: z.string().min(1),
    slug: z.string().min(1),
    area: z.string().optional(),
    imageRights: z
      .enum(['unknown', 'needs_review', 'owned', 'licensed', 'approved_feed'])
      .default('unknown'),
    source: z.string().default('agoda_api'),
    fetchedAt: z.string().datetime(),
    officialUrl: z.string().url().optional().nullable(),
    affiliateUrl: z.string().url().optional().nullable(),
    image: z.string().url().optional().nullable(),
    type: z.string().optional(),
    starRating: z.number().min(0).max(5).optional().nullable(),
    reviewScore: z.number().min(0).max(10).optional().nullable(),
    reviewCount: z.number().min(0).optional().nullable(),
    priceMin: z.number().min(0).optional().nullable(),
    currency: z.string().optional(),
    sourceNote: z.string().optional(),
  }),
});

export const collections = { hotels };
