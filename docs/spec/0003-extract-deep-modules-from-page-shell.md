# Specification: Extract Deep Modules from the Page Shell

## Problem Statement

The `page.tsx` file is a 444-line shallow module containing 13 state variables, 5 handlers, and 2 effects. Every change to the application — a new Chapter type, a different Progress formula, a keyboard shortcut — touches this single file. Bugs can hide anywhere in the tangle because locality is zero. The domain model in CONTEXT.md (Track → Module → Chapter → Submission → RCE Engine → Progress → Streak) and the codebase's pattern of one-test-per-module in `src/lib/` are not being followed for the page shell's client-side logic.

## Solution

Refactor `page.tsx` into four deep modules, each backed by plain service functions in `src/lib/{domain}/` with thin React hook adapters in `src/hooks/`:

1. **Progress Tracker** — owns Progress state (completed Chapter IDs, Streak, per-Chapter failed attempts). Service functions fetch Progress on load, record Submissions, fetch per-Chapter failed attempts, and increment failed attempts on RCE-API failures.
2. **Chapter Lifecycle** — owns Module and Chapter state and navigation. Service functions load all Modules, fetch a single Chapter, and compute the next Chapter in the Track. Exposes `advanceToNextChapter`.
3. **Challenge Session** — owns Challenge Chapter editor state (code, testCode, activeTab, result, isLoading, enableRaceCheck) and the run orchestration (execute RCE, record Submission, auto-advance on pass). The orchestration function accepts injected ports for testability.
4. **Reading Session** — manages mark-as-read for Reading Chapters by recording a Submission with the READING_COMPLETION_MARKER and advancing to the next Chapter.

The page shell becomes a thin layout that composes these four hooks, holding only UI state (hint modal open, command palette open) and wiring dependencies between modules via useEffect.

A fourth module (Progress Tracker) is added beyond the issue's three-module proposal because Progress state (completed Chapter IDs, Streak, failed attempts) is written by all three flows, which would create a circular dependency or force Chapter Lifecycle to become a god module.

## User Stories

1. As a learner, I want to see all available Modules and their Chapters in the sidebar, so that I can navigate the curriculum.
2. As a learner, I want to select any Chapter from the sidebar, so that I can jump to specific content.
3. As a learner, I want the first Chapter to auto-select when the app loads, so that I can start learning immediately without manual navigation.
4. As a learner, I want to see the current Chapter's title and content, so that I know what I'm learning.
5. As a learner, I want reading chapters to show MDX-formatted content, so that I can read theoretical explanations with rich formatting.
6. As a learner, I want to mark reading chapters as read, so that I can track my completion status.
7. As a learner, I want to see a "Completed" badge on chapters I've finished, so that I can track my progress at a glance.
8. As a learner, I want to see my overall progress percentage, so that I can track how far through the Track I am.
9. As a learner, I want to see my daily Streak, so that I'm motivated to return each day.
10. As a learner, I want to see starter code in the editor when I open a challenge chapter, so that I have a starting point for coding.
11. As a learner, I want to edit Go code in the Monaco Editor, so that I can write and modify solutions.
12. As a learner, I want to switch between code, test, and solution tabs, so that I can view different aspects of the challenge.
13. As a learner, I want to run my code against the test suite with a click, so that I can verify my solution passes.
14. As a learner, I want to use Cmd+Enter to run code, so that I can use keyboard shortcuts for speed.
15. As a learner, I want to see test results in a terminal output pane, so that I can debug failures.
16. As a learner, I want to see an "Executing..." state while code runs, so that I know the system is working.
17. As a learner, I want the app to auto-advance to the next chapter after I pass a challenge, so that I can continue learning seamlessly.
18. As a learner, I want to see a Socratic Hint modal when I click the hint button, so that I can get conceptual guidance without seeing the answer.
19. As a learner, I want solutions to unlock after passing or 3 failed attempts, so that I can learn from reference implementations when stuck.
20. As a learner, I want to use Cmd+K to open the command palette, so that I can quickly search and jump to any chapter.
21. As a learner, I want to search for chapters by topic, so that I can find specific content quickly.
22. As a learner, I want to enable the Go data race detector (-race), so that I can check for concurrency bugs in my code.
23. As a learner, I want to see which chapters I've completed in the sidebar, so that I can track my learning path.
24. As a learner, I want the solution tab to be locked until unlocked, so that I'm not tempted to skip learning.
25. As a learner, I want the failed attempt counter to increment even when the RCE API fails, so that I can eventually unlock solutions during service outages.
26. As a learner, I want the editor to reset to starter code when I select a new chapter, so that I start fresh.
27. As a developer, I want each service module to be independently testable, so that I can verify behavior without running the full app.
28. As a developer, I want clear module boundaries with acyclic dependencies, so that I can make changes to one concern without affecting others.
29. As a developer, I want domain-precise naming aligned with CONTEXT.md, so that new contributors can understand the codebase using the glossary.
30. As a developer, I want the page shell to be a thin layout, so that it's easy to understand the app's composition.
31. As a developer, I want modules to follow the existing src/lib/{domain}/ pattern with one test file each, so that the codebase stays consistent.
32. As a developer, I want service functions to be testable in the node environment, so that tests run fast without a browser.
33. As a developer, I want orchestration logic to accept injected ports, so that I can test it with stub dependencies.

