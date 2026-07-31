# Feature Spec: Bootcamp Homepage and Branding

## Problem Statement

The platform currently loads the Go curriculum workspace directly on the root route (`/`) and titles the header as `go-mastery-cli v1.0.0`. First-time visitors cannot easily choose between Go and TypeScript, and returning users do not have a dedicated homepage hub to resume learning.

## Solution

Create an interactive retro terminal-styled Homepage at `/` featuring the **BOOTCAMP** ASCII logo banner, track selection cards for Go and TypeScript with live progress bars, and a "Continue Learning" CTA for returning learners. Update header titlebar text to `bootcamp v1.0.0`.

## User Stories

1. As a learner, I want to see a retro ASCII terminal banner for BOOTCAMP on `/`, so that I am welcomed by a distinct developer platform brand.
2. As a first-time learner visiting `/`, I want to explore Go and TypeScript track cards side-by-side, so that I can choose which language track to start.
3. As a returning learner visiting `/`, I want to see a prominent "Continue Learning: [Active Track]" CTA button, so that I can resume my active language track with one click.
4. As a learner, I want the header titlebar text to display `bootcamp v1.0.0`, so that the shell title is clean and free of `-cli` jargon.

## Implementation Decisions

- Update `TerminalHeader.tsx` `formatTitlebarText` to return `bootcamp v1.0.0 -- track: <trackTitle>`.
- Build `/` homepage component (`src/app/page.tsx`) with ASCII banner container, active track resume hero card, and language track grid.
- Integrate `useTrack` hook and `getTrackProgress` to dynamically highlight active track status.

## Testing Decisions

- Seam: `TerminalHeader.test.ts` for header titlebar formatting (`bootcamp v1.0.0`).
- Seam: `src/app/page.tsx` home page rendering tests.

## Out of Scope

- User authentication / login wall.
