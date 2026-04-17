# Sprint 07 Contract: 네이버 클립보드 복사

## Scope

- 생성/편집된 Markdown 본문을 네이버 붙여넣기용 HTML로 변환한다.
- 전체 글 복사, 선택 문단 복사, Markdown 복사 액션을 구현한다.
- renderer는 preload IPC를 통해서만 클립보드에 접근한다.
- Electron clipboard payload에 `text/html`과 `text/plain`을 함께 기록한다.
- 변환 실패 시 `<pre>` 기반 fallback HTML로 복사를 유지한다.

## Done Conditions

1. `clipboard:copyNaver`, `clipboard:copySelectionNaver`, `clipboard:copyMarkdown` IPC 핸들러가 등록된다.
2. main process clipboard service가 Markdown 정규화, Naver HTML 변환, fallback HTML 생성을 처리한다.
3. 전체 글 네이버 복사 버튼이 동작하고 사용자 메시지를 표시한다.
4. 선택 문단 복사 버튼이 동작하고 selection 없음 케이스 메시지를 표시한다.
5. Markdown 복사 버튼이 동작한다.
6. 클립보드 변환/IPC/renderer 액션 테스트가 추가된다.
7. `npm test`, `npm run typecheck`, `npm run build`가 모두 통과한다.
8. 네이버 붙여넣기 수동 검증 checklist가 문서화된다.

## Verification Methods

1. clipboard service unit test를 먼저 작성한다.
2. article IPC clipboard 채널 test를 작성한다.
3. renderer 복사 버튼 integration test를 작성한다.
4. 구현 후 `test/typecheck/build`를 실행한다.

## Technical Notes

- 변환기는 `@jjlabsio/md-to-naver-blog`를 사용한다.
- 변환 예외 발생 시 HTML escape한 `<pre>` fallback을 사용한다.
- 선택 문단 복사는 BlockNote selection snapshot(`getSelection`, `getSelectionCutBlocks`) 기반으로 Markdown을 생성한다.

## Risks / Open Questions

- BlockNote selection이 비어 있는 경우 UX 안내 메시지 품질이 실제 사용성에 영향을 줄 수 있다.
- 특정 블록 타입의 네이버 변환 결과 품질은 수동 검증이 필요하다.
