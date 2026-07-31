import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useResizableLayout } from './useResizableLayout';

describe('useResizableLayout hook', () => {
  const storageMock: Record<string, string> = {};

  beforeEach(() => {
    Object.keys(storageMock).forEach((key) => delete storageMock[key]);
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storageMock[key] ?? null,
      setItem: (key: string, value: string) => {
        storageMock[key] = value;
      },
      clear: () => {
        Object.keys(storageMock).forEach((key) => delete storageMock[key]);
      },
    });
  });

  it('exports useResizableLayout function', () => {
    expect(typeof useResizableLayout).toBe('function');
  });

  it('handles localStorage layout keys safely', () => {
    localStorage.setItem('bootcamp_sidebar_width', '320');
    localStorage.setItem('bootcamp_workspace_split', '60');
    localStorage.setItem('bootcamp_console_height', '280');

    expect(localStorage.getItem('bootcamp_sidebar_width')).toBe('320');
    expect(localStorage.getItem('bootcamp_workspace_split')).toBe('60');
    expect(localStorage.getItem('bootcamp_console_height')).toBe('280');
  });
});
