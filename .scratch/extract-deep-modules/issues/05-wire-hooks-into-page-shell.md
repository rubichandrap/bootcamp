# 05 — Wire hooks into page shell + remove inline code

**What to build:** Replace all inline state variables, handlers, and effects in page.tsx with the four hooks. The page shell becomes a thin layout composing the modules.

**Blocked by:** Ticket 01, Ticket 02, Ticket 03, Ticket 04.

**Status:** ready-for-agent

- [ ] page.tsx has no inline `fetch` calls — all API access through hooks
- [ ] page.tsx retains only `isHintOpen` and `isPaletteOpen` as state variables (2, down from 13)
- [ ] page.tsx has 4 useEffects: initial load, auto-select first chapter, fetch failed attempts on chapter change, keyboard shortcuts
- [ ] Derived values (isPassed, isUnlocked, progressPercent) computed in page shell from hook state
- [ ] All existing tests pass
- [ ] App behaves identically to before the refactor (no behavioral changes)
