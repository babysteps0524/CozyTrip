/**
 * 아고다 API → 마크다운 파일 자동화 파이프라인
 *
 * 실행 예시:
 *   bun run scripts/sync-agoda-hotels.ts
 *   bun run scripts/sync-agoda-hotels.ts --dry-run
 *   bun run scripts/sync-agoda-hotels.ts --keyword "도쿄" --limit 20
 *   bun run scripts/sync-agoda-hotels.ts --retry-failed
 *   bun run scripts/sync-agoda-hotels.ts --city 도쿄 --limit 100 --overwrite
 */

import { AgodaClient } from './agoda-client.js';
import {
  type NormalizedHotel,
  type PipelineResult,
} from './types.js';
import {
  validateHotelData,
  type HotelInput,
} from './hotel-schema.js';
import { generateHotelMarkdown, createSlug } from './generate-hotel-md.js';

const CONTENT_DIR = 'src/content/hotels';
const DEFAULT_LIMIT = 20;
const FAILED_LOG_FILE = 'src/content/hotels/.failed-hotels.json';

/** 모크 호텔 데이터 (API 엔드포인트 미확정 시 테스트용) */
const MOCK_HOTELS: Array<{
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
  tags?: string[];
}> = [
  {
    name: '호텔 그레이서리 신주쿠',
    city: '도쿄',
    area: '신주쿠',
    summary: '신주쿠 일대를 중심으로 여행 동선을 짜는 사람이라면 위치와 교통편을 먼저 비교해 볼 숙소 후보입니다.',
    officialUrl: 'https://www.agoda.com/ko-kr/hotel-gracery-shinjuku/',
    affiliateUrl: 'https://www.agoda.com/ko-kr/hotel-gracery-shinjuku/',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=85',
    type: '도시 호텔',
    starRating: 4,
    reviewScore: 8.5,
    reviewCount: 1200,
    priceMin: 150000,
    currency: 'KRW',
    tags: ['도심 여행', '쇼핑', '교통 확인'],
  },
  {
    name: '크로스 호텔 교토',
    city: '교토',
    area: '가와라마치 인근',
    summary: '교토 중심부에서 관광지와 식당을 함께 살펴보려는 여행객에게 검토할 만한 숙소 후보입니다.',
    officialUrl: 'https://www.agoda.com/ko-kr/cross-hotel-kyoto/',
    affiliateUrl: 'https://www.agoda.com/ko-kr/cross-hotel-kyoto/',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=85',
    type: '도시 호텔',
    starRating: 4,
    reviewScore: 8.2,
    reviewCount: 950,
    priceMin: 180000,
    currency: 'KRW',
    tags: ['도심 산책', '미식', '위치 확인'],
  },
  {
    name: '더 프린스 파크 타워 도쿄',
    city: '도쿄',
    area: '시바 공원 일대',
    summary: '도쿄의 주요 명소를 둘러보는 일정이라면 호텔 위치와 이동 경로를 기준으로 비교해 볼 수 있습니다.',
    officialUrl: 'https://www.agoda.com/ko-kr/the-prince-park-tower-tokyo/',
    affiliateUrl: 'https://www.agoda.com/ko-kr/the-prince-park-tower-tokyo/',
    image: 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1000&q=85',
    type: '도시 호텔',
    starRating: 5,
    reviewScore: 8.8,
    reviewCount: 2100,
    priceMin: 250000,
    currency: 'KRW',
    tags: ['도쿄 관광', '숙소 비교', '교통 확인'],
  },
  {
    name: '하얏트 리젠시 세라가키 아일랜드 오키나와',
    city: '오키나와',
    area: '온나손',
    summary: '리조트 중심의 휴식을 계획한다면 섬 내 이동 방법과 숙박 조건을 함께 확인해 보세요.',
    officialUrl: 'https://www.agoda.com/ko-kr/hyatt-regency-seragaki/',
    affiliateUrl: 'https://www.agoda.com/ko-kr/hyatt-regency-seragaki/',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1000&q=85',
    type: '리조트',
    starRating: 5,
    reviewScore: 9.1,
    reviewCount: 750,
    priceMin: 350000,
    currency: 'KRW',
    tags: ['리조트 여행', '휴식', '예약 조건 확인'],
  },
  {
    name: '호텔 닛코 후쿠오카',
    city: '후쿠오카',
    area: '하카타',
    summary: '하카타역 주변을 거점으로 후쿠오카와 근교를 둘러볼 때 위치를 비교할 후보입니다.',
    officialUrl: 'https://www.agoda.com/ko-kr/hotel-nikko-fukuoka/',
    affiliateUrl: 'https://www.agoda.com/ko-kr/hotel-nikko-fukuoka/',
    image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1000&q=85',
    type: '도시 호텔',
    starRating: 4,
    reviewScore: 8.4,
    reviewCount: 680,
    priceMin: 140000,
    currency: 'KRW',
    tags: ['하카타', '도시 여행', '이동 동선'],
  },
];

