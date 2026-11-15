import { LOADING_THEME, TIMING_MS, TYPOGRAPHY } from '../theme';

export interface LoadingScreenOptions {
  /** Minimum display duration in ms before auto-finishing (set Infinity to hold for preview). */
  durationMs?: number;
  /** Called once the fade-out finishes or the loading phase completes. */
  onComplete?: () => void;
}

/**
 * Màn 1 — Màn Loading / Splash của Paper Territory.
 * Khớp bố cục & bảng màu chuẩn khung 720×1558 (video_b_frames/0018.png):
 * - Trên (7.4%–27.6%H): Tag studio + Logo 3D "PAPER TERRITORY" + quầng mặt trời #01FDFC
 * - Giữa (28%–78%H): Cụm linh vật 2.5D tự vẽ với vệt sơn vuốt thuôn & lá thu viền khung
 * - Dưới (63%–100%H): Đồi vàng cam #FBC416/#FEC200, linh vật Gà Vàng nổi trên đỉnh đồi,
 *   lá phong #E86E00 góc dưới & vòng quay tải tại y = 91.5%H
 */
export class LoadingScreen {
  private container: HTMLElement;
  private root: HTMLElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private durationMs: number;
  private onComplete?: () => void;

  private rafId: number | null = null;
  private startTs = 0;
  private fadeTimerId: number | null = null;
  private completeTimerId: number | null = null;
  private destroyed = false;
  private finishStarted = false;
  private viewW = 390;
  private viewH = 844;
  private onResizeBound = () => this.resize();

