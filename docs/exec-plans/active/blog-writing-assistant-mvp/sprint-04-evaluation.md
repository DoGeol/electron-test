# Sprint 04 Evaluation

## Overall Verdict

- Status: `completed`
- Action: `pass`
- Mode: `runnable`

## Tested Items

### Test-first execution order

- Verdict: `PASS`
- Expected: Settings 관련 테스트를 먼저 추가하고 red 상태를 확인한 뒤 구현한다.
- Actual: settings 관련 테스트(`settings-service`, `settings IPC`, `renderer settings integration`)를 먼저 추가한 뒤, 모듈 미구현 상태에서 red를 확인하고 구현을 진행했다.
- Evidence:
  - Initial red: `Cannot find module './settings-service'`, `Cannot find module './ipc'`, `settings.chooseOutputPath` 누락
  - Final green: `Test Files 9 passed (9)`, `Tests 31 passed (31)`

### electron-store only persistence

- Verdict: `PASS`
- Expected: Settings 저장/로드는 main process `electron-store` 경로만 사용한다.
- Actual: main process에서 `electron-store` 인스턴스를 생성하고 settings service를 통해서만 읽기/쓰기 처리.
- Evidence:
  - `src/main/index.ts`
  - `src/main/settings/settings-service.ts`
  - `src/main/settings/settings-service.test.ts`

### IPC boundary integrity

- Verdict: `PASS`
- Expected: renderer가 `fs` 또는 `electron-store`를 직접 참조하지 않고 preload IPC만 사용한다.
- Actual: settings 관련 동작은 `settings:get/update/testApiKey/chooseOutputPath` IPC로 분리, `chooseOutputPath`는 경로 선택만 반환하고 저장은 `settings:update`에서만 수행.
- Evidence:
  - `src/shared/ipc.ts`
  - `src/preload/bridge.ts`
  - `src/main/settings/ipc.ts`
  - `src/preload/bridge.test.ts` (`fs`, `electronStore` 미노출 검증)

### API key masking and non-disclosure

- Verdict: `PASS`
- Expected: UI는 masked value를 표시하고 로그/에러에 원문이 노출되지 않는다.
- Actual: settings service에서 API 키는 마스킹 후 반환하며, 로그에는 원문 대신 길이/상태 메타만 기록.
- Evidence:
  - `src/main/settings/settings-service.ts`
  - `src/main/settings/settings-service.test.ts` (`does not log raw api key`)
  - `src/renderer/src/App.settings.test.tsx` (로드 시 masked 값 표시)

### manual-save guardrail

- Verdict: `PASS`
- Expected: article bundle 생성은 explicit save action 전까지 발생하지 않는다.
- Actual: settings 업데이트는 outputPath 저장만 수행하며 파일 쓰기를 수행하지 않는다.
- Evidence:
  - `src/main/settings/settings-service.test.ts` (`does not create article bundle files before manual save`)

### Restart persistence behavior

- Verdict: `PASS` (unit/integration layer)
- Expected: 앱 재시작 후에도 Settings 값이 유지된다.
- Actual: service 재생성(restart-like) 시 동일 store로 값이 유지되는 테스트를 추가해 검증.
- Evidence:
  - `src/main/settings/settings-service.ts`
  - `src/main/settings/settings-service.test.ts`

## Command Evidence

- `npm test` -> pass (`Test Files 9 passed (9)`, `Tests 32 passed (32)`)
- `npm run typecheck` -> pass
- `npm run build` -> pass

## Scope Guardrail Check

- Sprint 4 includes:
  - Settings persistence
  - IPC boundary hardening
  - API key masking/non-disclosure tests
- Sprint 4 excludes:
  - Keychain adapter/integration
  - Gemini generation pipeline
  - Naver clipboard conversion
  - Auto-save and article bundle auto-write

## Criteria Scores (Initial Template)

| Criterion | Weight | Raw Score | Weighted | Notes |
|-----------|--------|-----------|----------|-------|
| Spec and sprint decision alignment | 3 | 9 | 2.7 | Sprint 4 고정사항 반영 |
| Test-first compliance | 3 | 9 | 2.7 | red -> green evidence 확보 |
| Security and privacy guardrails | 3 | 9 | 2.7 | masking + raw key 비노출 |
| IPC boundary discipline | 2 | 9 | 1.8 | renderer direct access 금지 |
| Handoff clarity | 2 | 9 | 1.8 | Sprint 5 진입 정보 명확 |

Total: **11.7 / 13.0**
