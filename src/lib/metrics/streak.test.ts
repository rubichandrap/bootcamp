import { describe, it, expect } from 'vitest';
import { calculateStreak } from './streak';

describe('Streak Metrics Engine', () => {
  it('should return 0 when submission dates are empty', () => {
    expect(calculateStreak([])).toBe(0);
  });

  it('should calculate 1 day streak for today submission', () => {
    const today = new Date().toISOString();
    expect(calculateStreak([today])).toBe(1);
  });

  it('should calculate consecutive multi-day streak accurately', () => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const dayBefore = new Date();
    dayBefore.setDate(today.getDate() - 2);

    const dates = [
      today.toISOString(),
      yesterday.toISOString(),
      dayBefore.toISOString(),
    ];

    expect(calculateStreak(dates)).toBe(3);
  });
});
