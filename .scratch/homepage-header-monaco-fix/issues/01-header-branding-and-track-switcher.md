# 01 — Header Titlebar Branding Refactor & UI Track Switcher

**What to build:** Remove `go-mastery-cli v1.0.0` branding jargon from `TerminalHeader` and render clean Unix-style breadcrumbs (`~ / catalog` on homepage, `~ / tracks / <trackSlug> > <moduleTitle>` in workspace). Wire up the Header Track Switcher dropdown to navigate dynamically between language tracks (`/tracks/go`, `/tracks/typescript`).

**Blocked by:** None — can start immediately.

**Status:** completed

- [x] `formatTitlebarText` output updated to clean Unix breadcrumbs without `go-mastery-cli v1.0.0` branding.
- [x] `TerminalHeader` displays `~ / catalog` on homepage and `~ / tracks / <trackSlug> > <moduleTitle>` in workspace.
- [x] Track Switcher dropdown in header changes the active route to `/tracks/[trackSlug]` dynamically.
- [x] All unit tests in `src/components/TerminalHeader.test.ts` pass cleanly.
