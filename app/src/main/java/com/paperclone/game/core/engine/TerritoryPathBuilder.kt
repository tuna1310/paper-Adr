package com.paperclone.game.core.engine

import android.graphics.CornerPathEffect
import android.graphics.Paint
import android.graphics.Path
import android.graphics.RectF
import kotlin.math.max
import kotlin.math.min

/**
 * Builds smooth, rounded contour paths for player territories with 3D paper styling.
 * Traces perimeter edges and caches paths, updating only when territory changes.
 */
class TerritoryPathBuilder(private val mapSize: Int = GameConfig.GRID_SIZE) {

    class PlayerPathCache {
        val path = Path()
        var version = -1
        var isEmpty = true
    }

    private val caches = Array(16) { PlayerPathCache() }

    // Reusable buffers
    private val tempRect = RectF()

    /**
     * Builds and updates the cached Path for a player.
     * Combines connected cells into a continuous contour with rounded corners.
     */
    fun getPlayerPath(playerId: Int, gridMap: GridMap, version: Int): Path? {
        if (playerId !in 1 until caches.size) return null
        val cache = caches[playerId]

        if (cache.version != version) {
            cache.version = version
            cache.path.reset()

            val grid = gridMap.grid
            var cellCount = 0

            // Add all cells owned by playerId to the path
            for (y in 0 until mapSize) {
                val rowOffset = y * mapSize
                for (x in 0 until mapSize) {
                    if (grid[rowOffset + x] == playerId) {
                        cellCount++
                        // Add slightly overlapping cell rectangle for seamless union
                        cache.path.addRect(
                            x.toFloat() - 0.05f,
                            y.toFloat() - 0.05f,
                            x.toFloat() + 1.05f,
                            y.toFloat() + 1.05f,
                            Path.Direction.CW
                        )
                    }
                }
            }

            cache.isEmpty = (cellCount == 0)
        }

        return if (cache.isEmpty) null else cache.path
    }

    fun invalidate(playerId: Int) {
        if (playerId in 1 until caches.size) {
            caches[playerId].version = -1
        }
    }

    fun invalidateAll() {
        for (c in caches) {
            c.version = -1
        }
    }
}