  constructor(container: HTMLElement, options: LoadingScreenOptions = {}) {
    this.container = container;
    this.durationMs = options.durationMs ?? TIMING_MS.LOADING_MIN_DISPLAY;
    this.onComplete = options.onComplete;

    this.root = document.createElement('div');
    this.root.className = 'loading-screen';
    this.root.setAttribute('data-screen', 'loading');

    this.canvas = document.createElement('canvas');
    this.canvas.className = 'loading-canvas';
    this.root.appendChild(this.canvas);
    this.container.appendChild(this.root);

    this.ctx = this.canvas.getContext('2d');
    this.resize();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.onResizeBound);
    }

    this.startLoop();
  }

  public getElement(): HTMLElement {
    return this.root;
  }

  /** Renders one frame immediately at elapsedMs (useful for deterministic screenshot/unit tests). */
  public renderFrame(elapsedMs = 0): void {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const w = this.viewW;
    const h = this.viewH;
    const t = elapsedMs / 1000;

    ctx.clearRect(0, 0, w, h);

    this.drawSkyAndSun(ctx, w, h, t);
    this.drawBackgroundClouds(ctx, w, h);
    this.drawTopFoliageFraming(ctx, w, h);
    // Vẽ đồi vàng thu TRƯỚC linh vật tiền cảnh để Gà Vàng ngồi nổi trọn vẹn trên đỉnh đồi
    this.drawMidgroundMascots(ctx, w, h, t);
    this.drawAutumnSlope(ctx, w, h);
    this.drawForegroundChickAndDonut(ctx, w, h, t);
    this.drawForegroundMapleLeaves(ctx, w, h);
    this.drawBrandHeader(ctx, w, h);
    this.drawSpinner(ctx, w, h, elapsedMs);
  }

  private resize(): void {
    const rect = this.root.getBoundingClientRect();
    this.viewW = rect.width || (typeof window !== 'undefined' ? window.innerWidth : 390) || 390;
    this.viewH = rect.height || (typeof window !== 'undefined' ? window.innerHeight : 844) || 844;
    const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;

    this.canvas.width = Math.max(1, Math.round(this.viewW * dpr));
    this.canvas.height = Math.max(1, Math.round(this.viewH * dpr));
    if (this.ctx) {
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  private startLoop(): void {
    const perfNow = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
    this.startTs = perfNow();
    this.renderFrame(0);

    if (typeof window !== 'undefined' && Number.isFinite(this.durationMs)) {
      this.fadeTimerId = window.setTimeout(() => this.beginExit(), Math.max(0, this.durationMs));
    }

    if (typeof requestAnimationFrame === 'function') {
      const tick = (now: number) => {
        if (this.destroyed) return;
        this.renderFrame(now - this.startTs);
        this.rafId = requestAnimationFrame(tick);
      };
      this.rafId = requestAnimationFrame(tick);
    }
  }

  private beginExit(): void {
    if (this.destroyed || this.finishStarted) return;
    this.finishStarted = true;
    this.root.classList.add('loading-screen--fade');
    if (typeof window !== 'undefined') {
      this.completeTimerId = window.setTimeout(() => {
        if (this.destroyed) return;
        const cb = this.onComplete;
        this.destroy();
        cb?.();
      }, TIMING_MS.LOADING_FADE_OUT);
    }
  }

  public destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    if (this.rafId !== null && typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.fadeTimerId !== null && typeof window !== 'undefined') {
      window.clearTimeout(this.fadeTimerId);
      this.fadeTimerId = null;
    }
    if (this.completeTimerId !== null && typeof window !== 'undefined') {
      window.clearTimeout(this.completeTimerId);
      this.completeTimerId = null;
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.onResizeBound);
    }
    this.root.remove();
  }

  private drawSkyAndSun(ctx: CanvasRenderingContext2D, w: number, h: number, t: number): void {
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.85);
    skyGrad.addColorStop(0, LOADING_THEME.skyTop);
    skyGrad.addColorStop(0.48, LOADING_THEME.skyMid);
    skyGrad.addColorStop(1, LOADING_THEME.skyRight);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    const sunX = w * (LOADING_THEME.layout.sunCenterXPct / 100);
    const sunY = h * (LOADING_THEME.layout.sunCenterYPct / 100);
    const pulse = 1 + Math.sin(t * 2) * 0.02;
    const sunR = w * 0.66 * pulse;

    const sunGrad = ctx.createRadialGradient(sunX, sunY, w * 0.03, sunX, sunY, sunR);
    sunGrad.addColorStop(0, 'rgba(255, 255, 255, 0.96)');
    sunGrad.addColorStop(0.24, 'rgba(1, 253, 252, 0.52)');
    sunGrad.addColorStop(0.54, 'rgba(195, 216, 248, 0.25)');
    sunGrad.addColorStop(1, 'rgba(7, 182, 252, 0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
    ctx.fill();

    // Soft halo rings like 0018.png
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.lineWidth = Math.max(2, w * 0.012);
    ctx.beginPath();
    ctx.arc(sunX, sunY, w * 0.42, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(195, 216, 248, 0.14)';
    ctx.lineWidth = Math.max(1.5, w * 0.008);
    ctx.beginPath();
    ctx.arc(sunX, sunY, w * 0.52, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  private drawBackgroundClouds(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    this.drawCloudPuff(ctx, -w * 0.02, h * 0.48, w * 0.34, h * 0.075);
    this.drawCloudPuff(ctx, w * 0.9, h * 0.64, w * 0.32, h * 0.085);
  }

  private drawCloudPuff(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    rw: number,
    rh: number,
  ): void {
    ctx.save();
    const grad = ctx.createLinearGradient(cx, cy - rh, cx, cy + rh);
    grad.addColorStop(0, LOADING_THEME.cloudWhite);
    grad.addColorStop(1, LOADING_THEME.cloudTint);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx - rw * 0.36, cy + rh * 0.18, rh * 0.66, 0, Math.PI * 2);
    ctx.arc(cx, cy - rh * 0.16, rh * 0.9, 0, Math.PI * 2);
    ctx.arc(cx + rw * 0.38, cy + rh * 0.12, rh * 0.72, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private drawTopFoliageFraming(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    // Soft puffy orange foliage framing top-left and upper-right behind/around the title
    this.drawOrangeCanopyBlob(ctx, w * 0.06, h * 0.045, w * 0.21);
    this.drawOrangeCanopyBlob(ctx, w * 0.19, h * 0.085, w * 0.13);
    this.drawOrangeCanopyBlob(ctx, w * 0.98, h * 0.245, w * 0.16);
    this.drawAutumnLeaf(ctx, w * 0.79, h * 0.32, w * 0.052, -0.45);
    // Warm orange cliff bump at mid-left edge
    this.drawOrangeCanopyBlob(ctx, -w * 0.04, h * 0.54, w * 0.11);
  }

  private drawOrangeCanopyBlob(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    r: number,
  ): void {
    ctx.save();
    ctx.fillStyle = LOADING_THEME.leafDark;
    ctx.beginPath();
    ctx.arc(cx - r * 0.3, cy + r * 0.28, r * 0.64, 0, Math.PI * 2);
    ctx.arc(cx + r * 0.15, cy + r * 0.05, r * 0.84, 0, Math.PI * 2);
    ctx.arc(cx + r * 0.56, cy + r * 0.38, r * 0.54, 0, Math.PI * 2);
    ctx.fill();

    const grad = ctx.createRadialGradient(cx - r * 0.18, cy - r * 0.24, r * 0.08, cx, cy, r * 1.1);
    grad.addColorStop(0, LOADING_THEME.leafLight);
    grad.addColorStop(0.68, LOADING_THEME.leafMid);
    grad.addColorStop(1, LOADING_THEME.leafDark);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx - r * 0.32, cy + r * 0.18, r * 0.6, 0, Math.PI * 2);
    ctx.arc(cx + r * 0.1, cy - r * 0.1, r * 0.82, 0, Math.PI * 2);
    ctx.arc(cx + r * 0.52, cy + r * 0.3, r * 0.52, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private drawBrandHeader(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    ctx.save();
    ctx.font = `700 ${Math.round(w * 0.044)}px ${TYPOGRAPHY.UI_FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.shadowColor = 'rgba(8, 27, 91, 0.32)';
    ctx.shadowBlur = 8;
    ctx.fillText('PAPER STUDIO', w * 0.5, h * (LOADING_THEME.layout.studioTopPct / 100));
    ctx.restore();

    // Giant 3D arched comic headline ("PAPER" white-ice + "TERRITORY" warm gold) matching logo box 10.6%..27.6%H
    this.draw3DComicWord(ctx, 'PAPER', w * 0.45, h * 0.156, w * 0.215, -0.055, false);
    this.draw3DComicWord(ctx, 'TERRITORY', w * 0.55, h * 0.236, w * 0.105, -0.025, true);
  }

  private draw3DComicWord(
    ctx: CanvasRenderingContext2D,
    text: string,
    cx: number,
    cy: number,
    fontSize: number,
    tiltRad: number,
    isGoldAccent: boolean,
  ): void {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(tiltRad);
    ctx.font = `900 ${Math.round(fontSize)}px ${TYPOGRAPHY.DISPLAY_FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    const depth = Math.max(5, Math.round(fontSize * 0.12));
    ctx.lineWidth = Math.max(6, Math.round(fontSize * 0.24));
    ctx.strokeStyle = LOADING_THEME.logoExtrudeNavy;
    for (let d = depth; d >= 1; d--) {
      ctx.strokeText(text, 0, d);
    }

    ctx.strokeStyle = LOADING_THEME.logoStrokeNavy;
    ctx.lineWidth = Math.max(6, Math.round(fontSize * 0.22));
    ctx.strokeText(text, 0, 0);

    const fillGrad = ctx.createLinearGradient(0, -fontSize * 0.5, 0, fontSize * 0.5);
    if (isGoldAccent) {
      fillGrad.addColorStop(0, LOADING_THEME.logoAccentTop);
      fillGrad.addColorStop(0.55, LOADING_THEME.logoAccentMid);
      fillGrad.addColorStop(1, LOADING_THEME.logoAccentBot);
    } else {
      fillGrad.addColorStop(0, LOADING_THEME.logoFaceTop);
      fillGrad.addColorStop(0.68, '#EAF6FF');
      fillGrad.addColorStop(1, LOADING_THEME.logoFaceBottom);
    }
    ctx.fillStyle = fillGrad;
    ctx.fillText(text, 0, 0);
    ctx.restore();
  }

  private drawMidgroundMascots(ctx: CanvasRenderingContext2D, w: number, h: number, t: number): void {
    const bob1 = Math.sin(t * 2.4) * h * 0.005;
    const bob2 = Math.cos(t * 2.1 + 0.7) * h * 0.004;
    const bob3 = Math.sin(t * 1.9 + 1.5) * h * 0.004;

    // 1. Winged Cobalt Cube-Bat + tapered cobalt paint ribbon (upper left)
    this.drawTaperedPaintTrail(
      ctx,
      w * 0.25, h * 0.35 + bob1,
      w * 0.15, h * 0.44,
      w * 0.09, h * 0.54,
      w * 0.05, w * 0.012,
      LOADING_THEME.mascot.batTrail,
    );
    this.drawBatMascot(ctx, w * 0.26, h * 0.345 + bob1, w * 0.13);

    // 2. Watermelon Slice + tapered red ribbon (mid left)
    this.drawTaperedPaintTrail(
      ctx,
      w * 0.19, h * 0.56 + bob2,
      w * 0.31, h * 0.525,
      w * 0.36, h * 0.57,
      w * 0.036, w * 0.01,
      LOADING_THEME.mascot.watermelonRed,
    );
    this.drawWatermelonMascot(ctx, w * 0.185, h * 0.565 + bob2, w * 0.13);

    // 3. Pink Boxer Bunny Hero + tapered cyan-emerald ribbon (upper-center hero)
    this.drawTaperedPaintTrail(
      ctx,
      w * 0.47, h * 0.46 + bob3,
      w * 0.29, h * 0.47,
      w * 0.19, h * 0.55,
      w * 0.05, w * 0.01,
      '#13D5A6',
    );
    this.drawPinkHeroMascot(ctx, w * 0.56, h * 0.43 + bob3, w * 0.22);

    // 4. White Winter Skater Bunny + tapered violet ribbon (mid right)
    this.drawTaperedPaintTrail(
      ctx,
      w * 0.84, h * 0.56 + bob1,
      w * 0.68, h * 0.58,
      w * 0.56, h * 0.585,
      w * 0.03, w * 0.008,
      '#A155E8',
    );
    this.drawWinterSkaterMascot(ctx, w * 0.85, h * 0.545 + bob1, w * 0.11);
  }

  private drawAutumnSlope(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    // Khớp ranh giới đồi thu trong 0018.png: trái ~63%H -> giữa 75%H -> phải ~83%H
    const yLeft = h * 0.64;
    const yRight = h * 0.825;

    const hillGrad = ctx.createLinearGradient(0, yLeft, 0, h);
    hillGrad.addColorStop(0, LOADING_THEME.slopeHighlight);
    hillGrad.addColorStop(0.24, LOADING_THEME.slopeTop);
    hillGrad.addColorStop(1, LOADING_THEME.slopeBottom);

    ctx.fillStyle = hillGrad;
    ctx.beginPath();
    ctx.moveTo(0, yLeft);
    ctx.quadraticCurveTo(w * 0.48, h * 0.755, w, yRight);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // Warm sunlit ridge along crest
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 245, 160, 0.55)';
    ctx.lineWidth = Math.max(3, w * 0.012);
    ctx.beginPath();
    ctx.moveTo(0, yLeft);
    ctx.quadraticCurveTo(w * 0.48, h * 0.755, w, yRight);
    ctx.stroke();
    ctx.restore();
  }

  private drawForegroundChickAndDonut(ctx: CanvasRenderingContext2D, w: number, h: number, t: number): void {
    const bobChick = Math.sin(t * 2.0 + 0.4) * h * 0.004;
    const bobDonut = Math.cos(t * 2.1 + 1.1) * h * 0.004;

    // 5. Pink Sprinkle Donut hovering above right hill edge
    this.drawTaperedPaintTrail(
      ctx,
      w * 0.85, h * 0.73 + bobDonut,
      w * 0.82, h * 0.67,
      w * 0.75, h * 0.635,
      w * 0.028, w * 0.008,
      '#FF61B8',
    );
    this.drawDonutMascot(ctx, w * 0.86, h * 0.73 + bobDonut, w * 0.11);

    // 6. Sweeping golden slide wake + Giant Foreground Golden Chick Cube resting visibly ABOVE hill crest
    this.drawTaperedPaintTrail(
      ctx,
      w * 0.43, h * 0.76 + bobChick,
      w * 0.24, h * 0.735,
      w * 0.08, h * 0.68,
      w * 0.065, w * 0.014,
      '#FF9D00',
    );
    this.drawChickMascot(ctx, w * 0.47, h * 0.695 + bobChick, w * 0.42);
  }

  private drawForegroundMapleLeaves(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    this.drawAutumnLeaf(ctx, w * 0.14, h * 0.91, w * 0.25, -0.34);
    this.drawAutumnLeaf(ctx, w * 0.42, h * 0.99, w * 0.18, 0.16);
    this.drawAutumnLeaf(ctx, w * 0.93, h * 0.875, w * 0.14, -0.48);
  }

  private drawTaperedPaintTrail(
    ctx: CanvasRenderingContext2D,
    x0: number,
    y0: number,
    cx: number,
    cy: number,
    x1: number,
    y1: number,
    startHalfW: number,
    endHalfW: number,
    color: string,
  ): void {
    ctx.save();
    const steps = 16;
    const leftPts: Array<[number, number]> = [];
    const rightPts: Array<[number, number]> = [];

    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const iu = 1 - u;
      const px = iu * iu * x0 + 2 * iu * u * cx + u * u * x1;
      const py = iu * iu * y0 + 2 * iu * u * cy + u * u * y1;
      const tx = 2 * iu * (cx - x0) + 2 * u * (x1 - cx);
      const ty = 2 * iu * (cy - y0) + 2 * u * (y1 - cy);
      const len = Math.hypot(tx, ty) || 1;
      const nx = -ty / len;
      const ny = tx / len;
      const hw = startHalfW + (endHalfW - startHalfW) * u;
      leftPts.push([px + nx * hw, py + ny * hw]);
      rightPts.push([px - nx * hw, py - ny * hw]);
    }

    ctx.fillStyle = color;
    ctx.globalAlpha = 0.88;
    ctx.beginPath();
    ctx.moveTo(leftPts[0][0], leftPts[0][1]);
    for (let i = 1; i < leftPts.length; i++) ctx.lineTo(leftPts[i][0], leftPts[i][1]);
    for (let i = rightPts.length - 1; i >= 0; i--) ctx.lineTo(rightPts[i][0], rightPts[i][1]);
    ctx.closePath();
    ctx.fill();

    // Inner gleam highlight along upper trail spine
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.34)';
    ctx.lineWidth = Math.max(2, startHalfW * 0.42);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x0, y0 - startHalfW * 0.3);
    ctx.quadraticCurveTo(cx, cy - startHalfW * 0.25, x1, y1 - endHalfW * 0.2);
    ctx.stroke();
    ctx.restore();
  }

  private drawBatMascot(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number): void {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(0.16);

    ctx.fillStyle = LOADING_THEME.mascot.batDark;
    ctx.strokeStyle = LOADING_THEME.logoStrokeNavy;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(-size * 0.56, -size * 0.08, size * 0.34, size * 0.16, -0.45, 0, Math.PI * 2);
    ctx.ellipse(size * 0.56, -size * 0.08, size * 0.34, size * 0.16, 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#38E552';
    for (const dir of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(dir * size * 0.28, -size * 0.4);
      ctx.lineTo(dir * size * 0.16, -size * 0.82);
      ctx.lineTo(0, -size * 0.42);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    this.drawRoundedVoxel(ctx, 0, 0, size * 0.86, size * 0.78, size * 0.24, LOADING_THEME.mascot.batBlue, LOADING_THEME.mascot.batDark);

    ctx.fillStyle = '#1B0C45';
    ctx.beginPath();
    ctx.roundRect(-size * 0.26, -size * 0.04, size * 0.52, size * 0.28, size * 0.1);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(-size * 0.18, -size * 0.03);
    ctx.lineTo(-size * 0.1, size * 0.11);
    ctx.lineTo(-size * 0.02, -size * 0.03);
    ctx.moveTo(size * 0.02, -size * 0.03);
    ctx.lineTo(size * 0.1, size * 0.11);
    ctx.lineTo(size * 0.18, -size * 0.03);
    ctx.fill();
    ctx.restore();
  }

  private drawWatermelonMascot(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number): void {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-0.22);

    ctx.fillStyle = LOADING_THEME.mascot.watermelonGreen;
    ctx.strokeStyle = LOADING_THEME.logoStrokeNavy;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-size * 0.52, -size * 0.25);
    ctx.lineTo(size * 0.52, -size * 0.25);
    ctx.lineTo(0, size * 0.56);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = LOADING_THEME.mascot.watermelonRed;
    ctx.beginPath();
    ctx.moveTo(-size * 0.42, -size * 0.14);
    ctx.lineTo(size * 0.42, -size * 0.14);
    ctx.lineTo(0, size * 0.45);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#1E1B3A';
    const seeds: Array<[number, number]> = [
      [-0.14, -0.02], [0.14, -0.02], [0, 0.14], [-0.07, 0.25], [0.09, 0.24],
    ];
    for (const [sx, sy] of seeds) {
      ctx.beginPath();
      ctx.ellipse(size * sx, size * sy, size * 0.032, size * 0.052, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private drawPinkHeroMascot(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number): void {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-0.08);

    for (const dir of [-1, 1]) {
      ctx.fillStyle = LOADING_THEME.mascot.bunnyPink;
      ctx.strokeStyle = LOADING_THEME.logoStrokeNavy;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.roundRect(dir * size * 0.22 - size * 0.12, -size * 0.78, size * 0.24, size * 0.42, size * 0.1);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#FFE44D';
      ctx.beginPath();
      ctx.roundRect(dir * size * 0.22 - size * 0.06, -size * 0.72, size * 0.12, size * 0.28, size * 0.06);
      ctx.fill();
    }

    this.drawRoundedVoxel(
      ctx,
      0,
      0,
      size * 0.78,
      size * 0.88,
      size * 0.18,
      LOADING_THEME.mascot.bunnyPink,
      LOADING_THEME.mascot.bunnyShade,
    );

    ctx.fillStyle = '#146EF5';
    ctx.beginPath();
    ctx.roundRect(-size * 0.36, size * 0.22, size * 0.72, size * 0.22, size * 0.08);
    ctx.fill();

    this.drawGoggleEyes(ctx, 0, -size * 0.12, size * 0.46, true);

    this.drawRoundedVoxel(
      ctx,
      size * 0.56,
      -size * 0.06,
      size * 0.36,
      size * 0.36,
      size * 0.12,
      LOADING_THEME.mascot.gloveCyan,
      LOADING_THEME.mascot.gloveShadow,
    );

    this.drawRoundedVoxel(
      ctx,
      -size * 0.48,
      size * 0.18,
      size * 0.44,
      size * 0.44,
      size * 0.14,
      LOADING_THEME.mascot.gloveCyan,
      LOADING_THEME.mascot.gloveShadow,
    );
    ctx.fillStyle = '#FF55B8';
    ctx.beginPath();
    ctx.arc(-size * 0.52, size * 0.14, size * 0.08, 0, Math.PI * 2);
    ctx.arc(-size * 0.42, size * 0.14, size * 0.08, 0, Math.PI * 2);
    ctx.moveTo(-size * 0.6, size * 0.17);
    ctx.lineTo(-size * 0.47, size * 0.31);
    ctx.lineTo(-size * 0.34, size * 0.17);
    ctx.fill();
    ctx.restore();
  }

  private drawWinterSkaterMascot(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number): void {
    ctx.save();
    ctx.translate(cx, cy);
    // Compact tilted hoverboard under winter bunny
    ctx.fillStyle = '#31237A';
    ctx.strokeStyle = LOADING_THEME.logoStrokeNavy;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-size * 0.62, size * 0.34, size * 1.24, size * 0.22, size * 0.11);
    ctx.fill();
    ctx.stroke();

    this.drawRoundedVoxel(ctx, 0, 0, size * 0.78, size * 0.78, size * 0.2, LOADING_THEME.mascot.skaterWhite, '#BDD7EC');
    ctx.fillStyle = LOADING_THEME.mascot.skaterHatGreen;
    ctx.strokeStyle = LOADING_THEME.logoStrokeNavy;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-size * 0.44, -size * 0.54, size * 0.88, size * 0.34, size * 0.14);
    ctx.fill();
    ctx.stroke();
    this.drawGoggleEyes(ctx, -size * 0.05, 0, size * 0.36, false);
    ctx.restore();
  }

  private drawDonutMascot(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number): void {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(0.28);
    this.drawRoundedVoxel(ctx, 0, 0, size * 0.86, size * 0.78, size * 0.2, LOADING_THEME.mascot.donutCrust, '#B96B27');
    ctx.fillStyle = LOADING_THEME.mascot.donutPink;
    ctx.beginPath();
    ctx.roundRect(-size * 0.41, -size * 0.38, size * 0.82, size * 0.54, size * 0.18);
    ctx.fill();
    // Sprinkles on frosting
    const sprinkles: Array<[number, number, string]> = [
      [-0.24, -0.24, '#FFFFFF'],
      [0.2, -0.24, '#FFF200'],
      [-0.22, 0.0, '#1BC5FF'],
      [0.22, 0.02, '#FFFFFF'],
    ];
    for (const [sx, sy, color] of sprinkles) {
      ctx.fillStyle = color;
      ctx.fillRect(size * sx - 2, size * sy - 1, 5, 2.5);
    }
    ctx.fillStyle = '#0480EC';
    ctx.beginPath();
    ctx.roundRect(-size * 0.12, -size * 0.18, size * 0.24, size * 0.2, size * 0.07);
    ctx.fill();
    ctx.restore();
  }

  private drawChickMascot(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number): void {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(0.05);

    // Soft shadow onto hill
    ctx.fillStyle = 'rgba(201, 108, 0, 0.34)';
    ctx.beginPath();
    ctx.ellipse(0, size * 0.42, size * 0.45, size * 0.12, -0.02, 0, Math.PI * 2);
    ctx.fill();

    // Cute head feathers
    ctx.fillStyle = LOADING_THEME.mascot.chickTop;
    ctx.strokeStyle = '#DF8B00';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(size * 0.04, -size * 0.51, size * 0.075, size * 0.16, 0.14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(size * 0.15, -size * 0.46, size * 0.065, size * 0.13, 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Rounded golden hero body with warm amber rim (matching 0018.png glow instead of dark box line)
    this.drawRoundedVoxel(
      ctx,
      0,
      0,
      size * 0.88,
      size * 0.82,
      size * 0.24,
      LOADING_THEME.mascot.chickYellow,
      LOADING_THEME.mascot.chickGold,
      '#DF8B00',
    );

    ctx.fillStyle = 'rgba(255, 255, 255, 0.48)';
    ctx.beginPath();
    ctx.ellipse(-size * 0.16, -size * 0.29, size * 0.24, size * 0.07, -0.1, 0, Math.PI * 2);
    ctx.fill();

    // Signature giant comic goggle eyes
    this.drawGoggleEyes(ctx, size * 0.02, size * 0.04, size * 0.64, false, '#D98600');
    ctx.restore();
  }

  private drawRoundedVoxel(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    w: number,
    h: number,
    r: number,
    topColor: string,
    sideColor: string,
    rimColor: string = LOADING_THEME.logoStrokeNavy,
  ): void {
    const depth = Math.max(4, Math.round(h * 0.14));
    ctx.save();
    ctx.strokeStyle = rimColor;
    ctx.lineWidth = Math.max(2, Math.round(w * 0.024));

    ctx.fillStyle = sideColor;
    ctx.beginPath();
    ctx.roundRect(cx - w * 0.5, cy - h * 0.5 + depth, w, h, r);
    ctx.fill();
    ctx.stroke();

    const grad = ctx.createLinearGradient(cx, cy - h * 0.5, cx, cy + h * 0.5);
    grad.addColorStop(0, topColor);
    grad.addColorStop(1, sideColor);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(cx - w * 0.5, cy - h * 0.5, w, h, r);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private drawGoggleEyes(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    span: number,
    winking: boolean,
    rimColor: string = LOADING_THEME.logoStrokeNavy,
  ): void {
    const eyeR = span * 0.34;
    ctx.save();
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = rimColor;
    ctx.lineWidth = Math.max(2, span * 0.036);

    for (const dir of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(cx + dir * span * 0.25, cy, eyeR * 0.92, eyeR * 1.18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.fillStyle = '#09248A';
    ctx.beginPath();
    ctx.ellipse(cx - span * 0.23, cy + eyeR * 0.06, eyeR * 0.48, eyeR * 0.74, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#040B2A';
    ctx.beginPath();
    ctx.ellipse(cx - span * 0.23, cy - eyeR * 0.08, eyeR * 0.3, eyeR * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();

    if (winking) {
      ctx.strokeStyle = '#040B2A';
      ctx.lineWidth = Math.max(2.5, span * 0.08);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(cx + span * 0.25, cy + eyeR * 0.1, eyeR * 0.38, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#09248A';
      ctx.beginPath();
      ctx.ellipse(cx + span * 0.27, cy + eyeR * 0.06, eyeR * 0.48, eyeR * 0.74, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#040B2A';
      ctx.beginPath();
      ctx.ellipse(cx + span * 0.27, cy - eyeR * 0.08, eyeR * 0.3, eyeR * 0.42, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(cx - span * 0.29, cy - eyeR * 0.3, eyeR * 0.16, 0, Math.PI * 2);
    ctx.fill();
    if (!winking) {
      ctx.beginPath();
      ctx.arc(cx + span * 0.21, cy - eyeR * 0.3, eyeR * 0.16, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private drawAutumnLeaf(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    size: number,
    rotRad: number,
  ): void {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotRad);

    ctx.fillStyle = 'rgba(184, 74, 0, 0.24)';
    ctx.beginPath();
    ctx.ellipse(0, size * 0.08, size * 0.65, size * 0.46, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = LOADING_THEME.leafDark;
    ctx.strokeStyle = LOADING_THEME.leafLight;
    ctx.lineWidth = Math.max(2, size * 0.04);
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.72);
    ctx.lineTo(size * 0.2, -size * 0.34);
    ctx.lineTo(size * 0.66, -size * 0.36);
    ctx.lineTo(size * 0.38, size * 0.04);
    ctx.lineTo(size * 0.56, size * 0.44);
    ctx.lineTo(0, size * 0.26);
    ctx.lineTo(-size * 0.56, size * 0.44);
    ctx.lineTo(-size * 0.38, size * 0.04);
    ctx.lineTo(-size * 0.66, -size * 0.36);
    ctx.lineTo(-size * 0.2, -size * 0.34);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = LOADING_THEME.leafShadow;
    ctx.lineWidth = Math.max(1.5, size * 0.035);
    ctx.beginPath();
    ctx.moveTo(0, size * 0.46);
    ctx.lineTo(0, -size * 0.45);
    ctx.moveTo(0, size * 0.05);
    ctx.lineTo(size * 0.36, -size * 0.2);
    ctx.moveTo(0, size * 0.05);
    ctx.lineTo(-size * 0.36, -size * 0.2);
    ctx.stroke();
    ctx.restore();
  }

  private drawSpinner(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    elapsedMs: number,
  ): void {
    const cx = w * 0.5;
    const cy = h * (LOADING_THEME.layout.spinnerCenterYPct / 100);
    const radius = w * (LOADING_THEME.layout.spinnerRadiusPct / 100);
    const ringWidth = Math.max(5, radius * 0.4);
    const angle = ((elapsedMs % TIMING_MS.LOADING_SPINNER_REV) / TIMING_MS.LOADING_SPINNER_REV) * Math.PI * 2;

    ctx.save();
    // Subtle dark amber ring shadow matching 0018.png
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = LOADING_THEME.spinnerOutline;
    ctx.lineWidth = ringWidth + 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, radius, angle - Math.PI * 0.35, angle + Math.PI * 1.1);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.72)';
    ctx.lineWidth = ringWidth;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();
  }
}
