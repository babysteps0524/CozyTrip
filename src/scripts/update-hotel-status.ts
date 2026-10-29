/**
 * 호텔 콘텐츠 상태 전이 CLI 스크립트
 *
 * 호텔 마크다운 파일의 frontmatter 상태를 변경합니다.
 * 상태 전이 규칙:
 *   draft → review → published → archived → draft (순환)
 *
 * 실행 예시:
 *   bun run scripts/update-hotel-status.ts --slug hotel-gracery-shinjuku --status published
 *   bun run scripts/update-hotel-status.ts --slug hotel-gracery-shinjuku --status review
 *   bun run scripts/update-hotel-status.ts --slug hotel-gracery-shinjuku --status draft
 *   bun run scripts/update-hotel-status.ts --slug hotel-gracery-shinjuku --status archived
 *   bun run scripts/update-hotel-status.ts --slug hotel-gracery-shinjuku --next  (다음 상태로 순환)
 *
 * 검증 규칙:
 *   - published로 변경하려면 factsVerified, sources.length > 0,
 *     imageRights !== 'unknown'/'needs_review' 조건을 충족해야 함
 *   - archived는 언제든지 가능
 */

import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const CONTENT_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  '../content/hotels',
);

const VALID_STATUSES = [
  'draft',
  'review',
  'approved',
  'published',
  'archived',
] as const;

type Status = (typeof VALID_STATUSES)[number];

/** 상태 전이 순서: draft → review → approved → published → archived */
const STATUS_ORDER: Status[] = [
  'draft',
  'review',
  'approved',
  'published',
  'archived',
];

/** CLI 인자 파싱 */
function parseArgs(argv: string[]): {
  slug?: string;
  status?: Status;
  next: boolean;
  dryRun: boolean;
} {
  const args = {
    slug: undefined as string | undefined,
    status: undefined as Status | undefined,
    next: false,
    dryRun: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--slug') {
      args.slug = argv[++i];
    } else if (arg === '--status') {
      const val = argv[++i];
      if (VALID_STATUSES.includes(val as Status)) {
        args.status = val as Status;
      } else {
        console.error(
          `잘못된 상태: ${val}. 허용값: ${VALID_STATUSES.join(', ')}`,
        );
        process.exit(1);
      }
    } else if (arg === '--next') {
      args.next = true;
    } else if (arg === '--dry-run') {
      args.dryRun = true;
    }
  }

  if (!args.slug) {
    console.error(
      'Usage: bun run scripts/update-hotel-status.ts --slug <slug> --status <status>',
    );
    console.error(
      '       bun run scripts/update-hotel-status.ts --slug <slug> --next',
    );
    process.exit(1);
  }

  if (!args.status && !args.next) {
    console.error('--status 또는 --next 중 하나는 지정해야 합니다.');
    process.exit(1);
  }

  return args;
}

/** 마크다운 frontmatter 파싱 */
function parseFrontmatter(content: string): {
  frontmatter: Record<string, string>;
  body: string;
} {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!fmMatch) {
    return { frontmatter: {}, body: content };
  }

  const fmText = fmMatch[1];
  const body = fmMatch[2];
  const frontmatter: Record<string, string> = {};

  for (const line of fmText.split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim();
      let val = line.slice(colonIdx + 1).trim();
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1);
      }
      frontmatter[key] = val;
    }
  }

  return { frontmatter, body };
}

