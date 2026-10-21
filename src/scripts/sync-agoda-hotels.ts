/**
 * 아고다 API → 마크다운 파일 자동화 파이프라인
 *
 * 실행 예시:
 *   bun run scripts/sync-agoda-hotels.ts
 *   bun run scripts/sync-agoda-hotels.ts --dry-run
 *   bun run scripts/sync-agoda-hotels.ts --keyword "도쿄" --limit 20
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

/** CLI 인자 파싱 */
function parseArgs(argv: string[]): {
  keyword?: string;
  city?: string;
  limit: number;
  dryRun: boolean;
  skipExisting: boolean;
} {
  const args: {
    keyword?: string;
    city?: string;
    limit: number;
    dryRun: boolean;
    skipExisting: boolean;
  } = { limit: DEFAULT_LIMIT, dryRun: false, skipExisting: true };

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
        .filter((f) => f.endsWith('.md'))
        .map((f) => f.replace(/\.md$/, '')),
    );
  } catch {
    // 디렉토리가 없으면 빈 집합 반환
    return new Set();
  }
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
  const errors: Array<{ slug: string; error: string }> = [];
  const files: string[] = [];
  let processed = 0;
  let created = 0;
  let skipped = 0;
  let failed = 0;

  console.log(`[아고다 자동화] 시작`);
  console.log(
    `  키워드: ${args.keyword ?? '전체'} | 도시: ${args.city ?? '전체'} | 제한: ${args.limit}`,
  );
  console.log(`  드라이런: ${args.dryRun} | 기존 파일 건너뛰기: ${args.skipExisting}`);

  try {
    // 1단계: 아고다 API에서 호텔 목록 수집
    console.log('\n[1단계] 아고다 API 호텔 검색 중...');
    const rawHotels = await client.searchHotels({
      keyword: args.keyword,
      city: args.city,
      limit: args.limit,
    });
    console.log(`  수집된 호텔 수: ${rawHotels.length}`);

    // 2단계: 각 호텔을 순차 처리 (rate limit 고려)
    for (const raw of rawHotels) {
      processed++;
      const hotelId = raw.hotelId;

      try {
        // 상세 정보 조회 (ID가 있으면)
        let detail = raw;
        if (hotelId) {
          try {
            detail = await client.getHotelDetail({ hotelId });
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

        // 6단계: 마크다운 생성 및 저장 (NormalizedHotel 타입으로 캐스팅)
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
        console.error(`  [오류] ${raw.name ?? hotelId}: ${err}`);
      }
    }
  } catch (err) {
    console.error(`파이프라인 치명적 오류: ${err}`);
    throw err;
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
