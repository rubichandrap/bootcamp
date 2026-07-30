import { ModuleMeta, ChapterMeta } from '@/lib/content/contentEngine';

export function searchCurriculum(query: string, modules: ModuleMeta[]): ChapterMeta[] {
  if (!query || query.trim() === '') return [];

  const q = query.toLowerCase().trim();
  const matchedChapters: ChapterMeta[] = [];

  for (const mod of modules) {
    for (const ch of mod.chapters) {
      if (
        ch.title.toLowerCase().includes(q) ||
        ch.slug.toLowerCase().includes(q) ||
        ch.content.toLowerCase().includes(q)
      ) {
        matchedChapters.push(ch);
      }
    }
  }

  return matchedChapters;
}

export function calculateStreak(submissionDates: string[]): number {
  if (submissionDates.length === 0) return 0;

  const dates = submissionDates
    .map((d) => new Date(d).toISOString().split('T')[0])
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort()
    .reverse();

  const today = new Date().toISOString().split('T')[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().split('T')[0];

  if (!dates.includes(today) && !dates.includes(yesterday)) {
    return 0;
  }

  let streak = 0;
  let checkDate = new Date();

  if (!dates.includes(today) && dates.includes(yesterday)) {
    checkDate = yesterdayDate;
  }

  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0];
    if (dates.includes(dateStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