/** CLI 인자 파싱 */
function parseArgs(argv: string[]): {
  keyword?: string;
  city?: string;
  limit: number;
  dryRun: boolean;
  skipExisting: boolean;
  retryFailed: boolean;
  overwrite: boolean;
  mock: boolean;
} {
  const args: {
    keyword?: string;
    city?: string;
    limit: number;
    dryRun: boolean;
    skipExisting: boolean;
    retryFailed: boolean;
    overwrite: boolean;
    mock: boolean;
  } = {
    limit: DEFAULT_LIMIT,
    dryRun: false,
    skipExisting: true,
    retryFailed: false,
    overwrite: false,
    mock: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--keyword' || arg === '-k') {
      args.keyword = argv[++i];
    } else if (arg === '--city' || arg === '-c') {
      args.city = argv[++i];
    } else if (arg === '--limit' || arg === '-l') {
      args.limit = parseInt(argv[++i], 10) || DEFAULT_LIMIT;
    } else if (arg === '--dry-run') {
      args.dryRun = true;
    } else if (arg === '--overwrite') {
      args.skipExisting = false;
    } else if (arg === '--retry-failed') {
      args.retryFailed = true;
    } else if (arg === '--mock') {
      args.mock = true;
    }
  }

  return args;
}

/** 기존에 생성된 마크다운 파일 목록 조회 (중복 방지용) */
async function getExistingSlugs(): Promise<Set<string>> {
  try {
    const { readdir } = await import('node:fs/promises');
    const files = await readdir(CONTENT_DIR);
    return new Set(
      files
        .filter((f) => f.endsWith('.md') && !f.startsWith('.'))
        .map((f) => f.replace(/\.md$/, '')),
    );
  } catch {
    return new Set();
  }
}

