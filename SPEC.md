# Blog Writing Assistant Spec

## 1. Summary

Mac 로컬에서 사용하는 Electron 기반 블로그 글 작성 보조 앱을 만든다. 사용자는 주제와 참고 이미지를 입력하고, Gemini API의 Grounding with Google Search를 사용해 블로그 글 초안을 생성한다. 생성된 글은 Notion처럼 문단 단위로 이동, 편집, 선택할 수 있고, 네이버 블로그에 붙여넣었을 때 서식이 유지되도록 HTML 클립보드 복사를 지원한다.

이 문서는 1차 구현을 시작하기 위한 구조화 스펙이다. 세부 UX, 저장 포맷, 에디터 라이브러리 선택은 구현 전 짧은 검증을 거쳐 확정한다.

## 2. Goals

- React + shadcn/ui + Tailwind CSS v4 + Electron 조합으로 macOS 데스크톱 앱을 만든다.
- Electron 앱은 macOS에서 로컬 실행과 빌드가 가능해야 한다.
- Gemini API `gemini-2.5-flash` 모델과 Google Search Grounding을 사용해 블로그 글을 생성한다.
- API Key, 프롬프트, 글 저장 경로를 설정 화면에서 관리한다.
- 생성된 글은 문단/블록 단위로 편집, 이동, 선택, 복사할 수 있어야 한다.
- 네이버 블로그 에디터에 붙여넣을 때 주요 서식이 유지되는 복사 기능을 제공한다.
- 앱 디자인은 `AGENTS.md`에 명시된 `docs/DESIGN.md`의 Octo Code 디자인 가이드를 따른다.

## 3. Non-Goals

- 웹 배포, 서버 배포, SaaS 운영은 하지 않는다.
- Windows/Linux 빌드는 1차 범위에 포함하지 않는다.
- 네이버 블로그 자동 로그인, 자동 발행, 브라우저 자동화 발행은 1차 범위에 포함하지 않는다.
- 팀 계정, 동기화, 클라우드 저장소, 사용자 인증은 제공하지 않는다.
- 이미지 생성 기능은 포함하지 않는다. 업로드 이미지는 글 생성의 참고 입력으로 사용한다.

## 4. Target User

- 네이버 블로그 글을 반복적으로 작성하는 개인 사용자.
- 주제와 참고 이미지를 기반으로 빠르게 초안을 만들고, 로컬에서 수정한 뒤 네이버 블로그에 붙여넣고 싶은 사용자.

## 5. Product Assumptions

- 앱은 단일 사용자 로컬 앱이다.
- Gemini API Key는 사용자가 직접 발급해서 입력한다.
- MVP에서는 Gemini API Key, 프롬프트, 저장 경로를 모두 `electron-store`에 저장한다.
- 글 생성 결과는 사용자가 지정한 로컬 폴더에 수동 저장한다.
- 업로드 이미지는 MVP에서 1장만 지원하며 AI 입력 컨텍스트로 사용한다. 네이버 블로그에 이미지를 자동 업로드하지 않는다.
- 생성 결과의 canonical 원본 포맷은 Markdown으로 고정하고, 네이버 복사는 별도 변환 파이프라인으로 처리한다.

## 6. Information Architecture

앱은 좌우 2단 레이아웃을 기본으로 한다.

```text
┌──────────────────────┬──────────────────────────────────────────────┐
│ Sidebar              │ Content                                      │
│                      │                                              │
│ - Blog Generator     │ Blog Generator Page                          │
│ - Settings           │ or                                           │
│                      │ Settings Page                                │
└──────────────────────┴──────────────────────────────────────────────┘
```

### 6.1 Sidebar

- 고정 폭 사이드바.
- 메뉴:
  - 블로그 글 생성
  - 설정
- 현재 선택된 메뉴는 Octo Code 디자인 가이드의 active row 규칙을 따른다.
- 사이드바는 `#0D1117` 또는 `#161B22` 계열 배경과 `#30363D` border를 사용한다.

### 6.2 Content Area

- 선택된 메뉴에 따라 화면을 전환한다.
- 카드 남용을 피하고, 전체 콘텐츠는 정보 밀도 높은 패널/섹션 구조로 배치한다.
- 기본 배경은 dark mode first로 유지한다.

## 7. Page Specs

### 7.1 Blog Generator Page

#### Primary Flow

1. 사용자가 주제를 입력한다.
2. 사용자가 참고 이미지를 업로드한다.
3. 사용자가 글 생성 버튼을 누른다.
4. 앱이 설정된 Gemini API Key와 프롬프트를 사용해 글 생성을 요청한다.
5. 생성 결과를 블록 기반 에디터에 표시한다.
6. 사용자는 문단/블록을 편집, 이동, 선택, 복사한다.
7. 사용자는 네이버 블로그용 서식 복사를 실행한다.
8. 앱은 지정된 저장 경로에 생성 글과 메타데이터를 저장한다.

