# Specification: Interactive Go Mastery Platform

## Problem Statement

As a senior software engineer who previously relied on high-level garbage-collected languages like TypeScript, heavy reliance on agentic AI tools over time has started dulling hands-on programming intuition and deep software engineering recall. The user wants to achieve true Go mastery (specifically understanding idiomatic Go design, memory models, interface composition, and concurrency primitives). Existing learning platforms either lack real Go runtime evaluation (such as `go test -json`, race condition detection, and memory allocation profiling) or introduce heavy cloud infrastructure overhead. The learner needs an interactive, Codecademy-like web application powered by a zero-disk-bloat RCE engine that enforces active code writing and test-driven verification.

## Solution

Build an interactive full-stack web application (Next.js App Router, TypeScript, TailwindCSS) with an embedded Monaco Editor and a host-local native Go RCE Engine. The curriculum is structured into 6 progressive Modules containing Reading Chapters, Challenge Chapters, and compulsory capstone Assessment Chapters.

Submissions are compiled and executed natively against `go test -json` in isolated, temporary `/tmp` workspaces (backed by RAM `tmpfs`) with automatic deletion (`defer os.RemoveAll`), ensuring sub-50ms feedback and zero disk bloat. The platform implements active mastery mechanics—including Socratic conceptual hints, memory allocation profiling (`B/op` and `allocs/op`), and restricted solution reveals—to rebuild deep programming muscle memory.

## User Stories

1. As a learner, I want to browse a structured 6-module Go curriculum track from beginner to advanced topics, so that I can systematically build my Go expertise.
2. As a learner, I want to view Modules grouped by cohesive Go themes (e.g. Memory Models, Interfaces, Concurrency), so that I can focus on specific domain concepts.
3. As a learner, I want to read comprehensive Markdown/MDX content in Reading Chapters, so that I can understand theoretical concepts and idiomatic Go patterns before writing code.
4. As a learner, I want to open Challenge Chapters featuring a 3-pane workspace (Reading Material on left, Monaco Editor on top-right, Terminal Output on bottom-right), so that I can write code in an IDE-like environment.
5. As a learner, I want pre-populated Go starter code and failing test cases in Challenge Chapters, so that I know what specification my implementation needs to satisfy.
6. As a learner, I want to submit my Go code solution to the RCE Engine with a single click or keyboard shortcut (`Cmd+Enter`), so that I can verify my answer against test suites.
7. As a learner, I want the RCE Engine to execute my code using standard `go test -json` in sub-50ms, so that I get fast, non-blocking feedback.
8. As a learner, I want to view detailed test pass/fail breakdowns and compiler error output in the terminal pane, so that I can quickly debug syntax or logical errors.
9. As a learner, I want to view Go race condition warnings (`-race`) when running concurrency challenges, so that I can learn to prevent goroutine data races.
10. As a learner, I want to view memory allocation metrics (`B/op` and `allocs/op`) in a performance tab, so that I can write memory-efficient Go code and understand escape analysis.
11. As a learner, I want Socratic conceptual hints when I am stuck on a challenge, so that I am guided toward the right approach without receiving copy-pasteable solution code.
12. As a learner, I want access to the official solution code only after passing the challenge or completing 3 unsuccessful submission attempts, so that I am forced to write code myself first.
13. As a learner, I want to complete a mandatory Assessment Chapter at the end of each Module, so that I can validate comprehensive mastery before completing the Module.
14. As a learner, I want my chapter completion state, submission history, and test logs saved automatically in SQLite, so that I can resume my learning progress across sessions.
15. As a learner, I want a Vercel-inspired light and dark mode UI with high-contrast typography, so that I can read and write code comfortably during long learning sessions.
16. As a learner, I want a "Jump to Chapter" command palette (`Cmd+K`), so that I can quickly navigate between modules and chapters.
17. As a learner, I want a toggleable "Free Exploration" mode, so that I can skip ahead to advanced modules when I want to focus on specific Go topics immediately.
18. As a developer/content author, I want curriculum content and test suites stored as git-versioned MDX and `.go` files in `content/modules/`, so that I can maintain content using standard IDE and Go tools.

## Implementation Decisions

- **Architecture**: Next.js (App Router, TypeScript) for web application rendering and API routes, connected to a lightweight Go microservice (or internal Next.js API route executing local `go` binary) for RCE execution.
- **RCE Engine Strategy**: Host-local execution in temporary `/tmp` directories backed by RAM (`tmpfs`). Temporary files are deleted immediately after `go test -json` execution via `defer os.RemoveAll(tmpDir)`.
- **Database Schema**: SQLite managed via Drizzle ORM storing `users`, `modules`, `chapters`, `user_progress`, and `submissions`.
- **Curriculum Format**: MDX files and associated `.go` starter/test files stored under `content/modules/01-fundamentals/...`.
- **UI & Aesthetics**: Language-agnostic Vercel-style light/dark mode using a Zinc/Slate neutral palette with Violet/Indigo highlights, Inter/Outfit for UI typography, and JetBrains Mono for code.
- **Mastery Mechanics**: 
  - Socratic Hints tab providing conceptual nudges without direct code snippets.
  - Performance tab parsing `go test -benchmem` output for `allocs/op` and `B/op`.
  - Solution unlock rule: Disabled until submission success OR 3 failed attempts.

## Testing Decisions

Good tests verify external system behavior and contracts, not internal private implementation details.

### Seams for Testing:

1. **RCE Engine Integration Seam (`/api/rce/execute`)**:
   - **Type**: Integration test.
   - **Behavior Tested**: Sends raw Go solution code and test files to the RCE endpoint; verifies JSON response containing test results, pass/fail statuses, compile error outputs, timeout enforcement, and memory allocation metrics.
   - **Seam Location**: HTTP API boundary between Next.js server and RCE Execution Service.

2. **Progression & Submission Database Seam (`/api/submissions`)**:
   - **Type**: API & Database Integration test.
   - **Behavior Tested**: Submitting a passing solution marks the chapter as completed in SQLite, updates user progress %, and unlocks the next sequential chapter; submitting a failing solution increments failed attempts count without unlocking.
   - **Seam Location**: Server Action / API Route boundary.

3. **End-to-End UI & Editor Seam (Playwright E2E)**:
   - **Type**: E2E browser test.
   - **Behavior Tested**: User navigates to a Challenge Chapter, edits code in Monaco Editor, clicks Submit, and observes terminal pane updating with test results and progress state changing.
   - **Seam Location**: Full browser DOM interaction layer.

## Out of Scope

- Multi-tenant cloud sandbox isolation (e.g. AWS Firecracker / microVM cluster) — local single-user execution is used.
- Public user registration, OAuth social logins, or subscription payments.
- Real-time multiplayer co-coding or classroom instructor dashboards.
- Live MCP Server voice agent (deferred to V2 roadmap as per ADR 0006).

## Further Notes

- All domain terminology strictly aligns with [CONTEXT.md](file:///home/rubic/projects/github.com/rubichandrap/bootcamp/CONTEXT.md).
- Architectural trade-offs and decisions are documented in ADRs `0001` through `0006` under `docs/adr/`.
