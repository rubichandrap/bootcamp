export type TrackSlug = 'go' | 'typescript';

export interface TrackConfig {
  title: string;
  language: 'go' | 'typescript';
  codeFile: string;
  testFile: string;
  solutionFile: string;
}

export const TRACK_CONFIG: Record<TrackSlug, TrackConfig> = {
  go: {
    title: 'Go Mastery',
    language: 'go',
    codeFile: 'main.go',
    testFile: 'main_test.go',
    solutionFile: 'solution.go',
  },
  typescript: {
    title: 'TypeScript Mastery',
    language: 'typescript',
    codeFile: 'solution.ts',
    testFile: 'solution.test.ts',
    solutionFile: 'solution.ts',
  },
};

export function getTrackConfig(trackSlug: TrackSlug): TrackConfig {
  return TRACK_CONFIG[trackSlug];
}