#### Inputs

- 주제 입력:
  - 단일 라인 input.
  - 필수값.
  - 예: "2026년 봄 제주도 가족여행 코스 추천"
- 이미지 업로드:
  - file upload.
  - 허용 형식: `png`, `jpg`, `jpeg`, `webp`.
  - 1차 범위에서는 단일 이미지 업로드를 기본으로 한다.
  - 업로드 후 썸네일, 파일명, 용량을 표시한다.
- 글 생성 버튼:
  - API Key와 주제가 없으면 disabled.
  - 생성 중에는 loading 상태를 표시하고 중복 요청을 막는다.

#### Generated Article Area

- 생성 전:
  - 입력 폼과 빈 상태를 표시한다.
- 생성 중:
  - 진행 상태와 현재 작업 상태를 표시한다.
  - MVP에서는 Gemini non-streaming 응답만 사용한다.
- 생성 후:
  - 블록 기반 에디터에 글을 표시한다.
  - 제목, 본문, 태그, 참고 출처 영역을 구분한다.

#### Block Editing Requirements

- 글은 문단/헤딩/리스트/인용/코드/이미지 참조 등 블록 단위로 관리한다.
- 사용자는 각 문단을 직접 편집할 수 있어야 한다.
- 사용자는 문단을 위/아래로 이동할 수 있어야 한다.
- 사용자가 문단에 hover하면 플로팅바가 나타난다.
- 플로팅바 액션:
  - 블록 선택
  - 위로 이동
  - 아래로 이동
  - 복사
  - 삭제
- 여러 문단 선택 후 복사할 수 있어야 한다.
- 선택/hover UI는 본문을 가리지 않도록 왼쪽 gutter 또는 블록 상단에 붙인다.

#### Naver Blog Copy Requirements

- 네이버 블로그에 붙여넣었을 때 heading, paragraph, list, bold, italic, code block, quote, link, image reference, tags 등의 서식을 최대한 유지한다.
- 변환 파이프라인은 `@jjlabsio/md-to-naver-blog`를 사용한다.
- 기본 흐름:
  1. 에디터 블록 상태를 Markdown으로 변환한다.
  2. Markdown을 `@jjlabsio/md-to-naver-blog`의 `convert(markdown)`로 네이버 호환 HTML로 변환한다.
  3. Electron main process에서 `clipboard.write({ html, text })`로 `text/html`과 `text/plain`을 동시에 기록한다.
- 사용자 액션:
  - 전체 글 네이버 형식 복사.
  - 선택한 문단만 네이버 형식 복사.
  - 일반 Markdown 복사. 이 액션은 fallback/debug 성격의 보조 기능이다.
- 제목/본문/태그 분리 복사는 MVP 이후 개선 항목으로 둔다.
- 변환 결과는 복사 전에 preview 또는 toast로 성공/실패를 알려준다.

### 7.2 Settings Page

#### API Key Settings

- Gemini API Key 입력 필드.
- 저장 버튼.
- 저장 상태 표시.
- API Key는 화면에 기본적으로 masked 처리한다.
- "연결 테스트" 버튼을 제공한다.
- MVP에서는 API Key를 `electron-store`에 저장한다.
- API Key 원문은 UI, 로그, 에러 메시지에 노출하지 않는다.
- macOS Keychain 저장은 MVP 이후 보안 개선 항목으로 둔다.

#### Prompt Settings

- 기본 글 생성 프롬프트를 수정할 수 있는 textarea/editor.
- 프롬프트는 Markdown 형식으로 입력하고 관리한다.
- Gemini 응답도 Markdown 형식으로 받도록 프롬프트에 출력 형식을 명시한다.
- 변수 지원:
  - `{{topic}}`
  - `{{image_context}}`
  - `{{style}}`
  - `{{format_rules}}`
- 기본값 복원 버튼.
- 저장 버튼.

#### Output Path Settings

- 생성 글 저장 경로 선택 버튼.
- 현재 선택된 경로 표시.
- 경로가 없거나 접근 불가하면 글 생성 전 오류를 표시한다.
- 저장 파일 형식은 `json`, `md`, `html`을 기본 후보로 한다.

## 8. Functional Requirements

### 8.1 App Shell

- Electron main process, preload, renderer를 분리한다.
- renderer는 Node API에 직접 접근하지 않는다.
- 파일 시스템, clipboard, dialog, `electron-store`, Gemini 호출은 preload IPC를 통해 main process에 위임한다.
- 기본 라우팅은 client-side state 기반으로 충분하다. 복잡한 URL 라우팅은 1차 범위에서 필요하지 않다.

### 8.2 Gemini Generation

