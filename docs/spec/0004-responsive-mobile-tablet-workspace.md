# Technical Specification: Responsive Mobile & Tablet Workspace Layout

**Spec ID**: 0004  
**Title**: Responsive Mobile & Tablet Workspace Layout  
**Status**: Draft / Ready for Implementation  

---

## Problem Statement

Learners attempting to practice Go on mobile smartphones (portrait/landscape) or tablet touch devices experience significant usability barriers:
- The fixed horizontal desktop split between the **Reading Chapter** guide and **Monaco Code Editor** / **RCE Engine** console causes heavy horizontal crowding and double-scrolling on screens under 768px wide.
- The `SidebarNav` (curriculum track tree) consumes fixed horizontal width and cannot be collapsed or toggled on narrow viewports.
- Resizing handles for panel splits depend solely on mouse events (`onMouseDown`), breaking drag interaction for touch-screen tablet users.
- Desktop action bars display dense text and keyboard shortcut badges (e.g. `[CMD+K]`, `[MODE: DARK]`, `⌘↵`) that overflow on small screens and are inefficient for touch-first interactions.

---

## Solution

The **Go Mastery Platform** will feature an adaptive **Workspace Layout** that seamlessly adjusts across screen sizes:
1. On mobile viewports (`< 768px`), the workspace transitions into a **Segmented Workspace View** with a top control bar (`[📖 Guide]` | `[💻 Code]` | `[⚡ Terminal]`) displaying each view at 100% full width to maximize readable and editable screen area.
2. The `SidebarNav` converts into a responsive slide-over overlay drawer on screens under 1024px, accessible via a prominent Hamburger Menu button in `TerminalHeader` and dismissible by tapping the backdrop overlay or choosing a Chapter.
3. Panel resizers in `useResizableLayout` will bind both touch events (`onTouchStart`, `onTouchMove`, `onTouchEnd`) and mouse events, with touch targets expanded to a 24px invisible hit region.
4. `TerminalHeader` becomes compact on mobile screens (`< 640px`), truncating titles and collapsing action badges (`[CMD+K]`, `[MODE: DARK]`) into touchable icon buttons.
5. The application container adopts Dynamic Viewport Height (`100dvh`) to accommodate dynamic browser chrome and soft keyboards smoothly.

---

## User Stories

1. As a mobile learner on a smartphone, I want a hamburger menu button in the header so that I can open the curriculum navigation drawer from any page.
2. As a mobile learner, I want the `SidebarNav` drawer to slide in over the workspace when opened, so that it does not squeeze my reading or coding area.
3. As a mobile learner, I want the `SidebarNav` drawer to automatically close when I select a Chapter, so that I immediately see the lesson content without extra taps.
4. As a mobile learner, I want to tap outside the `SidebarNav` drawer on a semi-transparent backdrop overlay to dismiss it.
5. As a mobile learner studying a Challenge Chapter, I want a top segmented tab bar (`Guide`, `Code`, `Terminal`) so that I can focus on one full-screen view at a time without horizontal scrolling.
6. As a mobile learner, I want the Monaco Code Editor to take up 100% width in Code mode with word wrapping enabled (`wordWrap: 'on'`), so that long lines of Go code do not overflow horizontally off screen.
7. As a mobile learner, I want Monaco Editor font sizing to adjust for touch screens (14px font size), so that code is easily readable and editable on small screens.
8. As a mobile learner using a soft keyboard, I want the workspace layout to use dynamic viewport height (`100dvh`), so that opening the keyboard does not distort or break layout boundaries.
9. As a mobile learner, I want clear tap buttons (`[RUN TESTS]` and `[SOCRATIC HINT]`) without cluttering keyboard shortcut hints (`⌘↵`), so that the interface is tailored for touch input.
10. As a tablet learner (768px – 1024px), I want a dual-pane split view preserved so that I can reference reading materials while typing Go code.
11. As a tablet learner, I want panel drag handles to respond smoothly to touch gestures (`onTouchStart`/`onTouchMove`), so that I can resize the guide and editor panes with my finger or stylus.
12. As a tablet learner, I want drag resizer handles to have an enlarged 24px touch hitbox, so that I can easily grab and drag resizers without precision tapping frustration.
13. As a learner on a narrow screen (< 640px), I want header action controls (`[CMD+K]`, `[MODE: DARK]`) to collapse into icon-only buttons (`Search`, `Moon`/`Sun`), so that header controls fit on a single row without wrapping.
14. As a learner on a narrow screen, I want the header titlebar text to truncate gracefully (`go-mastery-cli`), so that window controls and action icons remain accessible.

---

## Implementation Decisions

1. **Responsive State in Page Shell (`src/app/page.tsx`)**:
   - Add state for mobile drawer (`isSidebarOpen: boolean`) and mobile workspace active tab (`activeMobileTab: 'guide' | 'code' | 'terminal'`).
   - Use CSS Tailwind breakpoint classes (`hidden md:flex`, `hidden lg:block`, `w-full md:w-auto`) for layout transitions.

2. **Mobile Navigation Overlay Drawer (`SidebarNav`)**:
   - Wrap `SidebarNav` in a fixed slide-over container on `< 1024px` viewports (`fixed inset-y-0 left-0 z-50 transform transition-transform`).
   - Render a semi-transparent backdrop overlay (`fixed inset-0 bg-black/50 z-40 lg:hidden`) when open.

3. **Touch-Enabled Drag Resizing (`useResizableLayout`)**:
   - Extend `useResizableLayout` hook with touch event listeners (`touchstart`, `touchmove`, `touchend`).
   - Standardize client coordinate extraction from either `MouseEvent` (`clientX/clientY`) or `TouchEvent` (`touches[0].clientX/clientY`).

4. **Compact Header Controls (`TerminalHeader`)**:
   - Update `TerminalHeader` interface to accept `onToggleSidebar` callback and `isSidebarOpen` state.
   - Render a `Menu` icon button on mobile/tablet viewports (`lg:hidden`).
   - Render search and theme controls conditionally as labeled badges on desktop (`hidden sm:flex`) and icon buttons on mobile (`flex sm:hidden`).

5. **Monaco Touch Settings (`CodeEditor`)**:
   - Update `CodeEditor` options with `wordWrap: 'on'`, `touchSupport: true`, `fontSize: 14` on mobile viewports.

---

## Testing Decisions

### Seams to Test
- **Unit Seam 1 (`src/hooks/useResizableLayout.ts`)**: Test that resizer math logic correctly computes percentages and bounds for both touch and mouse position coordinates.
- **Unit Seam 2 (`src/components/TerminalHeader.tsx`)**: Test header title formatting, responsive badge/icon rendering, and drawer toggle callback execution.
- **Unit Seam 3 (`src/components/SidebarNav.tsx`)**: Test drawer backdrop click and chapter selection auto-close event triggers.

### Testing Best Practices
- Tests must verify purely external component behaviors, helper outputs, and hook state mutations without mocking DOM layout engines.

---

## Out of Scope

- Offline PWA code execution or local offline Go compiler.
- Custom mobile hardware keyboard mapping shortcuts (e.g. iPad physical Magic Keyboard bindings).

---

## Further Notes

- All changes adhere strictly to the project's domain model defined in [`CONTEXT.md`](file:///home/rubic/projects/github.com/rubichandrap/bootcamp/CONTEXT.md), maintaining ubiquitous language around **Track**, **Module**, **Chapter**, **RCE Engine**, **Theme Engine**, and **Workspace Layout**.
