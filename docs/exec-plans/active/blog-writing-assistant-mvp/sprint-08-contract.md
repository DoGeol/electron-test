# Sprint 08 Contract: macOS 패키징 + 마감 검증

## Scope

- `electron-builder` 기반 macOS 산출물(`dmg`, `zip`, `.app`)을 생성한다.
- MVP 핵심 흐름의 실행/검증 명령을 README에 정리한다.
- Sprint 8 검증 결과를 execution-plan 문서에 남긴다.

## Done Conditions

1. `npm run dist:mac` 명령이 성공한다.
2. `release/` 하위에 macOS 산출물이 생성된다.
3. packaged app 실행 바이너리 존재/실행 가능 여부를 확인한다.
4. `npm test`, `npm run typecheck`, `npm run build`가 모두 green이다.
5. README에 개발/테스트/빌드/패키징 명령과 MVP 제한사항이 반영된다.
6. 사용자 플로우 수동 검증 checklist가 문서화된다.

## Verification Methods

1. `npm run dist:mac`
2. `ls -lah release`
3. `test -x release/mac-arm64/Blog Writing Assistant.app/Contents/MacOS/Blog Writing Assistant`
4. `npm test`
5. `npm run typecheck`
6. `npm run build`

## Technical Notes

- notarization은 MVP 범위 밖이므로 skip 상태를 허용한다.
- 빌드 산출물은 `.gitignore`로 추적 제외한다.
- packaging 과정에서 기본 Electron 아이콘 사용 경고는 비차단으로 처리한다.

## Risks / Open Questions

- packaged app의 실제 UI 기반 end-to-end 동작은 로컬 수동 검증이 최종 기준이다.
- notarization 미적용 상태에서는 배포/배포 자동화 시 추가 보안 절차가 필요하다.
