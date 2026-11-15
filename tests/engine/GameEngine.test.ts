import { describe, it, expect, beforeEach } from 'vitest';
import { GameEngine } from '../../src/engine/GameEngine';

describe('GameEngine Orchestration', () => {
  let engine: GameEngine;

  beforeEach(() => {
    engine = new GameEngine();
    engine.init();
  });

  it('initializes human player and 9 bots with starter territories', () => {
    expect(engine.allPlayers.length).toBe(10);
    expect(engine.player.isBot).toBe(false);
    expect(engine.bots.length).toBe(9);

    // Each alive player must have positive cell count in grid
    for (const p of engine.allPlayers) {
      expect(p.status).toBe('alive');
      expect(engine.grid.countCells(p.id)).toBeGreaterThan(0);
    }
  });

  it('updates simulation on fixed 60Hz tick without errors', () => {
    engine.start();
    expect(engine.state).toBe('PLAYING');

    const dt = 1 / 60;
    for (let frame = 0; frame < 60; frame++) {
      engine.update(dt);
    }

    expect(engine.player.aliveTime).toBeCloseTo(1.0, 1);
  });

  it('generates sorted leaderboard with correct ranks', () => {
    engine.start();
    const leaderboard = engine.getLeaderboard();

    expect(leaderboard.length).toBe(10);
    // Leaderboard must be sorted descending by percentage
    for (let i = 0; i < leaderboard.length - 1; i++) {
      expect(leaderboard[i].percentage).toBeGreaterThanOrEqual(leaderboard[i + 1].percentage);
    }
  });

  it('transitions to GAME_OVER when player is eliminated', () => {
    engine.start();
    // Simulate player elimination
    engine.player.die();
    engine.update(1 / 60);

    expect(engine.state).toBe('GAME_OVER');
  });
});
