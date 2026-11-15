import './ui/theme.css';
import { GameEngine } from './engine/GameEngine';
import { DEFAULT_PLAYERS_CONFIG, PERF_CONFIG } from './config';
import { metaManager } from './meta/MetaManager';
import { NavFrame } from './ui/NavFrame';
import { GameRenderer } from './ui/GameRenderer';
import { TerritoryRenderer } from './ui/TerritoryRenderer';
import { InputController } from './ui/InputController';

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d', { alpha: false })!;

const engine = new GameEngine();
const initialSkin = metaManager.getState().activeSkinId || 'skin_watermelon';
engine.init(initialSkin);
(window as any)._testEngine = engine;

let matchResultRecorded = false;

const uiContainer = document.getElementById('ui-container') as HTMLElement;
let navFrame: NavFrame | null = null;
if (uiContainer) {
  navFrame = new NavFrame(uiContainer, () => {
    const skin = metaManager.getState().activeSkinId || 'skin_watermelon';
    TerritoryRenderer.clearCache();
    engine.init(skin);
    camX = engine.player.x;
    camY = engine.player.y;
    matchResultRecorded = false;
    engine.start();
  });
  (window as any)._navFrame = navFrame;
}

const inputController = new InputController(engine, navFrame, canvas);

// Viewport & Camera state (capped DPR for smooth 60 FPS on mid/low-end phones)
const container = document.getElementById('game-container') || document.body;
let viewWidth = container.clientWidth || window.innerWidth;
let viewHeight = container.clientHeight || window.innerHeight;
let lowQualityMode = false;
let dpr = Math.min(window.devicePixelRatio || 1, PERF_CONFIG.MAX_RENDER_DPR);
let camX = engine.player.x;
let camY = engine.player.y;
const zoom = 1.0;

function resize(): void {
  const cont = document.getElementById('game-container') || document.body;
  viewWidth = cont.clientWidth || window.innerWidth;
  viewHeight = cont.clientHeight || window.innerHeight;
  const maxDpr = lowQualityMode ? PERF_CONFIG.LOW_QUALITY_RENDER_DPR : PERF_CONFIG.MAX_RENDER_DPR;
  dpr = Math.min(window.devicePixelRatio || 1, maxDpr);

  canvas.width = Math.round(viewWidth * dpr);
  canvas.height = Math.round(viewHeight * dpr);
  canvas.style.width = `${viewWidth}px`;
  canvas.style.height = `${viewHeight}px`;

  inputController.updateViewport(viewWidth, viewHeight);
}
window.addEventListener('resize', resize);
resize();

// Color lookup map
const playerColors = new Map<number, string>();
DEFAULT_PLAYERS_CONFIG.forEach(p => playerColors.set(p.id, p.color));

// Game Loop: Fixed Timestep 60Hz with adaptive quality & spiral-of-death guard
const FIXED_DT = 1 / 60;
let lastTime = performance.now();
let accumulator = 0;
let frameTimeSum = 0;
let frameSamples = 0;

function gameLoop(now: number): void {
  const rawDeltaMs = now - lastTime;
  const elapsed = Math.min(rawDeltaMs / 1000, 0.1);
  lastTime = now;

  if (!lowQualityMode && engine.state === 'PLAYING') {
    frameTimeSum += rawDeltaMs;
    frameSamples++;
    if (frameSamples >= PERF_CONFIG.ADAPTIVE_SAMPLE_FRAMES) {
      if (frameTimeSum / frameSamples > PERF_CONFIG.ADAPTIVE_SLOW_FRAME_MS) {
        lowQualityMode = true;
        resize();
      }
      frameTimeSum = 0;
      frameSamples = 0;
    }
  }

  accumulator += elapsed;
  let steps = 0;
  while (accumulator >= FIXED_DT && steps < PERF_CONFIG.MAX_SIM_STEPS_PER_FRAME) {
    const prevState = engine.state;
    engine.update(FIXED_DT);
    if (prevState === 'PLAYING' && (engine.state === 'GAME_OVER' || engine.state === 'VICTORY') && !matchResultRecorded) {
      matchResultRecorded = true;
      const pct = engine.grid.getPercentage(engine.player.id);
      metaManager.recordMatchResult(pct, engine.player.kills, engine.state === 'VICTORY');
    } else if (engine.state === 'PLAYING') {
      matchResultRecorded = false;
    }
    accumulator -= FIXED_DT;
    steps++;
  }
  if (steps >= PERF_CONFIG.MAX_SIM_STEPS_PER_FRAME) {
    accumulator = 0;
  }

  // Camera lerp
  const targetX = engine.player.x;
  const targetY = engine.player.y;
  camX += (targetX - camX) * 0.14;
  camY += (targetY - camY) * 0.14;

  // Render Frame
  ctx.save();
  ctx.scale(dpr, dpr);

  GameRenderer.renderWorld(ctx, engine, viewWidth, viewHeight, camX, camY, zoom, now, playerColors);
  GameRenderer.renderHUD(ctx, engine, viewWidth, viewHeight, inputController.getJoystickState());

  ctx.restore();

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
