import { describe, it, expect, beforeEach } from 'vitest';
import { Player } from '../../src/engine/Player';
import { GridMap } from '../../src/engine/GridMap';
import { GAME_CONFIG, DEFAULT_PLAYERS_CONFIG } from '../../src/config';

describe('Player and Trail', () => {
  let grid: GridMap;
  let player: Player;

  beforeEach(() => {
    grid = new GridMap(
      GAME_CONFIG.GRID_WIDTH,
      GAME_CONFIG.GRID_HEIGHT,
      GAME_CONFIG.CELL_SIZE,
      GAME_CONFIG.ARENA_CENTER_CELL_X,
      GAME_CONFIG.ARENA_CENTER_CELL_Y,
      GAME_CONFIG.ARENA_RADIUS_CELLS
    );

    player = new Player(DEFAULT_PLAYERS_CONFIG[0], 1205, 1205, 0);
  });

  it('smoothly clamps steering turn rate without instant 180 snap', () => {
    // Current angle is 0. Request target angle = Math.PI (180 deg)
    player.requestSteerAngle(Math.PI);

    // Update with dt = 1/60s
    const dt = 1 / 60;
    player.updateKinematics(dt);

    // Angle should change by at most MAX_TURN_RATE * dt
    const maxChange = GAME_CONFIG.MAX_TURN_RATE * dt + 0.0001;
    expect(player.angle).toBeGreaterThan(0);
    expect(player.angle).toBeLessThanOrEqual(maxChange);
  });

  it('records no trail while inside own territory', () => {
    // Stamp starter territory at center
    grid.initTerritory(player.id, 120, 120, 5);

    // Position is at center of own territory
    player.x = 1205;
    player.y = 1205;

    player.update(1 / 60, grid);
    expect(player.trail.points.length).toBe(0);
  });

  it('records trail points when stepping outside own territory', () => {
    grid.initTerritory(player.id, 120, 120, 5);

    // Place player outside territory
    player.x = 1500;
    player.y = 1500;
    player.angle = 0;
    player.targetAngle = 0;

    // Move player over several frames
    for (let i = 0; i < 10; i++) {
      player.update(1 / 60, grid);
    }

    expect(player.trail.points.length).toBeGreaterThan(0);
  });

  it('detects territory re-entry trigger for loop closure', () => {
    grid.initTerritory(player.id, 120, 120, 5);

    // Start outside with an existing trail
    player.x = 1300;
    player.y = 1205;
    player.trail.addPoint(1280, 1205);
    player.trail.addPoint(1300, 1205);

    // Move player back inside own territory (cell 120, 120)
    player.x = 1205;
    player.y = 1205;

    const result = player.update(1 / 60, grid);
    expect(result.justEnteredTerritory).toBe(true);
  });
});

