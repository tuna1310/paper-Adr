import { describe, it, expect, beforeEach } from 'vitest';
import { CollisionDetector } from '../../src/engine/CollisionDetector';
import { GridMap } from '../../src/engine/GridMap';
import { Player } from '../../src/engine/Player';
import { GAME_CONFIG, DEFAULT_PLAYERS_CONFIG } from '../../src/config';

describe('CollisionDetector (New Rules)', () => {
  let grid: GridMap;
  let player1: Player;
  let player2: Player;
  let detector: CollisionDetector;

  beforeEach(() => {
    grid = new GridMap(
      GAME_CONFIG.GRID_WIDTH,
      GAME_CONFIG.GRID_HEIGHT,
      GAME_CONFIG.CELL_SIZE,
      GAME_CONFIG.ARENA_CENTER_CELL_X,
      GAME_CONFIG.ARENA_CENTER_CELL_Y,
      GAME_CONFIG.ARENA_RADIUS_CELLS
    );

    player1 = new Player(DEFAULT_PLAYERS_CONFIG[0], 1200, 1200, 0);
    player2 = new Player(DEFAULT_PLAYERS_CONFIG[1], 1300, 1300, 0);
    grid.initTerritory(player1.id, 120, 120, 5);
    grid.initTerritory(player2.id, 130, 130, 5);

    detector = new CollisionDetector();
  });

  it('eliminates victim when attacker cuts their trail', () => {
    player2.trail.addPoint(1200, 1100);
    player2.trail.addPoint(1200, 1300);

    player1.x = 1200;
    player1.y = 1200;

    const events = detector.checkCollisions([player1, player2], grid);
    const killEvent = events.find(e => e.type === 'trail_kill');

    expect(killEvent).toBeDefined();
    expect(killEvent?.victimId).toBe(player2.id);
    expect(killEvent?.killerId).toBe(player1.id);
  });

  it('Rule 1: crossing own trail NEVER kills the player', () => {
    // Player creates a loop crossing over their own past trail
    player1.trail.addPoint(1000, 1000);
    player1.trail.addPoint(1000, 1200);
    player1.trail.addPoint(1200, 1200);
    player1.trail.addPoint(1200, 1000);

    // Head is right on the old trail at (1000, 1100)
    player1.x = 1000;
    player1.y = 1100;

    const events = detector.checkCollisions([player1], grid);
    // Should NOT have any kill or self collision
    expect(events.length).toBe(0);
    expect(player1.status).toBe('alive');
  });

  it('Rule 3: head-on collision does NOT kill either player, triggers knockback bounce', () => {
    player1.x = 1400;
    player1.y = 1400;
    player2.x = 1410;
    player2.y = 1400;

    const events = detector.checkCollisions([player1, player2], grid);
    const bounceEvent = events.find(e => e.type === 'head_on_bounce');

    expect(bounceEvent).toBeDefined();
    expect(player1.status).toBe('alive');
    expect(player2.status).toBe('alive');

    // Both players should have active knockback
    expect(player1.knockback.active).toBe(true);
    expect(player2.knockback.active).toBe(true);
    // Pushed in opposite directions
    expect(Math.sign(player1.knockback.vx)).not.toBe(Math.sign(player2.knockback.vx));
  });

  it('Rule 4: arena boundary does not kill, character slides along the rim', () => {
    // Position player right at arena boundary facing outwards
    const maxR = GAME_CONFIG.RIM_SLIDE_MAX_RADIUS;
    player1.x = GAME_CONFIG.ARENA_CENTER_X + maxR;
    player1.y = GAME_CONFIG.ARENA_CENTER_Y;
    player1.angle = 0; // facing right (outward)
    player1.targetAngle = 0;

    player1.updateKinematics(1 / 60);

    // Collision detector shouldn't eliminate player
    const events = detector.checkCollisions([player1], grid);
    expect(events.length).toBe(0);
    expect(player1.status).toBe('alive');
    expect(player1.rimBoost.isSliding).toBe(true);
    expect(player1.rimBoost.charge).toBeGreaterThan(0);
  });

  it('Rule 5: active damage aura kills nearby enemies entering the ring', () => {
    player1.activateDamageAura(5.0);
    expect(player1.damageAura.active).toBe(true);

    // Place player 2 inside player 1's damage aura (within 50 units)
    player1.x = 1200;
    player1.y = 1200;
    player2.x = 1230;
    player2.y = 1200;

    const events = detector.checkCollisions([player1, player2], grid);
    const auraKill = events.find(e => e.type === 'damage_aura_kill');

    expect(auraKill).toBeDefined();
    expect(auraKill?.victimId).toBe(player2.id);
    expect(auraKill?.killerId).toBe(player1.id);
  });

  it('eliminates player who loses all territory (starvation)', () => {
    grid.clearPlayerTerritory(player2.id);
    expect(grid.countCells(player2.id)).toBe(0);

    const events = detector.checkCollisions([player1, player2], grid);
    const starveEvent = events.find(e => e.type === 'starvation');

    expect(starveEvent).toBeDefined();
    expect(starveEvent?.victimId).toBe(player2.id);
  });
});
