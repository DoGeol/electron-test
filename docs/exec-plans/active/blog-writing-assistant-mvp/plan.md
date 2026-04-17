# Execution Plan: Blog Writing Assistant MVP Harness

## Summary

- Goal: Drive Sprint 00 to Sprint 08 execution for the Blog Writing Assistant MVP with clear planner, generator, and evaluator artifacts.
- Success criteria: Decisions are locked before coding, Sprint 01 has an executable scaffold contract with test-first gates, and every sprint can be evaluated with concrete evidence.
- Why the harness is useful here: The work spans product constraints, Electron architecture, AI integration, clipboard behavior, and packaging, so durable sprint contracts are needed.

## Sources Read

- `AGENTS.md`
- `docs/DESIGN.md`
- `SPEC.md`
- `SPRINT_PLAN.md`
- `HARNESS_SPRINT_PROMPTS.md`
- `package.json`

## Constraints

- Worker ownership is limited to `docs/exec-plans/active/blog-writing-assistant-mvp/`.
- Do not edit code files outside the execution-plan folder in this pass.
- Keep MVP decisions already locked in `SPEC.md` and `SPRINT_PLAN.md`.
- Enforce test-first implementation for functional sprints.
- Use installed subagents per sprint to reduce implementation risk.

## Mode

- Mode: `non-runnable`
- Rationale: The repository has dependencies declared but no verified runnable Electron scaffold yet (`src/` and `electron/` runtime structure are not present, and no runnable dev script contract has been validated in this pass).
- Dev server command: `none`
- Dev server URL: `none`

## Complexity

- Level: `full`
- Total sprints: 9
- Max iterations per sprint: 5

## Sprints

1. Sprint 00: Decision lock and doc review
   Scope: Verify all locked MVP decisions across spec and sprint docs, classify remaining ambiguity.
   Expected outcome: A non-conflicting decision baseline and Sprint 01 entry checklist.
2. Sprint 01: Scaffold baseline and runtime boundary
   Scope: Build Electron plus React baseline with npm, security defaults, and test-first checks.
   Expected outcome: Runnable shell candidate with passing initial tests and packaging script baseline.
3. Sprint 02: Layout-first UI shell
   Scope: Implement left sidebar and right content static UI per design guide.
   Expected outcome: Navigable Blog Generator and Settings pages before deep feature work.
4. Sprint 03: Domain model and test harness
   Scope: Establish canonical Markdown model and pure-domain tests.
   Expected outcome: Stable serialization, selection, reorder, and prompt interpolation tests.
5. Sprint 04: Settings persistence
   Scope: Save and load API key, prompt, and output path through IPC with `electron-store`.
   Expected outcome: Restart-safe settings with masking and boundary protections.
6. Sprint 05: Gemini generation pipeline
   Scope: Implement non-streaming `gemini-2.5-flash` plus grounding and single-image input.
   Expected outcome: End-to-end draft generation with explicit error states and grounding metadata.
7. Sprint 06: Block editor and manual save
   Scope: Add BlockNote editing and explicit save bundle generation.
   Expected outcome: Editable blocks, move and selection actions, and manual save-only behavior.
8. Sprint 07: Naver clipboard copy
   Scope: Convert Markdown to Naver HTML and write both html and plain text clipboard payloads.
   Expected outcome: Whole-article and selected-block copy flows with fallback handling.
9. Sprint 08: macOS packaging and closeout
   Scope: Validate `electron-builder` mac outputs and MVP flow checklist.
   Expected outcome: Installable artifact and documented developer workflow commands.

## Evaluation Criteria

| Criterion | Weight | Verification |
|-----------|--------|--------------|
| Spec and sprint decision alignment | 3 | Cross-check locked decisions against `SPEC.md` and `SPRINT_PLAN.md` before and after each sprint. |
| Test-first compliance | 3 | Confirm tests are authored before implementation for each functional scope and pass with evidence. |
| Mode and evidence integrity | 2 | Ensure runnable vs non-runnable mode is accurate and supported by command or repo evidence. |
| Scope discipline | 2 | Verify each sprint only implements contracted work without leaking into later scope. |
| Handoff clarity | 2 | Confirm handoff includes verified outcomes, concrete changed files, and next actions. |
