# 배포 체크리스트 (Cloudflare Pages)

이 문서는 배포 안내이며, 실제 배포를 수행하지 않습니다.

## 1. 도메인 및 브랜드 확정

1. 실제 공개할 도메인과 브랜드를 확정합니다. 현재 도메인 `cozytrip.kr`을 변경하거나 기존 사이트를 교체하지 않습니다.
2. `astro.config.ts`의 `site` 값을 실제 공개할 도메인으로 확정하세요.
3. 도메인/DNS 변경, SSL 설정, Cloudflare Pages 커스텀 도메인 연결은 운영자의 명시적 승인 후 별도로 진행하세요.

## 2. 빌드 환경

1. Cloudflare Pages 프로젝트를 생성하고 저장소를 연결합니다.
2. 빌드 명령은 `bun run build`, 출력 디렉터리는 `dist`입니다.
3. Cloudflare가 지원하는 Bun 버전을 확인하고 `BUN_VERSION`을 프로젝트 환경에 맞게 설정합니다.
4. `bun.lock`을 버전 관리에 포함하여 재현 가능한 빌드 환경을 확보합니다.

## 3. 환경변수

광고/제휴 계정이 승인된 후 실제 환경변수를 등록합니다. 비밀키를 `PUBLIC_` 접두사가 있는 공개 변수로 만들지 않습니다.

| 변수                          | 범위      | 설명                     |
| ----------------------------- | --------- | ------------------------ |
| `PUBLIC_ADSENSE_CLIENT`       | 공개      | AdSense 게시자 ID        |
| `PUBLIC_ADSENSE_SLOT_HOME`    | 공개      | 홈 광고 슬롯 ID          |
| `PUBLIC_ADSENSE_SLOT_ARTICLE` | 공개      | 콘텐츠 광고 슬롯 ID      |
| `AGODA_SITE_ID`               | 서버 전용 | 아고다 제휴 사이트 ID    |
| `AGODA_API_KEY`               | 서버 전용 | 아고다 제휴 API 키       |
| `AGODA_API_SECRET`            | 서버 전용 | 아고다 API 비밀          |
| `CONTENT_AI_API_KEY`          | 서버 전용 | 콘텐츠 생성 API 키(선택) |

`.env` 파일과 실제 API 키, 토큰, 개인 데이터는 Git에 커밋하지 않습니다.

## 4. Preview 배포 검토

Preview 배포에서 다음을 확인하세요.

- 링크, 모바일 레이아웃, 다크 모드, 접근성
- 메타데이터(title, description, canonical, Open Graph)
- 광고 영역(AdSense 미설정 시 플레이스홀더 표시, 설정 시 실제 광고)
- 개인정보 고지, 제휴 고지
- 404 페이지, robots.txt, sitemap.xml

## 5. 사전 제외 페이지

다음 페이지는 `noindex` 처리되어 sitemap에 포함되지 않으며, 검색 엔진에 색인되지 않아야 합니다.

- `/studio/`: 콘텐츠 초안 생성 도구
- `/search/`: 브라우저 내 검색
- `/admin/hotels/`: 호텔 콘텐츠 관리

## 6. 최종 승인

운영자의 명시적 승인 없이 프로덕션 배포, DNS 변경, 기존 사이트 교체를 하지 않습니다.
