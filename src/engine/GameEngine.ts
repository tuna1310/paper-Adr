import { GridMap } from './GridMap';
import { Player } from './Player';
import { CollisionDetector } from './CollisionDetector';
import { closeLoopAndCapture } from './FloodFill';
import { BotController } from '../ai/BotController';
import { PowerUpManager } from './PowerUpManager';
import {
  CollisionEvent,
  CaptureResult,
  ScoreEntry,
  SkinId,
  Point,
  TerritoryTransferWave,
  KillNotification
} from './types';
import { GAME_CONFIG, DEFAULT_PLAYERS_CONFIG } from '../config';
import skinsData from '../meta/data/skins.json';

export type GameState = 'READY' | 'PLAYING' | 'GAME_OVER' | 'VICTORY';

export class GameEngine {
  readonly grid: GridMap;
  player!: Player;
  readonly bots: Player[] = [];
  readonly allPlayers: Player[] = [];
  readonly collisionDetector: CollisionDetector;
  botController!: BotController;
  readonly powerUpManager: PowerUpManager;

  state: GameState = 'READY';
  recentEvents: CollisionEvent[] = [];
  recentCaptures: CaptureResult[] = [];
  readonly transferWaves: TerritoryTransferWave[] = [];
  readonly notifications: KillNotification[] = [];
  private nextNotificationId: number = 1;

  constructor() {
    this.grid = new GridMap(
      GAME_CONFIG.GRID_WIDTH,
      GAME_CONFIG.GRID_HEIGHT,
      GAME_CONFIG.CELL_SIZE,
      GAME_CONFIG.ARENA_CENTER_CELL_X,
      GAME_CONFIG.ARENA_CENTER_CELL_Y,
      GAME_CONFIG.ARENA_RADIUS_CELLS
    );
    this.collisionDetector = new CollisionDetector();
    this.powerUpManager = new PowerUpManager();
  }

  init(playerSkin: SkinId = 'watermelon'): void {
    this.bots.length = 0;
    this.allPlayers.length = 0;
    this.recentEvents = [];
    this.recentCaptures = [];
    this.transferWaves.length = 0;
    this.notifications.length = 0;
    this.powerUpManager.clear();

    const totalCount = 10;
    const spawnDist = GAME_CONFIG.ARENA_RADIUS * 0.65;
    const pAngle = Math.PI / 2; // Bottom spawn for user

    // 1. Setup Human Player
    const catalogSkin = skinsData.skins.find(s => s.id === playerSkin);
    const playerCfg = {
      ...DEFAULT_PLAYERS_CONFIG[0],
      color: catalogSkin?.color || DEFAULT_PLAYERS_CONFIG[0].color,
      darkColor: catalogSkin?.secondaryColor || DEFAULT_PLAYERS_CONFIG[0].darkColor,
      skinId: playerSkin
    };

    const pSpawnX = GAME_CONFIG.ARENA_CENTER_X + Math.cos(pAngle) * spawnDist;
    const pSpawnY = GAME_CONFIG.ARENA_CENTER_Y + Math.sin(pAngle) * spawnDist;
    this.player = new Player(playerCfg, pSpawnX, pSpawnY, -Math.PI / 2);
    this.player.spawnImmunityTimer = 2.0;
    this.allPlayers.push(this.player);

    const pGrid = this.grid.worldToGrid(pSpawnX, pSpawnY);
    this.grid.initTerritory(this.player.id, pGrid.gx, pGrid.gy, GAME_CONFIG.STARTER_TERRITORY_RADIUS_CELLS);

    // 2. Setup 9 Bots evenly distributed radially
    const botConfigs = DEFAULT_PLAYERS_CONFIG.slice(1);

    for (let i = 0; i < botConfigs.length; i++) {
      const bIndex = i + 1;
      const angle = pAngle + (bIndex * 2 * Math.PI) / totalCount;
      const bx = GAME_CONFIG.ARENA_CENTER_X + Math.cos(angle) * spawnDist;
      const by = GAME_CONFIG.ARENA_CENTER_Y + Math.sin(angle) * spawnDist;

      const bot = new Player(botConfigs[i], bx, by, angle + Math.PI);
      bot.spawnImmunityTimer = 2.0;
      this.bots.push(bot);
      this.allPlayers.push(bot);

      const bGrid = this.grid.worldToGrid(bx, by);
      this.grid.initTerritory(bot.id, bGrid.gx, bGrid.gy, GAME_CONFIG.STARTER_TERRITORY_RADIUS_CELLS);
    }

    this.botController = new BotController(this.bots, this.grid, this.powerUpManager);
    this.state = 'READY';
  }

  start(): void {
    this.state = 'PLAYING';
  }

