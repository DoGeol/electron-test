# Sprint Plan

## 기준

이 계획은 `SPEC.md`를 기준으로 Blog Writing Assistant를 개발하기 위한 실행 단위로 쪼갠다. 관점은 “10년차 풀스택 개발자가 리스크를 줄이며 실제로 완성 가능한 순서로 진행한다”에 둔다.

핵심 원칙:

- 먼저 스캐폴딩을 끝내고 레이아웃을 눈으로 확인한다.
- 기능 구현은 테스트 코드와 테스트 케이스를 먼저 작성한 뒤 진행한다.
- 애매한 요구사항은 구현 전에 `plan:plan-deep-interview`로 조건을 확정한다.
- Electron main/preload/renderer 경계를 초반부터 명확히 잡는다.
- 외부 API, 파일 시스템, clipboard, Keychain은 초반부터 mock 가능한 adapter로 감싼다.
- MVP는 “생성 → 편집 → 네이버 복사 → 로컬 저장”의 한 흐름이 실제로 동작하는 상태로 정의한다.

## 전체 스프린트 구조

| Sprint | 목표 | 산출물 |
| --- | --- | --- |
| Sprint 0 | 요구사항/기술 결정 게이트 정리 | 확정 질문 목록, 구현 전제, 기술 선택 기준 |
| Sprint 1 | 스캐폴딩 및 앱 실행 기반 | React + Electron + Tailwind + shadcn 기본 앱 |
| Sprint 2 | 레이아웃 우선 구현 | 좌우 2단 레이아웃, 생성/설정 페이지 UI 목업 |
| Sprint 3 | 테스트 인프라와 도메인 모델 | 테스트 환경, ArticleDocument, prompt/validation 테스트 |
| Sprint 4 | 설정 저장 기능 | API Key, 프롬프트, 저장 경로 설정 |
| Sprint 5 | Gemini 생성 파이프라인 | Gemini adapter, Grounding 요청, 이미지 입력 |
| Sprint 6 | 블록 에디터와 문서 저장 | 문단 편집/이동/선택, article 저장/로드 |
| Sprint 7 | 네이버 블로그 복사 | Markdown export, Naver HTML 변환, clipboard 복사 |
| Sprint 8 | macOS 빌드와 마감 검증 | dmg/zip 빌드, E2E/manual 검증, README 보강 |

## 설치된 서브에이전트

이 프로젝트에는 다음 project-scoped Codex subagents를 `.codex/agents/`에 설치한다.

| Agent | 주 역할 |
| --- | --- |
| `electron-pro` | Electron main/preload/renderer 경계, IPC, clipboard, file dialog, macOS packaging |
| `frontend-developer` | React + shadcn/ui + Tailwind 기반 화면과 사용자 흐름 구현 |
| `ui-designer` | Octo Code 디자인 가이드 기반 레이아웃, 상호작용, UI 의사결정 |
| `react-specialist` | React 상태 흐름, 블록 에디터, hover toolbar, 렌더링 동작 |
| `ai-engineer` | Gemini API + Grounding, AI 입출력 계약, 실패 처리, metadata 저장 |
| `test-automator` | 테스트 우선 개발, regression coverage, test harness 구성 |
| `build-engineer` | Vite/Electron build, Tailwind/shadcn 설정, macOS packaging 안정화 |
| `code-reviewer` | sprint 단위 correctness, regression, missing tests, 유지보수성 리뷰 |

## 스프린트별 서브에이전트 운영 계획