/** 실패한 호텔 목록 로드 */
async function loadFailedHotels(): Promise<Array<{ slug: string; name: string; error: string }>> {
  try {
    const { readFile } = await import('node:fs/promises');
    const content = await readFile(FAILED_LOG_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return [];
  }
}

/** 실패한 호텔 목록 저장 */
async function saveFailedHotels(
  failed: Array<{ slug: string; name: string; error: string }>,
): Promise<void> {
  const { writeFile, mkdir } = await import('node:fs/promises');
  const { join } = await import('node:path');
  await mkdir('src/content/hotels', { recursive: true });
  await writeFile(FAILED_LOG_FILE, JSON.stringify(failed, null, 2), 'utf-8');
}

/** 마크다운 파일을 파일 시스템에 저장 */
async function saveMarkdownFile(
  slug: string,
  content: string,
  dryRun: boolean,
): Promise<void> {
  const { writeFile, mkdir } = await import('node:fs/promises');
  const { join } = await import('node:path');

  if (!dryRun) {
    await mkdir(CONTENT_DIR, { recursive: true });
    await writeFile(join(CONTENT_DIR, `${slug}.md`), content, 'utf-8');
  }
}

/** Agoda 원시 데이터를 HotelInput (Zod 검증 가능) 으로 변환 */
function normalizeHotel(raw: any): HotelInput {
  const slug = createSlug(String(raw.name ?? raw.hotelId ?? 'hotel'));

  return {
    slug,
    name: raw.name ?? '',
    city: raw.city ?? '',
    area: raw.area ?? undefined,
    summary: raw.summary ?? '',
    officialUrl: raw.officialUrl ?? undefined,
    affiliateUrl: raw.affiliateUrl ?? undefined,
    image: raw.image ?? raw.images?.[0] ?? undefined,
    type: raw.type ?? undefined,
    starRating: raw.starRating ?? undefined,
    reviewScore: raw.reviewScore ?? undefined,
    reviewCount: raw.reviewCount ?? undefined,
    priceMin: raw.priceMin ?? undefined,
    currency: raw.currency ?? undefined,
    tags: raw.tags ?? [],
    sources: (raw.sources ?? []).map((s: any) => ({
      label: s.label ?? '',
      url: s.url ?? '',
      checkedAt: s.checkedAt ?? undefined,
    })),
    facts: (raw.facts ?? []).map((f: any) => ({
      label: f.label ?? '',
      value: f.value ?? '',
      sourceUrl: f.sourceUrl ?? undefined,
      verified: f.verified ?? false,
    })),
    imageRights: raw.imageRights ?? 'unknown',
    sourceNote: raw.sourceNote ?? undefined,
    fetchedAt: raw.fetchedAt ?? new Date().toISOString(),
  };
}

/** Zod 기반 검증 */
function validateWithZod(
  data: HotelInput,
): { valid: true; data: HotelInput } | { valid: false; errors: string[] } {
  const result = validateHotelData(data);
  if (result.success) {
    return { valid: true, data: result.data };
  }
  const errors = result.errors.map(
    (issue) =>
      `${issue.path.join('.') ?? 'root'}: ${issue.message}`,
  );
  return { valid: false, errors };
}

/** 메인 파이프라인 실행 */
export async function runPipeline(
  client: AgodaClient,
  argv: string[],
): Promise<PipelineResult> {
  const args = parseArgs(argv);
  const existingSlugs = await getExistingSlugs();
  const previousFailed = args.retryFailed ? await loadFailedHotels() : [];
  const errors: Array<{ slug: string; error: string }> = [];
  const newFailed: Array<{ slug: string; name: string; error: string }> = [];
  const files: string[] = [];
  let processed = 0;
  let created = 0;
  let skipped = 0;
  let failed = 0;

  console.log(`[아고다 자동화] 시작`);
  console.log(
    `  키워드: ${args.keyword ?? '전체'} | 도시: ${args.city ?? '전체'} | 제한: ${args.limit}`,
  );
  console.log(
    `  드라이런: ${args.dryRun} | 기존 파일 건너뛰기: ${args.skipExisting} | 실패 재처리: ${args.retryFailed} | 모크 모드: ${args.mock}`,
  );

  if (args.retryFailed && previousFailed.length > 0) {
    console.log(`  [재처리 대상] ${previousFailed.length}개 호텔`);
  }

  try {
    // 1단계: 아고다 API에서 호텔 목록 수집
    console.log('\n[1단계] 아고다 API 호텔 검색 중...');
    const effectiveClient = args.mock
      ? new AgodaClient({ mockMode: true, mockHotels: MOCK_HOTELS })
      : client;
    const rawHotels = await effectiveClient.searchHotels({
      keyword: args.keyword,
      city: args.city,
      limit: args.limit,
    });
    console.log(`  수집된 호텔 수: ${rawHotels.length}`);

    // 실패 재처리 대상이 있으면 해당 호텔만 필터링
    const hotelsToProcess = args.retryFailed && previousFailed.length > 0
      ? rawHotels.filter((raw) =>
          previousFailed.some((f) => f.slug === createSlug(String(raw.name ?? raw.hotelId))),
        )
      : rawHotels;

    // 2단계: 각 호텔을 순차 처리 (rate limit 고려)
    for (const raw of hotelsToProcess) {
      processed++;
      const hotelId = raw.hotelId;

      try {
        // 상세 정보 조회 (ID가 있으면)
        let detail = raw;
        if (hotelId) {
          try {
            detail = await effectiveClient.getHotelDetail({ hotelId });
          } catch (err) {
            console.warn(
              `  [경고] 호텔 ID ${hotelId} 상세 조회 실패, 검색 결과 사용: ${err}`,
            );
          }
        }

        // 3단계: 정규화 (Zod 입력 타입)
        const normalized = normalizeHotel(detail);

        // 4단계: Zod 검증
        const validation = validateWithZod(normalized);
        if (!validation.valid) {
          failed++;
          errors.push({
            slug: normalized.slug,
            error: validation.errors.join(', '),
          });
          newFailed.push({
            slug: normalized.slug,
            name: normalized.name,
            error: validation.errors.join(', '),
          });
          console.warn(
            `  [검증 실패] ${normalized.name}: ${validation.errors.join(', ')}`,
          );
          continue;
        }

        // 5단계: 중복 확인
        if (args.skipExisting && existingSlugs.has(normalized.slug)) {
          skipped++;
          console.log(`  [건너뜀] ${normalized.name} (이미 존재)`);
          continue;
        }

        // 6단계: 마크다운 생성 및 저장
        const result = generateHotelMarkdown(
          normalized as NormalizedHotel,
        );
        await saveMarkdownFile(result.slug, result.content, args.dryRun);

        created++;
        files.push(result.filename);
        console.log(
          `  [생성] ${normalized.name} → ${result.filename}`,
        );
      } catch (err) {
        failed++;
        const slug = createSlug(String(raw.name ?? hotelId ?? 'unknown'));
        errors.push({ slug, error: String(err) });
        newFailed.push({
          slug,
          name: String(raw.name ?? hotelId ?? 'unknown'),
          error: String(err),
        });
        console.error(`  [오류] ${raw.name ?? hotelId}: ${err}`);
      }
    }
  } catch (err) {
    console.error(`파이프라인 치명적 오류: ${err}`);
    throw err;
  }

  // 실패한 호텔 목록 저장 (재처리를 위해)
  if (!args.dryRun && newFailed.length > 0) {
    await saveFailedHotels(newFailed);
    console.log(`  [실패 로그] ${newFailed.length}개 호텔 기록됨 (.failed-hotels.json)`);
  }

  const result: PipelineResult = {
    success: failed === 0,
    processed,
    created,
    skipped,
    failed,
    errors,
    files,
  };

  console.log(`\n[완료] 처리: ${processed} | 생성: ${created} | 건너뜀: ${skipped} | 실패: ${failed}`);
  if (errors.length > 0) {
    console.log(`\n[오류 목록]`);
    for (const e of errors) {
      console.log(`  - ${e.slug}: ${e.error}`);
    }
    console.log(`\n  → 실패한 호텔은 --retry-failed 옵션으로 재처리할 수 있습니다.`);
  }

  return result;
}

/** 스크립트 직접 실행 시 */
if (import.meta.main) {
  const client = new AgodaClient();
  runPipeline(client, process.argv.slice(2)).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
