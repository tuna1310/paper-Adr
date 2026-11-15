import { Player } from '../engine/Player';
import { GridMap } from '../engine/GridMap';
import { PowerUpManager } from '../engine/PowerUpManager';
import { GAME_CONFIG } from '../config';
import { Point } from '../engine/types';

export class BotController {
  private readonly bots: Player[];
  private readonly grid: GridMap;
  powerUpManager?: PowerUpManager;

  constructor(bots: Player[], grid: GridMap, powerUpManager?: PowerUpManager) {
    this.bots = bots;
    this.grid = grid;
    this.powerUpManager = powerUpManager;
  }

  update(dt: number, allPlayers: Player[]): void {
    for (const bot of this.bots) {
      if (bot.status === 'dead') {
        this.handleRespawn(bot, dt);
        continue;
      }

      this.updateBotSteering(bot, allPlayers);
    }
  }

  private updateBotSteering(bot: Player, allPlayers: Player[]): void {
    const { gx, gy } = this.grid.worldToGrid(bot.x, bot.y);
    const inOwnTerritory = this.grid.get(gx, gy) === bot.id;
    const trailLength = bot.trail.getLength();

    let maxDistance = 280;
    if (bot.archetype === 'cautious') maxDistance = 150;
    if (bot.archetype === 'greedy') maxDistance = 420;

    let desiredAngle = bot.angle;

    // 1. If yellow damage orb is nearby, steer towards it! (Rule 5)
    const nearbyOrbAngle = this.findNearbyOrbAngle(bot);

    // 2. If Hunter, scan for nearby rival trails to cut
    let huntingAngle: number | null = null;
    if (bot.archetype === 'hunter' && trailLength < maxDistance * 0.8) {
      huntingAngle = this.findNearestEnemyTrailAngle(bot, allPlayers);
    }

    // 3. Decide primary intention
    if (!inOwnTerritory && trailLength >= maxDistance) {
      desiredAngle = this.getAngleToNearestTerritory(bot);
    } else if (nearbyOrbAngle !== null) {
      desiredAngle = nearbyOrbAngle;
    } else if (huntingAngle !== null) {
      desiredAngle = huntingAngle;
    } else if (inOwnTerritory) {
      desiredAngle = bot.angle + (Math.random() - 0.5) * 0.4;
    } else {
      const turnBias = bot.archetype === 'cautious' ? 0.35 : 0.18;
      desiredAngle = bot.angle + turnBias;
    }

    // 4. Whisker evaluation for active damage auras & rim boost navigation
    const bestAngle = this.evaluateWhiskers(bot, desiredAngle, allPlayers);
    bot.requestSteerAngle(bestAngle);
  }

  private evaluateWhiskers(bot: Player, preferredAngle: number, allPlayers: Player[]): number {
    const whiskerOffsets = [0, -0.4, 0.4, -0.8, 0.8, -1.3, 1.3, Math.PI];
    let bestScore = -Infinity;
    let chosenAngle = preferredAngle;

    for (const offset of whiskerOffsets) {
      const candidateAngle = preferredAngle + offset;
      let score = 100 - Math.abs(offset) * 20;

      const probeDistances = [35, 70, 110];
      for (const dist of probeDistances) {
        const px = bot.x + Math.cos(candidateAngle) * dist;
        const py = bot.y + Math.sin(candidateAngle) * dist;

        // Threat: Enemy active Damage Aura! (Rule 5)
        for (const rival of allPlayers) {
          if (rival.id === bot.id || rival.status !== 'alive' || !rival.damageAura.active) continue;
          const dx = px - rival.x;
          const dy = py - rival.y;
          const safeDist = rival.damageAura.radius + 30;
          if (dx * dx + dy * dy < safeDist * safeDist) {
            score -= 1000; // RUN AWAY FROM DAMAGE AURA
          }
        }

        // Rim interaction (Rule 4):
        // Sliding along rim is SAFE and beneficial for boost, but don't get stuck heading outwards indefinitely
        const distFromCenter = Math.hypot(px - GAME_CONFIG.ARENA_CENTER_X, py - GAME_CONFIG.ARENA_CENTER_Y);
        if (distFromCenter > GAME_CONFIG.ARENA_RADIUS - 20) {
          // If already fully charged boost on rim, steer inwards to release it
          if (bot.rimBoost.charge >= 0.8) {
            score -= 200;
          }
        }
      }

      if (score > bestScore) {
        bestScore = score;
        chosenAngle = candidateAngle;
      }
    }

    return chosenAngle;
  }

