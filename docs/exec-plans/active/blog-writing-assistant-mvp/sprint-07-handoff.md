# Sprint 07 Handoff

## Completed in This Pass

- main process에 clipboard service를 추가해 네이버 HTML/Markdown 복사를 처리했다.
- `article` IPC 핸들러에 clipboard 채널 3개를 연결했다.
- 생성 페이지의 복사 액션 버튼(전체/선택/Markdown)에 실제 동작을 연결했다.
- 선택 문단이 없는 경우 사용자 가드 메시지를 추가했다.
- 변환 실패 시 `<pre>` fallback HTML로 복사를 유지하도록 구현했다.
- Sprint 7 테스트와 네이버 수동 검증 checklist 문서를 추가했다.

## Changed Files

- Main
  - `src/main/article/clipboard-service.ts`
  - `src/main/article/clipboard-service.test.ts`
  - `src/main/article/ipc.ts`
  - `src/main/article/ipc.test.ts`
  - `src/main/index.ts`
- Renderer
  - `src/renderer/src/App.tsx`
  - `src/renderer/src/App.clipboard.test.tsx`
- Harness docs
  - `docs/exec-plans/active/blog-writing-assistant-mvp/sprint-07-contract.md`
  - `docs/exec-plans/active/blog-writing-assistant-mvp/sprint-07-evaluation.md`
  - `docs/exec-plans/active/blog-writing-assistant-mvp/sprint-07-handoff.md`
  - `docs/exec-plans/active/blog-writing-assistant-mvp/sprint-07-manual-checklist.md`

## Verification Summary

- `npm test` -> pass (`Test Files 18 passed (18)`, `Tests 61 passed (61)`)
- `npm run typecheck` -> pass
- `npm run build` -> pass
- `npm run dev` 실행 시 renderer dev server URL 확인: `http://localhost:5174/`

## Guardrails Preserved

- renderer는 clipboard에 직접 접근하지 않고 preload IPC만 사용한다.
- manual save only 정책은 유지되며 자동 저장은 추가하지 않았다.
- selection copy는 선택 없음 상태에서 즉시 실패 안내를 제공한다.

## Entry Checklist for Sprint 8

- macOS 빌드(`dist:mac`) 및 실행 검증
- packaged app 기준 end-to-end 수동 점검
- README에 최종 실행/검증 명령과 MVP 제한사항 정리
