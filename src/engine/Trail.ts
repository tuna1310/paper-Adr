import { Point } from './types';
import { GAME_CONFIG } from '../config';

export interface Segment {
  p1: Point;
  p2: Point;
}

export class Trail {
  readonly points: Point[] = [];
  private readonly minDist: number;

  constructor(minDist: number = GAME_CONFIG.TRAIL_POINT_MIN_DIST) {
    this.minDist = minDist;
  }

  addPoint(x: number, y: number): boolean {
    const len = this.points.length;
    if (len === 0) {
      this.points.push({ x, y });
      return true;
    }

    const last = this.points[len - 1];
    const dx = x - last.x;
    const dy = y - last.y;

    if (dx * dx + dy * dy >= this.minDist * this.minDist) {
      this.points.push({ x, y });
      return true;
    }
    return false;
  }

  clear(): void {
    this.points.length = 0;
  }

  getSegments(): Segment[] {
    const segs: Segment[] = [];
    const len = this.points.length;
    for (let i = 0; i < len - 1; i++) {
      segs.push({
        p1: this.points[i],
        p2: this.points[i + 1]
      });
    }
    return segs;
  }

  getLength(): number {
    let total = 0;
    const len = this.points.length;
    for (let i = 0; i < len - 1; i++) {
      const p1 = this.points[i];
      const p2 = this.points[i + 1];
      total += Math.hypot(p2.x - p1.x, p2.y - p1.y);
    }
    return total;
  }

  clonePoints(): Point[] {
    return this.points.map(p => ({ x: p.x, y: p.y }));
  }
}

