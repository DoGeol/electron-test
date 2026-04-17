# Sprint 05 Handoff

## Completed in This Pass

- Gemini 생성 파이프라인을 main process adapter(`@google/genai`)로 구현했다.
- `non-streaming only` 정책을 유지하고 `gemini-2.5-flash` + `googleSearch` request 구성을 적용했다.
- 단일 이미지(옵션) 입력 경로를 추가하고, 허용 확장자 검증 후 `inlineData` 변환을 연결했다.
- Markdown canonical 응답 처리와 빈 응답/SAFETY/provider 오류 사용자 메시지 매핑을 추가했다.
- grounding metadata를 구조화 payload로 추출하고 renderer에서 출처 요약으로 노출했다.
- IPC `generator:generate`를 shared/preload/main에 연결하고 settings service의 API Key/Prompt 주입 경로를 확정했다.
- renderer App의 생성 플로우(topic/image -> generate -> loading/success/error)를 연결했다.
- Sprint 5 테스트를 추가하고 전체 검증(`test/typecheck/build`)을 통과했다.

## Changed Files (Sprint 5 구현 기준)

- Main / Generator
  - `src/main/generator/gemini-client.ts`
  - `src/main/generator/generator-service.ts`
  - `src/main/generator/generator-service.test.ts`
  - `src/main/generator/ipc.ts`
  - `src/main/generator/ipc.test.ts`
  - `src/main/index.ts`
- Shared / Preload
  - `src/shared/ipc.ts`
  - `src/preload/bridge.ts`
- Renderer
  - `src/renderer/src/App.tsx`
  - `src/renderer/src/App.generator.test.tsx`
- Harness docs
  - `docs/exec-plans/active/blog-writing-assistant-mvp/sprint-05-contract.md`
  - `docs/exec-plans/active/blog-writing-assistant-mvp/sprint-05-evaluation.md`
  - `docs/exec-plans/active/blog-writing-assistant-mvp/sprint-05-handoff.md`

## Verification Summary

- `npm test` -> pass (`Test Files 12 passed (12)`, `Tests 43 passed (43)`)
- `npm run typecheck` -> pass
- `npm run build` -> pass
- 핵심 테스트 파일:
  - `src/main/generator/generator-service.test.ts`
  - `src/main/generator/ipc.test.ts`
  - `src/renderer/src/App.generator.test.tsx`

## Guardrails Preserved

- renderer는 Gemini API를 직접 호출하지 않고 IPC를 통해서만 생성 요청을 수행한다.
- 설정값(API Key/Prompt)은 settings service에서 주입하며 renderer payload로 전달하지 않는다.
- streaming 및 다중 이미지는 Sprint 5 범위에서 제외했다.
- grounding 출처는 본문 자동 삽입 없이 별도 구조 데이터/요약 UI로만 노출한다.

## Entry Checklist for Sprint 6

- Sprint 5 회귀 테스트/타입체크/빌드가 green 상태.
- 생성 결과 Markdown을 editor canonical 데이터로 넘길 준비 완료.
- 다음 단계는 BlockNote 편집 기능 + manual save bundle 생성(저장 버튼 트리거) 구현.