- Gemini API 호출은 main process에서 수행한다.
- SDK는 `@google/genai`를 사용한다.
- 모델은 `gemini-2.5-flash`로 고정한다.
- Grounding with Google Search는 `googleSearch` tool을 사용한다.
- MVP에서는 non-streaming 호출만 지원한다.
- 업로드 이미지는 1장만 요청에 포함한다.
- Gemini 출력은 Markdown을 canonical 형식으로 받는다.
- 요청에는 다음 정보를 포함한다:
  - 사용자 주제
  - 설정된 Markdown 프롬프트
  - 업로드 이미지 1장
  - 출력 형식 지시: Markdown
- 응답에서 가능한 경우 `groundingMetadata`를 저장한다.
- Grounding 출처는 본문에 자동 삽입하지 않고 `groundingMetadata`에 저장한다.
- UI에는 참고 출처 또는 citation 정보를 본문과 분리된 팝업/패널로 보여준다.
- 실패 케이스:
  - API Key 없음
  - API Key invalid
  - rate limit
  - 네트워크 오류
  - 이미지 크기/형식 오류
  - 안전성 필터 또는 빈 응답

### 8.3 Local Persistence

- 설정 저장:
  - API Key, prompt, output path, UI 설정: `electron-store`.
  - API Key는 masked UI로만 표시하고 로그/에러에는 원문을 남기지 않는다.
  - macOS Keychain은 MVP 이후 보안 개선 항목이다.
- 글 저장:
  - MVP는 manual save only로 고정한다.
  - 생성 직후나 편집 중 debounce auto-save는 제공하지 않는다.
  - 사용자가 저장 버튼을 눌렀을 때만 지정 경로에 글 bundle을 생성한다.
- 권장 저장 구조:

```text
<output-path>/
  2026-04-17-topic-slug/
    article.json
    article.md
    naver.html
    metadata.json
    input-image.<ext>
```

### 8.4 Article Document Model

권장 canonical model:

```ts
type ArticleDocument = {
  id: string;
  title: string;
  topic: string;
  createdAt: string;
  updatedAt: string;
  model: "gemini-2.5-flash";
  promptVersion: string;
  blocks: ArticleBlock[];
  tags: string[];
  grounding?: GroundingMetadata;
  sourceImage?: {
    fileName: string;
    localPath: string;
    mimeType: string;
  };
};
```

```ts
type ArticleBlock = {
  id: string;
  type: "heading" | "paragraph" | "list" | "quote" | "code" | "image";
  content: unknown;
  order: number;
};
```

### 8.5 Clipboard

- Electron clipboard API를 사용해 HTML과 plain text를 동시에 복사한다.
- 네이버 블로그용 복사는 `@jjlabsio/md-to-naver-blog` 변환 결과를 사용한다.
- 일반 복사는 Markdown 또는 plain text를 제공한다.
- 복사 실패 시 사용자에게 원인을 표시한다.

## 9. Technical Approach

### 9.1 Stack

- Runtime/App:
  - Electron
  - React
  - TypeScript
  - `electron-vite`
  - npm
- UI:
  - shadcn/ui
  - Tailwind CSS v4
  - Radix UI primitives
  - lucide-react icons
- Editor:
  - BlockNote
  - Markdown import/export가 안정적인 block type 위주로 MVP 기능을 제한
- AI:
  - `@google/genai`
  - `gemini-2.5-flash`
  - Grounding with Google Search
- Clipboard conversion:
  - `@jjlabsio/md-to-naver-blog`
- Local storage:
  - `electron-store`
  - macOS Keychain 또는 `keytar` 연동은 MVP 이후 개선 항목
- Build:
  - `electron-builder`
  - app name: `Blog Writing Assistant`
  - bundle identifier: `com.local.blog-writing-assistant`
  - macOS `dmg`, `zip` target
  - `arm64`, `x64`, 필요 시 universal build 검토

### 9.2 Suggested Project Structure

```text
src/
  main/
    index.ts
    gemini/
      client.ts
      prompts.ts
    storage/
      settings.ts
      articles.ts
    clipboard/
      naver.ts
  preload/
    index.ts
  renderer/
    App.tsx
    routes/
      BlogGeneratorPage.tsx
      SettingsPage.tsx
    components/
      layout/
      editor/
      settings/
      ui/
    lib/
      article-format.ts
      validations.ts
```

### 9.3 Electron Security

- `contextIsolation: true`.
- `nodeIntegration: false`.
- preload에서 필요한 IPC API만 expose한다.
- API Key와 파일 경로는 renderer 로그에 남기지 않는다.
- Gemini 요청/응답 로그에는 민감정보를 마스킹한다.

### 9.4 macOS Build

