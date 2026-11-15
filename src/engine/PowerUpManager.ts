import { PowerUpItem, PowerUpType } from './types';
import { GridMap } from './GridMap';
import { Player } from './Player';
import { GAME_CONFIG } from '../config';

export class PowerUpManager {
  readonly items: PowerUpItem[] = [];
  private nextId: number = 1;
  private spawnTimer: number = 1.5;

  update(dt: number, grid: GridMap, players: Player[]): PowerUpItem[] {
    const collected: PowerUpItem[] = [];
    const alivePlayers = players.filter(p => p.status === 'alive');

    // 1. Spawning items (max 4 items in arena at once)
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0 && this.items.length < 4) {
      this.spawnTimer = 4.0 + Math.random() * 3.0;
      // Alternate between speed boost and yellow damage aura
      const type: PowerUpType = Math.random() > 0.45 ? 'damage_aura' : 'speed';
      this.spawnItem(grid, type);
    }

    // 2. Magnet Attraction & Collection (Rule 6)
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      let nearestPlayer: Player | null = null;
      let nearestDistSq = Infinity;

      for (const p of alivePlayers) {
        const dx = p.x - item.x;
        const dy = p.y - item.y;
        const distSq = dx * dx + dy * dy;

        if (distSq <= GAME_CONFIG.MAGNET_ATTRACT_RADIUS * GAME_CONFIG.MAGNET_ATTRACT_RADIUS) {
          if (distSq < nearestDistSq) {
            nearestDistSq = distSq;
            nearestPlayer = p;
          }
        }
      }

      // If within magnet range, pull item toward player with acceleration
      if (nearestPlayer) {
        const dist = Math.sqrt(nearestDistSq);
        if (dist > 0.001) {
          const dirX = (nearestPlayer.x - item.x) / dist;
          const dirY = (nearestPlayer.y - item.y) / dist;

          item.vx += dirX * GAME_CONFIG.MAGNET_PULL_ACCEL * dt;
          item.vy += dirY * GAME_CONFIG.MAGNET_PULL_ACCEL * dt;
        }
      } else {
        // Friction when not pulled
        item.vx *= 0.92;
        item.vy *= 0.92;
      }

      item.x += item.vx * dt;
      item.y += item.vy * dt;

      // Check pickup collision
      let isCollected = false;
      for (const p of alivePlayers) {
        const dx = p.x - item.x;
        const dy = p.y - item.y;
        const pickupRadius = GAME_CONFIG.CHARACTER_RADIUS + item.radius;

        if (dx * dx + dy * dy <= pickupRadius * pickupRadius) {
          if (item.type === 'speed') {
            p.applyBoost(item.durationSec);
          } else if (item.type === 'damage_aura') {
            p.activateDamageAura(item.durationSec);
          }
          collected.push(item);
          this.items.splice(i, 1);
          isCollected = true;
          break;
        }
      }

      if (isCollected) continue;

      // Despawn after 30 seconds
      if (Date.now() - item.spawnTime > 30000) {
        this.items.splice(i, 1);
      }
    }

    return collected;
  }

  spawnItem(grid: GridMap, type: PowerUpType = 'damage_aura', wx?: number, wy?: number): void {
    if (wx !== undefined && wy !== undefined) {
      this.items.push({
        id: this.nextId++,
        type,
        x: wx,
        y: wy,
        vx: 0,
        vy: 0,
        radius: type === 'damage_aura' ? 10 : 12,
        durationSec: type === 'damage_aura' ? GAME_CONFIG.DAMAGE_AURA_DURATION : GAME_CONFIG.BOOST_DURATION_SEC,
        spawnTime: Date.now()
      });
      return;
    }

    for (let attempt = 0; attempt < 25; attempt++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * (GAME_CONFIG.ARENA_RADIUS * 0.75);
      const spawnX = GAME_CONFIG.ARENA_CENTER_X + Math.cos(angle) * dist;
      const spawnY = GAME_CONFIG.ARENA_CENTER_Y + Math.sin(angle) * dist;

      const { gx, gy } = grid.worldToGrid(spawnX, spawnY);
      if (grid.isInsideArena(gx, gy) && grid.get(gx, gy) === GAME_CONFIG.NEUTRAL_CELL) {
        this.items.push({
          id: this.nextId++,
          type,
          x: spawnX,
          y: spawnY,
          vx: 0,
          vy: 0,
          radius: type === 'damage_aura' ? 10 : 12,
          durationSec: type === 'damage_aura' ? GAME_CONFIG.DAMAGE_AURA_DURATION : GAME_CONFIG.BOOST_DURATION_SEC,
          spawnTime: Date.now()
        });
        return;
      }
    }
  }

  clear(): void {
    this.items.length = 0;
  }
}
