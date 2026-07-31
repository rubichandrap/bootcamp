export function getChapterTypeLabel(type: 'reading' | 'challenge' | 'assessment'): string {
  switch (type) {
    case 'reading':
      return 'Reading Article';
    case 'challenge':
      return 'Interactive Challenge';
    case 'assessment':
      return 'Capstone Assessment';
    default:
      return 'Chapter';
  }
}
