import { describe, it, expect, beforeEach } from 'vitest';
import { getStoredTrack, setStoredTrack, DEFAULT_TRACK, TRACK_STORAGE_KEY } from './useTrack';

describe('useTrack logic with cookies & localStorage', () => {
  beforeEach(() => {
    let mockCookie = '';
    const mockStorage = new Map<string, string>();

    // Mock global window/localStorage/document for node environment
    (global as unknown as { window: unknown }).window = {};
    (global as unknown as { localStorage: unknown }).localStorage = {
      getItem: (k: string) => mockStorage.get(k) || null,
      setItem: (k: string, v: string) => mockStorage.set(k, v),
      clear: () => mockStorage.clear(),
    };
    (global as unknown as { document: unknown }).document = {
      get cookie() {
        return mockCookie;
      },
      set cookie(val: string) {
        mockCookie = val;
      },
    };
  });

  it('returns default track when no cookie or localStorage is set', () => {
    expect(getStoredTrack()).toBe(DEFAULT_TRACK);
  });

  it('persists selected track to document.cookie and localStorage via setStoredTrack', () => {
    setStoredTrack('typescript');
    expect(document.cookie).toContain(`${TRACK_STORAGE_KEY}=typescript`);
    expect(localStorage.getItem(TRACK_STORAGE_KEY)).toBe('typescript');
    expect(getStoredTrack()).toBe('typescript');
  });
});
