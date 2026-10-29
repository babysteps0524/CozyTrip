import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const hotelSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().min(2),
  city: z.string().min(1),
  summary: z.string().min(40),
  status: z.enum(['draft', 'review', 'published', 'archived']).default('draft'),
  sources: z
    .array(
      z.object({
        url: z.string().url(),
        label: z.string().min(2),
        checkedAt: z.string().date(),
      }),
    )
    .default([]),
  affiliateUrl: z.string().url().optional(),
  imageRights: z
    .enum(['owned', 'licensed', 'approved_feed', 'needs_review', 'unknown'])
    .default('unknown'),
  factsVerified: z.boolean().default(false),
});

const root = join(
  dirname(fileURLToPath(import.meta.url)),
  '../src/content/hotels',
);

/** frontmatter 블록을 추출해 간단한 키-값 맵으로 파싱 */
function parseFrontmatter(content: string): Record<string, string> {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n/);
  if (!fmMatch) return {};
  const fmText = fmMatch[1];
  const map: Record<string, string> = {};
  for (const line of fmText.split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim();
      let val = line.slice(colonIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      map[key] = val;
    }
  }
  return map;
}

async function main() {
  let failed = false;

  // 1) JSON 파일 검증 (기존 동작 유지)
  const jsonFiles = (await readdir(root)).filter((name) => name.endsWith('.json'));
  for (const file of jsonFiles) {
    try {
      const raw: unknown = JSON.parse(await readFile(join(root, file), 'utf8'));
      const result = hotelSchema.safeParse(raw);
      if (!result.success) {
        failed = true;
        console.error(
          `✗ ${file}: ${result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')}`,
        );
      } else {
        const item = result.data;
        const publishReady =
          item.status === 'published' &&
          item.factsVerified &&
          item.sources.length > 0 &&
          item.imageRights !== 'unknown' &&
          item.imageRights !== 'needs_review';
        console.warn(
          `${publishReady ? '✓' : '•'} ${file}: ${publishReady ? 'publish checks passed' : 'valid data; not approved for publishing'}`,
        );
      }
    } catch (error) {
      failed = true;
      console.error(
        `✗ ${file}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  // 2) MD 파일 검증 (frontmatter 기반)
  const mdFiles = (await readdir(root))
    .filter((name) => name.endsWith('.md'))
    .filter((name) => name !== 'sample-hotel.md'); // 예시 파일은 검증에서 제외
  for (const file of mdFiles) {
    try {
      const content = await readFile(join(root, file), 'utf8');
      const fm = parseFrontmatter(content);

      // slug 형식 검사
      const slug = fm.slug ?? '';
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
        failed = true;
        console.error(`✗ ${file}: slug '${slug}' is not URL-safe`);
        continue;
      }

      // 이름 검사
      if (!fm.name || fm.name.length < 2) {
        failed = true;
        console.error(`✗ ${file}: name is missing or too short`);
        continue;
      }

      // 요약 검사
      if (!fm.summary || fm.summary.length < 40) {
        failed = true;
        console.error(`✗ ${file}: summary is missing or shorter than 40 chars`);
        continue;
      }

      // 상태 검사
      const status = fm.status ?? 'draft';
      if (!['draft', 'review', 'published', 'archived'].includes(status)) {
        failed = true;
        console.error(`✗ ${file}: invalid status '${status}'`);
        continue;
      }

      // 이미지 권리 검사
      const imageRights = fm.imageRights ?? 'unknown';
      if (!['owned', 'licensed', 'approved_feed', 'needs_review', 'unknown'].includes(imageRights)) {
        failed = true;
        console.error(`✗ ${file}: invalid imageRights '${imageRights}'`);
        continue;
      }

      const factsVerified = fm.factsVerified === 'true';
      const sourcesRaw = fm.sources ?? '';
      const sourcesCount = sourcesRaw ? 1 : 0; // 단순화된 카운트 (파이프 구분 다중 출처는 별도 파싱 필요)

      const publishReady =
        status === 'published' &&
        factsVerified &&
        sourcesCount > 0 &&
        imageRights !== 'unknown' &&
        imageRights !== 'needs_review';

      console.warn(
        `${publishReady ? '✓' : '•'} ${file}: ${publishReady ? 'publish checks passed' : 'valid data; not approved for publishing'}`,
      );
    } catch (error) {
      failed = true;
      console.error(
        `✗ ${file}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  if (jsonFiles.length === 0 && mdFiles.length === 0) {
    console.warn(
      'No hotel files found. Add a source-backed hotel record to validate.',
    );
  }
  if (failed) process.exitCode = 1;
}

main();
