# 04 — Migrate Track Route Server Pages to Track Catalog Seam (#47)

**What to build:** Refactor track catalog and dashboard server route components to consume the `TrackCatalog` service module, eliminating direct database repository calls and inline array math from Next.js page files.

**Blocked by:** #46 — Create Deep Track Catalog Service Module for Content & Progress Standing

**Status:** ready-for-agent

- [ ] `TracksCatalogPage` (`src/app/tracks/page.tsx`) queries `getAllTracksOverview` to render track catalog cards.
- [ ] `TrackDashboardPage` (`src/app/tracks/[trackSlug]/page.tsx`) queries `getTrackDashboard` to render module/chapter listings.
- [ ] Removes raw `submissionRepo` calls and inline percentage reductions from server components.
- [ ] Header navigation track switcher draws active track standing from `TrackCatalog`.