- `npm run dev`: Electron + Vite 개발 서버 실행.
- `npm run build`: renderer/main/preload build.
- `npm run dist:mac`: macOS 앱 패키징.
- 1차 범위에서는 로컬 사용 목적이므로 notarization은 필수 범위가 아니다.
- 외부 공유가 필요해지면 Apple Developer ID signing과 notarization을 별도 작업으로 추가한다.

## 10. UI Design Direction

`AGENTS.md`와 `docs/DESIGN.md`를 따른다.

- Dark mode first.
- 배경: `#0D1117`.
- surface: `#161B22`.
- border: `#30363D`.
- primary interactive: `#2F81F7`.
- success/generate action: `#238636`.
- error: `#F85149`.
- 기본 글꼴: Inter.
- 코드/원문/Markdown preview: JetBrains Mono.
- 기능 UI radius는 대부분 6px 이하.
- shadow보다 색상 레이어링으로 위계를 만든다.
- 정보 밀도를 높이고 불필요한 marketing/landing 화면은 만들지 않는다.

## 11. Validation Plan

- Unit:
  - Markdown 변환 함수.
  - Naver HTML 변환 wrapper.
  - ArticleDocument serialization/deserialization.
  - prompt variable interpolation.
  - 선택 문단 추출 및 Markdown export.
- Integration:
  - Settings 저장/로드.
  - Gemini API 호출 mock.
  - 단일 이미지 업로드 후 request payload 생성.
  - Grounding metadata 저장.
  - clipboard HTML/plain text 복사.
- E2E/manual:
  - API Key 저장 후 앱 재시작.
  - 주제 + 이미지로 글 생성.
  - 문단 이동/편집/선택 복사.
  - 네이버 블로그 에디터에 붙여넣기 서식 확인.
  - macOS build artifact 실행.

## 12. Risks and Tradeoffs

- 네이버 블로그 에디터의 붙여넣기 동작은 서비스 변경에 영향을 받을 수 있다.
- `@jjlabsio/md-to-naver-blog`가 모든 에디터 블록 형식을 완벽히 지원하지 않을 수 있으므로, canonical Markdown 변환 규칙을 제한해야 할 수 있다.
- Gemini Grounding 결과는 응답마다 검색 쿼리와 출처가 달라질 수 있다.
- MVP에서 API Key를 `electron-store`에 저장하는 것은 보안상 최선은 아니며, 이후 Keychain 전환이 필요하다.
- Electron macOS build에서 signing/notarization 여부에 따라 다른 Mac에서 실행 경고가 발생할 수 있다.
- BlockNote의 Markdown export 품질에 따라 일부 block type은 MVP에서 제한하거나 fallback 처리해야 할 수 있다.

## 13. Open Questions

- 앱 아이콘 최종 디자인은 별도 작업으로 정한다. MVP에서는 placeholder icon을 허용한다.
- 외부 공유용 macOS 앱이 필요한 경우 signing/notarization 범위를 추가해야 한다.

## 14. Delivery Plan

### Phase 1: Project Foundation

- React + Electron + TypeScript + `electron-vite` + npm 기반 프로젝트 구성.
- Tailwind CSS v4 + shadcn/ui 설정.
- Octo Code 디자인 토큰을 CSS 변수로 정리.
- macOS local build script 구성.

### Phase 2: App Shell and Settings

- 좌우 2단 레이아웃 구현.
- Sidebar navigation 구현.
- Settings page 구현.
- `electron-store` 기반 API Key 저장, Markdown prompt 저장, output path 선택 구현.

### Phase 3: Gemini Generation

- Gemini client 구현.
- Grounding with Google Search 설정.
- 단일 이미지 업로드 입력 처리.
- non-streaming Markdown 글 생성 요청/응답 처리.
- 실패 상태와 loading 상태 구현.

### Phase 4: Editor and Document Persistence

- 블록 기반 에디터 도입.
- BlockNote 도입.
- Markdown 생성 결과를 editor document로 변환.
- 문단 이동, 편집, 선택, 삭제, 복사 구현.
- 수동 로컬 article 저장/로드 구현.

### Phase 5: Naver Clipboard

- Markdown export 구현.
- `@jjlabsio/md-to-naver-blog` 변환 wrapper 구현.
- 전체 글과 선택 문단의 Electron clipboard HTML/plain text 복사 구현.
- 네이버 블로그 붙여넣기 수동 검증.

### Phase 6: Polish and Build Verification

- 디자인 가이드 기준 UI 정리.
- 접근성, 키보드 이동, hover/focus 상태 보완.
- macOS build artifact 생성 및 실행 확인.
- README에 개발/빌드 명령 정리.

## 15. References

- Gemini API Grounding with Google Search: https://ai.google.dev/gemini-api/docs/google-search
- Gemini API model overview: https://ai.google.dev/gemini-api/docs/models
- md-to-naver-blog: https://github.com/jjlabsio/md-to-naver-blog
- Project design guide: `AGENTS.md`, `docs/DESIGN.md`
