import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  useResizableLayout,
  getEventPosition,
  calculateSidebarWidth,
  calculateWorkspaceSplit,
  calculateConsoleHeight,
} from './useResizableLayout';

describe('useResizableLayout hook & helpers', () => {
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

  describe('Drag coordinate and dimension helpers', () => {
    it('extracts client coordinates from MouseEvent and TouchEvent', () => {
      const mouseEv = { clientX: 250, clientY: 400 } as MouseEvent;
      expect(getEventPosition(mouseEv)).toEqual({ clientX: 250, clientY: 400 });

      const touchEv = {
        touches: [{ clientX: 300, clientY: 500 }],
      } as unknown as TouchEvent;
      expect(getEventPosition(touchEv)).toEqual({ clientX: 300, clientY: 500 });
    });

    it('clamps sidebar width within min/max bounds', () => {
      expect(calculateSidebarWidth(100)).toBe(180);
      expect(calculateSidebarWidth(300)).toBe(300);
      expect(calculateSidebarWidth(600)).toBe(480);
    });

    it('calculates workspace split percentage accurately within bounds', () => {
      // container left 0, width 1000 => offset 500 = 50%
      expect(calculateWorkspaceSplit(500, 0, 1000)).toBe(50);
      // offset 100 = 10% => clamped to min 20%
      expect(calculateWorkspaceSplit(100, 0, 1000)).toBe(20);
      // offset 900 = 90% => clamped to max 80%
      expect(calculateWorkspaceSplit(900, 0, 1000)).toBe(80);
    });

    it('calculates console height from bottom boundary accurately', () => {
      // bottom 600, clientY 400 => height = 200
      expect(calculateConsoleHeight(400, 600, 500)).toBe(200);
      // height too small => clamped to min 100
      expect(calculateConsoleHeight(550, 600, 500)).toBe(100);
    });
  });
});