  private findNearbyOrbAngle(bot: Player): number | null {
    if (!this.powerUpManager) return null;
    let closestDistSq = 200 * 200;
    let targetPoint: Point | null = null;

    for (const item of this.powerUpManager.items) {
      if (item.type !== 'damage_aura') continue;
      const dx = item.x - bot.x;
      const dy = item.y - bot.y;
      const dSq = dx * dx + dy * dy;

      if (dSq < closestDistSq) {
        closestDistSq = dSq;
        targetPoint = { x: item.x, y: item.y };
      }
    }

    if (targetPoint) {
      return Math.atan2(targetPoint.y - bot.y, targetPoint.x - bot.x);
    }
    return null;
  }

  private getAngleToNearestTerritory(bot: Player): number {
    const botGx = Math.floor(bot.x / this.grid.cellSize);
    const botGy = Math.floor(bot.y / this.grid.cellSize);

    let nearestGx = botGx;
    let nearestGy = botGy;
    let minDistSq = Infinity;

    const scanRadius = 35;
    for (let dy = -scanRadius; dy <= scanRadius; dy += 2) {
      const gy = botGy + dy;
      if (gy < 0 || gy >= this.grid.height) continue;

      for (let dx = -scanRadius; dx <= scanRadius; dx += 2) {
        const gx = botGx + dx;
        if (gx < 0 || gx >= this.grid.width) continue;

        if (this.grid.get(gx, gy) === bot.id) {
          const dSq = dx * dx + dy * dy;
          if (dSq < minDistSq) {
            minDistSq = dSq;
            nearestGx = gx;
            nearestGy = gy;
          }
        }
      }
    }

    const targetWorld = this.grid.gridToWorld(nearestGx, nearestGy);
    return Math.atan2(targetWorld.wy - bot.y, targetWorld.wx - bot.x);
  }

  private findNearestEnemyTrailAngle(bot: Player, allPlayers: Player[]): number | null {
    let bestScore = 0;
    let targetPoint: Point | null = null;
    const maxSensoryDist = 320;
    const maxSensoryDistSq = maxSensoryDist * maxSensoryDist;

    for (const player of allPlayers) {
      if (player.id === bot.id || player.status !== 'alive') continue;

      const pts = player.trail.points;
      if (pts.length === 0) continue;

      // Higher aggression for targets possessing larger territory (Rule 1)
      const targetPct = this.grid.getPercentage(player.id);
      const rewardMultiplier = 1.0 + (targetPct * 0.7); // High-value targets get priority

      for (let i = 0; i < pts.length; i++) {
        const pt = pts[i];
        const dx = pt.x - bot.x;
        const dy = pt.y - bot.y;
        const dSq = dx * dx + dy * dy;

        if (dSq < maxSensoryDistSq) {
          const score = rewardMultiplier / (Math.sqrt(dSq) + 10);
          if (score > bestScore) {
            bestScore = score;
            targetPoint = pt;
          }
        }
      }
    }

    if (targetPoint) {
      return Math.atan2(targetPoint.y - bot.y, targetPoint.x - bot.x);
    }
    return null;
  }

  private handleRespawn(bot: Player, dt: number): void {
    bot.respawnTimer -= dt;
    if (bot.respawnTimer <= 0) {
      for (let attempt = 0; attempt < 25; attempt++) {
        const randAngle = Math.random() * Math.PI * 2;
        const randDist = Math.random() * (GAME_CONFIG.ARENA_RADIUS * 0.75);
        const spawnX = GAME_CONFIG.ARENA_CENTER_X + Math.cos(randAngle) * randDist;
        const spawnY = GAME_CONFIG.ARENA_CENTER_Y + Math.sin(randAngle) * randDist;

        const { gx, gy } = this.grid.worldToGrid(spawnX, spawnY);
        if (this.grid.isInsideArena(gx, gy) && this.grid.get(gx, gy) === GAME_CONFIG.NEUTRAL_CELL) {
          this.grid.initTerritory(bot.id, gx, gy, GAME_CONFIG.STARTER_TERRITORY_RADIUS_CELLS);
          bot.respawn(spawnX, spawnY, randAngle);
          return;
        }
      }

      const { gx, gy } = this.grid.worldToGrid(bot.x, bot.y);
      this.grid.initTerritory(bot.id, gx, gy, GAME_CONFIG.STARTER_TERRITORY_RADIUS_CELLS);
      bot.respawn(bot.x, bot.y, 0);
    }
  }
}
