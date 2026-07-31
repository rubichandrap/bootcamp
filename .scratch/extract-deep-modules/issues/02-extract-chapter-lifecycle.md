# 02 — Extract Chapter Lifecycle service + hook + tests

**What to build:** Chapter state management (Modules, current Chapter, navigation) extracted from the page shell into service functions backed by the /api/modules API, with a thin React hook adapter.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Service functions created: `fetchModules`, `fetchChapter`, `findNextChapter` (pure)
- [ ] `useChapterLifecycle` hook created with Chapter state + methods
- [ ] `findNextChapter` tested as pure function with edge cases (last chapter, empty modules, middle chapter)
- [ ] `fetchModules` and `fetchChapter` tested with mocked `fetch`
- [ ] `advanceToNextChapter` delegates to `findNextChapter` + `selectChapter`