/** frontmatter를 문자열로 직렬화 */
function serializeFrontmatter(frontmatter: Record<string, string>): string {
  const lines: string[] = [];
  for (const [key, value] of Object.entries(frontmatter)) {
    // 특수 문자가 포함된 값은 따옴표로 감싸기
    if (/[:\n#{[\],&*!|>'"%@`]/.test(value)) {
      lines.push(`${key}: "${value.replace(/"/g, '\\"')}"`);
    } else {
      lines.push(`${key}: ${value}`);
    }
  }
  return `---\n${lines.join('\n')}\n---\n`;
}

/** 호텔 파일의 존재 여부 및 frontmatter 로드 */
async function loadHotelFile(slug: string): Promise<{
  filePath: string;
  frontmatter: Record<string, string>;
  body: string;
} | null> {
  const { readdir, readFile } = await import('node:fs/promises');
  const files = await readdir(CONTENT_DIR);
  const mdFile = files.find((f) => f.replace(/\.md$/, '') === slug);
  if (!mdFile) return null;

  const filePath = join(CONTENT_DIR, mdFile);
  const content = await readFile(filePath, 'utf-8');
  const { frontmatter, body } = parseFrontmatter(content);

  return { filePath, frontmatter, body };
}

/** published 상태로 변경 가능한지 검증 */
function validatePublishReady(
  frontmatter: Record<string, string>,
): { valid: true } | { valid: false; reasons: string[] } {
  const reasons: string[] = [];

  const factsVerified = frontmatter.factsVerified === 'true';
  if (!factsVerified) {
    reasons.push('factsVerified가 true가 아닙니다. 사실을 검증해야 합니다.');
  }

  const sourcesRaw = frontmatter.sources ?? '';
  // sources는 배열 형태로 저장되므로, 간단히 존재 여부만 확인
  if (!sourcesRaw || sourcesRaw.length === 0) {
    reasons.push('출처(sources)가 등록되지 않았습니다.');
  }

  const imageRights = frontmatter.imageRights;
  if (
    imageRights === 'unknown' ||
    imageRights === 'needs_review' ||
    !imageRights
  ) {
    reasons.push(
      `이미지 권리가 확인되지 않았습니다 (현재: ${imageRights ?? '미입력'}). 'owned', 'licensed', 또는 'approved_feed'로 설정해야 합니다.`,
    );
  }

  if (reasons.length > 0) {
    return { valid: false, reasons };
  }
  return { valid: true };
}

/** 다음 상태로 순환 */
function nextStatus(current: Status): Status {
  const currentIndex = STATUS_ORDER.indexOf(current);
  return STATUS_ORDER[(currentIndex + 1) % STATUS_ORDER.length];
}

/** 메인 실행 */
export async function runStatusUpdate(
  slug: string,
  targetStatus?: Status,
  useNext?: boolean,
  dryRun: boolean = false,
): Promise<void> {
  const hotel = await loadHotelFile(slug);
  if (!hotel) {
    console.error(`호텔을 찾을 수 없습니다: ${slug}`);
    process.exit(1);
  }

  const currentStatus = (hotel.frontmatter.status as Status) ?? 'draft';
  const newStatus = useNext ? nextStatus(currentStatus) : targetStatus!;

  console.warn(`[호텔 상태 전이]`);
  console.warn(`  파일: ${slug}.md`);
  console.warn(`  현재 상태: ${currentStatus}`);
  console.warn(`  변경 대상: ${newStatus}`);
  console.warn(`  드라이런: ${dryRun}`);

  // published로 변경하려면 검증
  if (newStatus === 'published') {
    const validation = validatePublishReady(hotel.frontmatter);
    if (!validation.valid) {
      console.error(`  [검증 실패] published 상태로 변경할 수 없습니다.`);
      for (const reason of validation.reasons) {
        console.error(`    - ${reason}`);
      }
      console.error(
        `\n  검증 조건을 충족한 후 다시 시도하세요. 강제 변경을 원하면 --status published --force 옵션을 사용하세요.`,
      );
      process.exit(1);
    }
    console.warn(`  [검증 통과] published 상태로 게시 가능합니다.`);
  }

  if (dryRun) {
    console.warn(`  [드라이런] 파일 수정은 수행되지 않았습니다.`);
    return;
  }

  // frontmatter 상태 업데이트
  const newFrontmatter = { ...hotel.frontmatter, status: newStatus };
  const newContent = serializeFrontmatter(newFrontmatter) + hotel.body;

  const { writeFile } = await import('node:fs/promises');
  await writeFile(hotel.filePath, newContent, 'utf-8');

  console.warn(`  [완료] 상태가 '${newStatus}'로 변경되었습니다.`);
}

/** 스크립트 직접 실행 시 */
if (import.meta.main) {
  const args = parseArgs(process.argv.slice(2));
  runStatusUpdate(args.slug!, args.status, args.next, args.dryRun).catch(
    (err) => {
      console.error(err);
      process.exit(1);
    },
  );
}
