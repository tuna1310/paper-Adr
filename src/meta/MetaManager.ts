import { MetaState, PlayerSettings, ChestRewardResult } from './types';
import { loadMetaState, saveMetaState } from './storage';
import { META_CONFIG } from '../config';
import countriesData from './data/countries.json';
import heroesData from './data/heroes.json';
import missionsData from './data/missions.json';
import skinsData from './data/skins.json';

export class MetaManager {
  private state: MetaState;
  private listeners: Array<(state: MetaState) => void> = [];
  public lastChestReward: ChestRewardResult | null = null;

  constructor() {
    this.state = loadMetaState();
    this.checkDailyReset();
  }

  public getState(): Readonly<MetaState> { return this.state; }

  public subscribe(listener: (state: MetaState) => void): () => void {
    this.listeners.push(listener);
    return () => { this.listeners = this.listeners.filter(l => l !== listener); };
  }

  private notify(): void {
    saveMetaState(this.state);
    this.listeners.forEach(fn => fn(this.state));
  }

  public checkDailyReset(rng: () => number = Math.random): void {
    const today = new Date().toISOString().split('T')[0];
    if (this.state.missions.lastResetDate !== today) {
      this.state.missions.lastResetDate = today;
      const pool = [...missionsData.dailyPool];
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      this.state.missions.daily = pool.slice(0, META_CONFIG.DAILY_MISSIONS_COUNT).map(m => ({
        id: m.id, progress: 0, completed: false, claimed: false
      }));
      this.state.missions.dailyChestClaimed = false;
      this.notify();
    }
  }

  public rerollDailyMission(missionId: string, rng: () => number = Math.random): boolean {
    const idx = this.state.missions.daily.findIndex(m => m.id === missionId);
    if (idx === -1 || this.state.missions.daily[idx].claimed) return false;
    const activeIds = new Set(this.state.missions.daily.map(m => m.id));
    const candidates = missionsData.dailyPool.filter(m => !activeIds.has(m.id));
    if (candidates.length === 0) return false;
    const pick = candidates[Math.floor(rng() * candidates.length)];
    this.state.missions.daily[idx] = { id: pick.id, progress: 0, completed: false, claimed: false };
    this.notify();
    return true;
  }

  public addCoins(amount: number): void {
    if (amount <= 0) return;
    this.state.currencies.coins += amount;
    this.notify();
  }

  public spendCoins(amount: number): boolean {
    if (amount <= 0 || this.state.currencies.coins < amount) return false;
    this.state.currencies.coins -= amount;
    this.notify();
    return true;
  }

  public addGems(amount: number): void {
    if (amount <= 0) return;
    this.state.currencies.gems += amount;
    this.notify();
  }

  public spendGems(amount: number): boolean {
    if (amount <= 0 || this.state.currencies.gems < amount) return false;
    this.state.currencies.gems -= amount;
    this.notify();
    return true;
  }

  public setActiveSkin(skinId: string): boolean {
    if (!this.state.ownedSkins.includes(skinId)) return false;
    this.state.activeSkinId = skinId;
    this.notify();
    return true;
  }

  public buySkin(skinId: string): boolean {
    if (this.state.ownedSkins.includes(skinId)) {
      this.state.activeSkinId = skinId;
      this.notify();
      return true;
    }
    const skin = skinsData.skins.find(s => s.id === skinId) as any;
    if (!skin) return false;

    if (skin.isFree || skin.priceCoins === 0) {
      // Free basic skin
    } else if (skin.priceCoins && skin.priceCoins > 0) {
      if (!this.spendCoins(skin.priceCoins)) return false;
    } else if (skin.priceGems && skin.priceGems > 0) {
      if (!this.spendGems(skin.priceGems)) return false;
    }

    this.state.ownedSkins.push(skinId);
    this.state.activeSkinId = skinId;
    this.progressLifetimeMission('lifetime_skins_20', this.state.ownedSkins.length);
    this.notify();
    return true;
  }

