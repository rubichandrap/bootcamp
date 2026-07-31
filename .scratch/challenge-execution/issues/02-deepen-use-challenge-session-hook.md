# 02 — refactor(challenges): deepen useChallengeSession hook and remove UI port wiring

**What to build:** Deepen `useChallengeSession.ts` to encapsulate raw state setters behind high-level domain action methods (`updateCode`, `updateTestCode`, `selectTab`, `toggleRaceCheck`, `resetForChapter`, `runChallenge`). Remove the 15+ lines of manual `RunChallengePorts` wiring in `src/app/page.tsx`.

**Blocked by:** 01 — refactor(challenges): decouple challengeService ports with domain defaults

**Status:** done

- [x] `useChallengeSession` exposes domain action methods instead of raw `setState` functions.
- [x] `runChallengeSession` inside `useChallengeSession` can be called without passing explicit ports.
- [x] `src/app/page.tsx` is updated to remove manual `RunChallengePorts` callback construction.
- [x] All UI challenge execution flows and Vitest test suites pass without regressions.
