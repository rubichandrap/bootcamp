# 8. Multi-Language Track Architecture

Date: 2026-08-01

## Status

Accepted

## Context

The platform was initially designed around a single Go curriculum. To broaden the platform to support additional programming languages starting with TypeScript, we need an architecture that supports multi-language track selection, independent track progress tracking with a unified learner streak, and a clean, extensible Remote Code Execution (RCE) engine for running language-specific tests.

## Decision

1. **Track Content Directory Layout**:
   Organize content by track under `content/tracks/<trackSlug>/modules/<moduleSlug>/<chapterSlug>.mdx`.
   Existing Go modules will move into `content/tracks/go/modules/` and TypeScript modules into `content/tracks/typescript/modules/`.

2. **Domain & Route Architecture**:
   - `/tracks`: Catalog page displaying all available language tracks with individual progress indicators.
   - `/tracks/[trackSlug]`: Language-specific dashboard listing track modules and chapters.
   - `/tracks/[trackSlug]/[moduleSlug]/[chapterSlug]`: Interactive learning workspace.
   - Global Header Switcher: Dropdown in main navigation to switch active tracks effortlessly.

3. **Database & Progress Model**:
   - Update `user_progress` and `submissions` tables to include a `trackId` column.
   - Calculate per-track progress (`user_progress WHERE trackId = ?`) and total platform progress.
   - Maintain a unified daily streak across all tracks.

4. **Polymorphic RCE Engine Architecture**:
   - Refactor `rceEngine.ts` to use a `LanguageRunner` interface (`GoRunner`, `TypeScriptRunner`).
   - Standardize submission results across all runners into `SubmissionExecutionResult`.
   - `GoRunner` uses `go test -json`.
   - `TypeScriptRunner` uses `vitest` / `node:test` with JSON reporter.

## Consequences

- Easily scale to new language tracks (e.g., Python, Rust) without structural refactoring.
- Existing Go content routes update cleanly to preserve backwards capability via redirects if necessary.
- RCE implementation remains clean, modular, and maintainable.
