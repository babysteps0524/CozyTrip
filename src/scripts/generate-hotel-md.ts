/**
 * 호텔 데이터를 Astro Content Collections 용 Markdown 파일로 생성합니다.
 *
 * frontmatter (YAML) + 본문 (Markdown) 구조로 출력하며,
 * src/content/hotels/[slug].md 에 저장할 수 있습니다.
 *
 * SEO 최적화 메타 태그와 구조화된 콘텐츠를 포함합니다.
 */

import type { NormalizedHotel, MarkdownGenerationResult } from './types.js';

/** 한글/영문/숫자를 제외한 문자를 하이픈으로 치환해 slug 생성 */
export function createSlug(name: string): string {
  return (
    name
      .normalize('NFKD')
      .replace(/[^a-zA-Z0-9가-힣]+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase()
      .replace(/-+/g, '-') || 'hotel'
  );
}

/** frontmatter 값의 문자열 이스케이프 (YAML 안전 처리) */
function escapeYamlValue(value: string): string {
  return value.replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

/** 한글 포함 텍스트의 안전한 설명문 생성 (최대 160자) */
function createDescription(
  name: string,
  city: string,
  summary?: string,
): string {
  const base = summary || `${name} 호텔 소개`;
  const desc = `${city} ${name} - ${base}`;
  return desc.length > 160 ? `${desc.slice(0, 157)}...` : desc;
}

/**
 * 호텔 데이터를 Markdown 문자열로 변환합니다.
 */
export function generateHotelMarkdown(
  hotel: NormalizedHotel,
): MarkdownGenerationResult {
  const slug = hotel.slug || createSlug(hotel.name);
  const filename = `${slug}.md`;

  const description = createDescription(hotel.name, hotel.city, hotel.summary);

  const frontmatter: Record<string, unknown> = {
    status: 'draft',
    publish: false,
    name: hotel.name,
    city: hotel.city,
    slug: hotel.slug,
    title: `${hotel.name} | ${hotel.city} 호텔 소개`,
    description,
    imageRights: hotel.imageRights,
    source: 'agoda_api',
    fetchedAt: hotel.fetchedAt ?? new Date().toISOString(),
  };

  if (hotel.area) frontmatter['area'] = hotel.area;
  if (hotel.officialUrl) frontmatter['officialUrl'] = hotel.officialUrl;
  if (hotel.affiliateUrl) frontmatter['affiliateUrl'] = hotel.affiliateUrl;
  if (hotel.image) frontmatter['image'] = hotel.image;
  if (hotel.type) frontmatter['type'] = hotel.type;
  if (hotel.starRating !== undefined)
    frontmatter['starRating'] = hotel.starRating;
  if (hotel.reviewScore !== undefined)
    frontmatter['reviewScore'] = hotel.reviewScore;
  if (hotel.reviewCount !== undefined)
    frontmatter['reviewCount'] = hotel.reviewCount;
  if (hotel.priceMin !== undefined) frontmatter['priceMin'] = hotel.priceMin;
  if (hotel.currency) frontmatter['currency'] = hotel.currency;
  if (hotel.sourceNote) frontmatter['sourceNote'] = hotel.sourceNote;

  const fmLines: string[] = [];
  for (const [key, value] of Object.entries(frontmatter)) {
    if (typeof value === 'string') {
      fmLines.push(`${key}: "${escapeYamlValue(value)}"`);
    } else if (typeof value === 'boolean' || typeof value === 'number') {
      fmLines.push(`${key}: ${value}`);
    } else if (Array.isArray(value)) {
      fmLines.push(`${key}:`);
      for (const item of value) {
        fmLines.push(`  - "${escapeYamlValue(String(item))}"`);
      }
    }
  }

  const body: string[] = [];

  // 이미지 (상단)
  if (hotel.image) {
    body.push(`![${hotel.name} 이미지](${hotel.image})\n`);
  }

  body.push(`# ${hotel.name}`);

  // 위치 배지
  const locationParts = [hotel.city, hotel.area].filter(Boolean);
  if (locationParts.length > 0) {
    body.push(`\n**위치:** ${locationParts.join(' > ')}\n`);
  }

  // 호텔 타입 정보 (검증된 객실 유형만 표시)
  const badges: string[] = [];
  if (hotel.type) badges.push(`**타입:** ${hotel.type}`);
  if (badges.length > 0) {
    body.push(`\n${badges.join(' · ')}\n`);
  }

  // 편의 시설
  const amenities: string[] = [];
  if (hotel.includeBreakfast) amenities.push('조식 포함');
  if (hotel.freeWifi) amenities.push('무료 WiFi');
  if (amenities.length > 0) {
    body.push(`\n## 편의 시설\n`);
    body.push(`- ${amenities.join(', ')}\n`);
  }

  // 소개 초안
  if (hotel.summary) {
    body.push(`\n## 소개 초안\n\n${hotel.summary}\n`);
  }

  // 예약 및 공식 정보
  if (hotel.officialUrl || hotel.affiliateUrl) {
    body.push(`\n## 예약 및 공식 정보\n`);
    if (hotel.officialUrl) {
      body.push(`- [호텔 공식 페이지](${hotel.officialUrl})\n`);
    }
    if (hotel.affiliateUrl) {
      body.push(`- [아고다 예약 링크](${hotel.affiliateUrl})\n`);
    }
  }

  // 확인된 사실
  if (hotel.facts.length > 0) {
    body.push(`\n## 확인된 사실\n`);
    body.push(`| 항목 | 값 | 검증 상태 | 출처 |\n`);
    body.push(`|------|-----|-----------|------|\n`);
    for (const fact of hotel.facts) {
      const verifiedMark = fact.verified ? '✅ 완료' : '❓ 미검증';
      const sourceLink = fact.sourceUrl ? `[링크](${fact.sourceUrl})` : '-';
      body.push(
        `| ${fact.label} | ${fact.value} | ${verifiedMark} | ${sourceLink} |\n`,
      );
    }
  }

  // 출처 목록
  if (hotel.sources.length > 0) {
    body.push(`\n## 출처\n`);
    for (const source of hotel.sources) {
      const checkedAt = source.checkedAt
        ? ` (확인일: ${source.checkedAt})`
        : '';
      body.push(`- [${source.label}](${source.url})${checkedAt}\n`);
    }
  }

  // 태그
  if (hotel.tags && hotel.tags.length > 0) {
    body.push(`\n## 태그\n`);
    for (const tag of hotel.tags) {
      body.push(`- #${tag}\n`);
    }
  }

  body.push(`\n---\n`);

  body.push(
    `**정보 검증 안내:** 이 페이지는 아고다 API를 통해 수집된 데이터를 기반으로 한 편집 검토용 초안입니다. `,
  );
  body.push(
    `숙박 요금·객실 가능 여부·평점·리뷰 수는 게시 전에 공식 출처로 재검증해야 합니다.\n`,
  );

  const content = `---\n${fmLines.join('\n')}\n---\n\n${body.join('\n')}`;

  return {
    slug,
    filename,
    content,
    frontmatter,
  };
}
