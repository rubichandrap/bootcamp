# 04 — Add TypeScript `03-async-patterns` Module

**What to build:** New 7-chapter module covering Promises & the event loop, async/await & typed error handling (Result pattern), and concurrent patterns (`Promise.all`, `allSettled`, `race`, `any`, batching).

**Blocked by:** #03

**Status:** done

- [x] `module.json` created — title "Async Patterns & the Runtime", order 3
- [x] `01-promises-reading.mdx` — Promise<T> anatomy, `.then`/`.catch`/`.finally`, `Promise.resolve`/`reject`, event loop mental model, typing async functions
- [x] `02-promises-challenge.mdx` — `delay`, `withDefault`, `transformAll`
- [x] `03-async-await-reading.mdx` — async/await sugar, error handling with `try/catch`, `err: unknown` pattern, Result pattern, unhandled rejection traps, async arrow functions
- [x] `04-async-await-challenge.mdx` — `tryCatch` (Result wrapper), `retryOnce`, `mapResult`
- [x] `05-concurrent-patterns-reading.mdx` — `Promise.all`, `allSettled`, `race`, `any`, async generators/iterators, concurrency batching
- [x] `06-concurrent-patterns-challenge.mdx` — `withTimeout`, `settleAll`, `firstSuccess`, `batchedAll`
- [x] `07-async-assessment.mdx` — Async Task Scheduler capstone (`runTimed`, `runAll`, `summarize`)
