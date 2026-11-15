import { describe, it, expect, beforeEach } from 'vitest';
import { BotController } from '../../src/ai/BotController';
import { GridMap } from '../../src/engine/GridMap';
import { Player } from '../../src/engine/Player';
import { GAME_CONFIG, DEFAULT_PLAYERS_CONFIG } from '../../src/config';

describe('BotController AI', () => {
  let grid: GridMap;
  let bot: Player;
  let rival: Player;
  let controller: BotController;

  beforeEach(() => {
    grid = new GridMap(
      GAME_CONFIG.GRID_WIDTH,
      GAME_CONFIG.GRID_HEIGHT,
      GAME_CONFIG.CELL_SIZE,
      GAME_CONFIG.ARENA_CENTER_CELL_X,
      GAME_CONFIG.ARENA_CENTER_CELL_Y,
      GAME_CONFIG.ARENA_RADIUS_CELLS
    );

    bot = new Player(DEFAULT_PLAYERS_CONFIG[1], 1200, 1200, 0); // Mia (cautious)
    rival = new Player(DEFAULT_PLAYERS_CONFIG[0], 1260, 1200, Math.PI); // You
    grid.initTerritory(bot.id, 120, 120, 5);
    grid.initTerritory(rival.id, 126, 120, 5);

    controller = new BotController([bot], grid);
  });

  it('steers back to territory when cautious bot reaches trail limit', () => {
    bot.x = 1350;
    bot.y = 1200;
    bot.angle = 0;
    bot.targetAngle = 0;

    for (let i = 0; i < 40; i++) {
      bot.trail.addPoint(1200 + i * 5, 1200);
    }

    controller.update(1 / 60, [bot, rival]);

    // Should steer back left towards base (1200, 1200)
    const angleDiff = Math.abs(Math.atan2(Math.sin(bot.targetAngle - Math.PI), Math.cos(bot.targetAngle - Math.PI)));
    expect(angleDiff).toBeLessThan(1.2);
  });

  it('Rule 5: bot actively flees from a rival with active damage aura', () => {
    // Rival activates damage aura directly in front of bot (heading 0)
    rival.activateDamageAura(5.0);
    bot.x = 1200;
    bot.y = 1200;
    bot.angle = 0;
    bot.targetAngle = 0;

    controller.update(1 / 60, [bot, rival]);

    // Bot must NOT steer straight at angle 0 towards the killer aura
    expect(Math.abs(bot.targetAngle)).toBeGreaterThan(0.6);
  });

  it('respawns dead bot after delay in an empty arena area', () => {
    bot.die();
    expect(bot.status).toBe('dead');

    controller.update(GAME_CONFIG.RESPAWN_DELAY_SEC + 0.1, [bot]);

    expect(bot.status).toBe('alive');
    expect(grid.countCells(bot.id)).toBeGreaterThan(0);
  });
});
