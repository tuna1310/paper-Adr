import { describe, it, expect, beforeEach } from 'vitest';
import { GridMap } from '../../src/engine/GridMap';
import { Player } from '../../src/engine/Player';
import { GameEngine } from '../../src/engine/GameEngine';
import { GAME_CONFIG, DEFAULT_PLAYERS_CONFIG } from '../../src/config';

describe('Territory Claiming Rules (Upgrades)', () => {
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

    player1 = new Player(DEFAULT_PLAYERS_CONFIG[0], 1200, 1200, 0);
    player2 = new Player(DEFAULT_PLAYERS_CONFIG[1], 1300, 1300, 0);
  });

  it('Rule 1: transfers all victim territory to killer under 2ms with exact cell counts', () => {
    // Stamp a large territory for player2 (radius 18 cells, ~1000 cells)
    const victimCells = grid.initTerritory(player2.id, 120, 120, 18);
    const initialKillerCells = grid.initTerritory(player1.id, 80, 80, 5);

    expect(grid.countCells(player2.id)).toBe(victimCells);
    expect(grid.countCells(player1.id)).toBe(initialKillerCells);

    // Warm up JIT compiler
    grid.transferTerritory(0, 0);

    // Measure transfer performance
    const start = performance.now();
    const transferred = grid.transferTerritory(player2.id, player1.id);
    const durationMs = performance.now() - start;

    // Performance target: strictly under 2 ms
    expect(durationMs).toBeLessThan(2.0);
    expect(transferred).toBe(victimCells);

    // Victim must have 0 cells, killer must have initial + victim cells
    expect(grid.countCells(player2.id)).toBe(0);
    expect(grid.countCells(player1.id)).toBe(initialKillerCells + victimCells);

    // Dirty flags must be marked
    expect(grid.isDirty(player1.id)).toBe(true);
    expect(grid.isDirty(player2.id)).toBe(true);

    // Invariant: Total cells owned across grid matches exact cache sum
    let actualKillerCount = 0;
    const raw = grid.getRawData();
    for (let i = 0; i < raw.length; i++) {
      if (raw[i] === player1.id) actualKillerCount++;
      expect(raw[i]).not.toBe(player2.id); // zero victim cells remaining
    }
    expect(actualKillerCount).toBe(initialKillerCells + victimCells);
  });

  it('Rule 1: unclaimed death (no killer) releases territory to neutral', () => {
    grid.initTerritory(player2.id, 120, 120, 10);
    expect(grid.countCells(player2.id)).toBeGreaterThan(0);

    const cleared = grid.clearPlayerTerritory(player2.id);
    expect(cleared).toBeGreaterThan(0);
    expect(grid.countCells(player2.id)).toBe(0);
    expect(grid.get(120, 120)).toBe(GAME_CONFIG.NEUTRAL_CELL);
  });

  it('Rule 1: kill by damage aura transfers all victim territory to aura owner', () => {
    const engine = new GameEngine();
    engine.init('watermelon');
    engine.start();

    const victim = engine.bots[0];
    const victimInitCells = engine.grid.countCells(victim.id);
    const killerInitCells = engine.grid.countCells(engine.player.id);
    expect(victimInitCells).toBeGreaterThan(0);

    // Move victim into player's position and activate aura
    engine.player.activateDamageAura(5.0);
    victim.x = engine.player.x + 20;
    victim.y = engine.player.y;

    engine.update(1 / 60);

    // Victim should be killed by damage aura and territory transferred
    expect(victim.status).toBe('dead');
    expect(engine.player.kills).toBe(1);
    expect(engine.grid.countCells(victim.id)).toBe(0);
    expect(engine.grid.countCells(engine.player.id)).toBe(killerInitCells + victimInitCells);
  });

  it('Rule 2: carves rival territory on the fly underfoot when walking through it', () => {
    // Player 2 owns a patch around (120, 120)
    grid.initTerritory(player2.id, 120, 120, 8);
    const initVictimCount = grid.countCells(player2.id);

    // Player 1 walks over (1205, 1205)
    const carveResult = grid.carveRivalTerritory(player1.id, 1205, 1205, 1);

    expect(carveResult.has(player2.id)).toBe(true);
    const carvedAmount = carveResult.get(player2.id)!;
    expect(carvedAmount).toBeGreaterThan(0);

    // Center cell (120, 120) must now belong to player1
    expect(grid.get(120, 120)).toBe(player1.id);
    expect(grid.countCells(player2.id)).toBe(initVictimCount - carvedAmount);
    expect(grid.countCells(player1.id)).toBe(carvedAmount);
  });

  it('Rule 2: carving rival down to 0 cells eliminates them and credits killer', () => {
    const engine = new GameEngine();
    engine.init('watermelon');
    engine.start();

    const victim = engine.bots[0];
    // Shrink victim's territory to just 1 cell at (120, 120)
    engine.grid.clearPlayerTerritory(victim.id);
    engine.grid.set(120, 120, victim.id);
    expect(engine.grid.countCells(victim.id)).toBe(1);

    // Player walks directly over cell (120, 120)
    const worldPos = engine.grid.gridToWorld(120, 120);
    engine.player.x = worldPos.wx;
    engine.player.y = worldPos.wy;

    engine.update(1 / 60);

    // Victim should now be dead due to starvation, credited to player!
    expect(victim.status).toBe('dead');
    expect(engine.grid.countCells(victim.id)).toBe(0);
    expect(engine.player.kills).toBeGreaterThanOrEqual(1);
    // Notification banner should record the kill
    const notif = engine.notifications.find(n => n.text.includes(victim.name));
    expect(notif).toBeDefined();
    expect(notif?.text).toBe(`Bạn đã hạ ${victim.name}`);
  });
});
