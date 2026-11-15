import { describe, it, expect, beforeEach } from 'vitest';
import { MetaManager } from '../../src/meta/MetaManager';
import { clearMetaState } from '../../src/meta/storage';

describe('MetaManager Unit Tests', () => {
  let manager: MetaManager;

  beforeEach(() => {
    clearMetaState();
    manager = new MetaManager();
  });

  it('initializes with default currencies matching reference screenshots', () => {
    const state = manager.getState();
    expect(state.currencies.coins).toBe(10510);
    expect(state.currencies.gems).toBe(44);
    expect(state.activeCountryId).toBe('nicaragua');
    expect(state.countries['nicaragua']?.percent).toBe(63);
    expect(state.profile.trophies).toBe(1090);
    expect(state.profile.rankName).toBe('ĐỒNG II');
  });

  it('adds and spends currencies properly', () => {
    manager.addCoins(500);
    expect(manager.getState().currencies.coins).toBe(11010);

    const spendSuccess = manager.spendCoins(1000);
    expect(spendSuccess).toBe(true);
    expect(manager.getState().currencies.coins).toBe(10010);

    const spendFail = manager.spendCoins(999999);
    expect(spendFail).toBe(false);
    expect(manager.getState().currencies.coins).toBe(10010);
  });

  it('records match results: coins, trophies, country percentage, and missions', () => {
    const res = manager.recordMatchResult(25.5, 3, false);
    expect(res.coinsEarned).toBe(255 + 60);
    expect(res.trophyChange).toBeGreaterThan(0);
    expect(res.newCountryPercent).toBe(63);

    const res2 = manager.recordMatchResult(75.0, 5, true);
    expect(res2.newCountryPercent).toBe(75);
    expect(manager.getState().countries['nicaragua'].percent).toBe(75);
  });

  it('upgrades hero when sufficient cards and coins are available', () => {
    manager.addHeroCards('cuby', 50);
    expect(manager.getState().heroes['cuby'].cards).toBe(51);

    const upgradeSuccess = manager.upgradeHero('cuby');
    expect(upgradeSuccess).toBe(true);
    expect(manager.getState().heroes['cuby'].level).toBe(2);
  });

  it('claims daily missions and opens daily chest with 80% Gold / 10% Ruby / 10% Skin rates', () => {
    const dailyKill = manager.getState().missions.daily.find(m => m.id === 'daily_kill')!;
    dailyKill.completed = true;

    const coinsBefore = manager.getState().currencies.coins;
    const claimed = manager.claimDailyMission('daily_kill');
    expect(claimed).toBe(true);
    expect(manager.getState().currencies.coins).toBe(coinsBefore + 250);

    // 1) Roll 0.45 (< 0.80) -> Gold reward
    const goldRes = manager.openDailyChest(() => 0.45);
    expect(goldRes).not.toBeNull();
    expect(goldRes?.type).toBe('gold');
    expect(manager.getState().missions.dailyChestClaimed).toBe(true);

    // Reset chest claimed to test Ruby (0.85) and Skin (0.95)
    manager.getState().missions.dailyChestClaimed = false;
    const rubyRes = manager.openDailyChest(() => 0.85);
    expect(rubyRes?.type).toBe('ruby');

    manager.getState().missions.dailyChestClaimed = false;
    const skinRes = manager.openDailyChest(() => 0.95);
    expect(skinRes?.type).toBe('skin');
    expect(skinRes?.skinId).toBeTruthy();
  });

  it('tracks 8 representative countries per continent and supports free & VND skin purchases', () => {
    const prog = manager.getContinentProgress('asia');
    expect(prog.total).toBe(8);
    expect(prog.completed).toBe(1); // Vietnam is pre-completed in default state

    // Buy a free common skin without spending coins
    const coinsBefore = manager.getState().currencies.coins;
    const freeOk = manager.buySkin('skin_apple');
    expect(freeOk).toBe(true);
    expect(manager.getState().currencies.coins).toBe(coinsBefore);
    expect(manager.getState().activeSkinId).toBe('skin_apple');

    // Buy a standout Legendary VND skin
    const vndOk = manager.buySkin('skin_golden_king');
    expect(vndOk).toBe(true);
    expect(manager.getState().activeSkinId).toBe('skin_golden_king');
  });
});
