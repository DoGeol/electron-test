# Sprint Plan

## 기준

이 계획은 `SPEC.md`를 기준으로 Blog Writing Assistant를 개발하기 위한 실행 단위로 쪼갠다. 관점은 “10년차 풀스택 개발자가 리스크를 줄이며 실제로 완성 가능한 순서로 진행한다”에 둔다.

핵심 원칙:

- 먼저 스캐폴딩을 끝내고 레이아웃을 눈으로 확인한다.
- 기능 구현은 테스트 코드와 테스트 케이스를 먼저 작성한 뒤 진행한다.
- 애매한 요구사항은 구현 전에 `plan:plan-deep-interview`로 조건을 확정한다.
- Electron main/preload/renderer 경계를 초반부터 명확히 잡는다.
- 외부 API, 파일 시스템, clipboard, `electron-store`는 초반부터 mock 가능한 adapter로 감싼다.
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

- 구현을 시작하기 전에 막힐 가능성이 높은 조건이 문서에 확정되어 있는지 확인한다.
- 아래 확정 사항이 `SPEC.md`와 실제 구현 계획에 유지되도록 관리한다.

착수 전 확인:

- `SPEC.md`
- `AGENTS.md`
- `docs/DESIGN.md`
- React/Next 관련 project skills 중 React composition/performance 관련 문서

확정된 결정:

- 스캐폴딩: `electron-vite + npm`.
- 앱 이름: `Blog Writing Assistant`.
- bundle identifier: `com.local.blog-writing-assistant`.
- 저장소: API Key, Markdown prompt, output path 모두 `electron-store`.
- API Key: UI에서는 masked 처리하고 로그/에러에는 원문을 남기지 않는다.
- 글 저장: `manual save only`.
- 업로드 이미지: MVP에서는 1장만 지원.
- Gemini 응답: non-streaming Markdown.
- Grounding 출처: metadata에 저장하고 본문과 분리된 팝업/패널로 표시.
- 에디터: BlockNote 우선, Markdown canonical.
- 네이버 복사: 전체 글과 선택 문단의 Naver HTML 복사, 일반 Markdown 복사.
- 제목/본문/태그 분리 복사, 여러 이미지, streaming, Keychain, notarization은 MVP 이후로 둔다.

완료 기준:

- 확정된 결정이 `SPEC.md`와 `SPRINT_PLAN.md`에 반영되어 있다.
- Sprint 1 착수자가 추가 결정을 하지 않아도 스캐폴딩을 시작할 수 있다.

## Sprint 1: 스캐폴딩 및 실행 기반

목표:

- 앱이 로컬에서 실행되고, macOS 빌드까지 갈 수 있는 골격을 만든다.
- 이 단계에서는 기능보다 프로젝트 구조와 경계를 검증한다.

주요 작업:

- `electron-vite + npm` 기반 Electron + React + TypeScript 스캐폴딩.
- Tailwind CSS v4 설정.
- shadcn/ui 초기화.
- app name을 `Blog Writing Assistant`로 설정.
- bundle identifier를 `com.local.blog-writing-assistant`로 설정.
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
- `electron-builder` 기반 macOS packaging script가 최소한 설정 수준에서 준비된다.
- package manager는 npm으로 고정되어 있다.

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

- API Key, Markdown prompt, output path는 MVP에서 모두 `electron-store`에 저장한다.
- Keychain adapter 구현은 MVP 범위에서 제외하고 이후 보안 개선 항목으로 둔다.
- 글은 manual save only이므로 설정 저장과 article 저장을 혼동하지 않는다.

테스트 우선 항목:

- settings default value 로드.
- prompt 저장/복원.
- output path 저장/복원.
- API Key 저장/조회 adapter mock test.
- API Key masking 및 로그 비노출 test.
- renderer가 직접 파일 시스템/`electron-store`에 접근하지 않는지 IPC boundary test.
- manual save 전에는 article 파일이 생성되지 않는지 test.

주요 작업:

- Settings page form state 구현.
- `settings:get`, `settings:update`, `settings:testApiKey` IPC 설계.
- output path 선택 dialog 구현.
- API Key masking 구현.
- Markdown prompt editor/textarea 구현.
- 연결 테스트 버튼 구현.

완료 기준:

- 앱 재시작 후 설정이 유지된다.
- API Key는 UI에 그대로 노출되지 않는다.
- API Key 원문은 로그/에러에 남지 않는다.
- 저장 경로 접근 불가 상태를 사용자에게 표시한다.
- article bundle은 사용자가 저장 버튼을 누르기 전에는 생성되지 않는다.

## Sprint 5: Gemini 생성 파이프라인

목표:

- 주제와 이미지를 입력하면 Gemini API로 글 초안을 생성하는 vertical slice를 만든다.

확정 게이트:

- Gemini 응답 canonical format은 Markdown으로 고정한다.
- MVP는 non-streaming 호출만 지원한다.
- 업로드 이미지는 1장만 지원한다.
- Grounding 출처는 metadata 저장 후 별도 팝업/패널에서 표시한다.

테스트 우선 항목:

