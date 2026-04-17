# Sprint 05 Contract: Gemini 생성 파이프라인 + Grounding 메타데이터

## Scope

- main process에서 `@google/genai` adapter를 통해 Gemini 생성 파이프라인을 구현한다.
- 생성 방식은 MVP 고정 정책대로 `non-streaming only`로 제한한다.
- 단일 이미지(옵션) 입력을 지원하고, 확장자(`png/jpg/jpeg/webp`) 검증 후 `inlineData`로 변환한다.
- Gemini 요청은 `model: gemini-2.5-flash` + `tools: [{ googleSearch: {} }]` 구성을 사용한다.
- 응답은 Markdown canonical 흐름으로 처리하고, 빈 응답/안전성 차단/일반 오류를 사용자 메시지로 매핑한다.
- grounding metadata를 구조화 payload로 추출해 UI에서 요약 정보로 노출한다.
- IPC `generator:generate` 채널을 추가하고 settings service의 API Key/Prompt를 주입해 호출한다.
- renderer에서 생성 플로우(주제/이미지 입력 → 생성 버튼 → 로딩/성공/실패)를 연결한다.

## Done Conditions

1. Gemini 호출이 main process generator service에서만 수행된다.
2. 요청 payload가 `gemini-2.5-flash` + `googleSearch` tool 설정을 포함한다.
3. streaming 관련 API/상태 처리가 없고 non-streaming 응답만 처리한다.
4. 이미지 입력은 최대 1장만 처리하며 허용 확장자 외 입력은 API 호출 전 실패한다.
5. 허용 이미지 입력은 `inlineData(mimeType, base64 data)`로 변환되어 request `parts`에 포함된다.
6. 빈 응답/SAFETY 응답/provider 오류에 대한 사용자 메시지 매핑이 구현된다.
7. grounding metadata가 `{ webSearchQueries, sources[] }` 구조로 추출된다.
8. renderer에서 생성 성공 시 Markdown 본문과 출처 요약을 표시하고, 실패 시 오류 메시지를 표시한다.
9. 테스트 파일 `src/main/generator/generator-service.test.ts`, `src/main/generator/ipc.test.ts`, `src/renderer/src/App.generator.test.tsx`가 존재하고 통과한다.
10. `npm test`, `npm run typecheck`, `npm run build` 검증이 모두 통과한다.

## Verification Methods

1. 테스트 선작성 원칙으로 generator service / IPC / renderer flow 테스트를 먼저 추가한다.
2. red 상태를 확인한 뒤 최소 구현으로 green 상태를 만든다.
3. `npm test`로 Sprint 5 관련 테스트와 전체 회귀를 확인한다.
4. `npm run typecheck`로 shared 타입과 main-preload-renderer 경계 일관성을 검증한다.
5. `npm run build`로 Electron/Vite 번들 생성 성공을 검증한다.
6. 코드 정적 점검으로 `generator:generate` IPC 경로가 settings service 값을 주입하는지 확인한다.

## Technical Notes

- generator request는 `responseMimeType: text/plain`을 사용하고, 반환 텍스트를 Markdown canonical 입력으로 취급한다.
- 이미지 MIME은 확장자 기준(`.png`, `.jpg`, `.jpeg`, `.webp`)으로 결정한다.
- grounding은 본문에 자동 삽입하지 않고 별도 payload/UI 요약으로만 노출한다.
- API Key/Prompt는 renderer payload에서 받지 않고 settings service에서 읽어 주입한다.

## Risks / Open Questions

- OS/브라우저 환경에 따라 file input의 `path` 가용성이 다를 수 있어, 이미지 경로 확보 방식의 fallback 정책이 필요할 수 있다.
- provider 응답 포맷 변경 시 grounding metadata 파싱 로직 보강이 필요할 수 있다.
- 현재는 non-streaming 고정이므로 긴 응답에서 체감 대기 시간이 커질 수 있다(정책상 Sprint 5 범위 내 유지).
