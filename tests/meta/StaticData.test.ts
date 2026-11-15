import { describe, it, expect } from 'vitest';
import countriesData from '../../src/meta/data/countries.json';
import heroesData from '../../src/meta/data/heroes.json';
import missionsData from '../../src/meta/data/missions.json';
import skinsData from '../../src/meta/data/skins.json';

describe('Static Data Verification', () => {
  it('loads 56 countries across 7 continents with valid structure', () => {
    expect(countriesData).toBeDefined();
    expect(countriesData.countries.length).toBe(56);
    const continents = new Set(countriesData.countries.map((c: any) => c.continent));
    expect(continents.size).toBe(7);
    const nicaragua = countriesData.countries.find((c: any) => c.id === 'nicaragua');
    expect(nicaragua).toBeDefined();
    expect(nicaragua?.unlockedByDefault).toBe(true);
  });

  it('loads 6 original heroes with distinct rarities and skills', () => {
    expect(heroesData).toBeDefined();
    expect(heroesData.heroes.length).toBe(6);
    heroesData.heroes.forEach((h: any) => {
      expect(h.id).toBeTruthy();
      expect(h.name).toBeTruthy();
      expect(h.maxLevel).toBeGreaterThanOrEqual(5);
      expect(h.skill).toBeDefined();
    });
  });

  it('loads daily and lifetime missions', () => {
    expect(missionsData).toBeDefined();
    expect(missionsData.dailyPool.length).toBeGreaterThanOrEqual(4);
    expect(missionsData.lifetimeMilestones.length).toBe(5);
    expect(missionsData.dailyChestRequiredMissions).toBe(3);
  });

  it('loads 100 skins categorized across 4 rarities', () => {
    expect(skinsData).toBeDefined();
    expect(skinsData.skins.length).toBe(100);
    const rarities = new Set(skinsData.skins.map((s: any) => s.rarity));
    expect(rarities.has('common')).toBe(true);
    expect(rarities.has('rare')).toBe(true);
    expect(rarities.has('epic')).toBe(true);
    expect(rarities.has('legendary')).toBe(true);
  });
});

