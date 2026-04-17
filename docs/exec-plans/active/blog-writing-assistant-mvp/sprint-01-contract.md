# Sprint 01 Contract: Electron Plus React Scaffold Baseline

## Scope

- Scaffold Electron plus React plus TypeScript baseline using npm and electron-vite.
- Set application identity to `Blog Writing Assistant` with bundle identifier `com.local.blog-writing-assistant`.
- Define `main`, `preload`, and `renderer` boundaries with secure defaults.
- Add test-first baseline checks before adding runtime shell behavior.
- Prepare build and packaging command surface for future runnable and mac build sprints.

## Done Conditions

1. `package.json` contains working script entries for `dev`, `build`, `dist:mac`, `test`, and `typecheck`.
2. Repository contains explicit Electron process separation (`main`, `preload`, `renderer`) with no direct Node API use inside renderer.
3. Browser window security defaults are set (`contextIsolation: true`, `nodeIntegration: false`) and verified by static inspection.
4. Initial tests exist and pass for renderer mount and preload API surface contract.
5. Scaffold metadata reflects app name and mac bundle id in builder config or equivalent runtime packaging config.
6. Sprint 01 handoff records exact command evidence and unresolved blockers.

## Verification Methods

1. Inspect `package.json` scripts and run `npm run typecheck`.
2. Inspect scaffold directories and preload bridge exports for boundary compliance.
3. Inspect Electron main window options to confirm secure defaults.
4. Run `npm run test` and verify renderer mount plus preload surface tests pass.
5. Inspect build configuration for app name and bundle id values.
6. Attempt `npm run dev` and record command output; only switch mode to runnable if Electron window launch is verified.

## Technical Notes

- Primary subagents: `electron-pro`, `build-engineer`.
- Support subagents: `test-automator`, `code-reviewer`.
- Test-first order is mandatory: write tests, observe failure, then implement minimal scaffold to pass.
- This sprint does not implement feature logic for Gemini, editor actions, or clipboard behavior.
- Keep compatibility with Sprint 02 by leaving Tailwind v4 and shadcn setup ready for UI layout work.

## Risks / Open Questions

- Existing repository files may partially overlap with scaffold output and need careful merge strategy.
- `dist:mac` may need environment prerequisites even when config is correct.
- If runtime startup fails despite scaffold files, mode stays non-runnable and requires refine loop.
