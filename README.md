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

## 현재 상태

현재는 1차 제품 스펙 정리 단계입니다. 상세 요구사항, 기술 접근, 저장 구조, 검증 계획은 [SPEC.md](./SPEC.md)에 정리되어 있습니다.

## 참고 문서

- [SPEC.md](./SPEC.md): 제품 및 기술 스펙
- [AGENTS.md](./AGENTS.md): Codex 작업 지침
- [docs/DESIGN.md](./docs/DESIGN.md): Octo Code 디자인 가이드
- [Gemini API Grounding with Google Search](https://ai.google.dev/gemini-api/docs/google-search)
- [md-to-naver-blog](https://github.com/jjlabsio/md-to-naver-blog)
