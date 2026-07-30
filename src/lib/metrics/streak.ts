export function calculateStreak(submissionDates: string[]): number {
  if (submissionDates.length === 0) return 0;

  const dateStrings = Array.from(
    new Set(
      submissionDates
        .map((d) => {
          try {
            return new Date(d).toISOString().split('T')[0];
          } catch {
            return null;
          }
        })
        .filter((d): d is string => d !== null)
    )
  )
    .sort()
    .reverse();

  const today = new Date().toISOString().split('T')[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().split('T')[0];

  if (!dateStrings.includes(today) && !dateStrings.includes(yesterday)) {
    return 0;
  }

  let streak = 0;
  let checkDate = new Date();

  if (!dateStrings.includes(today) && dateStrings.includes(yesterday)) {
    checkDate = yesterdayDate;
  }

  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0];
    if (dateStrings.includes(dateStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
