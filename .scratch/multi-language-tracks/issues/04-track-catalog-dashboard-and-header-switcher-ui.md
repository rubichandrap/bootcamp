# 04 — Track Catalog Page, Dashboard Routes & Header Switcher UI

**What to build:** Build the `/tracks` catalog page, language dashboard routes `/tracks/[trackSlug]`, updated chapter workspace routes `/tracks/[trackSlug]/[moduleSlug]/[chapterSlug]`, and global Header Track Switcher component with active track persistence.

**Blocked by:**
- 01 — Track-Aware Content Directory & Content Engine
- 02 — Database Schema & Track-Specific Progress Tracker
- 03 — Decoupled Polymorphic RCE Engine & TypeScript Runner

**Status:** done

- [x] `/tracks` page displays all available language tracks (Go, TypeScript) with completion progress bars.
- [x] `/tracks/[trackSlug]` renders the module list for the selected track.
- [x] Header includes a Track Selector dropdown allowing seamless switching between Go and TypeScript tracks.
- [x] Active track preference persists across sessions (localStorage/cookie).
- [x] Legacy routes (`/modules/...`) redirect gracefully to `/tracks/go/modules/...`.
- [x] End-to-end user navigation flow verified and UI tests pass cleanly.
