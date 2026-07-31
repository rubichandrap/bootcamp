# Developer Mastery Platform

An interactive platform for developers (from beginners to experienced engineers) to learn and master programming languages (Go, TypeScript, etc.) via reading materials, code execution, and test-driven verification.

## Language

**Track**:
The top-level structured curriculum dedicated to a specific programming language (e.g., Go, TypeScript), containing ordered Modules from beginner to expert.
_Avoid_: Course, pathway, syllabus

**Track Catalog**:
The service responsible for consolidating Track curriculum structures (Modules, Chapters) with learner Progress standing to expose a unified navigation and catalog overview.
_Avoid_: Track manager, course index, syllabus engine

**Module**:
A group of related Chapters focused on a cohesive language theme (e.g., "Fundamentals", "Concurrency & Channels", "Interfaces & Polymorphism").
_Avoid_: Category, section, topic group

**Chapter**:
A distinct learning unit within a Module. Can be a Reading Chapter, Challenge Chapter, or Assessment Chapter.
_Avoid_: Lesson, step

**Reading Chapter**:
A Chapter dedicated to theoretical concepts, code breakdown, and mental models without an embedded code editor.

**Challenge Chapter**:
A Chapter with an embedded Monaco Editor and RCE test runner, strictly bounded to reinforcing only the concepts taught in its preceding Reading Chapter.

**Assessment Chapter**:
The final Chapter of a Module containing a comprehensive test integrating all concepts in the Module to prove mastery before unlocking the next Module.

**Submission**:
A learner's submitted code for a Challenge or Assessment Chapter sent to the RCE Engine.
_Avoid_: Answer, attempt, code run

**Progress**:
The learner's standing in a Track, derived from Submission records: which Chapters are completed per Track, overall platform progress, daily streak, and per-Chapter failed-attempt counts.
_Avoid_: Completion, achievement, stats

**Streak**:
The number of consecutive days a learner has made at least one Submission across any Track.
_Avoid_: Run, chain, streak count

**RCE Engine**:
The Remote Code Execution service responsible for securely building and executing learner submissions against language-specific test suites (e.g., `go test` for Go, `vitest`/`node` for TypeScript).
_Avoid_: Runner, compiler, playground

**Theme Engine**:
The system responsible for managing and persisting visual workspace themes (Dark vs. Light mode) across the platform UI elements and embedded code editor instances.
_Avoid_: Color scheme switcher, palette toggle

**Workspace Layout**:
The adaptive arrangement of Reading Guide, Code Editor, and RCE Engine console panes within a Chapter view, supporting side-by-side split view on desktop/tablet devices and segmented tabbed views on mobile devices.
_Avoid_: Page grid, split screen wrapper

**Workspace Session**:
The stateful coordination of Chapter lifecycle, Challenge execution, and Progress tracking for a given Track within a Workspace Layout. Distinct from Workspace Layout, which describes the visual arrangement of panes — Workspace Session owns what happens when a learner selects a Chapter, submits code, or marks a Chapter as read.
_Avoid_: Workspace controller, workspace manager, workspace state
