import { GridMap } from './GridMap';
import { Player } from './Player';
import { CaptureResult } from './types';

function bresenham(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  callback: (gx: number, gy: number) => void
): void {
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  let cx = x0;
  let cy = y0;

  while (true) {
    callback(cx, cy);
    if (cx === x1 && cy === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      cx += sx;
    }
    if (e2 < dx) {
      err += dx;
      cy += sy;
    }
  }
}

export function closeLoopAndCapture(grid: GridMap, player: Player): CaptureResult {
  const trailPoints = player.trail.points;
  let capturedCount = 0;

  let minGx = grid.width;
  let maxGx = 0;
  let minGy = grid.height;
  let maxGy = 0;

  const updateBounds = (gx: number, gy: number) => {
    if (gx < minGx) minGx = gx;
    if (gx > maxGx) maxGx = gx;
    if (gy < minGy) minGy = gy;
    if (gy > maxGy) maxGy = gy;
  };

  // 1. Rasterize trail polyline segments to grid and stamp as player's territory
  const stampCell = (gx: number, gy: number) => {
    if (grid.isInsideArena(gx, gy)) {
      if (grid.set(gx, gy, player.id)) {
        capturedCount++;
      }
      updateBounds(gx, gy);
    }
  };

  if (trailPoints.length > 0) {
    // Rasterize consecutive trail points
    for (let i = 0; i < trailPoints.length - 1; i++) {
      const p1 = grid.worldToGrid(trailPoints[i].x, trailPoints[i].y);
      const p2 = grid.worldToGrid(trailPoints[i + 1].x, trailPoints[i + 1].y);
      bresenham(p1.gx, p1.gy, p2.gx, p2.gy, stampCell);
    }

    // Connect last trail point to player's current head position
    const lastP = grid.worldToGrid(
      trailPoints[trailPoints.length - 1].x,
      trailPoints[trailPoints.length - 1].y
    );
    const headP = grid.worldToGrid(player.x, player.y);
    bresenham(lastP.gx, lastP.gy, headP.gx, headP.gy, stampCell);
  }

  // If no bounds were recorded (empty or degenerate trail), clear and return
  if (minGx > maxGx || minGy > maxGy) {
    player.trail.clear();
    const headWorld = grid.gridToWorld(minGx, minGy);
    return {
      playerId: player.id,
      capturedCount: 0,
      minX: headWorld.wx,
      minY: headWorld.wy,
      maxX: headWorld.wx,
      maxY: headWorld.wy,
      centerPoint: { x: player.x, y: player.y }
    };
  }

  // 2. Expand bounding box by margin to guarantee exterior perimeter
  const margin = 6;
  const minBx = Math.max(0, minGx - margin);
  const maxBx = Math.min(grid.width - 1, maxGx + margin);
  const minBy = Math.max(0, minGy - margin);
  const maxBy = Math.min(grid.height - 1, maxGy + margin);

  const bWidth = maxBx - minBx + 1;
  const bHeight = maxBy - minBy + 1;
  const totalBoxCells = bWidth * bHeight;

  // 3. Fast exterior flood fill
  const visited = new Uint8Array(totalBoxCells);
  const queue = new Int32Array(totalBoxCells);
  let qHead = 0;
  let qTail = 0;

  const pushSeed = (gx: number, gy: number) => {
    const localIdx = (gy - minBy) * bWidth + (gx - minBx);
    if (visited[localIdx] === 0 && grid.get(gx, gy) !== player.id) {
      visited[localIdx] = 1;
      queue[qTail++] = (gy << 16) | (gx & 0xffff);
    }
  };

  // Seed perimeter cells of bounding box
  for (let gx = minBx; gx <= maxBx; gx++) {
    pushSeed(gx, minBy);
    pushSeed(gx, maxBy);
  }
  for (let gy = minBy + 1; gy < maxBy; gy++) {
    pushSeed(minBx, gy);
    pushSeed(maxBx, gy);
  }

  // BFS flood fill
  while (qHead < qTail) {
    const encoded = queue[qHead++];
    const cy = encoded >> 16;
    const cx = (encoded << 16) >> 16;

    // 4 cardinal neighbors
    const neighbors = [
      [cx + 1, cy],
      [cx - 1, cy],
      [cx, cy + 1],
      [cx, cy - 1]
    ];

    for (let i = 0; i < 4; i++) {
      const nx = neighbors[i][0];
      const ny = neighbors[i][1];

      if (nx >= minBx && nx <= maxBx && ny >= minBy && ny <= maxBy) {
        const nIdx = (ny - minBy) * bWidth + (nx - minBx);
        if (visited[nIdx] === 0 && grid.get(nx, ny) !== player.id) {
          visited[nIdx] = 1;
          queue[qTail++] = (ny << 16) | (nx & 0xffff);
        }
      }
    }
  }

  // 4. Capture all enclosed cells inside the bounding box
  for (let gy = minBy; gy <= maxBy; gy++) {
    const rowOffset = (gy - minBy) * bWidth;
    for (let gx = minBx; gx <= maxBx; gx++) {
      const idx = rowOffset + (gx - minBx);
      // If NOT visited from exterior and inside arena
      if (visited[idx] === 0 && grid.isInsideArena(gx, gy)) {
        if (grid.get(gx, gy) !== player.id) {
          if (grid.set(gx, gy, player.id)) {
            capturedCount++;
            updateBounds(gx, gy);
          }
        }
      }
    }
  }

  // Clear player's trail
  player.trail.clear();

  const minWorld = grid.gridToWorld(minGx, minGy);
  const maxWorld = grid.gridToWorld(maxGx, maxGy);

  return {
    playerId: player.id,
    capturedCount,
    minX: minWorld.wx,
    minY: minWorld.wy,
    maxX: maxWorld.wx,
    maxY: maxWorld.wy,
    centerPoint: {
      x: (minWorld.wx + maxWorld.wx) / 2,
      y: (minWorld.wy + maxWorld.wy) / 2
    }
  };
}

