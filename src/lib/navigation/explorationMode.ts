export function isChapterAccessible(
  targetChapterSlug: string,
  completedChapterSlugs: string[],
  allChapterSlugs: string[],
  isFreeExploration: boolean
): boolean {
  if (isFreeExploration) {
    return true;
  }

  const targetIndex = allChapterSlugs.indexOf(targetChapterSlug);
  if (targetIndex === -1 || targetIndex === 0) {
    return true; // First chapter is always accessible
  }

  const prevChapterSlug = allChapterSlugs[targetIndex - 1];
  return completedChapterSlugs.includes(targetChapterSlug) || completedChapterSlugs.includes(prevChapterSlug);
}
