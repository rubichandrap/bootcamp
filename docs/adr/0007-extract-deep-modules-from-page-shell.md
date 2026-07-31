# Extract Deep Modules from the Page Shell

We are refactoring page.tsx (444 lines, 13 state variables, 5 handlers) into four deep modules backed by plain service functions in `src/lib/`, each with thin React hook adapters, to restore locality and testability. Four modules (not three as originally proposed) were chosen because shared Progress state written by all three flows creates a circular dependency in the three-module design; plain service functions (not hooks) were chosen because the vitest `node` environment cannot test React hooks without additional dependencies.

## Considered Options

- **3 modules (original proposal)** — Rejected: shared Progress state (completedChapterIds, streakDays, failedAttempts) is written by all three flows, creating a circular dependency or forcing chapterStore to become a god module.
- **Hooks as deep modules** — Rejected: vitest config uses `environment: 'node'`; React hooks require `jsdom` + `@testing-library/react-hooks` to test in isolation.
- **"Runner"/"Store"/"Reader" naming** — Rejected: glossary lists "Runner" as _avoid_ for RCE Engine; "Store"/"Reader" don't align with the domain vocabulary in CONTEXT.md.

## Consequences

- New `src/lib/{progress,chapters,challenges,reading}/` directories with service functions and one test file each, following the existing `src/lib/metrics/streak.ts` + `streak.test.ts` pattern.
- Page shell shrinks from 444 lines of intertwined logic to a thin layout: 2 state variables, 4 useEffects (initial load, auto-select first chapter, fetch failed attempts on chapter change, keyboard shortcuts), and simple derived values.
- `incrementFailedAttempts` method on the Progress tracker for the RCE-failure fallback edge case (line 197 of page.tsx increments failedAttempts when the RCE API itself throws, before any Submission is recorded).
