import { GAME_CONFIG } from '../config';
import { PlayerId } from './types';

export class GridMap {
  readonly width: number;
  readonly height: number;
  readonly cellSize: number;
  readonly centerCellX: number;
  readonly centerCellY: number;
  readonly radiusCells: number;
  readonly totalPlayableCells: number;

  private readonly data: Uint8Array;
  private readonly cellCounts: Map<PlayerId, number> = new Map();
  private readonly playerCells: Map<PlayerId, Set<number>> = new Map();
  private readonly dirtyFlags: Set<PlayerId> = new Set();

  constructor(
    width: number = GAME_CONFIG.GRID_WIDTH,
    height: number = GAME_CONFIG.GRID_HEIGHT,
    cellSize: number = GAME_CONFIG.CELL_SIZE,
    centerCellX: number = GAME_CONFIG.ARENA_CENTER_CELL_X,
    centerCellY: number = GAME_CONFIG.ARENA_CENTER_CELL_Y,
    radiusCells: number = GAME_CONFIG.ARENA_RADIUS_CELLS
  ) {
    this.width = width;
    this.height = height;
    this.cellSize = cellSize;
    this.centerCellX = centerCellX;
    this.centerCellY = centerCellY;
    this.radiusCells = radiusCells;

    this.data = new Uint8Array(width * height);
    let playable = 0;
    const r2 = radiusCells * radiusCells;

    for (let gy = 0; gy < height; gy++) {
      const dy = gy - centerCellY;
      const dy2 = dy * dy;
      const rowOffset = gy * width;

      for (let gx = 0; gx < width; gx++) {
        const dx = gx - centerCellX;
        if (dx * dx + dy2 <= r2) {
          this.data[rowOffset + gx] = GAME_CONFIG.NEUTRAL_CELL;
          playable++;
        } else {
          this.data[rowOffset + gx] = GAME_CONFIG.BOUNDARY_CELL;
        }
      }
    }

    this.totalPlayableCells = playable;
  }

  isInsideBounds(gx: number, gy: number): boolean {
    return gx >= 0 && gx < this.width && gy >= 0 && gy < this.height;
  }

  isInsideArena(gx: number, gy: number): boolean {
    if (!this.isInsideBounds(gx, gy)) return false;
    const dx = gx - this.centerCellX;
    const dy = gy - this.centerCellY;
    return dx * dx + dy * dy <= this.radiusCells * this.radiusCells;
  }

  get(gx: number, gy: number): number {
    if (!this.isInsideBounds(gx, gy)) {
      return GAME_CONFIG.BOUNDARY_CELL;
    }
    return this.data[gy * this.width + gx];
  }

  set(gx: number, gy: number, ownerId: PlayerId): boolean {
    if (!this.isInsideBounds(gx, gy)) return false;
    const idx = gy * this.width + gx;
    const oldOwner = this.data[idx];

    if (oldOwner === GAME_CONFIG.BOUNDARY_CELL) {
      return false; // Cannot set boundary cells outside arena
    }

    if (oldOwner !== ownerId) {
      if (oldOwner !== GAME_CONFIG.NEUTRAL_CELL) {
        const oldSet = this.playerCells.get(oldOwner);
        if (oldSet) oldSet.delete(idx);

        const oldCnt = this.cellCounts.get(oldOwner) || 0;
        if (oldCnt > 0) {
          this.cellCounts.set(oldOwner, oldCnt - 1);
          this.dirtyFlags.add(oldOwner);
        }
      }

      this.data[idx] = ownerId;

      if (ownerId !== GAME_CONFIG.NEUTRAL_CELL) {
        let newSet = this.playerCells.get(ownerId);
        if (!newSet) {
          newSet = new Set<number>();
          this.playerCells.set(ownerId, newSet);
        }
        newSet.add(idx);

        const newCnt = (this.cellCounts.get(ownerId) || 0) + 1;
        this.cellCounts.set(ownerId, newCnt);
        this.dirtyFlags.add(ownerId);
      }
      return true;
    }

    return false;
  }

  worldToGrid(wx: number, wy: number): { gx: number; gy: number } {
    return {
      gx: Math.floor(wx / this.cellSize),
      gy: Math.floor(wy / this.cellSize)
    };
  }

  gridToWorld(gx: number, gy: number): { wx: number; wy: number } {
    return {
      wx: (gx + 0.5) * this.cellSize,
      wy: (gy + 0.5) * this.cellSize
    };
  }

