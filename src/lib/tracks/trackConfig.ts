export type TrackSlug = 'go' | 'typescript' | 'python';

export interface TrackConfig {
  title: string;
  language: 'go' | 'typescript' | 'python';
  codeFile: string;
  testFile: string;
  solutionFile: string;
  supportsRaceCheck: boolean;
}

export const TRACK_CONFIG: Record<TrackSlug, TrackConfig> = {
  go: {
    title: 'Go Mastery',
    language: 'go',
    codeFile: 'main.go',
    testFile: 'main_test.go',
    solutionFile: 'solution.go',
    supportsRaceCheck: true,
  },
  typescript: {
    title: 'TypeScript Mastery',
    language: 'typescript',
    codeFile: 'solution.ts',
    testFile: 'solution.test.ts',
    solutionFile: 'solution.ts',
    supportsRaceCheck: false,
  },
  python: {
    title: 'Python Mastery',
    language: 'python',
    codeFile: 'solution.py',
    testFile: 'test_solution.py',
    solutionFile: 'solution.py',
    supportsRaceCheck: false,
  },
};

export function getTrackConfig(trackSlug: TrackSlug): TrackConfig {
  return TRACK_CONFIG[trackSlug];
}
