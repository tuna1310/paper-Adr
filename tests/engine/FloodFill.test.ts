import { describe, it, expect, beforeEach } from 'vitest';
import { GridMap } from '../../src/engine/GridMap';
import { Player } from '../../src/engine/Player';
import { closeLoopAndCapture } from '../../src/engine/FloodFill';
import { GAME_CONFIG, DEFAULT_PLAYERS_CONFIG } from '../../src/config';

describe('FloodFill Loop Closure', () => {
  let grid: GridMap;
  let player1: Player;
  let player2: Player;

  beforeEach(() => {
    grid = new GridMap(
      GAME_CONFIG.GRID_WIDTH,
      GAME_CONFIG.GRID_HEIGHT,
      GAME_CONFIG.CELL_SIZE,
      GAME_CONFIG.ARENA_CENTER_CELL_X,
      GAME_CONFIG.ARENA_CENTER_CELL_Y,
      GAME_CONFIG.ARENA_RADIUS_CELLS
    );

    player1 = new Player(DEFAULT_PLAYERS_CONFIG[0], 1205, 1205, 0);
    player2 = new Player(DEFAULT_PLAYERS_CONFIG[1], 1305, 1305, 0);

    // Initialize player1 base at (120, 120) with radius 3
    grid.initTerritory(player1.id, 120, 120, 3);
  });

  it('captures enclosed neutral territory when loop closes', () => {
    // Draw a square loop out from base:
    // (123, 120) -> (130, 120) -> (130, 130) -> (120, 130) -> (120, 123)
    const pts = [
      grid.gridToWorld(123, 120),
      grid.gridToWorld(130, 120),
      grid.gridToWorld(130, 130),
      grid.gridToWorld(120, 130),
      grid.gridToWorld(120, 123)
    ];

    pts.forEach(p => player1.trail.addPoint(p.wx, p.wy));

    // Player re-enters base at (120, 120)
    const baseCenter = grid.gridToWorld(120, 120);
    player1.x = baseCenter.wx;
    player1.y = baseCenter.wy;

    const result = closeLoopAndCapture(grid, player1);

    expect(result.capturedCount).toBeGreaterThan(0);
    // Interior cell (125, 125) must now belong to player1
    expect(grid.get(125, 125)).toBe(player1.id);
    // Trail should be cleared
    expect(player1.trail.points.length).toBe(0);
  });

  it('claims rival territory enclosed inside the loop', () => {
    // Create player2 territory inside the loop at (125, 125)
    grid.set(125, 125, player2.id);
    grid.set(126, 125, player2.id);
    expect(grid.get(125, 125)).toBe(player2.id);

    // Draw the loop enclosing (125, 125)
    const pts = [
      grid.gridToWorld(123, 120),
      grid.gridToWorld(130, 120),
      grid.gridToWorld(130, 130),
      grid.gridToWorld(120, 130),
      grid.gridToWorld(120, 123)
    ];

    pts.forEach(p => player1.trail.addPoint(p.wx, p.wy));

    const baseCenter = grid.gridToWorld(120, 120);
    player1.x = baseCenter.wx;
    player1.y = baseCenter.wy;

    closeLoopAndCapture(grid, player1);

    // Rival territory inside loop must now belong to player1!
    expect(grid.get(125, 125)).toBe(player1.id);
    expect(grid.get(126, 125)).toBe(player1.id);
  });
});

