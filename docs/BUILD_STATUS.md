# 빌드 검증 상태

실제 실행 결과:

- 프로젝트 파일 및 JSON 구성: 정적 무결성 검사 통과
- 상대 경로 import 및 필수 파일 존재: 정적 검사 통과
- `bun run check`: 0 에러, 0 경고 (타입 검사 통과)
- `bun test`: 11 pass, 0 fail (콘텐츠 무결성 + Agoda 클라이언트 단위 테스트)
- `bun run content:validate`: 호텔 JSON 검증 통과
- `bun run build`: 정적 사이트 생성 성공 (31 페이지, `sitemap-index.xml` 생성)

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
