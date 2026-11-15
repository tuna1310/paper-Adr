import { describe, it, expect } from 'vitest';
import {
  RANK_TIERS,
  getRankTierByTrophies,
  LOADING_THEME,
  NAV_THEME,
  SUBSCREEN_THEME,
} from '../../src/ui/theme';

describe('Design Tokens & 27 Rank Tiers (theme.ts)', () => {
  it('defines exact 27 rank tiers matching PO & Video A milestones', () => {
    expect(RANK_TIERS).toHaveLength(27);
    expect(RANK_TIERS[0].displayName).toBe('ĐỒNG I');
    expect(RANK_TIERS[0].minTrophies).toBe(0);
    expect(RANK_TIERS[0].topPercent).toBe(99);

    expect(RANK_TIERS[1].displayName).toBe('ĐỒNG II');
    expect(RANK_TIERS[1].minTrophies).toBe(650);
    expect(RANK_TIERS[1].topPercent).toBe(95);

    expect(RANK_TIERS[2].displayName).toBe('ĐỒNG III');
    expect(RANK_TIERS[2].minTrophies).toBe(1300);
    expect(RANK_TIERS[2].topPercent).toBe(91);

    expect(RANK_TIERS[3].displayName).toBe('BẠC I');
    expect(RANK_TIERS[3].minTrophies).toBe(2620);

    expect(RANK_TIERS[26].displayName).toBe('HUYỀN THOẠI III');
    expect(RANK_TIERS[26].minTrophies).toBe(408490);
    expect(RANK_TIERS[26].topPercent).toBe(1);

    for (let i = 1; i < RANK_TIERS.length; i++) {
      expect(RANK_TIERS[i].minTrophies).toBeGreaterThan(RANK_TIERS[i - 1].minTrophies);
      expect(RANK_TIERS[i].topPercent).toBeLessThan(RANK_TIERS[i - 1].topPercent);
    }
  });

  it('resolves 1588 trophies cleanly as ĐỒNG III (not capped as threshold)', () => {
    expect(getRankTierByTrophies(0).displayName).toBe('ĐỒNG I');
    expect(getRankTierByTrophies(649).displayName).toBe('ĐỒNG I');
    expect(getRankTierByTrophies(650).displayName).toBe('ĐỒNG II');
    expect(getRankTierByTrophies(1588).displayName).toBe('ĐỒNG III');
    expect(getRankTierByTrophies(500000).displayName).toBe('HUYỀN THOẠI III');
  });

  it('exports valid hex colors in screen theme palettes', () => {
    expect(LOADING_THEME.skyTop).toMatch(/^#[0-9A-F]{6}$/);
    expect(NAV_THEME.navBarLight).toMatch(/^#[0-9A-F]{6}$/);
    expect(SUBSCREEN_THEME.gameOver.heartRed).toMatch(/^#[0-9A-F]{6}$/);
  });
});
