import heroesData from './data/heroes.json';
import { metaManager } from './MetaManager';

export interface HeroChestOpenResult {
  heroName: string;
  cardsGained: number;
  coinsGained: number;
}

export function openHeroChestPack(
  gemsCost: number,
  cardsCount: number,
  bonusCoins: number,
  rng: () => number = Math.random
): HeroChestOpenResult | null {
  if (!metaManager.spendGems(gemsCost)) return null;
  const heroes = heroesData.heroes;
  const picked = heroes[Math.floor(rng() * heroes.length)] ?? heroes[0];
  metaManager.addHeroCards(picked.id, cardsCount);
  metaManager.addCoins(bonusCoins);
  return {
    heroName: picked.name,
    cardsGained: cardsCount,
    coinsGained: bonusCoins,
  };
}

export function buyCoinBundle(gemsCost: number, coinsGain: number): boolean {
  if (!metaManager.spendGems(gemsCost)) return false;
  metaManager.addCoins(coinsGain);
  return true;
}

export function buyGemBundleVnd(gemsGain: number): void {
  metaManager.addGems(gemsGain);
}
