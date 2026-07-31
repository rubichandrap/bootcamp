# 01 — refactor(challenges): decouple challengeService ports with domain defaults

**What to build:** Make `ports` optional in `challengeService.ts` (`ports?: Partial<RunChallengePorts>`), automatically defaulting unprovided ports to `executeSubmission` (`src/lib/rce/rceEngine.ts`) and `recordSubmission` (`src/lib/progress/progressService.ts`). Add `autoAdvanceDelayMs?: number` defaulting to 1500ms (set to `0` in test environments).

**Blocked by:** None — can start immediately.

**Status:** done

- [x] `ports?: Partial<RunChallengePorts>` is optional in `challengeService.ts`.
- [x] Defaults unprovided ports to `executeSubmission` and `recordSubmission`.
- [x] `autoAdvanceDelayMs?: number` is supported in `RunChallengeParams`.
- [x] Unit tests in `src/lib/challenges/challengeService.test.ts` pass when called without explicit port overrides.