| Sprint | Primary agents | Review/support agents | 위임 기준 |
| --- | --- | --- | --- |
| Sprint 0 | `ui-designer`, `electron-pro`, `ai-engineer` | `code-reviewer` | 요구사항 게이트, 기술 결정, MVP 컷 정리 |
| Sprint 1 | `electron-pro`, `build-engineer` | `test-automator`, `code-reviewer` | Electron/Vite 스캐폴딩, build/test 명령, process 경계 구성 |
| Sprint 2 | `ui-designer`, `frontend-developer` | `react-specialist`, `test-automator` | 좌우 2단 레이아웃, 정적 UI, 디자인 토큰, 화면 확인 |
| Sprint 3 | `test-automator`, `react-specialist` | `build-engineer`, `code-reviewer` | 테스트 인프라, ArticleDocument 모델, validation/prompt 테스트 |
| Sprint 4 | `electron-pro`, `frontend-developer` | `test-automator`, `code-reviewer` | Settings UI, IPC, API Key/prompt/output path 저장 |
| Sprint 5 | `ai-engineer`, `electron-pro` | `test-automator`, `code-reviewer` | Gemini adapter, Grounding 요청, 이미지 입력, 오류 처리 |
| Sprint 6 | `react-specialist`, `frontend-developer` | `test-automator`, `code-reviewer` | 블록 에디터, 문단 이동/선택/편집, article 저장/로드 |
| Sprint 7 | `electron-pro`, `frontend-developer` | `test-automator`, `ai-engineer`, `code-reviewer` | Naver HTML 변환, clipboard IPC, 복사 UX, 변환 실패 처리 |
| Sprint 8 | `build-engineer`, `electron-pro` | `test-automator`, `code-reviewer`, `ui-designer` | macOS build, packaged app 검증, E2E/manual checklist, polish |

운영 원칙:

- `ui-designer`는 구현 전 레이아웃/상호작용 판단이 필요할 때 먼저 사용한다.
- `test-automator`는 기능 구현 전에 실패하는 테스트와 fixture를 먼저 만들 때 사용한다.
- `code-reviewer`는 각 sprint의 완료 직전 PR-style review 용도로 사용한다.
- `electron-pro`는 renderer가 파일 시스템, clipboard, API Key, Gemini 호출에 직접 접근하려는 설계가 보이면 반드시 투입한다.
- `ai-engineer`는 prompt tweak만이 아니라 Gemini request/response contract, Grounding metadata, fallback/error handling까지 함께 검토한다.
- `build-engineer`는 Tailwind/shadcn/Vite/Electron builder 설정이 충돌하거나 packaged app에서만 실패하는 문제가 생길 때 우선 투입한다.

## Sprint 0: 요구사항 확정 게이트

목표:

- 구현을 시작하기 전에 막힐 가능성이 높은 조건을 확정한다.
- 확정되지 않아도 되는 항목과 반드시 닫아야 하는 항목을 구분한다.

착수 전 확인:

- `SPEC.md`
- `AGENTS.md`
- `docs/DESIGN.md`
- React/Next 관련 project skills 중 React composition/performance 관련 문서

확정 필요 질문:

- 앱 이름, bundle identifier, macOS 앱 표시 이름은 무엇인가?
- 업로드 이미지는 MVP에서 1장만 지원할 것인가?
- 글 생성 결과 저장은 생성 직후 자동 저장만 할지, 수동 저장 버튼도 둘지?
- API Key 저장은 MVP에서 macOS Keychain까지 구현할지, `electron-store` 암호화/마스킹으로 1차 처리할지?
- 블록 에디터는 BlockNote로 시작할지, Tiptap으로 시작할지?
- Gemini 응답 포맷은 Markdown을 canonical으로 할지, JSON block 구조를 canonical으로 할지?
- 네이버 복사는 전체 글/선택 문단/제목/태그를 각각 복사할지, MVP에서는 전체 글만 우선할지?

완료 기준:

- 위 질문의 MVP 범위 답변이 정리된다.
- 답변은 `SPEC.md` 또는 별도 decision log에 반영된다.

## Sprint 1: 스캐폴딩 및 실행 기반

목표:

- 앱이 로컬에서 실행되고, macOS 빌드까지 갈 수 있는 골격을 만든다.
- 이 단계에서는 기능보다 프로젝트 구조와 경계를 검증한다.

주요 작업:

