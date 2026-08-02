# 02 — Monaco Editor Model Isolation & Ctrl + Z Bug Fix

**What to build:** Eliminate the Monaco Editor `Ctrl + Z` undo code reversion bug by keying `CodeEditor` instances by `${currentChapter?.slug}-${activeTab}` and updating `useChallengeSession` initialization to ensure every chapter receives a clean text model with an isolated undo stack.

**Blocked by:** None — can start immediately.

**Status:** done

- [x] `CodeEditor` receives explicit key/path scoping per chapter and active tab.
- [x] `useChallengeSession` avoids setting dummy `DEFAULT_STARTER_CODE` prior to chapter initialization.
- [x] Navigating to Hello World Go and pressing `Ctrl + Z` no longer reverts code to `Add`/`Factorial`.
- [x] All unit tests in `src/hooks/useChallengeSession.test.ts` pass cleanly.
