# SEO 및 검색 품질 체크리스트

이 문서는 CozyTrip 프로젝트의 SEO 구현 사항과 검색 품질 게이트를 정의합니다. AGENT.md §8(SEO and Google Search quality)을 따릅니다.

## 1. 기본 SEO

모든 공개 페이지에 다음을 구현합니다:

- [ ] 고유하고 설명적인 `<title>` (페이지별 중복 없음)
- [ ] 고유한 meta description
- [ ] canonical URL (`https://cozytrip.kr` 기준, 일관성 있게 생성)
- [ ] robots 메타 태그 (noindex 페이지는 `noindex, nofollow`)
- [ ] Open Graph 메타데이터 (`og:title`, `og:description`, `og:url`, `og:image`)
- [ ] XML sitemap 및 `robots.txt`
- [ ] 명확한 제목 계층 (H1 하나, H2/H3 논리적 구성)
- [ ] 유용한 내부 링크 (호텔, 지역, 명소, 가이드 간)
- [ ] 이미지 alt 텍스트와 적절한 이미지 크기
- [ ] 언어 선언 `lang="ko"`
- [ ] 실제 페이지 내용과 일치하는 메타데이터

## 2. sitemap 및 robots

- sitemap에는 공개, 승인(`published`), 색인 가능 페이지만 포함합니다.
- 초안(`draft`), 검토 중(`review`), 승인 완료(`approved`), 보관(`archived`) 페이지는 sitemap에서 제외합니다.
- 404 페이지는 sitemap에서 제외합니다.
- 다음 페이지는 `noindex` 처리되어 sitemap에 포함되지 않습니다:
  - `/studio/` (콘텐츠 초안 생성 도구)
  - `/search/` (브라우저 내 검색)
  - `/admin/hotels/` (호텔 콘텐츠 관리)
- `astro.config.ts`의 sitemap filter에서 제외 페이지를 관리합니다.

## 3. 호텔/여행 페이지 SEO

- [ ] 호텔명, 지역, 여행 목적을 제목과 본문에 자연스럽게 반영
- [ ] 키워드 반복을 위한 부자연스러운 문장 금지
- [ ] 비슷한 호텔 페이지를 기계적으로 대량 생성 금지
- [ ] 각 페이지의 독자 가치와 고유 정보 확인
- [ ] 실제 투숙 경험이 없는 경우 리뷰 콘텐츠처럼 표시 금지
- [ ] 허위 평점이나 가짜 리뷰 구조화 데이터 사용 금지

## 4. 구조화 데이터 (JSON-LD)

- `WebSite`, `Organization`, `BreadcrumbList` 등 실제 페이지 내용과 일치하는 스키마만 사용
- 실제 페이지에 없는 평점/가격/리뷰를 넣지 않음
- 작성자, 게시일, 수정일은 실제 값만 사용
- JSON-LD를 HTML에 안전하게 삽입
- 사용자 입력 문자열로 인한 스크립트 삽입 위험 방지
- 빌드 테스트에서 JSON-LD 파싱과 필수 필드 일관성 확인

## 5. 검색 색인 품질 게이트

게시 가능한 페이지는 다음을 통과해야 합니다:

- [ ] 본문이 비어 있지 않음
- [ ] 페이지별 고유한 제목/설명
- [ ] 적절한 canonical
- [ ] 출처 및 확인 시점 (정보 유형에 따라)
- [ ] 유효한 내부 링크
- [ ] 실질적인 고유 가치
- [ ] 광고/제휴 고지
- [ ] 허위 데이터 없음
- [ ] 승인 상태 (`published`)
- [ ] 이미지 권리 상태 검증
- [ ] 중복성 점검

## 6. 검증 항목

빌드 시 자동으로 확인되는 항목:

- 중복 slug 검사
- 깨진 내부 링크 검사
- 중복 제목/메타 설명 검사
- canonical 및 sitemap 도메인 검증 (`cozytrip.kr`)
- `cozymoney.kr` 등 오래된 브랜드 문자열 잔류 여부 검사

## 7. Search Console 체크리스트

배포 후 운영자 수행 항목:

- [ ] `cozytrip.kr` 도메인 등록 및 소유권 확인
- [ ] sitemap 제출 (`https://cozytrip.kr/sitemap-index.xml`)
- [ ] robots.txt 확인
- [ ] 색인 상태 및 크롤링 오류 모니터링
- [ ] 모바일 사용성 검토
- [ ] Core Web Vitals 측정

> 검색 순위나 AdSense 승인을 보장하지 않습니다.