## Implementation Decisions

### Module Decomposition

The page shell's 13 state variables, 5 handlers, and 2 effects are distributed into four modules:

- **Progress Tracker** (`src/lib/progress/` + `src/hooks/useProgressTracker.ts`): owns Progress state — completed Chapter IDs, Streak, and per-Chapter failed attempts. Service functions: `fetchProgress`, `recordSubmission`, `fetchFailedAttemptsForChapter`, `incrementFailedAttempts`.
- **Chapter Lifecycle** (`src/lib/chapters/` + `src/hooks/useChapterLifecycle.ts`): owns Module/Chapter state and navigation. Service functions: `fetchModules`, `fetchChapter`, `findNextChapter` (pure function). Exposes `advanceToNextChapter`.
- **Challenge Session** (`src/lib/challenges/` + `src/hooks/useChallengeSession.ts`): owns editor state and run orchestration. Service function: `runChallenge` (accepts `executeRce`, `recordSubmission`, `onAdvance` as injected ports).
- **Reading Session** (`src/hooks/useReadingSession.ts`): mark-as-read for Reading Chapters. Delegates to `recordSubmission` with READING_COMPLETION_MARKER and `advanceToNextChapter`.

### Dependency Graph (Acyclic)

```
Progress Tracker    ← leaf (API: /api/submissions)
Chapter Lifecycle   ← leaf (API: /api/modules)
Challenge Session   → both (RCE execution + submission recording + auto-advance)
Reading Session     → both (mark-as-read + advance)
Page shell          → orchestrates composition + 2 UI state vars
```

### State Distribution

- Progress state (completedChapterIds, streakDays, failedAttempts) → Progress Tracker
- Chapter state (modules, currentChapter) → Chapter Lifecycle
- Challenge editor state (code, testCode, activeTab, result, isLoading, enableRaceCheck) → Challenge Session
- UI state (isHintOpen, isPaletteOpen) → page shell
- Derived values (isPassed, isUnlocked, progressPercent) → computed in page shell from Progress Tracker + Chapter Lifecycle state

### Page Shell Responsibilities

1. Initial data loading: `progress.loadProgress` + `chapters.loadModules` (mount useEffect)
2. Auto-select first Chapter when modules load (watch modules useEffect)
3. Fetch per-Chapter failed attempts when currentChapter changes (watch currentChapter useEffect)
4. Keyboard shortcuts: Cmd+Enter → `runner.run()`, Cmd+K → toggle palette (dependency-effect useEffect)
5. Compute derived values: `isPassed`, `isUnlocked`, `progressPercent`, `activeHint`
6. Render: pass hook return values to existing components (SidebarNav, MdxRenderer, CodeEditor, TerminalOutput, SocraticHintModal, CommandPaletteModal)

### Naming

Domain-precise names aligned with CONTEXT.md glossary:
- `useProgressTracker` — "tracker" implies active syncing from API (not "store", which is a Redux pattern)
- `useChapterLifecycle` — "lifecycle" describes load → select → advance → complete (not "store")
- `useChallengeSession` — "session" captures the bounded interaction scope (not "runner", which is explicitly _avoided_ in the glossary for RCE Engine)
- `useReadingSession` — "session" parallels challenge naming; avoids overlap with `contentEngine` and `MdxRenderer`

### Orchestration and Dependency Injection

- `runChallenge` accepts `executeRce`, `recordSubmission`, and `onAdvance` as injected ports (dependencies)
- `runChallenge` executes RCE, records the Submission, and auto-advances on success (with 1500ms delay)
- `markAsRead` delegates to the same `recordSubmission` + `advanceToNextChapter` ports
- The page shell wires these dependencies together by passing hook methods between hooks

