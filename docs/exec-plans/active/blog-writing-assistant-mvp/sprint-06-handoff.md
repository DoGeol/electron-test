# Sprint 06 Handoff

## Completed in This Pass

- 생성 페이지 본문 영역을 BlockNote 기반 편집기로 전환했다.
- 생성된 Markdown 결과를 BlockNote 문서에 주입하고 편집 시 Markdown 상태를 갱신하도록 연결했다.
- 수동 저장 버튼을 연결하고 `article:save` IPC 경로를 구현했다.
- main process에 article save service를 추가해 bundle 파일 생성을 구현했다.
- 저장 시 `article.json`, `article.md`, `naver.html`, `metadata.json`을 생성하고 이미지 입력 시 `input-image.<ext>`를 복사한다.
- Sprint 6 테스트(저장 서비스, IPC, BlockNote 브리지, renderer save integration)를 추가했다.

## Changed Files

- Main / Save
  - `src/main/article/save-service.ts`
  - `src/main/article/save-service.test.ts`
  - `src/main/article/ipc.ts`
  - `src/main/article/ipc.test.ts`
  - `src/main/index.ts`
- Shared / Preload
  - `src/shared/ipc.ts`
  - `src/shared/domain/article.ts`
  - `src/shared/domain/blocknote.ts`
  - `src/shared/domain/blocknote.test.ts`
  - `src/preload/bridge.ts`
- Renderer
  - `src/renderer/src/App.tsx`
  - `src/renderer/src/App.generator.test.tsx`
  - `src/renderer/src/App.save.test.tsx`
- Harness docs
  - `docs/exec-plans/active/blog-writing-assistant-mvp/sprint-06-contract.md`
  - `docs/exec-plans/active/blog-writing-assistant-mvp/sprint-06-evaluation.md`
  - `docs/exec-plans/active/blog-writing-assistant-mvp/sprint-06-handoff.md`

## Verification Summary

- `npm test` -> pass (`Test Files 16 passed (16)`, `Tests 53 passed (53)`)
- `npm run typecheck` -> pass
- `npm run build` -> pass

## Guardrails Preserved

- 저장은 manual save only로 유지했다.
- renderer는 파일 시스템에 직접 접근하지 않고 IPC 경계를 유지한다.
- Sprint 6에서 clipboard copy 구현은 추가하지 않았다.

## Entry Checklist for Sprint 7

- 현재 save bundle 구조가 안정화되어 clipboard 변환 입력으로 사용 가능하다.
- 다음 단계는 전체 글/선택 문단 네이버 HTML 변환 + clipboard write(`html` + `text`) 구현이다.
