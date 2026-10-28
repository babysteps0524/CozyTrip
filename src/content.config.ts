/**
 * Astro Content Collections 설정
 *
 * src/content/hotels/*.md 파일의 스키마를 정의합니다.
 * 아고다 API 자동화 파이프라인이 생성하는 MD 파일을 타입 안전하게 소비합니다.
 */

import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'zod';

const hotels = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/hotels' }),
  schema: z.object({
    status: z
      .enum(['draft', 'review', 'published', 'archived'])
      .default('draft'),
    publish: z.boolean().default(false),
    name: z.string().min(1),
    /** 확인된 일본어 표기 (실제 데이터가 확보된 경우에만 사용) */
    nameJa: z.string().optional(),
    city: z.string().min(1),
    slug: z.string().min(1),
    area: z.string().optional(),
    summary: z.string().min(1),
    address: z.string().optional(),
    amenities: z.array(z.string()).default([]),
    transportNotes: z.string().optional(),
    checkIn: z.string().optional(),
    checkOut: z.string().optional(),
    /** 마지막 정보 확인 날짜 (ISO 8601 date) */
    lastVerifiedAt: z.string().date().optional(),
    editorialNotes: z.string().optional(),
    tags: z.array(z.string()).default([]),
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
