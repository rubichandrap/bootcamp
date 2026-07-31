# Go Mastery Platform

An interactive platform for experienced engineers to master idiomatic Go via reading materials, code execution, and test-driven verification.

## Language

**Track**:
The top-level structured curriculum for mastering Go, containing ordered Modules from beginner to expert.
_Avoid_: Course, pathway, syllabus

**Module**:
A group of related Chapters focused on a cohesive Go theme (e.g., "Fundamentals", "Concurrency & Channels", "Interfaces & Polymorphism").
_Avoid_: Category, section, topic group

**Chapter**:
A distinct learning unit within a Module. Can be a Reading Chapter, Challenge Chapter, or Assessment Chapter.
_Avoid_: Lesson, step

**Reading Chapter**:
A Chapter dedicated to theoretical concepts and code breakdown without an embedded code editor.

**Challenge Chapter**:
A Chapter with embedded Monaco Editor and RCE test runner requiring hands-on coding to make tests pass.

**Assessment Chapter**:
The final Chapter of a Module containing a comprehensive test and submission to prove mastery before unlocking the next Module.

**Submission**:
A learner's submitted Go code for a Challenge or Assessment Chapter sent to the RCE Engine.
_Avoid_: Answer, attempt, code run

**Progress**:
The learner's standing in the Track, derived from Submission records: which Chapters are completed, the daily streak, and per-Chapter failed-attempt counts.
_Avoid_: Completion, achievement, stats

**Streak**:
The number of consecutive days a learner has made at least one Submission.
_Avoid_: Run, chain, streak count

**RCE Engine**:
The Remote Code Execution service responsible for securely building and executing learner submissions against challenge test suites using `go test`.
_Avoid_: Runner, compiler, playground
