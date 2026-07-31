# 03 — Responsive Curriculum Navigation Overlay Drawer

**What to build:** Learners on mobile and tablet screens (< 1024px) can open the `SidebarNav` track curriculum navigation as a slide-over overlay drawer using the header hamburger button, and dismiss it by selecting a chapter or tapping the semi-transparent backdrop overlay.

**Blocked by:** 02 — Compact Mobile Top Header & Drawer Toggle

**Status:** ready-for-agent

- [ ] On viewports under 1024px, `SidebarNav` renders inside a fixed slide-over overlay drawer container (`fixed inset-y-0 left-0 z-50`).
- [ ] Tapping the semi-transparent backdrop overlay (`fixed inset-0 bg-black/50 z-40`) closes the navigation drawer.
- [ ] Selecting any chapter inside `SidebarNav` automatically dismisses the drawer on mobile/tablet screens.
- [ ] On desktop screens (≥ 1024px), `SidebarNav` renders as a fixed inline left column as before.
