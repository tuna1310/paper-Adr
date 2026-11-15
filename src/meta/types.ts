export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface ChestRewardResult {
  type: 'gold' | 'ruby' | 'skin';
  amount: number;
  skinId?: string;
  skinName?: string;
  label: string;
}

export interface HeroProgress {
  id: string;
  level: number;
  cards: number;
  unlocked: boolean;
}

export interface CountryProgress {
  id: string;
  percent: number; // 0 to 100
  completed: boolean;
}

export interface DailyMissionState {
  id: string;
  progress: number;
  completed: boolean;
  claimed: boolean;
}

export interface LifetimeMissionState {
  id: string;
  progress: number;
  completed: boolean;
  claimed: boolean;
}

export interface PlayerSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  vibrationEnabled: boolean;
  particlesEnabled: boolean;
}

export interface MetaState {
  version: number;
  profile: {
    name: string;
    level: number;
    stars: number;
    trophies: number;
    rankName: string;
    avatarId: string;
  };
  currencies: {
    coins: number;
    gems: number;
  };
  activeSkinId: string;
  ownedSkins: string[];
  activeHeroId: string;
  heroes: Record<string, HeroProgress>;
  activeCountryId: string;
  countries: Record<string, CountryProgress>;
  missions: {
    lastResetDate: string; // YYYY-MM-DD
    daily: DailyMissionState[];
    dailyChestClaimed: boolean;
    lifetime: LifetimeMissionState[];
  };
  settings: PlayerSettings;
  stats: {
    totalMatches: number;
    totalKills: number;
    maxPercent: number;
    wins: number;
  };
}

