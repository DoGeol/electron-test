# Blog Writing Assistant

Mac 로컬에서 사용하는 Electron 기반 블로그 글 작성 보조 앱입니다. 사용자는 주제와 참고 이미지를 입력하고, Gemini API의 Google Search Grounding을 통해 블로그 글 초안을 생성한 뒤, 문단 단위로 편집하고 네이버 블로그에 서식이 유지되도록 복사할 수 있습니다.

## 개요

이 프로젝트는 네이버 블로그 글 작성 흐름을 로컬 데스크톱 앱 안에서 보조하는 것을 목표로 합니다. 서버 배포나 SaaS 운영 없이 개인 Mac에서 실행하며, API Key와 프롬프트, 생성 글 저장 경로를 로컬 설정으로 관리합니다.

## 핵심 기능

- 주제 입력, 참고 이미지 업로드, 글 생성 버튼으로 구성된 간단한 생성 플로우
- Gemini API `gemini-2.5-flash` 모델과 Google Search Grounding 기반 글 생성
- Notion처럼 문단/블록 단위로 작성 글 이동, 편집, 선택, 복사
- 문단 hover 시 플로팅바를 통해 블록 액션 제공
- 네이버 블로그에 붙여넣었을 때 형식을 유지하기 위한 HTML 클립보드 복사
- 설정 화면에서 Gemini API Key, 생성 프롬프트, 저장 경로 관리
- 생성 글과 메타데이터를 사용자가 지정한 로컬 경로에 저장

## 기술 스택

- React
- Electron
- TypeScript
- shadcn/ui
- Tailwind CSS v4
- Gemini API (`gemini-2.5-flash`)
- `@jjlabsio/md-to-naver-blog` 기반 네이버 블로그용 HTML 변환

## 화면 구조

앱은 좌우 2단 레이아웃을 사용합니다.

- 왼쪽: 사이드 메뉴
  - 블로그 글 생성
  - 설정
- 오른쪽: 선택된 페이지의 콘텐츠
  - 블로그 글 생성 페이지: 주제 입력, 이미지 업로드, 생성 결과 에디터
  - 설정 페이지: API Key, 프롬프트, 저장 경로 설정

## 디자인 방향

디자인은 프로젝트 루트의 [AGENTS.md](./AGENTS.md)와 [docs/DESIGN.md](./docs/DESIGN.md)를 기준으로 합니다.

- dark mode first
- Octo Code 디자인 가이드 기반 색상, 타이포그래피, spacing 사용
- 정보 밀도 높은 개발자 도구 스타일
- 카드 남용을 피하고 패널/섹션 중심의 레이아웃 구성

## 현재 구현 상태 (Sprint 1-8 완료)

MVP 기준의 핵심 흐름이 구현되어 있습니다.

- 설정 저장: API Key / 프롬프트 / 저장 경로(`electron-store`)
- 글 생성: `gemini-2.5-flash` + Google Search Grounding(Non-streaming, 이미지 1장)
- 편집: BlockNote 기반 문단 편집
- 복사: 전체 글/선택 문단 네이버 HTML 복사 + Markdown 복사
- 저장: 수동 저장 버튼 기반 article bundle 생성

## 개발 환경

- macOS (Apple Silicon 기준 빌드 확인)
- Node.js + npm

## 실행 방법

```bash
npm install
npm run dev
```

## 품질 검증 명령

```bash
npm test
npm run typecheck
npm run build
```

## macOS 패키징

```bash
npm run dist:mac
```

산출물은 `release/` 경로에 생성됩니다.

- `Blog Writing Assistant-0.1.0-arm64.dmg`
- `Blog Writing Assistant-0.1.0-arm64-mac.zip`
- `release/mac-arm64/Blog Writing Assistant.app`

## 로컬 저장 구조

글 저장 시(수동 저장 버튼 클릭) 지정한 output path 하위에 번들이 생성됩니다.

- `article.json`
- `article.md`
- `naver.html`
- `metadata.json`
- `input-image.<ext>` (입력 이미지가 있을 때만)

## MVP 제한 사항

- 로컬 개인 사용 전용(배포/서버 운영 미지원)
- API Key는 MVP에서 `electron-store`에 저장(키체인 미적용)
- Gemini streaming 미지원
- 이미지 입력 1장만 지원
- macOS notarization 미적용

## 참고 문서

- [SPEC.md](./SPEC.md): 제품 및 기술 스펙
- [AGENTS.md](./AGENTS.md): Codex 작업 지침
- [docs/DESIGN.md](./docs/DESIGN.md): Octo Code 디자인 가이드
- [SPRINT_PLAN.md](./SPRINT_PLAN.md): 스프린트 실행 계획
- [docs/exec-plans/active/blog-writing-assistant-mvp](./docs/exec-plans/active/blog-writing-assistant-mvp): 스프린트 실행/평가/인수인계 문서
- [Gemini API Grounding with Google Search](https://ai.google.dev/gemini-api/docs/google-search)
- [md-to-naver-blog](https://github.com/jjlabsio/md-to-naver-blog)
