# Sprint 00 Contract: Decision Lock and Readiness Review

## Scope

- Validate that locked MVP decisions are consistent across `SPEC.md`, `SPRINT_PLAN.md`, and `HARNESS_SPRINT_PROMPTS.md`.
- Classify unresolved items as `blocking` or `non-blocking` for Sprint 01 start.
- Produce a concrete Sprint 01 entry checklist with test-first and subagent usage requirements.
- Keep all work inside `docs/exec-plans/active/blog-writing-assistant-mvp/`.

## Done Conditions

1. A documented decision lock summary confirms the following remain consistent: npm plus electron-vite, BlockNote plus Markdown canonical, `electron-store` only, manual save only, Gemini non-streaming with single image, whole and selected Naver HTML copy.
2. Any unresolved ambiguity is listed with impact, severity (`blocking` or `non-blocking`), and a default path.
3. Sprint 01 contract exists with observable acceptance checks and verification methods.
4. Sprint 00 evaluation and handoff are produced with concrete repo evidence and a clear next sprint action list.

## Verification Methods

1. Cross-read `SPEC.md`, `SPRINT_PLAN.md`, and `HARNESS_SPRINT_PROMPTS.md` for direct consistency on locked decisions.
2. Verify `plan.md` and `config.json` record non-runnable mode with `dev_server_command` and `dev_server_url` set to `none`.
3. Verify `sprint-01-contract.md` includes test-first done conditions and subagent roles.
4. Confirm Sprint 00 evaluation has weighted scoring and non-runnable readiness verdict.

## Technical Notes

- Primary subagents for this sprint context: `ui-designer`, `electron-pro`, `ai-engineer`.
- Review support subagent: `code-reviewer`.
- This sprint is document and readiness only; no runtime claims are allowed.
- Mode remains non-runnable until a real Electron window launch command and URL are verifiable.

## Risks / Open Questions

- `docs/codex-workflow.md` is not present, so plan grounding uses `AGENTS.md`, `SPEC.md`, `SPRINT_PLAN.md`, and `HARNESS_SPRINT_PROMPTS.md`.
- Parallel workers may scaffold files before Sprint 01 generator starts, so the generator must re-read current repo state before edits.
- `package.json` has dependencies but does not yet prove runnable app readiness.
