# Bootcamp — Developer Mastery Platform

```text
██████╗ ██████╗ ██████╗ ████████╗██╗  ██╗██████╗ ██████╗████████╗
██╔══██╗██╔══██╗██╔══██╗╚══██╔══╝██║ ██╔╝██╔══██╗██╔═══╝╚══██╔══╝
██████╔╝██║  ██║██║  ██║   ██║   █████╔╝ ██████╔╝██║       ██║   
██╔══██╗██║  ██║██║  ██║   ██║   ██╔═██╗ ██╔══██╗██║       ██║   
██████╔╝██████╔╝██████╔╝   ██║   ██║  ██╗██████╔╝╚██████╗  ██║   
╚═════╝ ╚═════╝ ╚═════╝    ╚═╝   ╚═╝  ╚═╝╚═════╝  ╚═════╝  ╚═╝   
```

An interactive, terminal-style learning platform designed for developers to master programming languages (**Go**, **TypeScript**, and more) through reading guides, Monaco editor challenges, and real-time test-driven Remote Code Execution (RCE).

## Features

- 🎯 **Multi-Language Tracks**: Switch seamlessly between Go and TypeScript curriculums.
- ⚡ **Interactive RCE Engine**: Execute submissions against test suites in real-time (`go test` for Go, `vitest`/`node:test` for TypeScript).
- 🔥 **Unified Daily Streaks**: Keep your daily learning momentum alive across all tracks.
- 📊 **Track-Level & Platform Progress**: Monitor completion metrics per language and overall.
- 🎨 **Adaptive Terminal Workspace**: Responsive workspace with dark/light themes and customizable split panes.

## Getting Started

First, install dependencies and start the local development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the track catalog and start learning.

## Running Tests

Run the Vitest test suite and TypeScript typechecker:

```bash
npx vitest run
npx tsc --noEmit
```

## Architecture & Documentation

- [CONTEXT.md](CONTEXT.md) — Ubiquitous domain language and terminology.
- [docs/adr/](docs/adr/) — Architectural Decision Records (ADRs).
- [docs/specs/](docs/specs/) — Feature specifications and specs.
