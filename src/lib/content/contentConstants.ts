export const READING_COMPLETION_MARKER = '// Reading Chapter Completed';

export function isReadingCompletion(code: string): boolean {
  return code.trim() === READING_COMPLETION_MARKER;
}
