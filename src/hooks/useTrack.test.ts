import { describe, it, expect } from 'vitest';
import { getStoredTrack, DEFAULT_TRACK } from './useTrack';

describe('useTrack logic', () => {
  it('returns default track when localStorage is absent', () => {
    expect(getStoredTrack()).toBe(DEFAULT_TRACK);
  });
});
