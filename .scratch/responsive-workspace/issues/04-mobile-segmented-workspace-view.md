# 04 — Mobile Segmented Workspace View & Monaco Touch Optimization

**What to build:** Learners practicing Challenge & Assessment Chapters on mobile devices (< 768px) see a top segmented tab bar (`[📖 Guide]` | `[💻 Code]` | `[⚡ Terminal]`) switching between 100% full-width views, with dynamic viewport height (`100dvh`), Monaco Editor touch optimizations (`wordWrap: 'on'`, 14px font), and clear tap action buttons (`[RUN TESTS]`, `[SOCRATIC HINT]`).

**Blocked by:** 01 — Touch-Enabled Drag Resizing & Utilities Prefactoring, 03 — Responsive Curriculum Navigation Overlay Drawer

**Status:** ready-for-agent

- [ ] Challenge and Assessment Chapters on mobile viewports (< 768px) display a top segmented control (`[📖 Guide]`, `[💻 Code]`, `[⚡ Terminal]`) to switch full-width views.
- [ ] Application page container uses `100dvh` (Dynamic Viewport Height) to prevent soft keyboard and browser address bar height distortion.
- [ ] Monaco Code Editor enables `wordWrap: 'on'`, `touchSupport: true`, and 14px font size on mobile screens.
- [ ] Bottom action buttons display clean, touch-friendly tap targets (`[RUN TESTS]` and `[SOCRATIC HINT]`) without cluttering keyboard shortcuts.
- [ ] On tablet and desktop screens (≥ 768px), standard side-by-side split view resumes.
