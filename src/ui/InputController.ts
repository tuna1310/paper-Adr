import { GameEngine } from '../engine/GameEngine';
import { GameRenderer } from './GameRenderer';
import { TerritoryRenderer } from './TerritoryRenderer';
import { NavFrame } from './NavFrame';
import { metaManager } from '../meta/MetaManager';
import { JOYSTICK_CONFIG } from '../config';

export interface JoystickVisualState {
  active: boolean;
  baseX: number;
  baseY: number;
  knobX: number;
  knobY: number;
  angle: number;
}

export class InputController {
  private engine: GameEngine;
  private navFrame: NavFrame | null;
  private canvas: HTMLCanvasElement | null = null;
  private isPointerDown: boolean = false;
  private touchOrigin: { x: number; y: number } | null = null;
  private currentPos: { x: number; y: number } | null = null;
  private viewWidth: number = window.innerWidth;
  private viewHeight: number = window.innerHeight;
  private keysDown: Set<string> = new Set();

  constructor(engine: GameEngine, navFrame: NavFrame | null, canvas?: HTMLCanvasElement) {
    this.engine = engine;
    this.navFrame = navFrame;
    this.canvas = canvas || null;
    this.bindEvents();
  }

  public updateViewport(w: number, h: number): void {
    this.viewWidth = w;
    this.viewHeight = h;
  }

  public getJoystickState(): JoystickVisualState {
    const defaultBaseX = this.viewWidth / 2;
    const defaultBaseY = this.viewHeight - JOYSTICK_CONFIG.IDLE_BOTTOM_OFFSET;
    const playerAngle = this.engine.player ? this.engine.player.angle : -Math.PI / 2;

    if (!this.isPointerDown || !this.touchOrigin || !this.currentPos) {
      const idleOffset = JOYSTICK_CONFIG.RADIUS * 0.38;
      return {
        active: false,
        baseX: defaultBaseX,
        baseY: defaultBaseY,
        knobX: defaultBaseX + Math.cos(playerAngle) * idleOffset,
        knobY: defaultBaseY + Math.sin(playerAngle) * idleOffset,
        angle: playerAngle
      };
    }

    const dx = this.currentPos.x - this.touchOrigin.x;
    const dy = this.currentPos.y - this.touchOrigin.y;
    const dist = Math.hypot(dx, dy);
    const maxR = JOYSTICK_CONFIG.RADIUS;
    const clampedDist = Math.min(dist, maxR);
    const angle = dist > 2 ? Math.atan2(dy, dx) : playerAngle;

    return {
      active: true,
      baseX: this.touchOrigin.x,
      baseY: this.touchOrigin.y,
      knobX: this.touchOrigin.x + Math.cos(angle) * clampedDist,
      knobY: this.touchOrigin.y + Math.sin(angle) * clampedDist,
      angle
    };
  }

  private bindEvents(): void {
    window.addEventListener('pointerdown', (e) => this.onPointerDown(e));
    window.addEventListener('pointermove', (e) => this.onPointerMove(e));
    window.addEventListener('pointerup', () => this.onPointerUp());
    window.addEventListener('pointercancel', () => this.onPointerUp());
    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    window.addEventListener('keyup', (e) => this.onKeyUp(e));
  }

