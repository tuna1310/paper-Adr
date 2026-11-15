// 3D Isometric Floating Land Slice & 3D Perspective Red Car matching Paper.io 2 Reference

export class FloatingIsland3D {
  private skinColor = '#FF4757';
  private skinSecondary = '#FFA502';

  public setSkinAppearance(color: string, secondaryColor = '#FFFFFF'): void {
    this.skinColor = color || '#FF4757';
    this.skinSecondary = secondaryColor || '#FFFFFF';
  }
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animFrameId: number = 0;
  private percent: number = 63;

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

  public setProgress(percent: number): void {
    this.percent = percent;
  }

  public resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = rect.width || 360;
    const h = rect.height || 340;
    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  public destroy(): void {
    cancelAnimationFrame(this.animFrameId);
    this.canvas.remove();
  }

  private startLoop(): void {
    const render = (time: number) => {
      this.draw(time);
      this.animFrameId = requestAnimationFrame(render);
    };
    this.animFrameId = requestAnimationFrame(render);
  }

  private draw(time: number): void {
    const dpr = window.devicePixelRatio || 1;
    const w = this.canvas.width / dpr;
    const h = this.canvas.height / dpr;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, w, h);

    const bobY = Math.sin(time * 0.0022) * 3.5;
    const centerX = w / 2;
    const centerY = h / 2 + 18 + bobY;

    ctx.save();
    ctx.translate(centerX, centerY);

    // 1. Island Top Shape matching reference: rounded triangular wedge
    // Wide top sweeping from mid-left to high top-right, curving down to bottom-right apex
    const buildIslandTop = (offsetY = 0): Path2D => {
      const p = new Path2D();
      // Left rounded corner
      p.moveTo(-132, -8 + offsetY);
      // Top-left slope up toward center-right
      p.bezierCurveTo(-115, -48 + offsetY, -35, -82 + offsetY, 48, -110 + offsetY);
      // Top-right rounded corner
      p.bezierCurveTo(96, -124 + offsetY, 128, -114 + offsetY, 126, -72 + offsetY);
      // Right edge going almost straight down with slight inward taper
      p.bezierCurveTo(123, -10 + offsetY, 112, 65 + offsetY, 102, 108 + offsetY);
      // Bottom-right rounded corner
      p.bezierCurveTo(96, 134 + offsetY, 68, 138 + offsetY, 34, 122 + offsetY);
      // Bottom-left sweeping edge back up to left corner
      p.bezierCurveTo(-30, 92 + offsetY, -98, 48 + offsetY, -128, 14 + offsetY);
      p.bezierCurveTo(-136, 5 + offsetY, -136, -2 + offsetY, -132, -8 + offsetY);
      p.closePath();
      return p;
    };

    const topPath = buildIslandTop(0);
    const depthPath = buildIslandTop(10);

    // 2. 3D Bottom Thickness / Extrusion
    ctx.save();
    ctx.fillStyle = '#43474E';
    ctx.fill(depthPath);
    ctx.restore();

    // 3. Base Unclaimed White Surface
    ctx.save();
    ctx.fillStyle = '#FFFFFF';
    ctx.fill(topPath);

    // 4. Clip to Island Top to fill Claimed Gray Left Portion (63%) with wavy border
    ctx.clip(topPath);

    const splitX = -125 + (235 * (this.percent / 100));
    ctx.beginPath();
    ctx.moveTo(-160, -150);
    ctx.lineTo(splitX + 12, -150);
    // Wavy organic vertical boundary matching reference screenshot
    ctx.bezierCurveTo(
      splitX - 2, -70,
      splitX + 16, -20,
      splitX + 8, 35
    );
    ctx.bezierCurveTo(
      splitX + 2, 75,
      splitX + 14, 110,
      splitX + 10, 155
    );
    ctx.lineTo(-160, 155);
    ctx.closePath();

    ctx.fillStyle = '#5E6268';
    ctx.fill();

