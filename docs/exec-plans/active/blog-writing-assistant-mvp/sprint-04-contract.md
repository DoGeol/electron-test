# Sprint 04 Contract: Settings Persistence and IPC Boundary

## Scope

- Implement Settings persistence for `API Key`, `Prompt (Markdown)`, and `Output path`.
- Persist settings in main process using `electron-store` only.
- Keep renderer isolated from direct `fs` and `electron-store` access; all operations go through preload IPC bridge.
- Apply API key masking in UI and enforce log/error non-disclosure for raw key values.
- Preserve MVP storage guardrail: `manual save only` for article bundle (Settings persistence must not trigger article file creation).

## Done Conditions

1. Settings page can save/load `API Key`, `Prompt (Markdown)`, `Output path`.
2. Settings persist across app restart.
3. API Key is displayed in masked form in UI.
4. Test-first evidence exists: failing tests first, then minimal implementation to pass.
5. API Key masking and log non-disclosure tests exist and pass.
6. `manual save only` guardrail test exists and pass (no article bundle before explicit save action).
7. Renderer IPC boundary test exists and pass (no direct renderer access to `fs`/`electron-store`).
8. Keychain integration is excluded from Sprint 4 scope.

## Verification Methods

1. Write failing tests first for settings load/save, masking, and IPC boundary constraints.
2. Implement minimal main/preload/renderer code to satisfy tests.
3. Run `npm test` and capture Sprint 4 related test evidence.
4. Run `npm run typecheck` for cross-process type integrity.
5. Run `npm run build` to validate main/preload/renderer bundle consistency.
6. Manually verify restart persistence flow and masked key rendering in Settings view.

## Technical Notes

- Storage policy is fixed to `electron-store only` for MVP.
- Security policy:
  - API Key raw value must not appear in toast, console, thrown error text, or debug state dumps.
  - Use redacted error messages at renderer boundary.
- IPC contract should separate:
  - `settings:get`
  - `settings:update`
  - `settings:chooseOutputPath` (main dialog only, no persistence side effect)
- Do not couple Settings persistence with article bundle save logic.

## Risks / Open Questions

- Output path selection UX (`cancel` handling, invalid path handling) should be defined with explicit fallback states.
- Masking consistency must include initial load, edit state, and error state transitions.
- If legacy renderer state logs entire form objects, additional redaction hooks may be required.
