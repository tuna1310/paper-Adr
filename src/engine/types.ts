export interface Point {
  x: number;
  y: number;
}

export type PlayerId = number; // 0 = Neutral, 1 = Human Player, 2..10 = Bots

export type SkinId = string;

export type BotArchetype = 'greedy' | 'cautious' | 'hunter';

export type PlayerStatus = 'alive' | 'dead';

export interface SkinConfig {
  id: SkinId;
  name: string;
  baseColor: string;
  darkColor: string;
  trailColor: string;
  patternType: string;
}

export interface PlayerConfig {
  id: PlayerId;
  name: string;
  color: string;
  darkColor: string;
  skinId: SkinId;
  isBot: boolean;
  archetype?: BotArchetype;
}

export interface DamageAura {
  active: boolean;
  remainingSec: number;
  radius: number;
}

export interface RimBoostState {
  isSliding: boolean;
  charge: number; // 0.0 to 1.0
  boostRemainingSec: number;
  boostFactor: number;
}

export interface KnockbackState {
  active: boolean;
  vx: number;
  vy: number;
  remainingSec: number;
}

export interface CaptureResult {
  playerId: PlayerId;
  capturedCount: number;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  centerPoint: Point;
}

export type CollisionType = 'trail_kill' | 'damage_aura_kill' | 'starvation' | 'head_on_bounce';

export interface CollisionEvent {
  type: CollisionType;
  victimId: PlayerId;
  killerId?: PlayerId;
  location?: Point;
}

export interface ScoreEntry {
  playerId: PlayerId;
  name: string;
  color: string;
  percentage: number;
  kills: number;
  isAlive: boolean;
  isPlayer: boolean;
}

export type PowerUpType = 'speed' | 'damage_aura';

export interface TerritoryTransferWave {
  victimId: PlayerId;
  killerId: PlayerId;
  killerColor: string;
  originX: number;
  originY: number;
  progress: number; // 0.0 to 1.0
  durationSec: number;
}

export interface KillNotification {
  id: number;
  text: string;
  color: string;
  remainingSec: number;
}

export interface PowerUpItem {
  id: number;
  type: PowerUpType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  durationSec: number;
  spawnTime: number;
}
