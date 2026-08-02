# 03 — Curriculum Content Engine & Reading Chapters

**What to build:** A file-based MDX content engine that loads articles from `content/modules/`, rendering Reading Chapters with Markdown typography, syntax-highlighted code blocks, a sidebar table of contents, and a "Mark as Read / Next Chapter" progress handler.

**Blocked by:** 02 — SQLite Schema & Progress Tracking Persistence

**Status:** done

- [x] Content loader service reading MDX files and metadata from `content/modules/`.
- [x] MDX rendering component with high-contrast typography, heading anchors, and syntax highlighting for Go code blocks.
- [x] Chapter layout with sidebar navigation displaying Module titles and Chapter status badges.
- [x] "Mark as Read" button updating chapter completion status in SQLite and advancing to the next chapter.
