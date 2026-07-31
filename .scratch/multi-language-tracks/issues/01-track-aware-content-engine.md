# 01 — Track-Aware Content Directory & Content Engine

**What to build:** Reorganize curriculum content under language track directories (`content/tracks/go/modules/` and `content/tracks/typescript/modules/`) and update the Content Engine to load tracks, modules, and chapters dynamically by `trackSlug`.

**Blocked by:** None — can start immediately

**Status:** ready-for-agent

- [ ] Go modules are migrated to `content/tracks/go/modules/`.
- [ ] Initial TypeScript modules directory is established at `content/tracks/typescript/modules/` with at least one starter module.
- [ ] Content Engine exports `getAllTracks()`, `getTrack(trackSlug)`, `getModule(trackSlug, moduleSlug)`, and `getChapter(trackSlug, moduleSlug, chapterSlug)`.
- [ ] Unit tests for `contentEngine` pass cleanly.
