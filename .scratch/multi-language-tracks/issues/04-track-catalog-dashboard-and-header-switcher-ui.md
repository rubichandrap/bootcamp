# 04 — Track Catalog Page, Dashboard Routes & Header Switcher UI

**What to build:** Build the `/tracks` catalog page, language dashboard routes `/tracks/[trackSlug]`, updated chapter workspace routes `/tracks/[trackSlug]/[moduleSlug]/[chapterSlug]`, and global Header Track Switcher component with active track persistence.

**Blocked by:**
- 01 — Track-Aware Content Directory & Content Engine
- 02 — Database Schema & Track-Specific Progress Tracker
- 03 — Decoupled Polymorphic RCE Engine & TypeScript Runner

**Status:** ready-for-agent

- [ ] `/tracks` page displays all available language tracks (Go, TypeScript) with completion progress bars.
- [ ] `/tracks/[trackSlug]` renders the module list for the selected track.
- [ ] Header includes a Track Selector dropdown allowing seamless switching between Go and TypeScript tracks.
- [ ] Active track preference persists across sessions (localStorage/cookie).
- [ ] Legacy routes (`/modules/...`) redirect gracefully to `/tracks/go/modules/...`.
- [ ] End-to-end user navigation flow verified and UI tests pass cleanly.
