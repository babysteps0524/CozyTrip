import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const inputPath = process.argv[2];
if (!inputPath) {
  console.error('Usage: bun run content:draft -- path/to/hotel-input.json');
  console.error('This command creates a review-only Markdown draft. It never publishes content.');
  process.exit(1);
}
const schema = z.object({
  name: z.string().min(2), city: z.string().min(1), area: z.string().optional(),
  summary: z.string().min(30), hotelOfficialUrl: z.string().url().optional(),
  sources: z.array(z.object({ label: z.string(), url: z.string().url(), checkedAt: z.string().optional() })).default([]),
  facts: z.array(z.object({ label: z.string(), value: z.string(), sourceUrl: z.string().url().optional(), verified: z.boolean().default(false) })).default([]),
  imageRights: z.enum(['owned', 'licensed', 'approved_feed', 'needs_review', 'unknown']).default('unknown'),
  affiliateUrl: z.string().url().optional(),
});
const raw: unknown = JSON.parse(await readFile(inputPath, 'utf8'));
const input = schema.parse(raw);
const slug = input.name.normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `hotel-draft-${Date.now()}`;
const scriptDir = dirname(fileURLToPath(import.meta.url));
const outDir = join(scriptDir, '../src/content/drafts');
await mkdir(outDir, { recursive: true });
const list = (items: string[]) => items.length ? items.map((item) => `- ${item}`).join('\n') : '- 확인된 정보 없음';
const body = `---\nstatus: needs_review\npublish: false\nname: "${input.name.replaceAll('"', '\\"')}"\ncity: "${input.city}"\narea: "${input.area ?? '미확인'}"\nimageRights: ${input.imageRights}\n---\n\n# ${input.name} — 검토용 호텔 소개 초안\n\n> **게시 금지: 사람의 사실 검증과 이미지 권리 확인이 필요합니다.** 이 문서는 자동 게시되지 않습니다.\n\n## 기본 소개\n\n${input.summary}\n\n## 확인된 정보와 출처\n\n${input.facts.map((fact) => `- **${fact.label}:** ${fact.value} — ${fact.verified ? '검증됨(근거 재확인 필요)' : '미검증'}${fact.sourceUrl ? ` [출처](${fact.sourceUrl})` : ''}`).join('\n') || '- 확인된 사실이 입력되지 않았습니다.'}\n\n## 출처 목록\n\n${input.sources.map((source) => `- [${source.label}](${source.url})${source.checkedAt ? ` (확인일: ${source.checkedAt})` : ' (확인일 미입력)'}`).join('\n') || '- 출처를 추가해야 합니다.'}\n\n## 예약 링크\n\n${input.affiliateUrl ? `입력된 제휴 URL(계정 승인, 추적 매개변수, 랜딩 페이지를 별도로 검증할 것): ${input.affiliateUrl}` : '승인된 제휴 URL이 입력되지 않았습니다. URL을 추측하거나 임의로 만들지 마세요.'}\n\n## 이미지 권리 검토\n\n- 상태: ${input.imageRights}\n- 게시 전 라이선스/피드 사용 권한과 출처를 확인하세요.\n\n## 편집자 게시 전 체크리스트\n\n- [ ] 호텔 공식 정보 및 운영 상태 확인\n- [ ] 주소·역 접근성·교통 정보를 공식 출처로 확인\n- [ ] 요금·평점·객실 가능 여부를 검증 없이 쓰지 않음\n- [ ] 모든 사실 주장에 출처와 확인 날짜 기록\n- [ ] 이미지 사용 권리 확인\n- [ ] 아고다 링크 승인·랜딩·고지 확인\n- [ ] 중복 콘텐츠와 독창적 편집 가치 검토\n- [ ] 편집자 승인 후에만 공개 페이지에 반영\n`;
const outPath = join(outDir, `${slug || basename(inputPath, '.json')}.md`);
await writeFile(outPath, body, 'utf8');
console.log(`Draft created: ${outPath}`);
console.log('Status: needs_review. No publication or external API call was performed.');
