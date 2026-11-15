import {
  PlayerConfig,
  PlayerId,
  PlayerStatus,
  SkinId,
  BotArchetype,
  Point,
  DamageAura,
  RimBoostState,
  KnockbackState
} from './types';
import { Trail } from './Trail';
import { GridMap } from './GridMap';
import { GAME_CONFIG } from '../config';

export interface PlayerUpdateResult {
  justEnteredTerritory: boolean;
}

export class Player {
  readonly id: PlayerId;
  readonly name: string;
  readonly color: string;
  readonly darkColor: string;
  readonly skinId: SkinId;
  readonly isBot: boolean;
  readonly archetype?: BotArchetype;

  x: number;
  y: number;
  angle: number;
  targetAngle: number;
  speed: number = GAME_CONFIG.PLAYER_SPEED;
  boostTimer: number = 0;
  status: PlayerStatus = 'alive';
  readonly trail: Trail = new Trail();
  kills: number = 0;
  aliveTime: number = 0;
  respawnTimer: number = 0;
  spawnImmunityTimer: number = 0;
  deathLocation?: Point;

  // New features for latest Paper.io 2 rules
  readonly damageAura: DamageAura = {
    active: false,
    remainingSec: 0,
    radius: GAME_CONFIG.DAMAGE_AURA_RADIUS
  };

  readonly rimBoost: RimBoostState = {
    isSliding: false,
    charge: 0,
    boostRemainingSec: 0,
    boostFactor: 1.0
  };

  readonly knockback: KnockbackState = {
    active: false,
    vx: 0,
    vy: 0,
    remainingSec: 0
  };

  rimContactPoint?: Point;

  constructor(config: PlayerConfig, spawnX: number, spawnY: number, initialAngle: number = 0) {
    this.id = config.id;
    this.name = config.name;
    this.color = config.color;
    this.darkColor = config.darkColor;
    this.skinId = config.skinId;
    this.isBot = config.isBot;
    this.archetype = config.archetype;

    this.x = spawnX;
    this.y = spawnY;
    this.angle = initialAngle;
    this.targetAngle = initialAngle;
  }

  requestSteerAngle(targetAngle: number): void {
    this.targetAngle = targetAngle;
  }

  applyKnockback(dirX: number, dirY: number, durationSec: number = GAME_CONFIG.KNOCKBACK_DURATION): void {
    const speed = GAME_CONFIG.KNOCKBACK_DISTANCE / durationSec;
    this.knockback.active = true;
    this.knockback.vx = dirX * speed;
    this.knockback.vy = dirY * speed;
    this.knockback.remainingSec = durationSec;
  }

  activateDamageAura(durationSec: number = GAME_CONFIG.DAMAGE_AURA_DURATION): void {
    this.damageAura.active = true;
    this.damageAura.remainingSec = durationSec;
    this.damageAura.radius = GAME_CONFIG.DAMAGE_AURA_RADIUS;
  }

