export interface SocraticHint {
  chapterId: string;
  title: string;
  body: string;
  solutionCode?: string;
}

export const SOLUTION_UNLOCK_THRESHOLD = 3;

const HINTS_MAP: Record<string, SocraticHint> = {
  '02-slice-headers': {
    chapterId: '02-slice-headers',
    title: 'Slice Reallocations Hint',
    body: 'Remember that a Go slice is a 3-word header containing a pointer to an underlying array, a length, and a capacity. When append exceeds capacity, Go allocates a new array and copies elements over.',
    solutionCode: `package main\n\nfunc AppendInt(slice []int, val int) []int {\n\treturn append(slice, val)\n}\n`,
  },
  default: {
    chapterId: 'default',
    title: 'Conceptual Nudge Hint',
    body: 'Check your pointer dereferences and return types carefully. Verify table-driven test cases for boundary conditions (zero values, nil slices, and empty structs).',
    solutionCode: `package main\n\nfunc Add(a, b int) int {\n\treturn a + b\n}\n`,
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
  return params.failedAttempts >= SOLUTION_UNLOCK_THRESHOLD;
}
