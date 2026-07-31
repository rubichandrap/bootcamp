import { useState, useEffect } from 'react';

export const TRACK_STORAGE_KEY = 'active_track_slug';
export const DEFAULT_TRACK = 'go';

export function getStoredTrack(): string {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(TRACK_STORAGE_KEY);
    if (stored) return stored;
  }
  return DEFAULT_TRACK;
}

export function useTrack(initialTrack?: string) {
  const [activeTrack, setActiveTrack] = useState<string>(() => {
    if (initialTrack) return initialTrack;
    return getStoredTrack();
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem(TRACK_STORAGE_KEY, activeTrack);
    }
  }, [activeTrack]);

  const changeTrack = (newTrack: string) => {
    setActiveTrack(newTrack);
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem(TRACK_STORAGE_KEY, newTrack);
    }
  };

  return { activeTrack, changeTrack };
}
