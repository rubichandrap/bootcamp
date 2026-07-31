# Feature Spec: Multi-Language Track Support (Go & TypeScript)

## Problem Statement

Learners currently only have access to a single Go curriculum track. Developers who want to master TypeScript alongside or instead of Go cannot choose their preferred programming language, track language-specific progress, or execute TypeScript challenge submissions.

## Solution

Transform the platform into a multi-language developer mastery platform where learners can:
1. Browse and choose between different language Tracks (starting with Go and TypeScript).
2. Switch between Tracks anytime using a persistent navigation switcher.
3. Complete Reading, Challenge, and Assessment Chapters tailored to their active Track.
4. Track individual progress per Track as well as overall platform progress while maintaining a unified daily streak across all language tracks.
5. Execute TypeScript challenge submissions via a decoupled Remote Code Execution (RCE) Engine runner architecture.

## User Stories

1. As a learner, I want to browse a catalog of available language Tracks, so that I can discover all supported languages and choose which one to learn.
2. As a learner, I want to see my progress percentage for each language Track on the catalog page, so that I know how much of each Track I have completed.
3. As a learner, I want to select an active Track, so that the learning workspace loads the modules and chapters for my chosen programming language.
4. As a learner, I want to switch my active Track from a dropdown menu in the header navigation, so that I can easily toggle between Go and TypeScript from anywhere in the application.
5. As a learner, I want my active Track preference to be remembered across browser sessions, so that I don't have to re-select my language every time I return to the platform.
6. As a TypeScript learner, I want to read theoretical concepts in TypeScript Reading Chapters, so that I can build mental models of idiomatic TypeScript.
7. As a TypeScript learner, I want to complete interactive TypeScript Challenge Chapters in the embedded editor, so that I can reinforce concepts with hands-on coding.
8. As a TypeScript learner, I want to execute my TypeScript code and see pass/fail test results in the RCE Engine console pane, so that I can verify my solution against challenge test suites.
9. As a TypeScript learner, I want to complete Assessment Chapters at the end of TypeScript Modules, so that I can prove mastery of the module concepts.
10. As a learner, I want passing challenge submissions in any Track to increment my daily streak, so that my learning momentum is preserved regardless of which language I practice on a given day.
11. As a learner, I want to view my submissions history filtered by active Track, so that I can review previous code attempts in Go or TypeScript.
12. As a content author, I want to organize curriculum content under language-specific track directories, so that adding new language tracks in the future is straightforward.

## Implementation Decisions

- **Domain Model & Vocabulary**: Update domain model to treat `Track` as a first-class language-specific curriculum entity containing ordered `Modules` and `Chapters`.
- **Content Directory Architecture**: Re-organize content under `content/tracks/<trackSlug>/modules/<moduleSlug>/<chapterSlug>.mdx`.
- **Route Structure**:
  - `/tracks`: Catalog page displaying available Tracks with per-track progress bars.
  - `/tracks/[trackSlug]`: Track dashboard listing modules and chapters for the chosen language.
  - `/tracks/[trackSlug]/[moduleSlug]/[chapterSlug]`: Chapter workspace adapted to the active track.
- **Header Track Switcher**: Integrated in main navigation bar, persisting choice to local storage and user session cookie.
- **Database Schema Updates**:
  - Add `trackId` column (`text`, not null) to `user_progress` table.
  - Add `trackId` column (`text`, not null) to `submissions` table.
- **Progress Service**:
  - `getTrackProgress(userId, trackId)` calculates completed chapters out of total chapters in `trackId`.
  - `getOverallProgress(userId)` calculates total completed chapters across all tracks.
  - `getStreak(userId)` calculates consecutive active submission days across all tracks combined.
- **Polymorphic RCE Engine Architecture**:
  - Abstract runner logic into `LanguageRunner` interface:
    ```ts
    export interface LanguageRunner {
      execute(params: { code: string; testCode: string; timeoutMs?: number }): Promise<SubmissionExecutionResult>;
    }
    ```
  - `GoRunner`: Implements `LanguageRunner` using `go test -v -json`.
  - `TypeScriptRunner`: Implements `LanguageRunner` by spawning a temp workspace and running tests via `vitest` / `node:test` runner with JSON reporter.
  - `RCEFactory`: Dispatches submission request to appropriate runner based on `trackId`.

## Testing Decisions

- **Testing Philosophy**: Tests must verify external behavior (API contracts, content loading output, runner results, progress totals) without asserting internal implementation details.
- **Seams Under Test**:
  1. **Content Engine Seam**: Test `getAllTracks()`, `getTrack(trackSlug)`, `getModule(trackSlug, moduleSlug)`, and `getChapter(trackSlug, moduleSlug, chapterSlug)` return expected metadata and MDX contents.
  2. **Progress Tracker Seam**: Test that marking a chapter completed updates per-track progress correctly and maintains unified daily streak across different `trackId` submissions.
  3. **RCE Engine Seam**: Test `GoRunner` and `TypeScriptRunner` against mock submission code and verify output maps accurately to `SubmissionExecutionResult` (passing tests, failing tests, syntax errors).
  4. **API Endpoint Seam**: Test `/api/rce/execute` and `/api/submissions` handle `trackId` parameter properly and return valid execution payloads.
- **Prior Art**: Refer to existing test files (`contentEngine.test.ts`, `progressTracker.test.ts`, `rceEngine.test.ts`, `route.test.ts`).

## Out of Scope

- Support for languages other than Go and TypeScript (e.g. Rust, Python) in this phase.
- Third-party IDE/LSP server integration for browser editor beyond standard Monaco syntax highlighting.
- Social leaderboard / public profile sharing of per-track badges.

## Further Notes

- TypeScript challenge execution requires Node.js runtime and `tsx` or `vitest` installed in the execution environment.
- Backwards compatibility for legacy Go routes (`/modules/...`) will redirect to `/tracks/go/modules/...`.