- Electron + React + TypeScript + Vite 기반 스캐폴딩.
- Tailwind CSS v4 설정.
- shadcn/ui 초기화.
- main/preload/renderer 디렉터리 분리.
- IPC expose API의 기본 패턴 정의.
- lint, format, typecheck, test 명령 구성.
- `npm run dev`, `npm run build`, `npm run dist:mac` 스크립트 초안 구성.

테스트 우선 항목:

- 기본 smoke test: renderer가 mount되는지.
- preload API shape test: renderer에 노출되는 API 목록이 의도한 범위인지.
- build script dry-run 또는 typecheck가 실패하지 않는지.

완료 기준:

- 로컬에서 앱 창이 열린다.
- renderer가 빈 App Shell을 렌더링한다.
- main/preload/renderer build가 통과한다.
- macOS packaging script가 최소한 설정 수준에서 준비된다.

리스크:

- Electron builder와 Vite 설정이 충돌할 수 있다.
- Tailwind CSS v4와 shadcn/ui 설정 방식이 기존 v3 문서와 다를 수 있다.

## Sprint 2: 레이아웃 우선 구현

목표:

- 기능 구현 전에 실제 화면 구조를 먼저 확인한다.
- `AGENTS.md`와 `docs/DESIGN.md`의 Octo Code 스타일을 앱 전체에 적용한다.

주요 작업:

- App Shell 구현.
- 좌측 Sidebar 구현.
- 우측 Content 영역 구현.
- Blog Generator 페이지 정적 UI 구현.
- Settings 페이지 정적 UI 구현.
- Generate page의 입력 스트립 구현:
  - Topic input
  - Image upload 영역
  - Generate button
- Generated Article mock 영역 구현:
  - title
  - paragraph blocks
  - hover floating toolbar mock
  - source chips
  - copy/save action rail
- Settings mock 영역 구현:
  - API Key field
  - Prompt textarea
  - Output path selector

테스트 우선 항목:

- Sidebar navigation test.
- Blog Generator/Settings page 전환 test.
- 필수 label과 button이 렌더링되는지 test.
- Generate button disabled 상태 test.

완료 기준:

- 앱 실행 시 실제 제품에 가까운 2단 레이아웃이 보인다.
- Blog Generator와 Settings 페이지를 오갈 수 있다.
- 디자인 가이드 색상, radius, spacing이 CSS token으로 잡혀 있다.
- Playwright 또는 equivalent screenshot/manual check로 레이아웃을 확인한다.

리스크:

- 이 단계에서 컴포넌트 추상화를 과하게 만들면 이후 기능 개발이 느려진다.
- mock UI와 실제 데이터 모델이 너무 멀어지면 Sprint 6에서 재작업이 생긴다.

## Sprint 3: 테스트 인프라와 도메인 모델

목표:

- 기능 구현 전에 문서 모델, 변환, validation의 테스트 기반을 만든다.

주요 작업:

- test runner 설정.
- React component test 환경 설정.
- Electron main process 로직을 순수 함수/adapter로 분리할 수 있는 구조 확정.
- `ArticleDocument`, `ArticleBlock`, `Settings` 타입 정의.
- prompt variable interpolation 모듈 정의.
- file/image validation 모듈 정의.
- Markdown export/import 초안 정의.

테스트 우선 항목:

- ArticleDocument serialization/deserialization.
- block reorder 함수.
- selected blocks extraction 함수.
- prompt interpolation:
  - `{{topic}}`
  - `{{image_context}}`
  - `{{style}}`
  - `{{format_rules}}`
- image validation:
  - 허용 확장자
  - 허용 MIME type
  - 빈 파일/잘못된 파일 처리

완료 기준:

- 테스트가 CI 없이 로컬 명령으로 안정적으로 실행된다.
- 주요 도메인 로직이 UI 없이 테스트 가능하다.
- 이후 기능은 실패하는 테스트를 먼저 만들고 구현할 수 있다.

## Sprint 4: 설정 저장 기능

목표:

