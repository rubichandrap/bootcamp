import { useState, useEffect } from 'react';

export const TRACK_STORAGE_KEY = 'active_track_slug';
export const DEFAULT_TRACK = 'go';

export function getStoredTrack(): string {
  if (typeof window !== 'undefined') {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(TRACK_STORAGE_KEY);
      if (stored) return stored;
    }
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(new RegExp(`(?:^|; )${TRACK_STORAGE_KEY}=([^;]*)`));
      if (match) return decodeURIComponent(match[1]);
    }
  }
  return DEFAULT_TRACK;
}

export function setStoredTrack(trackSlug: string): void {
  if (typeof window !== 'undefined') {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(TRACK_STORAGE_KEY, trackSlug);
    }
    if (typeof document !== 'undefined') {
      document.cookie = `${TRACK_STORAGE_KEY}=${encodeURIComponent(trackSlug)}; path=/; max-age=31536000; SameSite=Lax`;
    }
  }
}

export function useTrack(initialTrack?: string) {
  const [activeTrack, setActiveTrack] = useState<string>(() => {
    if (initialTrack) return initialTrack;
    return getStoredTrack();
  });

  useEffect(() => {
    setStoredTrack(activeTrack);
  }, [activeTrack]);

  const changeTrack = (newTrack: string) => {
    setActiveTrack(newTrack);
    setStoredTrack(newTrack);
  };

  return { activeTrack, changeTrack };
}