    // Ribbon trail matching equipped skin (like reference video 00:50)
    ctx.beginPath();
    ctx.moveTo(-45, 36);
    ctx.bezierCurveTo(-10, 42, 42, 12, 18, -32);
    ctx.bezierCurveTo(6, -50, -8, -56, -6, -64);
    ctx.lineWidth = 22;
    ctx.lineCap = 'round';
    ctx.strokeStyle = this.skinColor;
    ctx.stroke();
    ctx.lineWidth = 10;
    ctx.strokeStyle = this.skinSecondary;
    ctx.globalAlpha = 0.45;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // 5. Cast Shadow of Hovering Red Car on the Gray Island Surface
    const shadowScale = 1 - Math.sin(time * 0.0022) * 0.04;
    ctx.save();
    ctx.translate(-8, -10);
    ctx.scale(shadowScale, shadowScale);
    ctx.beginPath();
    ctx.moveTo(-36, 2);
    ctx.bezierCurveTo(-24, -5, 18, -6, 36, 0);
    ctx.bezierCurveTo(42, 4, 22, 10, -4, 9);
    ctx.bezierCurveTo(-26, 8, -42, 6, -36, 2);
    ctx.closePath();
    ctx.fillStyle = 'rgba(32, 35, 40, 0.42)';
    ctx.fill();
    ctx.restore();

    ctx.restore(); // End island clip

    // 6. Draw 3D Perspective Red Car hovering near top of island (directly below Nicaragua pill)
    const carBob = Math.sin(time * 0.0035) * 2.5;
    ctx.save();
    ctx.translate(-6, -68 + carBob);

    this.draw3DRedCar(ctx);

    ctx.restore();
    ctx.restore();
  }

  private draw3DRedCar(ctx: CanvasRenderingContext2D): void {
    // Back-left & Back-right wheels (partially behind body)
    this.drawWheel(ctx, -30, 8, 9, 11);
    this.drawWheel(ctx, 29, -4, 9, 11);

    const fillPoly = (pts: Array<[number, number]>, color: string, shade?: string) => {
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      if (shade) { ctx.fillStyle = shade; ctx.fill(); }
    };

    fillPoly([[-40, -10], [4, -8], [4, 10], [-40, 6]], this.skinColor, 'rgba(0,0,0,0.12)');
    ctx.strokeStyle = 'rgba(0,0,0,0.45)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    fillPoly([[4, -8], [38, -22], [38, -5], [4, 10]], this.skinColor, 'rgba(0,0,0,0.28)');
    ctx.stroke();

    fillPoly([[-40, -10], [-8, -22], [38, -22], [4, -8]], this.skinColor);
    fillPoly([[-28, -14], [-18, -36], [24, -40], [34, -20], [4, -8]], 'rgba(135, 206, 250, 0.55)');

    ctx.fillStyle = this.skinSecondary;
    ctx.beginPath();
    ctx.roundRect(-8, -26, 14, 12, 3);
    ctx.fill();

    fillPoly([[-20, -35], [6, -34], [28, -41], [4, -42]], this.skinColor);
    ctx.stroke();

    ctx.strokeStyle = this.skinColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    [[-27, -14, -19, -35], [3, -10, 6, -34], [19, -15, 18, -37], [33, -20, 27, -40]].forEach(([x1, y1, x2, y2]) => {
      ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
    });
    ctx.stroke();

    // Headlights (2 warm glowing orange-yellow lamps on front face)
    ctx.fillStyle = '#FFB300';
    ctx.strokeStyle = '#FFF8E1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(-37, -5, 9, 5, 1.5);
    ctx.roundRect(-10, -4, 9, 5, 1.5);
    ctx.fill();
    ctx.stroke();

    // Silver Front Bumper / License Plate
    ctx.fillStyle = '#CFD8DC';
    ctx.beginPath();
    ctx.roundRect(-25, 0, 13, 6, 1.5);
    ctx.fill();

    // Front-center & Rear-right wheels (in foreground)
    this.drawWheel(ctx, 10, 8, 10, 12);
    this.drawWheel(ctx, 28, 0, 9, 11);
  }

  private drawWheel(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
    ctx.save();
    ctx.translate(x, y);
    // Dark tire cylinder
    ctx.fillStyle = '#231934';
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, 4);
    ctx.fill();
    // Inner rim highlight
    ctx.fillStyle = '#7E7890';
    ctx.beginPath();
    ctx.ellipse(2, 0, w * 0.25, h * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