  updateKinematics(dt: number): void {
    if (this.status !== 'alive') return;

    // 1. Steering angle interpolation
    let diff = Math.atan2(Math.sin(this.targetAngle - this.angle), Math.cos(this.targetAngle - this.angle));
    const maxStep = GAME_CONFIG.MAX_TURN_RATE * dt;
    diff = Math.max(-maxStep, Math.min(maxStep, diff));
    this.angle += diff;
    this.angle = Math.atan2(Math.sin(this.angle), Math.cos(this.angle));

    // 2. Speed multipliers (power-up boost + rim boost)
    let currentSpeed = this.speed;
    if (this.boostTimer > 0) {
      currentSpeed *= GAME_CONFIG.BOOST_SPEED_MULTIPLIER;
      this.boostTimer = Math.max(0, this.boostTimer - dt);
    }

    if (this.rimBoost.boostRemainingSec > 0) {
      const progress = this.rimBoost.boostRemainingSec / GAME_CONFIG.RIM_BOOST_DURATION;
      const factor = 1.0 + (this.rimBoost.boostFactor - 1.0) * progress;
      currentSpeed *= factor;
      this.rimBoost.boostRemainingSec = Math.max(0, this.rimBoost.boostRemainingSec - dt);
    }

    // 3. Movement with Arena Rim-Sliding (Rule 4)
    const forwardX = Math.cos(this.angle);
    const forwardY = Math.sin(this.angle);

    const cx = GAME_CONFIG.ARENA_CENTER_X;
    const cy = GAME_CONFIG.ARENA_CENTER_Y;
    const maxR = GAME_CONFIG.RIM_SLIDE_MAX_RADIUS;

    const curDist = Math.hypot(this.x - cx, this.y - cy);
    const atRim = curDist >= maxR - 1.5;

    if (atRim) {
      const nx = (this.x - cx) / (curDist || 1);
      const ny = (this.y - cy) / (curDist || 1);
      const outwardDot = forwardX * nx + forwardY * ny;

      if (outwardDot > 0.05) {
        // Player is steering outwards against the circular rim: slide tangentially!
        this.rimBoost.isSliding = true;
        this.rimBoost.charge = Math.min(1.0, this.rimBoost.charge + dt / GAME_CONFIG.RIM_BOOST_CHARGE_TIME);
        this.rimContactPoint = { x: this.x, y: this.y };

        // Project velocity onto tangent (remove outward normal velocity)
        const tangentX = forwardX - outwardDot * nx;
        const tangentY = forwardY - outwardDot * ny;
        const tLen = Math.hypot(tangentX, tangentY);

        if (tLen > 0.001) {
          this.x += (tangentX / tLen) * currentSpeed * dt;
          this.y += (tangentY / tLen) * currentSpeed * dt;
        }

        // Clamp to circle radius
        const newDist = Math.hypot(this.x - cx, this.y - cy);
        if (newDist > maxR) {
          this.x = cx + ((this.x - cx) / newDist) * maxR;
          this.y = cy + ((this.y - cy) / newDist) * maxR;
        }
      } else {
        // Player is steering inward away from the rim! Trigger accumulated boost
        if (this.rimBoost.charge > 0.05) {
          this.rimBoost.boostRemainingSec = GAME_CONFIG.RIM_BOOST_DURATION;
          this.rimBoost.boostFactor = 1.0 + (GAME_CONFIG.RIM_BOOST_MULTIPLIER - 1.0) * this.rimBoost.charge;
          this.rimBoost.charge = 0;
        }
        this.rimBoost.isSliding = false;
        this.rimContactPoint = undefined;

        this.x += forwardX * currentSpeed * dt;
        this.y += forwardY * currentSpeed * dt;
      }
    } else {
      this.rimBoost.isSliding = false;
      this.rimContactPoint = undefined;
      this.x += forwardX * currentSpeed * dt;
      this.y += forwardY * currentSpeed * dt;
    }

    // 4. Knockback displacement
    if (this.knockback.active) {
      const decay = Math.max(0, this.knockback.remainingSec / GAME_CONFIG.KNOCKBACK_DURATION);
      this.x += this.knockback.vx * decay * dt;
      this.y += this.knockback.vy * decay * dt;
      this.knockback.remainingSec -= dt;
      if (this.knockback.remainingSec <= 0) {
        this.knockback.active = false;
      }
    }

    // 5. Damage Aura update
    if (this.damageAura.active) {
      this.damageAura.remainingSec -= dt;
      if (this.damageAura.remainingSec <= 0) {
        this.damageAura.active = false;
        this.damageAura.radius = GAME_CONFIG.DAMAGE_AURA_RADIUS;
      } else if (this.damageAura.remainingSec < GAME_CONFIG.DAMAGE_AURA_SHRINK_TIME) {
        // Shrink aura ring when time is nearly up
        const shrinkFactor = this.damageAura.remainingSec / GAME_CONFIG.DAMAGE_AURA_SHRINK_TIME;
        this.damageAura.radius = Math.max(12, GAME_CONFIG.DAMAGE_AURA_RADIUS * shrinkFactor);
      }
    }

    if (this.spawnImmunityTimer > 0) {
      this.spawnImmunityTimer = Math.max(0, this.spawnImmunityTimer - dt);
    }

    this.aliveTime += dt;
  }

  update(dt: number, grid: GridMap): PlayerUpdateResult {
    if (this.status !== 'alive') {
      return { justEnteredTerritory: false };
    }

    this.updateKinematics(dt);

    const { gx, gy } = grid.worldToGrid(this.x, this.y);
    const owner = grid.get(gx, gy);

    if (owner === this.id) {
      if (this.trail.points.length > 0) {
        return { justEnteredTerritory: true };
      }
      this.trail.clear();
      return { justEnteredTerritory: false };
    } else {
      this.trail.addPoint(this.x, this.y);
      return { justEnteredTerritory: false };
    }
  }

  applyBoost(durationSec: number = GAME_CONFIG.BOOST_DURATION_SEC): void {
    this.boostTimer = durationSec;
  }

  die(location?: Point): void {
    this.status = 'dead';
    this.deathLocation = location ? { ...location } : { x: this.x, y: this.y };
    this.trail.clear();
    this.boostTimer = 0;
    this.rimBoost.charge = 0;
    this.rimBoost.isSliding = false;
    this.rimBoost.boostRemainingSec = 0;
    this.damageAura.active = false;
    this.knockback.active = false;
    this.respawnTimer = GAME_CONFIG.RESPAWN_DELAY_SEC;
  }

  respawn(spawnX: number, spawnY: number, angle: number = 0): void {
    this.x = spawnX;
    this.y = spawnY;
    this.angle = angle;
    this.targetAngle = angle;
    this.status = 'alive';
    this.trail.clear();
    this.boostTimer = 0;
    this.rimBoost.charge = 0;
    this.rimBoost.isSliding = false;
    this.rimBoost.boostRemainingSec = 0;
    this.damageAura.active = false;
    this.knockback.active = false;
    this.respawnTimer = 0;
    this.aliveTime = 0;
    this.deathLocation = undefined;
  }
}
