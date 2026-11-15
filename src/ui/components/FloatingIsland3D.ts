import { TYPOGRAPHY } from '../theme';

/**
 * 3D Isometric Floating Territory Slice + Equipped Hero Voxel Cube + Glowing Trail.
 * Khớp bố cục Video A [00:17–00:19] (`0038.png`), vẽ bằng Canvas 2D gốc cho Paper Territory.
 */
export class FloatingIsland3D {
  private skinColor = '#28C75A';
  private skinSecondary = '#FF4B6E';
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animFrameId = 0;
  private percent = 63;
  private lastDrawTime = 0;

  constructor(container: HTMLElement, percent = 63) {
    this.percent = percent;

    this.canvas = document.createElement('canvas');
    this.canvas.className = 'floating-island-canvas';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.ctx = this.canvas.getContext('2d')!;

    container.appendChild(this.canvas);
    this.resize();
    this.startLoop();
  }

  public setSkinAppearance(color: string, secondaryColor = '#FFFFFF'): void {
    this.skinColor = color || '#28C75A';
    this.skinSecondary = secondaryColor || '#FFFFFF';
    this.draw(this.lastDrawTime);
  }

  public setProgress(percent: number): void {
    this.percent = percent;
    this.draw(this.lastDrawTime);
  }

  public resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = rect.width || 360;
    const h = rect.height || 260;
    this.canvas.width = Math.max(1, Math.round(w * dpr));
    this.canvas.height = Math.max(1, Math.round(h * dpr));
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  public destroy(): void {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = 0;
    }
    this.canvas.remove();
  }

  private startLoop(): void {
    const render = (time: number) => {
      this.draw(time);
      this.animFrameId = requestAnimationFrame(render);
    };
    this.animFrameId = requestAnimationFrame(render);
  }

  public draw(time = 0): void {
    this.lastDrawTime = time;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = this.canvas.width / dpr;
    const h = this.canvas.height / dpr;
    if (w <= 0 || h <= 0) return;

    const ctx = this.ctx;
    ctx.clearRect(0, 0, w, h);

    const scale = Math.min(w / 425, h / 270);
    const bobY = Math.sin(time * 0.0022) * 3 * scale;
    const cx = w * 0.5;
    const cy = h * 0.49 + bobY;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);

    // 1. Floating Paper Island Wedge matching 0038.png organic diamond-wedge silhouette
    const buildIslandPath = (offsetY = 0): Path2D => {
      const p = new Path2D();
      p.moveTo(-148, -6 + offsetY);
      p.bezierCurveTo(-132, -40 + offsetY, -34, -64 + offsetY, 44, -68 + offsetY);
      p.bezierCurveTo(108, -70 + offsetY, 148, -44 + offsetY, 142, -6 + offsetY);
      p.bezierCurveTo(136, 36 + offsetY, 108, 72 + offsetY, 78, 86 + offsetY);
      p.bezierCurveTo(42, 102 + offsetY, -10, 62 + offsetY, -68, 44 + offsetY);
      p.bezierCurveTo(-118, 28 + offsetY, -156, 14 + offsetY, -148, -6 + offsetY);
      p.closePath();
      return p;
    };

    const topPath = buildIslandPath(0);
    const rimPath = buildIslandPath(9);

    // Subtle atmospheric shadow under island
    ctx.save();
    ctx.fillStyle = 'rgba(0, 56, 128, 0.22)';
    ctx.beginPath();
    ctx.ellipse(2, 56, 132, 34, -0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. 3D Extruded Island Thickness Rim (darkened skin color + navy depth)
    const rimColor = this.adjustHexBrightness(this.skinColor, -0.42);
    ctx.fillStyle = rimColor;
    ctx.fill(rimPath);
    ctx.strokeStyle = TYPOGRAPHY.OUTLINE_NAVY;
    ctx.lineWidth = 2;
    ctx.stroke(rimPath);

    // 3. Island Top Claimed Surface (skin territory gradient + subtle specular rim)
    ctx.save();
    const topGrad = ctx.createLinearGradient(-130, -60, 120, 75);
    topGrad.addColorStop(0, this.adjustHexBrightness(this.skinColor, 0.1));
    topGrad.addColorStop(0.55, this.skinColor);
    topGrad.addColorStop(1, this.adjustHexBrightness(this.skinColor, -0.14));
    ctx.fillStyle = topGrad;
    ctx.fill(topPath);

    ctx.clip(topPath);

    // Subtle territory percentage wave split on right edge (matching progress state cleanly)
    const clampedPct = Math.max(12, Math.min(100, this.percent));
    if (clampedPct < 100) {
      const splitX = -95 + (215 * (clampedPct / 100));
      ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
      ctx.beginPath();
      ctx.moveTo(splitX, -85);
      ctx.lineTo(165, -85);
      ctx.lineTo(165, 110);
      ctx.lineTo(splitX, 110);
      ctx.bezierCurveTo(splitX - 18, 45, splitX + 14, -20, splitX, -85);
      ctx.closePath();
      ctx.fill();
    }

    // Hero drop shadow on island deck
    ctx.fillStyle = 'rgba(7, 26, 117, 0.24)';
    ctx.beginPath();
    ctx.ellipse(-6, -10, 46, 16, -0.04, 0, Math.PI * 2);
    ctx.fill();

    // 4. Sweeping Thick Glowing White Paper Trail curving across right half (like 0038.png)
    ctx.save();
    ctx.shadowColor = 'rgba(255, 190, 255, 0.75)';
    ctx.shadowBlur = 16;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineCap = 'round';
    ctx.lineWidth = 42;
    ctx.beginPath();
    ctx.moveTo(14, -24);
    ctx.bezierCurveTo(64, -22, 112, 6, 108, 52);
    ctx.stroke();

    // Inner bright core & soft aura at hero trail base
    const auraGrad = ctx.createRadialGradient(28, -24, 2, 28, -24, 34);
    auraGrad.addColorStop(0, 'rgba(255, 255, 255, 0.96)');
    auraGrad.addColorStop(0.45, 'rgba(255, 130, 240, 0.42)');
    auraGrad.addColorStop(1, 'rgba(255, 130, 240, 0)');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(28, -24, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore(); // End topPath clip

    // Crisp rim outline along top island deck
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.34)';
    ctx.lineWidth = 2;
    ctx.stroke(topPath);

    // 5. Standing 3D Hero Voxel Cube matching equipped skin
    const heroBob = Math.sin(time * 0.0032 + 0.5) * 2.5;
    this.drawEquippedHeroVoxel(ctx, -6, -54 + heroBob, 78);

    ctx.restore();
  }

  private drawEquippedHeroVoxel(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    size: number,
  ): void {
    ctx.save();
    ctx.translate(cx, cy);

    const w = size;
    const h = size * 0.96;
    const r = size * 0.22;
    const depth = size * 0.16;

    // 3D Base / Extruded Side Body
    const bodyDark = this.adjustHexBrightness(this.skinColor, -0.3);
    ctx.fillStyle = bodyDark;
    ctx.strokeStyle = TYPOGRAPHY.OUTLINE_NAVY;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.roundRect(-w * 0.5, -h * 0.5 + depth, w, h, r);
    ctx.fill();
    ctx.stroke();

    // Main Top/Front Cube Face Gradient
    const faceGrad = ctx.createLinearGradient(0, -h * 0.5, 0, h * 0.5);
    faceGrad.addColorStop(0, this.adjustHexBrightness(this.skinColor, 0.22));
    faceGrad.addColorStop(0.65, this.skinColor);
    faceGrad.addColorStop(1, bodyDark);
    ctx.fillStyle = faceGrad;
    ctx.beginPath();
    ctx.roundRect(-w * 0.5, -h * 0.5, w, h, r);
    ctx.fill();
    ctx.stroke();

    // Accent belt / scarf / secondary color stripe
    ctx.fillStyle = this.skinSecondary;
    ctx.beginPath();
    ctx.roundRect(-w * 0.44, h * 0.14, w * 0.88, h * 0.18, size * 0.08);
    ctx.fill();

    // Glossy specular top bevel highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.44)';
    ctx.beginPath();
    ctx.ellipse(-w * 0.14, -h * 0.34, w * 0.22, h * 0.075, -0.1, 0, Math.PI * 2);
    ctx.fill();

    // Cute signature goggle eyes
    const eyeSpan = w * 0.54;
    const eyeR = eyeSpan * 0.34;
    const eyeY = -h * 0.07;

    for (const dir of [-1, 1]) {
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = TYPOGRAPHY.OUTLINE_NAVY;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.ellipse(dir * eyeSpan * 0.25, eyeY, eyeR * 0.9, eyeR * 1.15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#09248A';
      ctx.beginPath();
      ctx.ellipse(dir * eyeSpan * 0.23, eyeY + eyeR * 0.06, eyeR * 0.48, eyeR * 0.72, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#040B2A';
      ctx.beginPath();
      ctx.ellipse(dir * eyeSpan * 0.23, eyeY - eyeR * 0.08, eyeR * 0.3, eyeR * 0.42, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(dir * eyeSpan * 0.23 - eyeR * 0.16, eyeY - eyeR * 0.3, eyeR * 0.16, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private adjustHexBrightness(hex: string, factor: number): string {
    const clean = hex.replace('#', '');
    if (clean.length !== 6) return hex;
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return hex;

    const adj = (ch: number) => {
      const next = factor >= 0 ? ch + (255 - ch) * factor : ch * (1 + factor);
      return Math.max(0, Math.min(255, Math.round(next)));
    };
    return `#${[adj(r), adj(g), adj(b)].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
  }
}
