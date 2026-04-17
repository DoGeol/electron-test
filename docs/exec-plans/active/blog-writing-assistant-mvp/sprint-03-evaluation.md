# Sprint 03 Evaluation

## Overall Verdict

- Status: `completed`
- Action: `pass`
- Mode: `runnable` (workspace baseline 유지, Sprint 3는 pure-domain 검증 중심으로 수행)

## Tested Items

### Test-first execution order

- Verdict: `PASS`
- Expected: Sprint 3 범위 테스트를 먼저 작성하고 초기 red 상태를 확인한다.
- Actual: 테스트 파일 4개(`article/prompt/validation/markdown`)를 먼저 추가했고, 초기 `npm test`에서 모듈 미존재 에러로 red 확인 후 구현을 추가했다.
- Evidence:
  - Initial red: `Cannot find module './article'`, `./prompt`, `./validation`, `./markdown`
  - Green after implementation: `Test Files 6 passed (6), Tests 21 passed (21)`

### ArticleDocument serialization/deserialization

- Verdict: `PASS`
- Expected: 직렬화/역직렬화 round-trip이 보존되고 malformed payload는 실패해야 한다.
- Actual: `serializeArticleDocument` / `deserializeArticleDocument` 구현 및 테스트 통과.
- Evidence: `src/shared/domain/article.test.ts`, `src/shared/domain/article.ts`

### Block reorder and selected-block extraction

- Verdict: `PASS`
- Expected: 위/아래 이동 시 order 재정렬, 선택 문단 추출 시 문서 순서 유지.
- Actual: `moveBlockUp`, `moveBlockDown`, `extractSelectedBlocks` 구현 및 테스트 통과.
- Evidence: `src/shared/domain/article.test.ts`, `src/shared/domain/article.ts`

### Prompt interpolation tokens

- Verdict: `PASS`
- Expected: `{{topic}}`, `{{image_context}}`, `{{style}}`, `{{format_rules}}` 치환.
- Actual: 4개 토큰 모두 치환하고 unknown token 보존.
- Evidence: `src/shared/domain/prompt.test.ts`, `src/shared/domain/prompt.ts`

### Image validation cases

- Verdict: `PASS`
- Expected: 확장자, MIME type, 빈 파일, 잘못된 파일 정책 검증.
- Actual: 허용 확장자/타입 통과, `EMPTY_FILE`, `INVALID_EXTENSION`, `INVALID_MIME_TYPE` 실패 케이스 구현.
- Evidence: `src/shared/domain/validation.test.ts`, `src/shared/domain/validation.ts`

### Markdown canonical conversion

- Verdict: `PASS`
- Expected: MVP block type 파싱 및 parse/export round-trip canonical 안정성 보장.
- Actual: heading/paragraph/list/quote/code/image 파싱 및 export 구현, round-trip 안정성 테스트 통과.
- Evidence: `src/shared/domain/markdown.test.ts`, `src/shared/domain/markdown.ts`

## Command Evidence

- `npm run typecheck` → pass
- `npm test` → pass (`Test Files 6 passed (6)`, `Tests 21 passed (21)`)

## Scope Guardrail Check

- Sprint 3 범위 외(설정 저장, Gemini 연동, 클립보드 구현)는 추가하지 않음.
- 구현은 `src/shared/domain`의 pure domain 모듈에 한정됨.

## Criteria Scores

| Criterion | Weight | Raw Score | Weighted | Notes |
|-----------|--------|-----------|----------|-------|
| Spec and sprint decision alignment | 3 | 9 | 2.7 | Sprint 3 필수 요구사항 일치 |
| Test-first compliance | 3 | 9 | 2.7 | red -> green 증거 확보 |
| Mode and evidence integrity | 2 | 9 | 1.8 | 명령 결과와 파일 증거 일치 |
| Scope discipline | 2 | 10 | 2.0 | Sprint 4+ 기능 유입 없음 |
| Handoff clarity | 2 | 9 | 1.8 | 다음 스프린트 진입 기준 명확 |

Total: **11.0 / 12.0**
