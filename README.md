# CozyTrip — 일본 호텔 & 여행 가이드

일본 호텔 소개 콘텐츠, 지역별 여행 가이드, 편집 검토용 콘텐츠 자동화 흐름을 갖춘 독립적인 Astro 정적 웹사이트 프로젝트입니다. 기존 사이트의 파일을 수정하지 않고 별도 폴더에서 실행할 수 있도록 구성했습니다.

> **중요:** 이 패키지는 실제 제휴 승인을 받은 상태가 아니며, 아고다 API/딥링크를 임의로 만들지 않습니다. 호텔 소개 데이터는 검토용 샘플입니다. 현재 가격, 객실 재고, 평점, 리뷰 수를 사실인 것처럼 표시하지 않습니다. 공개 전 도메인·브랜드·이미지 권리·콘텐츠 출처를 확인해야 합니다.

## 기술 스택

- Astro + TypeScript + Bun
- UnoCSS Attributify / `presetWind4({ dark: 'media' })`
- 정적 사이트 생성(SSG)
- Zod 런타임 입력 검증
- Bun test 기반 콘텐츠 무결성 테스트
- Astro sitemap 통합

## 시작하기

필수 환경: Node.js 20.19+ 또는 22.12+, Bun 최신 안정 버전. 정확한 버전과 배포 환경은 운영자가 다시 확인하세요.

```bash
bun install
cp .env.example .env
bun run dev
```

Windows PowerShell에서 환경 파일을 복사하려면 `Copy-Item .env.example .env`를 사용하세요. `.env`에는 실제 비밀값을 커밋하지 마세요.

## 검증 및 빌드

```bash
bun run check
bun test
bun run content:validate
bun run build
bun run preview
```

`bun.lock`은 개발 환경에서 `bun install`로 생성하세요. Bun 실행 환경이 없는 경우 우선 `npm install`을 사용할 수 있지만, 운영 전 Bun으로 잠금 파일을 만들고 깨끗한 환경에서 설치·검증해야 합니다.

## 주요 페이지

- `/` 홈
- `/hotels/` 호텔 후보 목록
- `/hotels/{slug}/` 호텔 소개 초안
- `/regions/`, `/regions/{slug}/` 지역별 가이드
- `/guides/`, `/guides/{slug}/` 여행 가이드
- `/categories/` 테마별 호텔 탐색
- `/search/` 브라우저 내 검색
- `/studio/` 출처 입력 기반 Markdown 초안 생성 도구(비공개 색인 차단, 자동 게시 없음)
- `/about/`, `/editorial-policy/`, `/affiliate-disclosure/`, `/privacy/`, `/terms/`

## 콘텐츠 자동화 흐름

### 1. 새 콘텐츠 초안 생성

`examples/hotel-input.example.json`을 복사한 뒤 실제 출처가 확인된 정보로 채웁니다.

```bash
bun run content:draft -- examples/hotel-input.example.json
```

결과는 `src/content/drafts/`에 `needs_review` 상태로 생성됩니다. 이 명령은 API 호출, 게시, 예약 링크 활성화를 하지 않습니다. 브라우저에서 `/studio/`에 접속하면 별도 설치 없이 입력 폼으로 Markdown 초안을 생성하고 내려받을 수 있습니다.

### 2. 구조 검증

호텔 데이터 JSON은 `src/content/hotels/`에 둡니다.

```bash
bun run content:validate
```

검증 성공은 콘텐츠 공개 승인을 뜻하지 않습니다. 출처, 이미지 권리, 사실 검증, 편집자 승인 여부를 따로 확인해야 합니다.

### 3. 공개 승인 절차

1. 공식 호텔/교통/관광 출처와 확인 날짜를 기록합니다.
2. 요금·객실 가능 여부·평점·리뷰 수는 승인된 최신 데이터가 있을 때만 사용합니다.
3. 이미지 권리와 피드/API 이용 약관을 확인합니다.
4. 아고다 계정의 실제 승인 상태, 허용된 API 또는 딥링크 방법을 확인합니다.
5. 제휴 고지와 광고 관련 개인정보 안내를 검토합니다.
6. 편집자 승인 후 정적 콘텐츠에 반영하고 빌드/링크 검사를 수행합니다.

## Agoda 및 Google AdSense 설정

`.env.example`은 빈 환경 변수 자리표시자만 제공합니다.

- `PUBLIC_ADSENSE_CLIENT`: 실제 게시자 ID
- `PUBLIC_ADSENSE_SLOT_HOME`: 실제 홈 광고 슬롯
- `PUBLIC_ADSENSE_SLOT_ARTICLE`: 실제 콘텐츠 광고 슬롯
- `PUBLIC_AGODA_AFFILIATE_URL`: 실제로 승인되고 검증된 제휴 랜딩 URL(현재 코드에서 자동 활성화하지 않음)
- `AGODA_API_KEY`, `AGODA_API_SECRET`: 서버 전용 비밀값. 공개 변수 접두사 `PUBLIC_`를 사용하지 마세요.
- `CONTENT_AI_API_KEY`: 콘텐츠 생성 API를 별도로 연결할 때만 서버 측에서 사용

API 엔드포인트, 인증 방식, 파라미터, 이미지 사용 권한은 실제 제휴 계정에서 제공하는 공식 문서를 기준으로 구현해야 합니다. 승인 전에는 가짜 API 응답이나 추측한 딥링크를 사용하지 않습니다.

## 배포 전 필수 점검

- `cozytrip.kr`은 금융/계산기 서비스를 연상시킬 수 있는 이름이지만 이 프로젝트의 주제는 일본 호텔입니다. 도메인/DNS 또는 기존 사이트를 변경하기 전에 운영자가 브랜드 전략을 결정해야 합니다.
- `astro.config.ts`의 `site` 값을 실제 공개할 도메인으로 확정하세요.
- 이미지 URL의 라이선스와 이용 조건을 하나씩 확인하고, 권한이 불분명하면 허가된 이미지로 교체하세요.
- 개인정보처리방침의 운영자 정보, 연락처, 광고/분석 도구 관련 내용을 실제 구현에 맞게 업데이트하세요.
- AdSense 승인/정책 준수는 보장되지 않습니다.
- 프로덕션 배포와 도메인 변경은 명시적 승인 후 별도로 진행하세요.

## 구조

```text
src/
  components/       # 재사용 카드, 광고 영역
  data/site.ts      # 정적 예시 데이터
  layouts/          # 공통 레이아웃, 메타데이터, 탐색
  pages/            # 홈, 호텔, 지역, 가이드, 정책 페이지
  content/hotels/   # JSON 검증 예시 데이터
scripts/             # 콘텐츠 검증 및 초안 생성
examples/            # 입력 JSON 템플릿
tests/               # 콘텐츠 무결성 테스트
docs/                # 설계 및 운영 가이드
```
