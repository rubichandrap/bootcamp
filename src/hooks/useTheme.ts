'use client';

import { useState, useEffect, useCallback } from 'react';

export type Theme = 'dark' | 'light';

export const STORAGE_KEY = 'go_mastery_theme';

export function resolveInitialTheme(
  stored: string | null,
  systemPrefersLight: boolean
): Theme {
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }
  if (systemPrefersLight) {
    return 'light';
  }
  return 'dark';
}

export function getMonacoTheme(theme: Theme): string {
  return theme === 'dark' ? 'vs-dark' : 'vs';
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    const systemPrefersLight =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: light)').matches;

    const initialTheme = resolveInitialTheme(stored, systemPrefersLight);
    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, theme);
    }
  }, [theme, mounted]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return {
    theme,
    toggleTheme,
    monacoTheme: getMonacoTheme(theme),
    mounted,
  };
}
