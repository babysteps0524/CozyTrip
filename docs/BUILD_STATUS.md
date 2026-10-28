# 빌드 검증 상태

실제 실행 결과:

- 프로젝트 파일 및 JSON 구성: 정적 무결성 검사 통과
- 상대 경로 import 및 필수 파일 존재: 정적 검사 통과
- `bun run check`: 0 에러, 0 경고 (타입 검사 통과)
- `bun test`: 11 pass, 0 fail (콘텐츠 무결성 + Agoda 클라이언트 단위 테스트)
- `bun run content:validate`: 호텔 JSON 검증 통과
- `bun run build`: 정적 사이트 생성 성공 (32 페이지, `sitemap-index.xml` 생성)
- `bun run lint`: 통과
- `bun run sync:agoda:dry-run --mock`: 5개 mock 호텔 생성 검증 (고유 slug로 충돌 없음)

## Phase 1 결함 수정 기록 (2026-10-28)

- `package.json`의 `sync:agoda`·`sync:agoda:dry-run` 스크립트가 존재하지 않는 `scripts/sync-agoda-hotels.ts` 경로를 가리키던 문제를 `src/scripts/`로 수정.
- `hotels/[slug].astro`의 status enum이 `needs_review`를 포함해 `content.config.ts`(`draft/review/published/archived`)과 불일치하던 문제를 해결. 정규식 frontmatter 수동 파싱을 `getCollection()` 기반으로 전환하고, 누락됐던 `summary` 필드도 스키마에 추가해 페이지 메타·본문에 정상 표시.
- `hotels/index.astro`의 중복 frontmatter 파싱 로직도 `getCollection()`으로 교체.
- Content Collection을 Astro 7 표준 `glob()` loader 방식으로 전환.
- 호텔 스키마에 AGENT.md §8 필드 추가: `nameJa`, `address`, `amenities`, `transportNotes`, `checkIn`, `checkOut`, `lastVerifiedAt`, `editorialNotes` (선택 필드, 실제 검증 데이터 확보 시에만 사용).
- 한글 호텔명이 `createSlug`(NFKD 자모 분해)에서 전부 탈락해 모든 생성 파일이 `hotel.md`로 충돌하던 파이프라인 버그 수정: mock 호텔은 고유 숫자 `hotelId`를 받고, 한글명 호텔은 `hotel-{hotelId}` slug 폴백 적용.
- `.env`가 `.gitignore`로 제외되어 있고 Git 히스토리에 커밋 기록이 없음을 확인.
- 남은 경고: Zod v4 deprecated API 힌트(`z.string().url()` 등), `admin/hotels.astro` 미사용 함수 힌트 — 동작에는 영향 없음.

## 검증 명령

다운로드 후 프로젝트 디렉터리에서 다음 순서로 실행하세요.

```bash
bun install
cp .env.example .env
bun run check
bun test
bun run content:validate
bun run build
bun run preview
```

위 명령을 실행하기 전까지는 프로덕션 빌드 성공으로 간주하지 마세요. `bun install`이 성공하면 `bun.lock`이 생성됩니다. 설치 및 빌드 오류가 발생하면 먼저 의존성 버전과 Astro/UnoCSS 호환성을 확인하세요.

## sitemap 제외 페이지

다음 페이지는 색인 차단(`noindex`) 처리되어 sitemap에 포함되지 않습니다.

- `/studio/` (콘텐츠 초안 생성 도구)
- `/search/` (브라우저 내 검색)
- `/admin/hotels/` (호텔 콘텐츠 관리)
