# Sprint 02 Contract: Layout-First UI Shell

## Scope

- Implement the two-pane app shell for Blog Writing Assistant.
- Keep left sidebar navigation for `Blog Generator` and `Settings`.
- Render static content sections for both pages with required labels and actions.
- Follow Octo Code dark tokens from `docs/DESIGN.md`.
- Do not implement Gemini, persistence, or clipboard logic in this sprint.

## Done Conditions

1. App renders a two-pane layout (`sidebar + content`).
2. Sidebar allows page switching between `Blog Generator` and `Settings`.
3. Generator page shows `Topic`, `Upload image`, and `Generate` controls.
4. `Generate` button is disabled when required topic input is empty.
5. Settings page shows `API Key`, `Prompt (Markdown)`, and `Output path`.
6. UI tests for navigation, required controls, and disabled state pass.

## Verification Methods

1. Run `npm test` and confirm Sprint 2 UI tests pass.
2. Run `npm run typecheck` to validate compile-time integrity.
3. Run `npm run build` to validate main/preload/renderer production build.
4. Run `npm run dev` and verify renderer dev server starts at `http://localhost:5173`.

## Technical Notes

- Color tokens are defined in `src/renderer/src/styles.css`.
- Page switching is local state based (`generator | settings`) without router complexity.
- App shell intentionally uses mock article blocks and static action rails for layout validation.

## Risks / Open Questions

- Runtime launch was validated from terminal logs; final visual check should still be done on local desktop window.
- Sprint 3+ domain tests were intentionally deferred to respect user request to stop at Sprint 2.
