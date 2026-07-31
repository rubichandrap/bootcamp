# 06 — Terminal Box-Framed Dialog Modals (Command Palette & Socratic Hint)

**What to build:** Command Palette modal (`Cmd+K`) and Socratic Hint modal (`Cmd+H`) styled as terminal dialog boxes with sharp 1px box-drawing headers (`┌─ [CMD+K] COMMAND PALETTE ──┐`), high-contrast input fields, and keyboard navigation.

**Blocked by:** 01 — Theme Management System & Global Functional Monochrome Design Tokens

**Status:** done

- [x] Refactor `CommandPaletteModal.tsx` to use terminal box header (`┌─ [CMD+K] COMMAND PALETTE ──┐`) and monospace list items.
- [x] Refactor `SocraticHintModal.tsx` to use terminal dialog framing (`┌─ [HINT SYSTEM] ──┐`) and Amber accents.
- [x] Ensure keyboard navigation (`ArrowUp`/`ArrowDown`/`Enter`/`Escape`) is styled with `>` cursor indicators.
- [x] Add component tests verifying modal render and keyboard selection behavior.
