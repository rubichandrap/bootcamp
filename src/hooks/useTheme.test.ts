import { describe, it, expect, beforeEach } from 'vitest';
import { resolveInitialTheme, getMonacoTheme, Theme } from './useTheme';

describe('Theme Service & State Resolution', () => {
  beforeEach(() => {
    // Clear mock storage
    if (typeof globalThis.localStorage !== 'undefined') {
      globalThis.localStorage.clear();
    }
  });

  it('should resolve default theme as "dark" when no stored theme or prefers-color-scheme exists', () => {
    const theme = resolveInitialTheme(null, false);
    expect(theme).toBe('dark');
  });

  it('should prioritize stored theme over system preference', () => {
    const themeFromLightStorage = resolveInitialTheme('light', true);
    expect(themeFromLightStorage).toBe('light');

    const themeFromDarkStorage = resolveInitialTheme('dark', false);
    expect(themeFromDarkStorage).toBe('dark');
  });

  it('should fall back to light mode if system prefers light and no stored theme exists', () => {
    const theme = resolveInitialTheme(null, true);
    expect(theme).toBe('light');
  });

  it('should map theme to correct Monaco Editor theme name', () => {
    expect(getMonacoTheme('dark')).toBe('vs-dark');
    expect(getMonacoTheme('light')).toBe('vs');
  });
});