  initTerritory(playerId: PlayerId, centerGx: number, centerGy: number, radiusCells: number): number {
    let claimed = 0;
    const r2 = radiusCells * radiusCells;

    for (let dy = -radiusCells; dy <= radiusCells; dy++) {
      const gy = centerGy + dy;
      if (gy < 0 || gy >= this.height) continue;
      const dy2 = dy * dy;

      for (let dx = -radiusCells; dx <= radiusCells; dx++) {
        const gx = centerGx + dx;
        if (gx < 0 || gx >= this.width) continue;

        if (dx * dx + dy2 <= r2 && this.isInsideArena(gx, gy)) {
          if (this.set(gx, gy, playerId)) {
            claimed++;
          }
        }
      }
    }
    this.dirtyFlags.add(playerId);
    return claimed;
  }

  countCells(playerId: PlayerId): number {
    return this.cellCounts.get(playerId) || 0;
  }

  getPercentage(playerId: PlayerId): number {
    if (this.totalPlayableCells <= 0) return 0;
    const count = this.countCells(playerId);
    return (count / this.totalPlayableCells) * 100;
  }

  clearPlayerTerritory(playerId: PlayerId): number {
    const victimSet = this.playerCells.get(playerId);
    if (!victimSet || victimSet.size === 0) {
      this.cellCounts.set(playerId, 0);
      return 0;
    }

    const data = this.data;
    for (const idx of victimSet) {
      data[idx] = GAME_CONFIG.NEUTRAL_CELL;
    }

    const cleared = victimSet.size;
    victimSet.clear();
    this.cellCounts.set(playerId, 0);
    this.dirtyFlags.add(playerId);
    return cleared;
  }

  transferTerritory(victimId: PlayerId, killerId: PlayerId): number {
    if (victimId === killerId) return 0;

    const victimSet = this.playerCells.get(victimId);
    if (!victimSet || victimSet.size === 0) {
      return 0;
    }

    let killerSet = this.playerCells.get(killerId);
    if (!killerSet) {
      killerSet = new Set<number>();
      this.playerCells.set(killerId, killerSet);
    }

    const data = this.data;
    for (const idx of victimSet) {
      data[idx] = killerId;
      killerSet.add(idx);
    }

    const transferred = victimSet.size;
    victimSet.clear();

    const currentKillerCount = this.cellCounts.get(killerId) || 0;
    this.cellCounts.set(killerId, currentKillerCount + transferred);
    this.cellCounts.set(victimId, 0);

    this.dirtyFlags.add(killerId);
    this.dirtyFlags.add(victimId);

    return transferred;
  }

  carveRivalTerritory(
    carverId: PlayerId,
    wx: number,
    wy: number,
    carveRadiusCells: number = GAME_CONFIG.CARVE_RADIUS_CELLS
  ): Map<PlayerId, number> {
    const carvedFrom = new Map<PlayerId, number>();
    const { gx: cgx, gy: cgy } = this.worldToGrid(wx, wy);
    const r2 = carveRadiusCells * carveRadiusCells;

    for (let dy = -carveRadiusCells; dy <= carveRadiusCells; dy++) {
      const gy = cgy + dy;
      if (gy < 0 || gy >= this.height) continue;
      const dy2 = dy * dy;

      for (let dx = -carveRadiusCells; dx <= carveRadiusCells; dx++) {
        const gx = cgx + dx;
        if (gx < 0 || gx >= this.width) continue;

        if (dx * dx + dy2 <= r2 && this.isInsideArena(gx, gy)) {
          const owner = this.get(gx, gy);
          if (owner > 0 && owner !== carverId && owner !== GAME_CONFIG.BOUNDARY_CELL) {
            if (this.set(gx, gy, carverId)) {
              carvedFrom.set(owner, (carvedFrom.get(owner) || 0) + 1);
            }
          }
        }
      }
    }

    return carvedFrom;
  }

  isDirty(playerId: PlayerId): boolean {
    return this.dirtyFlags.has(playerId);
  }

  clearDirty(playerId: PlayerId): void {
    this.dirtyFlags.delete(playerId);
  }

  markDirty(playerId: PlayerId): void {
    this.dirtyFlags.add(playerId);
  }

  getRawData(): Uint8Array {
    return this.data;
  }

  getPlayerCells(playerId: PlayerId): ReadonlySet<number> | undefined {
    return this.playerCells.get(playerId);
  }
}

