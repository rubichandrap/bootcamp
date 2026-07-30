export interface SocraticHint {
  chapterId: string;
  title: string;
  body: string;
}

const HINTS_MAP: Record<string, SocraticHint> = {
  '02-slice-headers': {
    chapterId: '02-slice-headers',
    title: 'Slice Reallocations Hint',
    body: 'Remember that a Go slice is a 3-word header containing a pointer to an underlying array, a length, and a capacity. When append exceeds capacity, Go allocates a new array and copies elements over. Inspect whether your function mutates the original slice or returns a new slice header.',
  },
  default: {
    chapterId: 'default',
    title: 'Conceptual Nudge Hint',
    body: 'Check your pointer dereferences and return types carefully. Verify table-driven test cases for boundary conditions (zero values, nil slices, and empty structs).',
  },
};

export function getSocraticHint(chapterId: string): SocraticHint {
  return HINTS_MAP[chapterId] || { ...HINTS_MAP.default, chapterId };
}

export interface UnlockParams {
  passed: boolean;
  failedAttempts: number;
}

export function isSolutionUnlocked(params: UnlockParams): boolean {
  if (params.passed) return true;
  return params.failedAttempts >= 3;
}
