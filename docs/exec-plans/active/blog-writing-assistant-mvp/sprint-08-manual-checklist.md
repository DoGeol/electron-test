# Sprint 08 Manual Checklist: Packaged App 최종 점검

## 1) 설치/실행

- [ ] `release/Blog Writing Assistant-0.1.0-arm64.dmg` 마운트
- [ ] `.app`을 Applications로 복사
- [ ] 앱 실행 후 초기 화면(좌측 메뉴/우측 콘텐츠) 정상 표시

## 2) 설정 플로우

- [ ] 설정 페이지에서 API Key 입력/저장
- [ ] 프롬프트 Markdown 수정/저장
- [ ] 저장 경로 선택/저장
- [ ] 앱 재시작 후 설정 유지 확인

## 3) 글 생성/편집 플로우

- [ ] 주제 입력 + 이미지 1장 업로드
- [ ] AI 글 생성 성공 메시지 확인
- [ ] BlockNote에서 문단 편집/선택 동작 확인

## 4) 복사/저장 플로우

- [ ] 전체 글 네이버 복사 후 붙여넣기 서식 확인
- [ ] 선택 문단 복사 후 붙여넣기 확인
- [ ] Markdown 복사 동작 확인
- [ ] 수동 저장 버튼으로 bundle 파일 생성 확인
  - `article.json`
  - `article.md`
  - `naver.html`
  - `metadata.json`
  - `input-image.<ext>`(입력 이미지가 있을 때)

## 5) 비기능

- [ ] 앱 종료/재실행 시 치명 오류 없음
- [ ] `Gemini` 오류 발생 시 사용자 메시지 확인 가능
- [ ] 저장 경로 미설정/선택 문단 없음 등 가드 메시지 노출