  public setActiveHero(heroId: string): boolean {
    const hero = this.state.heroes[heroId];
    if (!hero || !hero.unlocked) return false;
    this.state.activeHeroId = heroId;
    this.notify();
    return true;
  }

  public addHeroCards(heroId: string, count: number): void {
    if (!this.state.heroes[heroId]) {
      this.state.heroes[heroId] = { id: heroId, level: 1, cards: 0, unlocked: false };
    }
    const hero = this.state.heroes[heroId];
    hero.cards += count;
    if (!hero.unlocked && hero.cards >= 1) hero.unlocked = true;
    this.notify();
  }

  public upgradeHero(heroId: string): boolean {
    const hero = this.state.heroes[heroId];
    if (!hero || !hero.unlocked) return false;
    const heroDef = heroesData.heroes.find(h => h.id === heroId);
    if (!heroDef || hero.level >= heroDef.maxLevel) return false;

    const cardsRequired = heroDef.cardsRequiredPerLevel[hero.level - 1] || 40;
    const coinsRequired = heroDef.coinsPerLevel[hero.level - 1] || 1000;
    if (hero.cards < cardsRequired || this.state.currencies.coins < coinsRequired) return false;

    this.spendCoins(coinsRequired);
    hero.cards -= cardsRequired;
    hero.level += 1;
    this.notify();
    return true;
  }

  public setActiveCountry(countryId: string): void {
    if (countriesData.countries.some(c => c.id === countryId)) {
      this.state.activeCountryId = countryId;
      if (!this.state.countries[countryId]) {
        this.state.countries[countryId] = { id: countryId, percent: 0, completed: false };
      }
      this.notify();
    }
  }

  public getContinentProgress(continentId: string): { completed: number; total: number; isCompleted: boolean } {
    const list = countriesData.countries.filter(c => c.continentId === continentId);
    const completed = list.filter(c => this.state.countries[c.id]?.completed).length;
    return { completed, total: list.length, isCompleted: list.length > 0 && completed >= list.length };
  }

  public recordMatchResult(percentConquered: number, kills: number, isWinner: boolean): {
    coinsEarned: number; trophyChange: number; newCountryPercent: number;
  } {
    const coinsEarned = Math.floor(percentConquered * 10) + kills * 20;
    this.addCoins(coinsEarned);

    const trophyChange = (isWinner || percentConquered >= 20)
      ? Math.min(30, Math.floor(percentConquered / 2) + kills * 3)
      : -5;
    this.state.profile.trophies = Math.max(0, this.state.profile.trophies + trophyChange);

    if (this.state.profile.trophies >= 3000) this.state.profile.rankName = 'CAO THỦ';
    else if (this.state.profile.trophies >= 2000) this.state.profile.rankName = 'VÀNG I';
    else if (this.state.profile.trophies >= 1500) this.state.profile.rankName = 'BẠC I';
    else if (this.state.profile.trophies >= 1000) this.state.profile.rankName = 'ĐỒNG II';
    else this.state.profile.rankName = 'ĐỒNG III';

    const cid = this.state.activeCountryId;
    if (!this.state.countries[cid]) this.state.countries[cid] = { id: cid, percent: 0, completed: false };
    const country = this.state.countries[cid];
    country.percent = Math.min(100, Math.max(country.percent, Math.round(percentConquered)));
    if (country.percent >= 100) country.completed = true;

    this.state.stats.totalMatches += 1;
    this.state.stats.totalKills += kills;
    this.state.stats.maxPercent = Math.max(this.state.stats.maxPercent, percentConquered);
    if (isWinner) this.state.stats.wins += 1;

    this.progressDailyMission('daily_play', 1);
    this.progressDailyMission('daily_kill', kills);
    if (percentConquered >= 20) this.progressDailyMission('daily_percent', 20);
    if (isWinner) this.progressDailyMission('daily_win', 1);

    this.progressLifetimeMission('lifetime_play_75', this.state.stats.totalMatches);
    this.progressLifetimeMission('lifetime_kill_300', this.state.stats.totalKills);
    const completedCountries = Object.values(this.state.countries).filter(c => c.completed).length;
    this.progressLifetimeMission('lifetime_countries_10', completedCountries);

    this.notify();
    return { coinsEarned, trophyChange, newCountryPercent: country.percent };
  }

