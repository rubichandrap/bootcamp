import { describe, it, expect } from 'vitest';
import {
  getAllTracks,
  getTrackBySlug,
  getTrack,
  getModule,
  getChapter,
  getAllModules,
  getChapterBySlug,
} from './contentEngine';

describe('Curriculum Content Engine', () => {
  it('should list all language tracks (go, typescript)', () => {
    const tracks = getAllTracks();
    expect(tracks.length).toBeGreaterThanOrEqual(2);
    const goTrack = tracks.find((t) => t.slug === 'go');
    const tsTrack = tracks.find((t) => t.slug === 'typescript');

    expect(goTrack).toBeDefined();
    expect(goTrack?.title).toBe('Go Mastery');
    expect(tsTrack).toBeDefined();
    expect(tsTrack?.title).toBe('TypeScript Mastery');
  });

  it('should get a track by slug using getTrack and getTrackBySlug', () => {
    const tsTrack = getTrack('typescript');
    expect(tsTrack).not.toBeNull();
    expect(tsTrack?.modules.length).toBeGreaterThan(0);
    expect(tsTrack?.modules[0].slug).toBe('00-basics');
    expect(getTrackBySlug('typescript')).toEqual(tsTrack);
  });

  it('should get a module by track and module slug using getModule', () => {
    const mod = getModule('typescript', '00-basics');
    expect(mod).not.toBeNull();
    expect(mod?.title).toContain('TypeScript Fundamentals');
  });

  it('should get a chapter using getChapter and getChapterBySlug', () => {
    const ch = getChapter('typescript', '00-basics', '07-basics-assessment');
    expect(ch).not.toBeNull();
    expect(ch?.type).toBe('assessment');
    expect(ch?.title).toContain('Module 00');
  });

  it('should list modules for default or specific track', () => {
    const defaultModules = getAllModules();
    expect(defaultModules.length).toBeGreaterThan(0);
    expect(defaultModules[0].slug).toBe('00-basics');

    const tsModules = getAllModules('typescript');
    expect(tsModules.length).toBeGreaterThan(0);
  });

  it('should load MDX content for track-aware chapter lookup', () => {
    const goChapter = getChapterBySlug('go', '01-fundamentals', '01-structs-reading');
    expect(goChapter).not.toBeNull();
    expect(goChapter?.title).toContain('Structs');
    expect(goChapter?.trackSlug).toBe('go');

    const tsChapter = getChapterBySlug('typescript', '00-basics', '01-hello-world-reading');
    expect(tsChapter).not.toBeNull();
    expect(tsChapter?.title).toContain('TypeScript');
    expect(tsChapter?.trackSlug).toBe('typescript');
  });
});