  private getCanvasPos(e: PointerEvent): { x: number; y: number } {
    if (this.canvas) {
      const rect = this.canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
    return { x: e.clientX, y: e.clientY };
  }

  private onKeyDown(e: KeyboardEvent): void {
    this.keysDown.add(e.key.toLowerCase());
    this.handleKeyboardSteering();
  }

  private onKeyUp(e: KeyboardEvent): void {
    this.keysDown.delete(e.key.toLowerCase());
    this.handleKeyboardSteering();
  }

  private handleKeyboardSteering(): void {
    if (this.engine.state !== 'PLAYING') return;
    let dx = 0;
    let dy = 0;
    if (this.keysDown.has('arrowleft') || this.keysDown.has('a')) dx -= 1;
    if (this.keysDown.has('arrowright') || this.keysDown.has('d')) dx += 1;
    if (this.keysDown.has('arrowup') || this.keysDown.has('w')) dy -= 1;
    if (this.keysDown.has('arrowdown') || this.keysDown.has('s')) dy += 1;

    if (dx !== 0 || dy !== 0) {
      const angle = Math.atan2(dy, dx);
      this.engine.player.requestSteerAngle(angle);
    }
  }

  private onPointerDown(e: PointerEvent): void {
    const pos = this.getCanvasPos(e);

    if (this.engine.state === 'GAME_OVER') {
      if (GameRenderer.isPlayAgainClicked(pos.x, pos.y, this.viewWidth, this.viewHeight)) {
        this.restartMatch();
        return;
      }
      if (GameRenderer.isHomeClicked(pos.x, pos.y, this.viewWidth, this.viewHeight)) {
        this.returnToHome();
        return;
      }
    } else if (this.engine.state === 'VICTORY') {
      if (GameRenderer.isPlayAgainClicked(pos.x, pos.y, this.viewWidth, this.viewHeight)) {
        this.returnToHome();
        return;
      }
      if (GameRenderer.isHomeClicked(pos.x, pos.y, this.viewWidth, this.viewHeight)) {
        this.returnToHome();
        return;
      }
    } else if (this.engine.state === 'PLAYING') {
      this.isPointerDown = true;
      const defaultBaseX = this.viewWidth / 2;
      const defaultBaseY = this.viewHeight - JOYSTICK_CONFIG.IDLE_BOTTOM_OFFSET;
      const distToIdle = Math.hypot(pos.x - defaultBaseX, pos.y - defaultBaseY);

      if (distToIdle <= JOYSTICK_CONFIG.RADIUS * 1.45) {
        this.touchOrigin = { x: defaultBaseX, y: defaultBaseY };
        this.currentPos = { x: pos.x, y: pos.y };
        if (distToIdle > JOYSTICK_CONFIG.DEADZONE) {
          this.engine.player.requestSteerAngle(Math.atan2(pos.y - defaultBaseY, pos.x - defaultBaseX));
        }
      } else {
        this.touchOrigin = { x: pos.x, y: pos.y };
        this.currentPos = { x: pos.x, y: pos.y };
      }
    }
  }

  private onPointerMove(e: PointerEvent): void {
    if (!this.isPointerDown || this.engine.state !== 'PLAYING') return;
    const pos = this.getCanvasPos(e);
    this.currentPos = { x: pos.x, y: pos.y };

    if (this.touchOrigin) {
      const dx = pos.x - this.touchOrigin.x;
      const dy = pos.y - this.touchOrigin.y;
      const dist = Math.hypot(dx, dy);

      if (dist >= JOYSTICK_CONFIG.DEADZONE) {
        const maxDrag = JOYSTICK_CONFIG.RADIUS * 1.35;
        if (dist > maxDrag) {
          const ratio = (dist - maxDrag) / dist;
          this.touchOrigin.x += dx * ratio;
          this.touchOrigin.y += dy * ratio;
        }
        const angle = Math.atan2(pos.y - this.touchOrigin.y, pos.x - this.touchOrigin.x);
        this.engine.player.requestSteerAngle(angle);
      }
    }
  }

  private onPointerUp(): void {
    this.isPointerDown = false;
    this.touchOrigin = null;
    this.currentPos = null;
  }

  private restartMatch(): void {
    const skin = metaManager.getState().activeSkinId || 'skin_watermelon';
    TerritoryRenderer.clearCache();
    this.engine.init(skin);
    this.engine.start();
  }

  private returnToHome(): void {
    const skin = metaManager.getState().activeSkinId || 'skin_watermelon';
    TerritoryRenderer.clearCache();
    this.engine.init(skin);
    if (this.navFrame) {
      this.navFrame.show();
    }
  }
}
