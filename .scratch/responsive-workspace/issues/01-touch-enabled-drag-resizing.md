# 01 — Touch-Enabled Drag Resizing & Utilities Prefactoring

**What to build:** Tablet touchscreen users can resize workspace split panels and RCE console panels using smooth touch gestures (`onTouchStart`, `onTouchMove`, `onTouchEnd`) on resize handles, with enlarged 24px touch hitboxes.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] `useResizableLayout` hook captures touch events (`touchstart`, `touchmove`, `touchend`) alongside mouse events for workspace split and console height adjustments.
- [ ] Drag handles expose an invisible 24px touch target hitbox (`-mx-2 px-2` / `-my-2 py-2`) for easy touch manipulation without precise cursor placement.
- [ ] Panel resizing behavior on touch devices maintains state limits (workspace split between 20%–80%, console height between 100px–max).
- [ ] Unit tests for touch and mouse coordinate calculation helpers in `useResizableLayout` pass cleanly.
