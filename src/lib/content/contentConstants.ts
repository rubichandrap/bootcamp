export const READING_PROGRESS_MARKER = '// Reading Chapter Completed';
export const READING_COMPLETION_MARKER = READING_PROGRESS_MARKER;

export function isReadingProgress(code: string): boolean {
  return code.trim() === READING_PROGRESS_MARKER;
}
export const isReadingCompletion = isReadingProgress;
