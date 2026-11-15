import { describe, it, expect, beforeEach } from 'vitest';
import { GridMap } from '../../src/engine/GridMap';
import { GAME_CONFIG } from '../../src/config';

describe('GridMap', () => {
  let grid: GridMap;

  beforeEach(() => {
    grid = new GridMap(
      GAME_CONFIG.GRID_WIDTH,
      GAME_CONFIG.GRID_HEIGHT,
      GAME_CONFIG.CELL_SIZE,
      GAME_CONFIG.ARENA_CENTER_CELL_X,
      GAME_CONFIG.ARENA_CENTER_CELL_Y,
      GAME_CONFIG.ARENA_RADIUS_CELLS
    );
  });

  it('initializes circular arena correctly', () => {
    // Center cell should be playable neutral
    expect(grid.isInsideArena(120, 120)).toBe(true);
    expect(grid.get(120, 120)).toBe(GAME_CONFIG.NEUTRAL_CELL);

    // Far corner cell (0, 0) should be outside arena
    expect(grid.isInsideArena(0, 0)).toBe(false);
    expect(grid.get(0, 0)).toBe(GAME_CONFIG.BOUNDARY_CELL);
  });

  it('converts world coordinates to grid coordinates and vice versa', () => {
    const gridPos = grid.worldToGrid(1205, 1205);
    expect(gridPos.gx).toBe(120);
    expect(gridPos.gy).toBe(120);

    const worldPos = grid.gridToWorld(120, 120);
    // Center of cell (120, 120) with cell size 10 is (1205, 1205)
    expect(worldPos.wx).toBe(1205);
    expect(worldPos.wy).toBe(1205);
  });

  it('initializes player starter territory in a disk shape', () => {
    const playerId = 1;
    const starterRadius = 5;
    const count = grid.initTerritory(playerId, 120, 120, starterRadius);

    expect(count).toBeGreaterThan(0);
    expect(grid.get(120, 120)).toBe(playerId);
    expect(grid.countCells(playerId)).toBe(count);

    const percentage = grid.getPercentage(playerId);
    expect(percentage).toBeGreaterThan(0);
    expect(percentage).toBeLessThan(10); // Starter territory is small (< 10%)
  });

  it('tracks dirty flags when territory changes', () => {
    const playerId = 1;
    grid.clearDirty(playerId);
    expect(grid.isDirty(playerId)).toBe(false);

    grid.set(120, 120, playerId);
    expect(grid.isDirty(playerId)).toBe(true);
  });

  it('clears all territory when player is eliminated', () => {
    const playerId = 2;
    grid.initTerritory(playerId, 100, 100, 4);
    expect(grid.countCells(playerId)).toBeGreaterThan(0);

    grid.clearPlayerTerritory(playerId);
    expect(grid.countCells(playerId)).toBe(0);
    expect(grid.get(100, 100)).toBe(GAME_CONFIG.NEUTRAL_CELL);
  });
});

