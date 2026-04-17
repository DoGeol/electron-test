# Sprint 06 Evaluation

## Overall Verdict

- Status: `completed`
- Action: `pass`
- Mode: `runnable`

## Tested Items

### BlockNote editor integration

- Verdict: `PASS`
- Expected: 생성 페이지 본문 영역에 BlockNote를 배치하고 생성 Markdown을 편집 가능한 문서로 로드해야 한다.
- Actual: `App.tsx`에서 `BlockNoteViewRaw` + `useCreateBlockNote`를 연결했고, 생성 결과 Markdown을 editor로 동기화했다.
- Evidence:
  - `src/renderer/src/App.tsx`
  - `src/renderer/src/App.generator.test.tsx`

### Markdown / editor bridge

- Verdict: `PASS`
- Expected: ArticleDocument를 BlockNote blocks로 변환하고, BlockNote blocks를 Markdown으로 export하는 테스트가 있어야 한다.
- Actual: BlockNote bridge 유틸을 추가하고 양방향 변환 테스트를 작성했다.
- Evidence:
  - `src/shared/domain/blocknote.ts`
  - `src/shared/domain/blocknote.test.ts`

### Manual save pipeline in main process

- Verdict: `PASS`
- Expected: 저장 버튼 트리거 시 main process에서 bundle 파일을 생성해야 한다.
- Actual: article save service/ipc를 구현하고 settings output path를 주입해 bundle 생성 경로를 고정했다.
- Evidence:
  - `src/main/article/save-service.ts`
  - `src/main/article/ipc.ts`
  - `src/main/index.ts`
  - `src/main/article/save-service.test.ts`
  - `src/main/article/ipc.test.ts`

### Bundle structure and image copy

- Verdict: `PASS`
- Expected: `article.json`, `article.md`, `naver.html`, `metadata.json` 생성 및 입력 이미지 복사 지원.
- Actual: save service가 위 파일을 생성하고 image path가 있으면 `input-image.<ext>`를 복사한다.
- Evidence:
  - `src/main/article/save-service.ts`
  - `src/main/article/save-service.test.ts`

### Renderer save interaction

- Verdict: `PASS`
- Expected: 저장 버튼 클릭 시 `article:save` IPC를 호출하고 성공/실패 메시지를 표시해야 한다.
- Actual: save 버튼 핸들러와 상태 메시지를 추가했고 integration test로 검증했다.
- Evidence:
  - `src/renderer/src/App.tsx`
  - `src/renderer/src/App.save.test.tsx`

## Command Evidence

- `npm test` -> pass (`Test Files 16 passed (16)`, `Tests 53 passed (53)`)
- `npm run typecheck` -> pass
- `npm run build` -> pass

## Scope Guardrail Check

- Sprint 6 포함:
  - BlockNote editor integration
  - manual article save bundle pipeline
  - save IPC wiring
- Sprint 6 제외:
  - clipboard 실제 복사 구현(Sprint 7)
  - 네이버 복사 버튼 동작 구현(Sprint 7)
  - macOS dist 검증(Sprint 8)
