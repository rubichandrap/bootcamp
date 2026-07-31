# 04 — Box-Framed Reading Workspace & Monospace Content Engine

**What to build:** Reading Chapters rendered with 100% monospace typography inside terminal box-drawing frames (`┌─ [READING] ... ──┐`), styled code snippets, and action buttons with CLI keyboard shortcut badges (`[MARK AS READ: ↵]`).

**Blocked by:** 01 — Theme Management System & Global Functional Monochrome Design Tokens

**Status:** done

- [x] Wrap `MdxRenderer.tsx` content in terminal box-drawing header panels (`┌─ [READING] ... ──┐`).
- [x] Enforce monospace typography across all markdown headings, paragraphs, and lists.
- [x] Style action buttons with CLI shortcut badges (`[MARK AS READ: ↵]`).
- [x] Add component tests verifying reading chapter rendering and mark-as-read interaction.
