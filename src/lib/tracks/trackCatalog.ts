import {
  getAllTracks,
  getTrackBySlug,
  getChapterBySlug,
  TrackMeta,
  ModuleMeta,
  ChapterMeta,
} from '@/lib/content/contentEngine';
import { getTrackProgress } from '@/lib/db/submissionRepo';
import { DEFAULT_USER_ID } from '@/lib/progress/progressTracker';

export interface TrackOverview {
  slug: string;
  title: string;
  description: string;
  language: string;
  totalModules: number;
  totalChapters: number;
  percentage: number;
}

export interface TrackDashboard {
  slug: string;
  title: string;
  description: string;
  language: string;
  percentage: number;
  completedChapterIds: string[];
  modules: ModuleMeta[];
}

export function getAllTracksOverview(userId: string = DEFAULT_USER_ID): TrackOverview[] {
  const tracks = getAllTracks();
  return tracks.map((track) => {
    const totalModules = track.modules.length;
    const totalChapters = track.modules.reduce((acc, m) => acc + m.chapters.length, 0);
    const progress = getTrackProgress(userId, track.slug);

    return {
      slug: track.slug,
      title: track.title,
      description: track.description,
      language: track.language,
      totalModules,
      totalChapters,
      percentage: progress.percentage,
    };
  });
}

export function getTrackDashboard(
  trackSlug: string,
  userId: string = DEFAULT_USER_ID
): TrackDashboard | null {
  const track = getTrackBySlug(trackSlug);
  if (!track) return null;

  const progress = getTrackProgress(userId, trackSlug);

  return {
    slug: track.slug,
    title: track.title,
    description: track.description,
    language: track.language,
    percentage: progress.percentage,
    completedChapterIds: progress.completedChapterIds,
    modules: track.modules,
  };
}

export function getChapterDetails(
  trackSlug: string,
  moduleSlug: string,
  chapterSlug: string
): ChapterMeta | null {
  return getChapterBySlug(trackSlug, moduleSlug, chapterSlug);
}