  public progressDailyMission(missionId: string, addAmount: number): void {
    const mission = this.state.missions.daily.find(m => m.id === missionId);
    const def = missionsData.dailyPool.find(d => d.id === missionId);
    if (mission && !mission.completed && def) {
      mission.progress += addAmount;
      if (mission.progress >= def.target) {
        mission.progress = def.target;
        mission.completed = true;
      }
    }
  }

  private progressLifetimeMission(missionId: string, currentVal: number): void {
    const mission = this.state.missions.lifetime.find(m => m.id === missionId);
    const def = missionsData.lifetimeMilestones.find(d => d.id === missionId);
    if (mission && def) {
      mission.progress = currentVal;
      if (mission.progress >= def.target) {
        mission.progress = def.target;
        mission.completed = true;
      }
    }
  }

  public claimDailyMission(missionId: string): boolean {
    const mission = this.state.missions.daily.find(m => m.id === missionId);
    const def = missionsData.dailyPool.find(d => d.id === missionId);
    if (!mission || !mission.completed || mission.claimed || !def) return false;
    mission.claimed = true;
    this.addCoins(def.rewardCoins);
    this.notify();
    return true;
  }

  /** Opens daily chest with 80% Gold, 10% Ruby, 10% Skin probability. */
  public openDailyChest(rng: () => number = Math.random): ChestRewardResult | null {
    const completedCount = this.state.missions.daily.filter(m => m.completed).length;
    if (completedCount < missionsData.dailyChestRequiredMissions || this.state.missions.dailyChestClaimed) {
      return null;
    }
    this.state.missions.dailyChestClaimed = true;
    const roll = rng();
    const goldThreshold = META_CONFIG.CHEST_GOLD_CHANCE;
    const rubyThreshold = goldThreshold + META_CONFIG.CHEST_RUBY_CHANCE;

    let result: ChestRewardResult;
    if (roll < goldThreshold) {
      const coins = missionsData.dailyChestReward.coins;
      this.addCoins(coins);
      result = { type: 'gold', amount: coins, label: `+${coins} Xu Vàng` };
    } else if (roll < rubyThreshold) {
      const gems = missionsData.dailyChestReward.gems;
      this.addGems(gems);
      result = { type: 'ruby', amount: gems, label: `+${gems} Đá Quý Ruby` };
    } else {
      const unowned = skinsData.skins.filter(s => !this.state.ownedSkins.includes(s.id));
      if (unowned.length > 0) {
        const pick = unowned[Math.floor(rng() * unowned.length)];
        this.state.ownedSkins.push(pick.id);
        this.state.activeSkinId = pick.id;
        this.progressLifetimeMission('lifetime_skins_20', this.state.ownedSkins.length);
        result = { type: 'skin', amount: 1, skinId: pick.id, skinName: pick.name, label: `Skin: ${pick.name}` };
      } else {
        this.addGems(30);
        result = { type: 'ruby', amount: 30, label: '+30 Đá Quý Ruby' };
      }
    }
    this.lastChestReward = result;
    this.notify();
    return result;
  }

  public claimDailyChest(rng: () => number = Math.random): boolean { return this.openDailyChest(rng) !== null; }

  public claimLifetimeMission(missionId: string): boolean {
    const mission = this.state.missions.lifetime.find(m => m.id === missionId);
    const def = missionsData.lifetimeMilestones.find(d => d.id === missionId);
    if (!mission || !mission.completed || mission.claimed || !def) return false;
    mission.claimed = true;
    this.state.profile.stars += def.rewardStars;
    this.notify();
    return true;
  }

  public updateSettings(settings: Partial<PlayerSettings>): void {
    this.state.settings = { ...this.state.settings, ...settings };
    this.notify();
  }
}
export const metaManager = new MetaManager();
