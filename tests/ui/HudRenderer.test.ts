import { describe, it, expect, vi } from 'vitest';
import { GameEngine } from '../../src/engine/GameEngine';
import { GameRenderer } from '../../src/ui/GameRenderer';
import { HudRenderer } from '../../src/ui/HudRenderer';
import { JoystickVisualState } from '../../src/ui/InputController';

function createMockCanvasContext(): CanvasRenderingContext2D {
  const noop = vi.fn();
  const mockGrad = { addColorStop: vi.fn() };
  return {
    save: noop,
    restore: noop,
    beginPath: noop,
    closePath: noop,
    moveTo: noop,
    lineTo: noop,
    arc: noop,
    roundRect: noop,
    rect: noop,
    fill: noop,
    stroke: noop,
    fillRect: noop,
    fillText: noop,
    strokeText: noop,
    translate: noop,
    rotate: noop,
    createLinearGradient: vi.fn(() => mockGrad),
    createRadialGradient: vi.fn(() => mockGrad),
    fillStyle: '#000',
    strokeStyle: '#000',
    lineWidth: 1,
    globalAlpha: 1,
    font: '12px sans-serif',
    textAlign: 'center',
    textBaseline: 'middle',
  } as unknown as CanvasRenderingContext2D;
}

describe('HudRenderer & GameRenderer static delegation (P0 regression)', () => {
  it('renders HUD with active 360 joystick through GameRenderer.renderHUD without TypeError', () => {
    const engine = new GameEngine();
    engine.init('skin_watermelon');
    engine.state = 'PLAYING';
    const ctx = createMockCanvasContext();
    const joystick: JoystickVisualState = {
      active: true,
      baseX: 195,
      baseY: 640,
      knobX: 235,
      knobY: 625,
      angle: -0.35,
    };

    expect(() => GameRenderer.renderHUD(ctx, engine, 390, 844, joystick)).not.toThrow();
    expect(() => HudRenderer.renderHUD(ctx, engine, 390, 844, joystick)).not.toThrow();
    expect(ctx.arc).toHaveBeenCalled();

    engine.state = 'GAME_OVER';
    expect(() => GameRenderer.renderHUD(ctx, engine, 390, 844, joystick)).not.toThrow();
  });

  it('delegates hit-test helpers safely via GameRenderer', () => {
    expect(GameRenderer.isPlayAgainClicked(195, 844 / 2 + 80, 390, 844)).toBe(true);
    expect(GameRenderer.isHomeClicked(195, 844 / 2 + 140, 390, 844)).toBe(true);
    expect(GameRenderer.isPlayAgainClicked(10, 10, 390, 844)).toBe(false);
  });
});
