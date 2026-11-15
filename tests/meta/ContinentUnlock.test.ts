import { describe, it, expect } from 'vitest';
import { isContinentUnlocked } from '../../src/meta/continentUnlock';

describe('Continent Sequential Unlock (no bypass)', () => {
  it('unlocks only continent 0 by default and requires 3 completed countries to unlock the next', () => {
    const empty = { completed: 0, total: 8, isCompleted: false };
    const twoDone = { completed: 2, total: 8, isCompleted: false };
    const threeDone = { completed: 3, total: 8, isCompleted: false };

    expect(isContinentUnlocked(0, empty, null, false)).toBe(true);
    expect(isContinentUnlocked(1, empty, empty, false)).toBe(false);
    expect(isContinentUnlocked(1, empty, twoDone, false)).toBe(false);
    expect(isContinentUnlocked(1, empty, threeDone, false)).toBe(true);
  });
});
