# Sprint 06 Contract: BlockNote 에디터 + Manual Save 번들

## Scope

- 생성 본문 영역에 BlockNote 에디터를 도입하고 Markdown 본문과 동기화한다.
- 사용자 편집 결과를 기준으로 `manual save only` 저장 파이프라인을 구현한다.
- 저장 실행 시 main process에서 article bundle을 생성한다.
- 저장 bundle 구조를 `article.json`, `article.md`, `naver.html`, `metadata.json`, `input-image.<ext>`로 맞춘다.
- renderer는 저장 시 preload IPC(`article:save`)만 사용하고 파일 시스템에 직접 접근하지 않는다.

## Done Conditions

1. BlockNote 편집기(`@blocknote/react`)가 생성 페이지 본문 영역에 렌더된다.
2. 생성된 Markdown이 BlockNote 문서로 로드되고, 편집 시 Markdown 상태가 갱신된다.
3. 저장 버튼 클릭 시 `article:save` IPC가 호출된다.
4. main process save service가 설정된 output path 아래 article bundle 디렉터리를 생성한다.
5. 저장 시 `article.json`, `article.md`, `naver.html`, `metadata.json` 파일이 생성된다.
6. 입력 이미지 경로가 제공되면 `input-image.<ext>`가 번들에 복사된다.
7. output path 미설정/본문 비어있음 등 실패 케이스에서 사용자 에러 메시지가 표시된다.
8. Sprint 6 관련 테스트가 추가되고 전체 `test/typecheck/build`가 green이다.

## Verification Methods

1. `save-service` 및 `article IPC` 테스트를 먼저 작성한다.
2. BlockNote 변환 브리지 테스트(`ArticleDocument -> BlockNote blocks`, `BlockNote blocks -> Markdown`)를 작성한다.
3. renderer save integration 테스트를 작성한다.
4. 구현 후 `npm test`, `npm run typecheck`, `npm run build`를 실행한다.

## Technical Notes

- BlockNote 렌더는 `BlockNoteViewRaw` + `useCreateBlockNote` 조합으로 구성한다.
- Markdown ↔ BlockNote 변환은 BlockNote editor API(`tryParseMarkdownToBlocks`, `blocksToMarkdownLossy`)를 사용한다.
- 저장 경로는 settings service의 persisted `outputPath`를 사용한다.
- `naver.html`은 `@jjlabsio/md-to-naver-blog` 변환 결과를 저장한다.

## Risks / Open Questions

- BlockNote 번들 크기가 증가하여 renderer chunk가 커질 수 있다(현 시점 허용).
- 현재 저장 대상의 slug 규칙은 단순화되어 있으며 충돌/중복 정책이 필요할 수 있다.
- 본문 내 블록 선택 기반 복사 UX는 Sprint 7 범위에서 확장한다.
