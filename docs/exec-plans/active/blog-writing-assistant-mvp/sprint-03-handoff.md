# Sprint 03 Handoff

## Completed in This Pass

- Sprint 3 domain 테스트를 먼저 작성하고 red 상태를 확인한 뒤 최소 구현으로 green 전환 완료.
- `ArticleDocument`, `ArticleBlock`, `Settings` 도메인 타입 및 순수 함수 추가.
- Markdown canonical 변환/파싱 모듈과 테스트를 Sprint 3 범위 내에서 구현.
- Sprint 3 evaluation 문서를 placeholder에서 실제 결과 기반으로 갱신.

## Changed Files

- Domain tests
  - `src/shared/domain/article.test.ts`
  - `src/shared/domain/prompt.test.ts`
  - `src/shared/domain/validation.test.ts`
  - `src/shared/domain/markdown.test.ts`
- Domain implementation
  - `src/shared/domain/article.ts`
  - `src/shared/domain/prompt.ts`
  - `src/shared/domain/validation.ts`
  - `src/shared/domain/markdown.ts`
  - `src/shared/domain/settings.ts`
- Harness docs
  - `docs/exec-plans/active/blog-writing-assistant-mvp/sprint-03-evaluation.md`
  - `docs/exec-plans/active/blog-writing-assistant-mvp/sprint-03-handoff.md`

## Verification Commands

- `npm run typecheck` → pass
- `npm test` → pass (`Test Files 6 passed (6)`, `Tests 21 passed (21)`)

## Evidence Summary

- Red-first proof:
  - 초기 `npm test`에서 `Cannot find module './article'` 등 4개 모듈 미구현 에러 확인.
- Green proof:
  - 도메인 구현 추가 후 `npm test` 전체 통과.
- Scope guardrail proof:
  - 변경은 `src/shared/domain`과 sprint 문서에 한정, Sprint 4+ 기능 미구현.

## Decisions Captured

- Sprint 3는 pure-domain 우선, UI/IPC/저장/AI 기능 확장 없음.
- Markdown canonical의 MVP block type은 heading/paragraph/list/quote/code/image로 고정.
- 이미지 검증 정책은 extension + MIME + empty file 규칙으로 테스트로 고정.

## Next Sprint Entry (Sprint 4)

- Settings 저장(`electron-store`) 기능으로 진입.
- renderer/main IPC 경계 유지 검증 테스트를 먼저 작성.
- API 키 마스킹/로그 비노출과 manual-save guardrail 테스트를 선행.
