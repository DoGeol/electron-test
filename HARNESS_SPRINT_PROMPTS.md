# Harness Sprint Prompts

아래 프롬프트는 `SPRINT_PLAN.md` 기준으로 Sprint 0부터 Sprint 8까지 순차 실행하기 위한 ready-to-paste harness prompt다. 각 sprint는 이전 sprint의 산출물이 완료되어 있다는 전제로 좁은 범위만 진행한다.

## Sprint 0 - 요구사항 확정 상태 점검

```text
[$harness-engineering](/Users/pdg/WebstormProjects/kakao-theme-generator/plugins/kakao-theme-harness/skills/harness-engineering/SKILL.md)
Sprint 0: Blog Writing Assistant 구현 전에 SPEC과 스프린트 계획의 확정 상태를 최종 점검해줘.

Goal:
- `SPEC.md`와 `SPRINT_PLAN.md`가 구현 착수 가능한 결정 상태인지 검토한다.
- 확정된 MVP 결정이 서로 충돌하지 않는지 확인한다.
- 구현자가 Sprint 1에서 추가 제품/기술 결정을 하지 않아도 되도록 남은 ambiguity를 목록화한다.

Context:
- `AGENTS.md`
- `docs/DESIGN.md`
- `SPEC.md`
- `SPRINT_PLAN.md`
- `.codex/agents/*.toml`
- 현재 확정 사항: `electron-vite + npm`, app name `Blog Writing Assistant`, bundle id `com.local.blog-writing-assistant`, `electron-store only`, `manual save only`, Gemini non-streaming Markdown, 단일 이미지, BlockNote, 전체 글/선택 문단 Naver HTML 복사

Constraints:
- 파일을 수정하지 말고 문서 검토 결과만 보고한다.
- 새 기술 선택지를 추가하지 않는다.
- 이미 확정된 MVP 결정을 되돌리지 않는다.
- 애매한 항목이 있으면 구현 차단 여부를 `blocking` 또는 `non-blocking`으로 분류한다.

Done when:
- Sprint 1 착수 전 반드시 수정해야 하는 문서 충돌이 있는지 보고한다.
- 구현 중 유의해야 할 MVP guardrail을 10개 이하로 정리한다.
- 남은 질문이 있다면 왜 repo에서 결정할 수 없는지와 권장 기본값을 함께 제시한다.
```

## Sprint 1 - 스캐폴딩 및 실행 기반

```text
[$harness-engineering](/Users/pdg/WebstormProjects/kakao-theme-generator/plugins/kakao-theme-harness/skills/harness-engineering/SKILL.md)
Sprint 1: Blog Writing Assistant의 Electron + React 실행 기반을 스캐폴딩해줘.

Goal:
- `electron-vite + npm` 기반으로 Electron, React, TypeScript 앱 골격을 만든다.
- app name은 `Blog Writing Assistant`, bundle identifier는 `com.local.blog-writing-assistant`로 설정한다.
- main/preload/renderer 경계를 분리하고 이후 IPC 기능 구현을 위한 최소 bridge 패턴을 준비한다.

Context:
- `AGENTS.md`
- `docs/DESIGN.md`
- `SPEC.md`
- `SPRINT_PLAN.md`의 Sprint 1
- 관련 subagents: `electron-pro`, `build-engineer`, `test-automator`, `code-reviewer`

Constraints:
- package manager는 npm으로 고정한다.
- Electron renderer에서 Node API를 직접 노출하지 않는다.
- `contextIsolation: true`, `nodeIntegration: false`를 기본 보안 설정으로 둔다.
- Tailwind CSS v4와 shadcn/ui를 이후 Sprint 2에서 바로 사용할 수 있게 설정한다.
- 기능 구현은 하지 말고 앱 shell이 뜨는 최소 기반까지만 만든다.
- 실행/빌드 스크립트는 실제 repo에서 동작하는 명령만 추가한다.

Done when:
- 로컬에서 Electron 앱 창이 열린다.
- renderer가 빈 App Shell을 렌더링한다.
- main/preload/renderer build 또는 typecheck가 통과한다.
- `npm run dev`, `npm run build`, `npm run dist:mac` 스크립트 초안이 준비된다.
- preload에서 노출할 API surface가 최소 구조로 정의되어 있다.
```

## Sprint 2 - 레이아웃 우선 구현

```text
[$harness-engineering](/Users/pdg/WebstormProjects/kakao-theme-generator/plugins/kakao-theme-harness/skills/harness-engineering/SKILL.md)
Sprint 2: Blog Writing Assistant의 좌우 2단 레이아웃과 정적 화면을 먼저 구현해줘.

Goal:
- 기능 구현 전에 실제 앱 레이아웃을 확인할 수 있는 정적 UI를 만든다.
- 좌측 Sidebar와 우측 Content 영역을 구현한다.
- Blog Generator 페이지와 Settings 페이지를 전환 가능한 상태로 만든다.

Context:
- `AGENTS.md`
- `docs/DESIGN.md`
- `SPEC.md`
- `SPRINT_PLAN.md`의 Sprint 2
- Sprint 1 스캐폴딩 결과
- 관련 subagents: `ui-designer`, `frontend-developer`, `react-specialist`, `test-automator`

Constraints:
- Octo Code 디자인 가이드를 따른다: dark mode first, `#0D1117`, `#161B22`, `#30363D`, 6px radius 중심.
- 카드 안에 카드를 중첩하지 않는다.
- 첫 화면은 landing page가 아니라 실제 작업 화면이어야 한다.
- Blog Generator에는 Topic input, image upload 영역, Generate button, mock article editor, source/action 영역을 배치한다.
- Settings에는 API Key field, Markdown prompt textarea, output path selector를 배치한다.
- 실제 Gemini, 저장, clipboard 기능은 구현하지 않는다.

Done when:
- 앱 실행 시 좌우 2단 레이아웃이 보인다.
- Sidebar에서 Blog Generator와 Settings를 전환할 수 있다.
- 필수 label과 button이 렌더링된다.
- Generate button은 필수 입력이 없을 때 disabled 상태를 표현한다.
- 레이아웃이 `docs/DESIGN.md`의 색상, spacing, radius 기준을 따른다.
```

## Sprint 3 - 테스트 인프라와 도메인 모델

```text
[$harness-engineering](/Users/pdg/WebstormProjects/kakao-theme-generator/plugins/kakao-theme-harness/skills/harness-engineering/SKILL.md)
Sprint 3: 기능 구현 전에 테스트 인프라와 문서 도메인 모델을 구축해줘.

Goal:
- 이후 기능을 테스트 우선으로 구현할 수 있게 test runner와 test harness를 구성한다.
- ArticleDocument, ArticleBlock, Settings 타입과 순수 도메인 함수를 정의한다.
- Markdown canonical 기반 변환/검증 로직의 첫 테스트를 만든다.

Context:
- `SPEC.md`의 Article Document Model, Validation Plan
- `SPRINT_PLAN.md`의 Sprint 3
- Sprint 1-2 결과
- 관련 subagents: `test-automator`, `react-specialist`, `build-engineer`, `code-reviewer`

Constraints:
- main process 의존 로직은 adapter 뒤로 분리해 unit test 가능하게 만든다.
- MVP 지원 block type은 heading, paragraph, list, quote, code, image reference로 제한한다.
- 테스트를 먼저 작성하고, 테스트를 통과하는 최소 구현만 추가한다.
- UI 변경은 테스트 인프라에 필요한 범위로 제한한다.

Done when:
- 로컬 테스트 명령이 동작한다.
- ArticleDocument serialization/deserialization 테스트가 있다.
- block reorder와 selected blocks extraction 테스트가 있다.
- prompt interpolation 테스트가 `{{topic}}`, `{{image_context}}`, `{{style}}`, `{{format_rules}}`를 포함한다.
- 이미지 validation 테스트가 확장자, MIME type, 빈 파일/잘못된 파일을 포함한다.
```

## Sprint 4 - 설정 저장 기능

```text
[$harness-engineering](/Users/pdg/WebstormProjects/kakao-theme-generator/plugins/kakao-theme-harness/skills/harness-engineering/SKILL.md)
Sprint 4: Settings 페이지와 electron-store 기반 설정 저장 기능을 구현해줘.

Goal:
- Gemini API Key, Markdown prompt, output path를 `electron-store`에 저장하고 불러온다.
- renderer가 직접 `electron-store`나 파일 시스템에 접근하지 않도록 IPC 경계를 유지한다.
- API Key는 UI와 로그/에러에서 원문이 노출되지 않게 처리한다.

Context:
- `SPEC.md`의 Settings Page, App Shell, Local Persistence
- `SPRINT_PLAN.md`의 Sprint 4
- Sprint 1-3 결과
- 관련 subagents: `electron-pro`, `frontend-developer`, `test-automator`, `code-reviewer`

Constraints:
- MVP에서는 Keychain을 구현하지 않는다.
- 설정 저장은 `electron-store only`로 고정한다.
- 글 저장은 `manual save only`이며, Settings 저장과 article 저장을 혼동하지 않는다.
- output path 선택은 main process dialog/IPC를 통해 처리한다.
- API Key 원문은 toast, console, error message, renderer state debug output에 남기지 않는다.

Done when:
- Settings page에서 API Key, Markdown prompt, output path를 저장/로드할 수 있다.
- 앱 재시작 후 설정이 유지된다.
- API Key는 masked UI로만 표시된다.
- API Key masking 및 로그 비노출 테스트가 있다.
- manual save 전에는 article bundle이 생성되지 않는다는 테스트가 있다.
- renderer가 직접 파일 시스템이나 `electron-store`에 접근하지 않는다는 IPC boundary 테스트가 있다.
```

## Sprint 5 - Gemini 생성 파이프라인

```text
[$harness-engineering](/Users/pdg/WebstormProjects/kakao-theme-generator/plugins/kakao-theme-harness/skills/harness-engineering/SKILL.md)
Sprint 5: Gemini API + Grounding 기반 글 생성 파이프라인을 구현해줘.

Goal:
- Blog Generator 입력값을 기반으로 `gemini-2.5-flash` non-streaming 요청을 보낸다.
- 단일 이미지와 Markdown prompt를 포함한 Gemini request payload를 구성한다.
- Grounding metadata를 저장하고 본문과 분리된 출처 팝업/패널에 표시할 데이터 모델을 만든다.

Context:
- `SPEC.md`의 Gemini Generation, Generated Article Area, Local Persistence
- `SPRINT_PLAN.md`의 Sprint 5
- Sprint 1-4 결과
- 관련 subagents: `ai-engineer`, `electron-pro`, `test-automator`, `code-reviewer`

Constraints:
- Gemini 호출은 main process adapter에서 수행한다.
- SDK는 `@google/genai`를 사용한다.
- MVP에서는 streaming을 구현하지 않는다.
- 업로드 이미지는 1장만 요청에 포함한다.
- Gemini 출력은 Markdown canonical로 받는다.
- Grounding 출처는 본문에 자동 삽입하지 않는다.
- 실제 API가 없어도 mock provider로 UI flow가 검증 가능해야 한다.

Done when:
- Gemini request payload 생성 테스트가 있다.
- `googleSearch` tool 설정 테스트가 있다.
- 단일 이미지 part 변환 및 validation 테스트가 있다.
- non-streaming success/error 응답 처리 테스트가 있다.
- Grounding metadata 저장 테스트가 있다.
- mock provider로 주제 + 이미지 입력 후 Markdown 글 생성 UI flow가 완주한다.
- 실패 상태가 화면에 명확히 표시된다.
```

## Sprint 6 - 블록 에디터와 문서 저장

```text
[$harness-engineering](/Users/pdg/WebstormProjects/kakao-theme-generator/plugins/kakao-theme-harness/skills/harness-engineering/SKILL.md)
Sprint 6: BlockNote 기반 블록 에디터와 manual article 저장 기능을 구현해줘.

Goal:
- Gemini Markdown 결과를 BlockNote editor document로 표시한다.
- 사용자가 문단/블록을 편집, 위/아래 이동, 선택, 삭제할 수 있게 한다.
- 저장 버튼을 눌렀을 때만 로컬 article bundle을 생성한다.

Context:
- `SPEC.md`의 Block Editing Requirements, Article Document Model, Local Persistence
- `SPRINT_PLAN.md`의 Sprint 6
- Sprint 1-5 결과
- 관련 subagents: `react-specialist`, `frontend-developer`, `test-automator`, `code-reviewer`

Constraints:
- 에디터는 BlockNote로 고정한다.
- Markdown canonical import/export가 안정적인 block type만 MVP에서 지원한다.
- 지원 block type은 heading, paragraph, list, quote, code, image reference다.
- auto-save와 debounce save는 구현하지 않는다.
- 저장 구조는 `article.json`, `article.md`, `naver.html`, `metadata.json`, `input-image.<ext>`를 기준으로 한다.

Done when:
- Markdown → ArticleDocument 변환 테스트가 있다.
- ArticleDocument → editor blocks 변환 테스트가 있다.
- BlockNote block → Markdown export 테스트가 있다.
- block move up/down 테스트가 있다.
- selected blocks copy target 생성 테스트가 있다.
- 사용자가 저장 버튼을 누르면 지정 경로에 article bundle이 생성된다.
- 저장 전에는 article bundle이 생성되지 않는다.
```

## Sprint 7 - 네이버 블로그 복사

```text
[$harness-engineering](/Users/pdg/WebstormProjects/kakao-theme-generator/plugins/kakao-theme-harness/skills/harness-engineering/SKILL.md)
Sprint 7: 전체 글과 선택 문단의 네이버 블로그용 HTML 클립보드 복사를 구현해줘.

Goal:
- ArticleDocument 또는 선택된 blocks를 Markdown으로 export한다.
- `@jjlabsio/md-to-naver-blog`로 Markdown을 Naver HTML로 변환한다.
- Electron clipboard에 `text/html`과 `text/plain`을 함께 기록한다.

Context:
- `SPEC.md`의 Naver Blog Copy Requirements, Clipboard, Article Document Model
- `SPRINT_PLAN.md`의 Sprint 7
- Sprint 1-6 결과
- 관련 subagents: `electron-pro`, `frontend-developer`, `test-automator`, `ai-engineer`, `code-reviewer`

Constraints:
- MVP copy 범위는 전체 글 Naver HTML 복사, 선택 문단 Naver HTML 복사, 일반 Markdown 복사다.
- 제목/본문/태그 분리 복사는 구현하지 않는다.
- renderer는 clipboard에 직접 접근하지 않고 IPC를 사용한다.
- 변환 실패 시 사용자가 복구 가능한 메시지를 본다.
- 지원하지 않는 block type은 plain HTML/Markdown fallback으로 처리한다.

Done when:
- ArticleDocument → Markdown export 테스트가 있다.
- Markdown → Naver HTML 변환 wrapper 테스트가 있다.
- 선택 문단 → Markdown → Naver HTML 변환 테스트가 있다.
- HTML/plain text clipboard payload 생성 테스트가 있다.
- 전체 글 복사 버튼과 선택 문단 복사 버튼이 동작한다.
- 실제 네이버 블로그 붙여넣기 manual test checklist가 작성되어 있다.
```

## Sprint 8 - macOS 빌드와 마감 검증

```text
[$harness-engineering](/Users/pdg/WebstormProjects/kakao-theme-generator/plugins/kakao-theme-harness/skills/harness-engineering/SKILL.md)
Sprint 8: macOS 빌드 산출물과 MVP 전체 흐름을 검증해줘.

Goal:
- `electron-builder` 기반 macOS dmg/zip 산출물을 생성한다.
- Sprint 1-7에서 구현한 MVP 핵심 흐름을 packaged app 기준으로 검증한다.
- README에 실제 개발/빌드/테스트 명령을 정리한다.

Context:
- `SPEC.md`의 macOS Build, Validation Plan, Non-Goals
- `SPRINT_PLAN.md`의 Sprint 8
- Sprint 1-7 결과
- 관련 subagents: `build-engineer`, `electron-pro`, `test-automator`, `code-reviewer`, `ui-designer`

Constraints:
- MVP는 로컬 개인 사용만 대상으로 한다.
- notarization은 구현하지 않는다.
- Windows/Linux build는 범위 밖이다.
- 자동 발행/브라우저 자동화는 범위 밖이다.
- 실제 repo에서 동작하는 명령만 README에 기록한다.

Done when:
- `npm run dist:mac`으로 macOS 산출물이 생성된다.
- packaged app을 실행할 수 있다.
- 핵심 user flow checklist가 통과한다: 앱 실행, 설정 저장, 주제/이미지 입력, 글 생성, 문단 편집/이동, 전체 글/선택 문단 네이버 복사, 수동 저장 파일 확인.
- production build smoke test 또는 equivalent 검증이 완료된다.
- README에 개발, 테스트, 빌드 명령과 MVP 제한 사항이 정리되어 있다.
```