- Gemini request payload 생성 test.
- `googleSearch` tool 설정 test.
- 단일 이미지 part 변환 및 validation test.
- API 오류를 UI error model로 변환하는 test.
- empty response/safety response 처리 test.
- non-streaming success/error 응답 처리 test.
- Grounding metadata 저장 test.

주요 작업:

- `GeminiClient` adapter 구현.
- `@google/genai` 연동.
- topic + Markdown prompt + 단일 image payload 구성.
- Grounding metadata 저장.
- 출처 팝업/패널 데이터 모델 구현.
- 생성 loading/error/success 상태 구현.
- mock Gemini provider로 UI integration test 작성.

완료 기준:

- mock provider로 글 생성 플로우가 완주한다.
- 실제 API Key가 있으면 Gemini 호출이 성공한다.
- Grounding source가 본문과 분리된 팝업/패널에 표시된다.
- 생성 결과가 Markdown canonical로 보존된다.
- 실패 상태가 화면에 명확히 표시된다.

## Sprint 6: 블록 에디터와 문서 저장

목표:

- 생성된 글을 사용자가 문단 단위로 편집, 이동, 선택, 저장할 수 있게 한다.

확정 게이트:

- 에디터는 BlockNote로 고정한다.
- Markdown canonical import/export가 안정적인 block type만 MVP에서 지원한다.
- 지원 block type: heading, paragraph, list, quote, code, image reference.

테스트 우선 항목:

- Markdown → ArticleDocument 변환.
- ArticleDocument → editor blocks 변환.
- BlockNote block → Markdown export.
- block move up/down.
- selected blocks copy target 생성.
- save path에 article bundle 생성하는 storage test.

주요 작업:

- 블록 에디터 도입.
- paragraph hover floating toolbar 구현.
- block select/move/copy/delete 구현.
- article manual save 구현.
- 저장 구조 생성:
  - `article.json`
  - `article.md`
  - `naver.html`
  - `metadata.json`
  - `input-image.<ext>`

완료 기준:

- 생성 글을 편집할 수 있다.
- 문단을 위/아래로 이동할 수 있다.
- 선택 문단을 추출할 수 있다.
- 사용자가 저장 버튼을 누르면 편집 결과가 로컬 파일로 저장된다.
- BlockNote block과 Markdown canonical 간 변환이 테스트로 보호된다.

## Sprint 7: 네이버 블로그 복사

목표:

- 작성된 글을 네이버 블로그에 붙여넣기 좋은 HTML로 클립보드에 복사한다.

확정 게이트:

- MVP copy 범위는 전체 글 Naver HTML 복사, 선택 문단 Naver HTML 복사, 일반 Markdown 복사로 고정한다.
- 제목/본문/태그 분리 복사는 MVP 이후로 둔다.

테스트 우선 항목:

- ArticleDocument → Markdown export.
- Markdown → Naver HTML 변환 wrapper.
- HTML/plain text clipboard payload 생성.
- 선택 문단 → Markdown → Naver HTML 변환.
- 지원하지 않는 block type fallback 처리.
- conversion failure 시 error 반환.

주요 작업:

- `@jjlabsio/md-to-naver-blog` 연동.
- `naverClipboard.copyArticle` IPC 구현.
- `naverClipboard.copySelectedBlocks` IPC 구현.
- 전체 글 복사 버튼 구현.
- 선택 문단 복사 버튼 구현.
- Markdown 복사 버튼 구현.
- 복사 성공/실패 toast 구현.
- 실제 네이버 블로그 붙여넣기 manual test checklist 작성.

완료 기준:

- 전체 글을 HTML + plain text로 clipboard에 기록한다.
- 선택 문단을 HTML + plain text로 clipboard에 기록한다.
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

## 구현 전 확정 상태

다음 항목은 최종 검토에서 확정됐다. 구현 중 이 결정을 바꾸면 관련 sprint 시작 전에 `plan:plan-deep-interview`로 다시 확정한다.

- Sprint 1 전:
  - 확정됨: `electron-vite + npm`
  - 확정됨: `Blog Writing Assistant`, `com.local.blog-writing-assistant`
- Sprint 4 전:
  - 확정됨: `electron-store only`
  - 확정됨: `manual save only`
- Sprint 5 전:
  - 확정됨: Markdown canonical
  - 확정됨: non-streaming
  - 확정됨: 단일 이미지
- Sprint 6 전:
  - 확정됨: BlockNote
  - 확정됨: Markdown import/export 가능한 block type 중심
- Sprint 7 전:
  - 확정됨: 전체 글 + 선택 문단 Naver HTML 복사
  - 확정됨: 제목/본문/태그 분리 복사는 MVP 이후

## 권장 MVP 컷

MVP에 반드시 포함:

- macOS Electron 앱 실행/빌드
- 좌우 2단 레이아웃
- Settings 저장
- 주제 + 단일 이미지 입력
- Gemini `gemini-2.5-flash` + Grounding 기반 글 생성
- 블록 단위 편집/이동
- 전체 글 및 선택 문단 Naver HTML 복사
- 수동 로컬 저장

MVP 이후로 미뤄도 되는 항목:

- 여러 이미지 업로드
- Gemini streaming 출력
- 제목/태그 개별 클립보드 UX
- Keychain 기반 API Key 저장
- app notarization
- 자동 발행/브라우저 자동화