  killPlayer(victim: Player, killer?: Player, location?: Point): void {
    if (victim.status !== 'alive') return;
    const loc = location || { x: victim.x, y: victim.y };
    victim.die(loc);

    if (killer && killer.id !== victim.id) {
      // Rule 1: Killer absorbs all of victim's territory!
      this.grid.transferTerritory(victim.id, killer.id);
      killer.kills++;

      // Trigger animated territory color wave
      this.transferWaves.push({
        victimId: victim.id,
        killerId: killer.id,
        killerColor: killer.color,
        originX: loc.x,
        originY: loc.y,
        progress: 0.0,
        durationSec: GAME_CONFIG.TERRITORY_TRANSFER_WAVE_DURATION
      });

      // Show floating notification
      const text = killer.id === this.player.id
        ? `Bạn đã hạ ${victim.name}`
        : `${killer.name} đã hạ ${victim.name}`;

      this.notifications.push({
        id: this.nextNotificationId++,
        text,
        color: killer.color,
        remainingSec: GAME_CONFIG.KILL_NOTIFICATION_DURATION
      });
    } else {
      // Unclaimed death: territory becomes neutral
      this.grid.clearPlayerTerritory(victim.id);
    }

    if (victim.id === this.player.id) {
      this.state = 'GAME_OVER';
    }
  }

  update(dt: number): void {
    if (this.state !== 'PLAYING') {
      return;
    }

    if (this.player.status === 'dead') {
      this.state = 'GAME_OVER';
      return;
    }

    this.recentEvents = [];
    this.recentCaptures = [];

    // 1. Tick Bot AI decisions
    this.botController.update(dt, this.allPlayers);

    // 2. Update players kinematics & detect loop closure + on-the-fly carving
    for (const p of this.allPlayers) {
      if (p.status !== 'alive') continue;

      const result = p.update(dt, this.grid);
      if (result.justEnteredTerritory) {
        const capture = closeLoopAndCapture(this.grid, p);
        if (capture.capturedCount > 0) {
          this.recentCaptures.push(capture);
        }
      } else {
        // Rule 2: Carve rival territory on the fly underfoot
        const carvedFrom = this.grid.carveRivalTerritory(p.id, p.x, p.y, GAME_CONFIG.CARVE_RADIUS_CELLS);
        if (carvedFrom.size > 0) {
          for (const [rivalId] of carvedFrom) {
            if (this.grid.countCells(rivalId) <= 0) {
              const rival = this.allPlayers.find(pl => pl.id === rivalId);
              if (rival && rival.status === 'alive') {
                this.killPlayer(rival, p, { x: rival.x, y: rival.y });
                this.recentEvents.push({
                  type: 'starvation',
                  victimId: rival.id,
                  killerId: p.id,
                  location: { x: rival.x, y: rival.y }
                });
              }
            }
          }
        }
      }
    }

    // 3. Collision Detection (Damage aura, head-on bounce, trail cuts, starvation)
    const collisions = this.collisionDetector.checkCollisions(this.allPlayers, this.grid);
    for (const event of collisions) {
      this.recentEvents.push(event);

      if (event.type === 'head_on_bounce') {
        continue;
      }

      // Eliminations (trail_kill, damage_aura_kill, starvation)
      const victim = this.allPlayers.find(p => p.id === event.victimId);
      const killer = event.killerId ? this.allPlayers.find(p => p.id === event.killerId) : undefined;

      if (victim && victim.status === 'alive') {
        this.killPlayer(victim, killer, event.location);
      }
    }

    // 4. Update territory transfer waves
    for (let i = this.transferWaves.length - 1; i >= 0; i--) {
      const wave = this.transferWaves[i];
      wave.progress += dt / wave.durationSec;
      if (wave.progress >= 1.0) {
        this.transferWaves.splice(i, 1);
      }
    }

    // 5. Update kill notifications
    for (let i = this.notifications.length - 1; i >= 0; i--) {
      const notif = this.notifications[i];
      notif.remainingSec -= dt;
      if (notif.remainingSec <= 0) {
        this.notifications.splice(i, 1);
      }
    }

    // 6. Update power-up items
    this.powerUpManager.update(dt, this.grid, this.allPlayers);

    // 7. Check victory
    if (this.grid.getPercentage(this.player.id) >= 60.0) {
      this.state = 'VICTORY';
    }
  }

  getLeaderboard(): ScoreEntry[] {
    const scores: ScoreEntry[] = this.allPlayers.map(p => ({
      playerId: p.id,
      name: p.name,
      color: p.color,
      percentage: Number(this.grid.getPercentage(p.id).toFixed(1)),
      kills: p.kills,
      isAlive: p.status === 'alive',
      isPlayer: !p.isBot
    }));

    return scores.sort((a, b) => b.percentage - a.percentage);
  }
}
