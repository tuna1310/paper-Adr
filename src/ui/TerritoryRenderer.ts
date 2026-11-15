import { GridMap } from '../engine/GridMap';
import { Player } from '../engine/Player';
import { SKINS, PERF_CONFIG } from '../config';
import { SkinId } from '../engine/types';
import skinsData from '../meta/data/skins.json';

export interface VisualParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export class TerritoryRenderer {
  private static blobCache = new Map<number, Path2D>();
  private static lastBuildTime = new Map<number, number>();
  private static patternCache = new Map<string, CanvasPattern | null>();
  public static particles: VisualParticle[] = [];

  public static clearCache(): void {
    this.blobCache.clear();
    this.lastBuildTime.clear();
    this.particles.length = 0;
  }

  public static spawnCaptureSparkles(x: number, y: number, color: string, count = 12): void {
    if (this.particles.length >= PERF_CONFIG.MAX_PARTICLES) return;
    const palette = [color, '#FFFFFF', '#FFD700', '#00E5FF'];
    for (let i = 0; i < count; i++) {
      const ang = (i / count) * Math.PI * 2 + Math.random() * 0.4;
      const spd = 45 + Math.random() * 120;
      const maxLife = 0.4 + Math.random() * 0.25;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 30,
        y: y + (Math.random() - 0.5) * 30,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 15,
        size: 3.5 + Math.random() * 3.5,
        color: palette[i % palette.length],
        alpha: 1,
        life: maxLife,
        maxLife
      });
    }
  }

  public static spawnDeathExplosion(x: number, y: number, color: string, darkColor: string): void {
    if (this.particles.length >= PERF_CONFIG.MAX_PARTICLES) return;
    const palette = [color, darkColor, '#FFFFFF', '#FFEA00'];
    for (let i = 0; i < 18; i++) {
      const ang = (i / 18) * Math.PI * 2 + Math.random() * 0.3;
      const spd = 60 + Math.random() * 180;
      const maxLife = 0.45 + Math.random() * 0.3;
      this.particles.push({
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        size: 4.5 + Math.random() * 5,
        color: palette[i % palette.length],
        alpha: 1,
        life: maxLife,
        maxLife
      });
    }
  }

  public static updateAndDrawParticles(ctx: CanvasRenderingContext2D, dt: number): void {
    if (this.particles.length === 0) return;
    ctx.save();
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.life -= dt;
      if (pt.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.vx *= 0.93;
      pt.vy *= 0.93;
      pt.alpha = Math.max(0, pt.life / pt.maxLife);

      ctx.globalAlpha = pt.alpha;
      ctx.fillStyle = pt.color;
      const s = pt.size * (0.4 + 0.6 * pt.alpha);
      ctx.fillRect(pt.x - s * 0.5, pt.y - s * 0.5, s, s);
    }
    ctx.restore();
  }

  public static renderTerritories(
    ctx: CanvasRenderingContext2D,
    grid: GridMap,
    players: Player[]
  ): void {
    const now = performance.now();
    for (const p of players) {
      if (grid.countCells(p.id) <= 0) {
        this.blobCache.delete(p.id);
        continue;
      }

      const lastTime = this.lastBuildTime.get(p.id) || 0;
      const canRebuild = now - lastTime >= PERF_CONFIG.TERRITORY_REBUILD_INTERVAL_MS;

      if (!this.blobCache.has(p.id) || (grid.isDirty(p.id) && canRebuild)) {
        const blobPath = this.buildSmoothTerritoryPath(grid, p.id);
        this.blobCache.set(p.id, blobPath);
        this.lastBuildTime.set(p.id, now);
        grid.clearDirty(p.id);
      }

      const path = this.blobCache.get(p.id);
      if (!path) continue;

      // 1. 3D Extruded Bottom Thickness
      ctx.save();
      ctx.translate(0, 4.5);
      ctx.fillStyle = p.darkColor;
      ctx.fill(path);
      ctx.restore();

      // 2. Top Surface + Pattern + Crisp Rim (no expensive ctx.clip)
      const pat = this.getSkinPattern(ctx, p.skinId, p.color, p.darkColor);
      ctx.fillStyle = pat || p.color;
      ctx.fill(path);
      ctx.lineWidth = 3.5;
      ctx.lineJoin = 'round';
      ctx.strokeStyle = p.darkColor;
      ctx.stroke(path);
    }
  }

  private static buildSmoothTerritoryPath(grid: GridMap, playerId: number): Path2D {
    const w = grid.width;
    const h = grid.height;
    const cs = grid.cellSize;
    const raw = grid.getRawData();
    const ownedCells = grid.getPlayerCells(playerId);

    const adj = new Map<number, number[]>();
    const stride = w + 1;

    const addEdge = (x1: number, y1: number, x2: number, y2: number) => {
      const u = y1 * stride + x1;
      const v = y2 * stride + x2;
      let list = adj.get(u);
      if (!list) {
        list = [];
        adj.set(u, list);
      }
      list.push(v);
    };

    if (ownedCells && ownedCells.size > 0) {
      // O(ownedCells) instead of scanning all 57,600 grid cells!
      for (const idx of ownedCells) {
        const gx = idx % w;
        const gy = (idx - gx) / w;

        if (gy === 0 || raw[idx - w] !== playerId) addEdge(gx, gy, gx + 1, gy);
        if (gx === w - 1 || raw[idx + 1] !== playerId) addEdge(gx + 1, gy, gx + 1, gy + 1);
        if (gy === h - 1 || raw[idx + w] !== playerId) addEdge(gx + 1, gy + 1, gx, gy + 1);
        if (gx === 0 || raw[idx - 1] !== playerId) addEdge(gx, gy + 1, gx, gy);
      }
    }

    const path = new Path2D();

    for (const [startNode, neighbors] of adj.entries()) {
      while (neighbors.length > 0) {
        const ring: { x: number; y: number }[] = [];
        let curr = startNode;

        while (true) {
          const vx = (curr % stride) * cs;
          const vy = Math.floor(curr / stride) * cs;
          ring.push({ x: vx, y: vy });

          const nextList = adj.get(curr);
          if (!nextList || nextList.length === 0) break;
          curr = nextList.pop()!;
          if (curr === startNode) break;
        }

        if (ring.length >= 3) {
          const smoothed = this.smoothRingChaikin(ring);
          path.moveTo(smoothed[0].x, smoothed[0].y);
          for (let i = 1; i < smoothed.length; i++) {
            path.lineTo(smoothed[i].x, smoothed[i].y);
          }
          path.closePath();
        }
      }
    }

    return path;
  }

  private static smoothRingChaikin(pts: { x: number; y: number }[]): { x: number; y: number }[] {
    const next: { x: number; y: number }[] = [];
    const len = pts.length;
    for (let i = 0; i < len; i++) {
      const p0 = pts[i];
      const p1 = pts[(i + 1) % len];
      next.push({ x: p0.x * 0.75 + p1.x * 0.25, y: p0.y * 0.75 + p1.y * 0.25 });
      next.push({ x: p0.x * 0.25 + p1.x * 0.75, y: p0.y * 0.25 + p1.y * 0.75 });
    }
    return next;
  }

  private static getSkinPattern(
    ctx: CanvasRenderingContext2D,
    skinId: SkinId,
    baseColor: string,
    darkColor: string
  ): CanvasPattern | null {
    const key = `${skinId}_${baseColor}`;
    if (this.patternCache.has(key)) {
      return this.patternCache.get(key) || null;
    }

    const tile = document.createElement('canvas');
    tile.width = 64;
    tile.height = 64;
    const tctx = tile.getContext('2d');
    if (!tctx) return null;

    // Fill solid base color directly into the pattern tile so a single fill(path) draws both base & pattern!
    tctx.fillStyle = baseColor;
    tctx.fillRect(0, 0, 64, 64);

    const catalogSkin = skinsData.skins.find(s => s.id === skinId);
    const patType = catalogSkin?.pattern || SKINS[skinId]?.patternType || 'seeds';
    const secColor = catalogSkin?.secondaryColor || darkColor;

    tctx.save();
    if (patType === 'sprinkles' || patType === 'seeds' || patType === 'watermelon') {
      const colors = patType === 'sprinkles'
        ? ['#FFFFFF', '#FFE066', '#4DD0E1', secColor]
        : ['#263238', secColor, 'rgba(255,255,255,0.5)'];
      const coords = [[14, 14, 0.4], [42, 12, -0.5], [52, 34, 0.8], [18, 44, -0.3], [44, 50, 0.6]];
      coords.forEach(([x, y, ang], idx) => {
        tctx.save();
        tctx.translate(x, y);
        tctx.rotate(ang);
        tctx.fillStyle = colors[idx % colors.length];
        tctx.globalAlpha = 0.6;
        tctx.fillRect(-4, -2, 8, 4);
        tctx.restore();
      });
    } else if (patType === 'stripes' || patType === 'rainbow') {
      tctx.fillStyle = secColor;
      tctx.globalAlpha = 0.28;
      tctx.fillRect(0, 8, 64, 10);
      tctx.fillRect(0, 36, 64, 10);
    } else {
      tctx.fillStyle = 'rgba(255, 255, 255, 0.24)';
      [[16, 16, 5], [48, 20, 4], [28, 48, 6]].forEach(([x, y, r]) => {
        tctx.beginPath();
        tctx.arc(x, y, r, 0, Math.PI * 2);
        tctx.fill();
      });
    }
    tctx.restore();

    const pattern = ctx.createPattern(tile, 'repeat');
    this.patternCache.set(key, pattern);
    return pattern;
  }
}
