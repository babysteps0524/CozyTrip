# 빌드 검증 상태

- 프로젝트 파일 및 JSON 구성: 정적 무결성 검사 통과
- 상대 경로 import 및 필수 파일 존재: 정적 검사 통과
- Astro 타입 검사 / 프로덕션 빌드 / Bun 테스트: 이 생성 환경에는 Bun과 Node 의존성이 설치되어 있지 않았고, 외부 패키지 저장소 DNS 연결이 불가능해 실행하지 못했습니다.

다운로드 후 프로젝트 디렉터리에서 다음 순서로 실행하세요.

```bash
bun install
bun run check
bun test
bun run content:validate
bun run build
```

위 명령을 실행하기 전까지는 프로덕션 빌드 성공으로 간주하지 마세요. `bun install`이 성공하면 `bun.lock`이 생성됩니다. 설치 및 빌드 오류가 발생하면 먼저 의존성 버전과 Astro/UnoCSS 호환성을 확인하세요.
