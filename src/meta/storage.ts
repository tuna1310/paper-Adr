import { MetaState } from './types';

const STORAGE_KEY = 'paper_io_2_meta_v1';
const CURRENT_VERSION = 1;

// In-memory fallback if localStorage is unavailable
let memoryStore: Record<string, string> = {};

function getStorage(): { getItem: (k: string) => string | null; setItem: (k: string, v: string) => void; removeItem: (k: string) => void } {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return {
    getItem: (k: string) => memoryStore[k] || null,
    setItem: (k: string, v: string) => { memoryStore[k] = v; },
    removeItem: (k: string) => { delete memoryStore[k]; }
  };
}

export function getDefaultMetaState(): MetaState {
  const today = new Date().toISOString().split('T')[0];
  return {
    version: CURRENT_VERSION,
    profile: {
      name: 'Player',
      level: 1,
      stars: 0,
      trophies: 1090,
      rankName: 'ĐỒNG II',
      avatarId: 'cuby'
    },
    currencies: {
      coins: 10510, // Matching reference image 10,51K
      gems: 44       // Matching reference image 44
    },
    activeSkinId: 'skin_watermelon',
    ownedSkins: ['skin_watermelon'],
    activeHeroId: 'cuby',
    heroes: {
      cuby: { id: 'cuby', level: 1, cards: 1, unlocked: true },
      shieldy: { id: 'shieldy', level: 1, cards: 0, unlocked: false },
      magneto: { id: 'magneto', level: 1, cards: 0, unlocked: false },
      pulsar: { id: 'pulsar', level: 1, cards: 0, unlocked: false },
      blaster: { id: 'blaster', level: 1, cards: 0, unlocked: false },
      titan: { id: 'titan', level: 1, cards: 0, unlocked: false }
    },
    activeCountryId: 'nicaragua',
    countries: {
      nicaragua: { id: 'nicaragua', percent: 63, completed: false }, // Matching reference image 63%
      costa_rica: { id: 'costa_rica', percent: 100, completed: true },
      panama: { id: 'panama', percent: 100, completed: true },
      vietnam: { id: 'vietnam', percent: 100, completed: true }
    },
    missions: {
      lastResetDate: today,
      daily: [
        { id: 'daily_play', progress: 5, completed: true, claimed: true },
        { id: 'daily_kill', progress: 0, completed: false, claimed: false },
        { id: 'daily_percent', progress: 20, completed: true, claimed: true }
      ],
      dailyChestClaimed: false,
      lifetime: [
        { id: 'lifetime_play_75', progress: 75, completed: true, claimed: false },
        { id: 'lifetime_kill_300', progress: 142, completed: false, claimed: false },
        { id: 'lifetime_countries_10', progress: 2, completed: false, claimed: false },
        { id: 'lifetime_skins_20', progress: 5, completed: false, claimed: false },
        { id: 'lifetime_bonus_games_5', progress: 1, completed: false, claimed: false }
      ]
    },
    settings: {
      soundEnabled: true,
      musicEnabled: true,
      vibrationEnabled: true,
      particlesEnabled: true
    },
    stats: {
      totalMatches: 75,
      totalKills: 142,
      maxPercent: 63,
      wins: 2
    }
  };
}

export function loadMetaState(): MetaState {
  try {
    const storage = getStorage();
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      const defaultState = getDefaultMetaState();
      saveMetaState(defaultState);
      return defaultState;
    }
    const parsed = JSON.parse(raw) as MetaState;
    // Migration check if version mismatches
    if (parsed.version !== CURRENT_VERSION) {
      parsed.version = CURRENT_VERSION;
      saveMetaState(parsed);
    }
    return parsed;
  } catch (err) {
    console.warn('Failed to load meta state, reverting to defaults:', err);
    return getDefaultMetaState();
  }
}

export function saveMetaState(state: MetaState): void {
  try {
    const storage = getStorage();
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save meta state:', err);
  }
}

export function clearMetaState(): void {
  const storage = getStorage();
  storage.removeItem(STORAGE_KEY);
  memoryStore = {};
}