- Gemini API Key, 프롬프트, 저장 경로를 로컬에 저장하고 읽어오는 기능을 만든다.

확정 게이트:

- API Key 저장 방식을 확정한다.
  - 권장 MVP: Keychain adapter 인터페이스를 만들고, macOS에서는 Keychain 구현을 사용한다.
  - 빠른 MVP 대안: `electron-store`에 저장하되 마스킹과 로그 방지만 적용한다.

테스트 우선 항목:

- settings default value 로드.
- prompt 저장/복원.
- output path 저장/복원.
- API Key 저장/조회 adapter mock test.
- renderer가 직접 파일 시스템/Keychain에 접근하지 않는지 IPC boundary test.

주요 작업:

- Settings page form state 구현.
- `settings:get`, `settings:update`, `settings:testApiKey` IPC 설계.
- output path 선택 dialog 구현.
- API Key masking 구현.
- 연결 테스트 버튼 구현.

완료 기준:

- 앱 재시작 후 설정이 유지된다.
- API Key는 UI에 그대로 노출되지 않는다.
- 저장 경로 접근 불가 상태를 사용자에게 표시한다.

## Sprint 5: Gemini 생성 파이프라인

목표:

- 주제와 이미지를 입력하면 Gemini API로 글 초안을 생성하는 vertical slice를 만든다.

확정 게이트:

- Gemini 응답 canonical format을 확정한다.
  - 권장: Gemini 출력은 Markdown으로 받고, 내부에서는 Markdown → ArticleDocument 변환.
  - 대안: Gemini 출력부터 JSON block 구조로 강제.
- streaming을 MVP에 포함할지 확정한다.
  - 권장: MVP는 non-streaming, UI loading 상태만 구현. 이후 streaming 추가.

테스트 우선 항목:

- Gemini request payload 생성 test.
- `googleSearch` tool 설정 test.
- 이미지 part 변환 test.
- API 오류를 UI error model로 변환하는 test.
- empty response/safety response 처리 test.

주요 작업:

- `GeminiClient` adapter 구현.
- `@google/genai` 연동.
- topic + prompt + image payload 구성.
- Grounding metadata 저장.
- 생성 loading/error/success 상태 구현.
- mock Gemini provider로 UI integration test 작성.

완료 기준:

- mock provider로 글 생성 플로우가 완주한다.
- 실제 API Key가 있으면 Gemini 호출이 성공한다.
- Grounding source가 UI에 표시된다.
- 실패 상태가 화면에 명확히 표시된다.

## Sprint 6: 블록 에디터와 문서 저장

목표:

- 생성된 글을 사용자가 문단 단위로 편집, 이동, 선택, 저장할 수 있게 한다.

확정 게이트:

- 에디터 라이브러리 확정.
  - 권장 검증 순서: BlockNote로 hover toolbar, block move, Markdown export가 충분한지 먼저 PoC.
  - 실패 시 Tiptap + custom floating menu로 전환.

테스트 우선 항목:

- Markdown → ArticleDocument 변환.
- ArticleDocument → editor blocks 변환.
- block move up/down.
- selected blocks copy target 생성.
- save path에 article bundle 생성하는 storage test.

주요 작업:

- 블록 에디터 도입.
- paragraph hover floating toolbar 구현.
- block select/move/copy/delete 구현.
- article auto-save 또는 manual save 구현.
- 저장 구조 생성:
  - `article.json`
  - `article.md`
  - `metadata.json`
  - `input-image.<ext>`

완료 기준:

- 생성 글을 편집할 수 있다.
- 문단을 위/아래로 이동할 수 있다.
- 선택 문단을 추출할 수 있다.
- 편집 결과가 로컬 파일로 저장된다.

## Sprint 7: 네이버 블로그 복사

목표:

- 작성된 글을 네이버 블로그에 붙여넣기 좋은 HTML로 클립보드에 복사한다.

확정 게이트:

- MVP copy 범위를 확정한다.
  - 권장 MVP: 전체 글 Naver HTML 복사 + 일반 Markdown 복사.
  - 다음 단계: 선택 문단 복사, 제목/태그 분리 복사.

테스트 우선 항목:

- ArticleDocument → Markdown export.
- Markdown → Naver HTML 변환 wrapper.
- HTML/plain text clipboard payload 생성.
- 지원하지 않는 block type fallback 처리.
- conversion failure 시 error 반환.

주요 작업:

- `@jjlabsio/md-to-naver-blog` 연동.
- `naverClipboard.copyArticle` IPC 구현.
- 전체 글 복사 버튼 구현.
- Markdown 복사 버튼 구현.
- 복사 성공/실패 toast 구현.
- 실제 네이버 블로그 붙여넣기 manual test checklist 작성.

완료 기준:

- 전체 글을 HTML + plain text로 clipboard에 기록한다.
- 네이버 블로그 에디터에 붙여넣었을 때 기본 서식이 유지된다.
- 실패 시 사용자가 복구 가능한 메시지를 본다.

## Sprint 8: macOS 빌드와 마감 검증

목표:

- 로컬 사용 가능한 macOS 앱 산출물을 만들고, MVP 흐름을 끝까지 검증한다.

테스트 우선 항목:

- packaging config validation.
- production build smoke test.
- 핵심 user flow E2E 또는 manual script:
  - 앱 실행
  - 설정 저장
  - 주제/이미지 입력
  - 글 생성
  - 문단 편집/이동
  - 네이버 복사
  - 저장 파일 확인

주요 작업:

- `electron-builder` mac target 설정.
- app icon placeholder 또는 최종 아이콘 적용.
- dmg/zip 산출물 생성.
- README에 개발/빌드/테스트 명령 업데이트.
- 에러 메시지와 empty/loading 상태 정리.
- 접근성 기본 점검.

완료 기준:

- `npm run dist:mac`으로 macOS 산출물이 생성된다.
- 산출물 앱을 실행할 수 있다.
- MVP 핵심 흐름이 수동 검증 체크리스트를 통과한다.

## 테스트 전략

### Unit

- 순수 함수 중심:
  - prompt interpolation
  - validation
  - ArticleDocument 변환
  - block reorder/selection
  - Markdown/Naver 변환 wrapper

### Integration

- IPC adapter:
  - settings
  - clipboard
  - article storage
  - Gemini client mock

### UI

- page navigation
- form validation
- loading/error/success states
- block editor shell interactions

### Manual/E2E

- Electron app launch
- macOS file dialog
- clipboard write
- 네이버 블로그 붙여넣기
- packaged app 실행

## 구현 전 결정이 필요한 항목

다음 항목은 관련 Sprint 착수 직전에 `plan:plan-deep-interview`로 짧게 조건을 확정한다.

- Sprint 1 전:
  - package manager
  - Electron scaffold 방식
  - 앱 이름/bundle id
- Sprint 4 전:
  - API Key 저장 방식
  - 설정 저장소
- Sprint 5 전:
  - Gemini 응답 포맷
  - streaming 포함 여부
  - 이미지 개수 제한
- Sprint 6 전:
  - BlockNote vs Tiptap
  - auto-save vs manual save
- Sprint 7 전:
  - 네이버 복사 MVP 범위
  - 제목/본문/태그 분리 복사 여부

## 권장 MVP 컷

MVP에 반드시 포함:

- macOS Electron 앱 실행/빌드
- 좌우 2단 레이아웃
- Settings 저장
- 주제 + 단일 이미지 입력
- Gemini `gemini-2.5-flash` + Grounding 기반 글 생성
- 블록 단위 편집/이동
- 전체 글 Naver HTML 복사
- 로컬 저장

MVP 이후로 미뤄도 되는 항목:

- 여러 이미지 업로드
- Gemini streaming 출력
- 선택 문단별 네이버 복사 고도화
- 제목/태그 개별 클립보드 UX
- app notarization
- 자동 발행/브라우저 자동화
