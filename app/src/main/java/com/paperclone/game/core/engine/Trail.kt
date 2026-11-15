package com.paperclone.game.core.engine

import kotlin.math.hypot
import kotlin.math.max
import kotlin.math.min

data class TrailPoint(val x: Float, val y: Float)

class Trail(val ownerId: Int) {
    val points = ArrayList<TrailPoint>(256)
    val cells = HashSet<Int>(256)

    val size: Int get() = points.size
    val isEmpty: Boolean get() = points.isEmpty()

    fun clear() {
        points.clear()
        cells.clear()
    }

    /**
     * Appends a new point to the trail. Also rasters cells along the segment
     * to guarantee contiguous coverage for flood fill boundary & grid lookups.
     */
    fun addPoint(nx: Float, ny: Float, mapSize: Int = GameConfig.GRID_SIZE) {
        if (points.isNotEmpty()) {
            val last = points.last()
            val dist = hypot(nx - last.x, ny - last.y)
            if (dist < 0.05f) return // Skip tiny jitter

            // Rasterize cells between last and new point
            val steps = max(1, (dist / 0.3f).toInt() + 1)
            for (s in 1..steps) {
                val t = s.toFloat() / steps
                val ix = (last.x + (nx - last.x) * t).toInt()
                val iy = (last.y + (ny - last.y) * t).toInt()
                if (ix in 0 until mapSize && iy in 0 until mapSize) {
                    cells.add(iy * mapSize + ix)
                }
            }
        } else {
            val ix = nx.toInt()
            val iy = ny.toInt()
            if (ix in 0 until mapSize && iy in 0 until mapSize) {
                cells.add(iy * mapSize + ix)
            }
        }
        points.add(TrailPoint(nx, ny))
    }

    fun containsCell(x: Int, y: Int, mapSize: Int = GameConfig.GRID_SIZE): Boolean {
        if (x !in 0 until mapSize || y !in 0 until mapSize) return false
        return cells.contains(y * mapSize + x)
    }

    /**
     * Checks if a circular head at (hx, hy) with radius collides with this trail.
     * [ignoreLastSegments]: used for self-collision check so the player doesn't hit their own neck.
     */
    fun collidesWith(
        hx: Float,
        hy: Float,
        radius: Float = GameConfig.HEAD_RADIUS,
        ignoreLastSegments: Int = 0
    ): Boolean {
        if (points.size < 2) return false
        val maxSegmentIdx = points.size - 1 - ignoreLastSegments
        if (maxSegmentIdx <= 0) return false

        val threshold = radius + GameConfig.TRAIL_WIDTH * 0.5f
        val radiusSq = threshold * threshold

        for (i in 0 until maxSegmentIdx) {
            val p1 = points[i]
            val p2 = points[i + 1]

            // Fast bounding box prune before expensive segment projection
            val segMinX = if (p1.x < p2.x) p1.x else p2.x
            val segMaxX = if (p1.x > p2.x) p1.x else p2.x
            if (hx < segMinX - threshold || hx > segMaxX + threshold) continue

            val segMinY = if (p1.y < p2.y) p1.y else p2.y
            val segMaxY = if (p1.y > p2.y) p1.y else p2.y
            if (hy < segMinY - threshold || hy > segMaxY + threshold) continue

            val distSq = distToSegmentSq(hx, hy, p1.x, p1.y, p2.x, p2.y)
            if (distSq <= radiusSq) {
                return true
            }
        }
        return false
    }

    companion object {
        fun distToSegmentSq(px: Float, py: Float, x1: Float, y1: Float, x2: Float, y2: Float): Float {
            val dx = x2 - x1
            val dy = y2 - y1
            val lenSq = dx * dx + dy * dy
            if (lenSq == 0f) {
                val dpx = px - x1
                val dpy = py - y1
                return dpx * dpx + dpy * dpy
            }
            // Project point onto segment, clamp t to [0, 1]
            var t = ((px - x1) * dx + (py - y1) * dy) / lenSq
            t = max(0f, min(1f, t))
            val projX = x1 + t * dx
            val projY = y1 + t * dy
            val dpx = px - projX
            val dpy = py - projY
            return dpx * dpx + dpy * dpy
        }
    }
}