### Edge Cases

- **RCE API failure**: when the RCE API throws before a Submission can be recorded, `progressStore.incrementFailedAttempts()` increments the local counter so solutions can still unlock during outages
- **Last chapter**: `findNextChapter` returns null when there is no next Chapter; `advanceToNextChapter` no-ops
- **Empty modules**: `loadModules` handles the case where the content directory has no modules (already handled by `contentEngine.getAllModules`)

### API Contracts

No changes to existing API routes:
- GET /api/modules — returns all Modules with Chapters
- GET /api/modules?module=X&chapter=Y — returns a single Chapter
- GET /api/submissions?userId=X — returns Progress
- GET /api/submissions?userId=X&chapterId=Y — returns per-Chapter failed attempts
- POST /api/submissions — records a Submission, returns updated Progress
- POST /api/rce/execute — executes Go tests, returns RCEExecuteResponse

## Testing Decisions

Good tests verify external behavior through the module's public interface — the functions it exports and the behavior they produce — not internal implementation details like which SQL was generated or how state was updated.

### Testing Seam (one seam, highest possible)

**Service function interface in `src/lib/{domain}/`**: The plain service functions are the single testing seam. They are tested in the existing `node` vitest environment with mocked global `fetch` via `vi.stubGlobal`. The thin hooks and page shell are NOT tested — they are pure composition with no business logic.

Within this seam:

1. **Service functions with mocked fetch**: `fetchProgress`, `recordSubmission`, `fetchFailedAttemptsForChapter`, `fetchModules`, `fetchChapter`, `executeRce` — each tested by mocking `fetch` and asserting on the return value and the fetch call arguments (URL, method, body).

2. **`findNextChapter` (pure function)**: tested directly with edge cases — last chapter in Track (returns null), middle chapter (returns next), empty modules (returns null).

3. **`runChallenge` (orchestration function)**: accepts `executeRce`, `recordSubmission`, `onAdvance` as injected ports. Tests provide stub functions and verify the correct sequence: execute → record → advance (on success only, after 1500ms delay). No `fetch` mocking at this level.

### What Is NOT Tested

- **Hooks** (`useProgressTracker`, `useChapterLifecycle`, `useChallengeSession`, `useReadingSession`): thin React state wrappers around the service functions. Require `jsdom` + `@testing-library/react-hooks`, which are not set up (vitest config uses `environment: 'node'`). The service functions they call are already tested.
- **Page shell**: pure presentation and composition, no business logic to test.

### Prior Art

- `src/lib/metrics/streak.test.ts` — tests a pure domain function (`calculateStreak`) in the `node` environment
- `src/lib/rce/benchParser.test.ts` — tests a pure parsing function in the `node` environment
- `src/lib/navigation/explorationMode.test.ts` — tests a domain function with mocked dependencies
- `src/app/api/submissions/route.test.ts` — tests the API route boundary (the server-side seam our client functions call into)
- `src/components/TerminalOutput.test.ts` — tests a component's type contract

Our service function tests follow the `streak.test.ts` pattern: import the function, mock `fetch`, call it, assert on the return value and fetch arguments.

## Out of Scope

- No changes to API routes or their request/response contracts.
- No changes to the database schema or Drizzle ORM models.
- No changes to the content directory structure or MDX files.
- No changes to existing components (SidebarNav, MdxRenderer, CodeEditor, TerminalOutput, SocraticHintModal, CommandPaletteModal).
- No new features — this is a pure behavioral refactor.
- No changes to the RCE execution engine (server-side Go test runner).
- No changes to existing ADRs (0001–0006).
- No changes to the existing `contentEngine.ts` — it already provides server-side content loading; the new `chapterService` is a client-side fetch wrapper around the same API.
- No changes to the `SocraticHintModal` or `CommandPaletteModal` components.

## Further Notes

- This refactoring is a candidate from the architecture deepening review that produced ADR-0002 (split progress module) and the existing page.tsx analysis.
- The refactoring preserves all existing user-facing behavior. The only observable differences are improved maintainability and testability.
- CONTEXT.md was updated to include "Progress" and "Streak" as domain terms (defined as the learner's standing derived from Submission records, and consecutive-day submission streak respectively).
- This refactoring is a prerequisite for future features: challenge auto-advance customization, progress analytics, and per-Module progress tracking.
- The new modules follow the existing `src/lib/{domain}/{service}.ts` + `{service}.test.ts` pattern (one implementation file, one test file per module).
