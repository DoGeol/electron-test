# Sprint 03 Contract: Domain Model and Test-First Harness

## Scope

- Build Sprint 3 foundation for domain-centric development before feature implementation.
- Define `ArticleDocument`, `ArticleBlock`, and `Settings` types as canonical domain model primitives.
- Add pure domain functions for serialization/deserialization, block reorder, block selection extraction, prompt interpolation, and image validation.
- Establish test harness coverage for Markdown canonical conversion rules required by MVP.
- Keep UI changes minimal and only where test harness integration requires it.

## Done Conditions

1. Local test command is runnable and Sprint 3 test suite executes in repository CI/local flow.
2. `ArticleDocument` serialization/deserialization tests exist and pass.
3. Block reorder and selected blocks extraction tests exist and pass.
4. Prompt interpolation tests include `{{topic}}`, `{{image_context}}`, `{{style}}`, `{{format_rules}}`.
5. Image validation tests include extension, MIME type, empty file, and malformed/invalid file cases.
6. Domain logic touching main-process dependencies is adapter-separated so unit tests can run without Electron runtime.
7. MVP block types are explicitly limited to: heading, paragraph, list, quote, code, image reference.
8. Implementation follows strict test-first order (failing tests first, then minimal code to pass).

## Verification Methods

1. Add failing tests first for each target domain behavior, then confirm red state.
2. Implement minimal domain code until tests pass, without introducing Sprint 4+ behavior.
3. Run `npm test` and capture command evidence for Sprint 3 test files.
4. Run `npm run typecheck` to verify type-level integrity for the new domain modules.
5. Run focused test commands for domain subsets when needed (serialization, reorder/selection, prompt, image validation).
6. Confirm no Sprint 4+ persistence/network integrations were added in this sprint.

## Technical Notes

- Canonical internal format remains Markdown-first per locked MVP decision.
- Domain modules should remain framework-agnostic and side-effect free.
- Adapter boundaries must isolate Electron/main concerns from pure domain tests.
- Block compatibility must be constrained to stable Markdown import/export block types only.

## Risks / Open Questions

- Markdown edge-cases (nested lists, fenced code metadata, mixed quote/list blocks) may need normalization rules during Sprint 3 refine loop.
- Image validation policy (allowed extensions vs MIME precedence) must be encoded unambiguously in tests to avoid drift.
- If legacy UI state shape conflicts with domain types, harmonization must remain inside Sprint 3 scope and not leak into persistence/AI integration.
