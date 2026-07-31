import { describe, it, expect } from 'vitest';
import {
  getAllTracksOverview,
  getTrackDashboard,
  getChapterDetails,
} from './trackCatalog';

describe('TrackCatalog', () => {
  describe('getAllTracksOverview', () => {
    it('returns an overview array for all tracks with calculated progress percentages', () => {
      const overviews = getAllTracksOverview('test-user');
      expect(Array.isArray(overviews)).toBe(true);
      expect(overviews.length).toBeGreaterThan(0);

      const goTrack = overviews.find((t) => t.slug === 'go');
      expect(goTrack).toBeDefined();
      expect(goTrack?.language).toBeDefined();
      expect(goTrack?.totalModules).toBeGreaterThan(0);
      expect(goTrack?.totalChapters).toBeGreaterThan(0);
      expect(typeof goTrack?.percentage).toBe('number');
    });
  });

  describe('getTrackDashboard', () => {
    it('returns full track structure with modules and progress for a valid track slug', () => {
      const dashboard = getTrackDashboard('go', 'test-user');
      expect(dashboard).not.toBeNull();
      expect(dashboard?.slug).toBe('go');
      expect(typeof dashboard?.percentage).toBe('number');
      expect(Array.isArray(dashboard?.completedChapterIds)).toBe(true);
      expect(dashboard?.modules.length).toBeGreaterThan(0);
    });

    it('returns null for an invalid track slug', () => {
      const dashboard = getTrackDashboard('non-existent-track', 'test-user');
      expect(dashboard).toBeNull();
    });
  });

  describe('getChapterDetails', () => {
    it('returns chapter content for valid track, module, and chapter slugs', () => {
      const chapter = getChapterDetails('go', '00-basics', '01-hello-world-reading');
      expect(chapter).not.toBeNull();
      expect(chapter?.title).toBeDefined();
      expect(chapter?.type).toBe('reading');
    });

    it('returns null for unknown chapter slugs', () => {
      const chapter = getChapterDetails('go', 'invalid-module', 'invalid-chapter');
      expect(chapter).toBeNull();
    });
  });
});
