# 9. Bootcamp Homepage and Branding

Date: 2026-08-01

## Status

Accepted

## Context

Originally, the root route (`/`) loaded the Go curriculum workspace directly and titled the header as `go-mastery-cli v1.0.0`. With the transition to a multi-language platform named **Bootcamp**, we need a dedicated landing hub at `/` with ASCII branding, clean titlebar header terminology (`bootcamp v1.0.0`), and intuitive track selection / resume-learning navigation for returning users.

## Decision

1. **Branding & Header Titlebar**:
   Update `formatTitlebarText` in `TerminalHeader.tsx` to display `bootcamp v1.0.0 -- track: <trackTitle>` (removing `-cli` jargon).

2. **Root Homepage Hub (`/`)**:
   Implement a dedicated, terminal-styled homepage at `/` featuring:
   - Retro ASCII Art banner for **BOOTCAMP**.
   - Track cards for **Go** and **TypeScript** with total module counts and progress bars.
   - For returning learners with an active track selected, display a primary **"Continue Learning: <Track Title>"** hero CTA that routes directly to their active track.

3. **Domain Glossary**:
   Update `CONTEXT.md` to reflect `bootcamp v1.0.0` as the canonical header titlebar under `Workspace Layout`.

## Consequences

- First-time visitors are welcomed by a clean, retro terminal homepage presenting both Go and TypeScript tracks.
- Returning learners can resume their active track with a single click.
- Consistent **Bootcamp** branding across header, landing page, and documentation.
