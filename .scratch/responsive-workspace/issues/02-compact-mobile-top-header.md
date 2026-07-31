# 02 — Compact Mobile Top Header & Drawer Toggle

**What to build:** Learners on mobile and tablet screens (< 640px) see a clean, single-row top header featuring a Hamburger Menu icon button to toggle curriculum navigation, gracefully truncated title text, and icon-only search (`Search` icon) and theme toggle (`Moon`/`Sun` icon) buttons.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] `TerminalHeader` renders a Hamburger Menu icon button on mobile/tablet viewports (`lg:hidden`) to toggle drawer state.
- [ ] On mobile viewports (< 640px), search trigger collapses to an icon-only button and theme toggle collapses to a sun/moon icon button.
- [ ] Header titlebar text truncates smoothly on narrow viewports without overflowing window controls or right-aligned action buttons.
- [ ] Unit tests for `TerminalHeader` compact mode and callback execution pass cleanly.
