# Language-Agnostic Design System & Theme Strategy

We decided to build a clean, Vercel-inspired light/dark design system using language-agnostic neutral tones (Slate/Zinc with Violet/Indigo highlights) rather than coupling the visual theme to Go-specific cyan branding.

## Rationale
- **Extensibility**: Allows the platform to support additional language tracks (e.g., Rust, TypeScript, Python, Zig) in the future without visual identity conflicts.
- **Vercel Aesthetics**: Crisp light/dark modes, high-contrast typography (Inter + JetBrains Mono), frosted glass borders, and subtle state indicators (emerald for pass, rose for fail).
