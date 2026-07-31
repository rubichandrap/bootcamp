# 01 — Theme Management System & Global Functional Monochrome Design Tokens

**What to build:** persistent Light/Dark mode switching with local storage memory, root HTML class toggling, global CSS high-contrast monochrome design tokens, Monaco Editor theme synchronization (`vs-dark` / `vs`), and unit test suite for theme resolution.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Implement `useTheme` hook with `localStorage` persistence and `prefers-color-scheme` fallback.
- [ ] Configure `globals.css` monochrome theme variables for background, text, zinc borders, and status colors (green/red/amber).
- [ ] Bind Monaco Editor theme state to `vs-dark` (dark mode) and `vs` (light mode).
- [ ] Add unit tests verifying default theme resolution and theme toggle state behavior.
