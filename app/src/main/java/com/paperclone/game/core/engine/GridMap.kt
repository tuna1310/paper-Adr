package com.paperclone.game.core.engine

import kotlin.math.sqrt

/**
 * 240x240 grid representing the game map.
 * Stores ownerId for each cell (0 = empty, 1 = player, 2..8 = bots).
 */
class GridMap(val size: Int = GameConfig.GRID_SIZE) {
    val totalCells: Int = size * size
    val grid = IntArray(totalCells)
    
    // Fast O(1) territory count per player ID (support up to 32 players/bots)
    private val territoryCounts = IntArray(32)

    // Version counter to trigger path rebuilding only when territory actually changes
    val territoryVersions = IntArray(32)

    init {
        // Initially all cells are 0 (empty)
        territoryCounts[0] = totalCells
    }

    fun isInside(x: Int, y: Int): Boolean {
        return x in 0 until size && y in 0 until size
    }

    fun isInside(x: Float, y: Float): Boolean {
        return x >= 0f && x < size && y >= 0f && y < size
    }

    fun getOwner(x: Int, y: Int): Int {
        if (!isInside(x, y)) return 0
        return grid[y * size + x]
    }

    fun getOwnerAt(worldX: Float, worldY: Float): Int {
        val cx = worldX.toInt()
        val cy = worldY.toInt()
        return getOwner(cx, cy)
    }

    fun setOwner(x: Int, y: Int, newOwner: Int) {
        if (!isInside(x, y)) return
        val idx = y * size + x
        val oldOwner = grid[idx]
        if (oldOwner != newOwner) {
            grid[idx] = newOwner
            if (oldOwner in territoryCounts.indices) {
                territoryCounts[oldOwner] = (territoryCounts[oldOwner] - 1).coerceAtLeast(0)
                territoryVersions[oldOwner]++
            }
            if (newOwner in territoryCounts.indices) {
                territoryCounts[newOwner]++
                territoryVersions[newOwner]++
            }
        }
    }

    fun getTerritoryCount(ownerId: Int): Int {
        return if (ownerId in territoryCounts.indices) territoryCounts[ownerId] else 0
    }

    fun getPercentage(ownerId: Int): Float {
        val count = getTerritoryCount(ownerId)
        return (count.toFloat() / totalCells.toFloat()) * 100f
    }

    /**
     * Clear all cells owned by ownerId back to 0 (neutral).
     */
    fun clearTerritory(ownerId: Int) {
        if (ownerId <= 0) return
        for (i in 0 until totalCells) {
            if (grid[i] == ownerId) {
                grid[i] = 0
            }
        }
        if (ownerId in territoryCounts.indices) {
            val freed = territoryCounts[ownerId]
            territoryCounts[ownerId] = 0
            territoryCounts[0] += freed
            territoryVersions[ownerId]++
            territoryVersions[0]++
        }
    }

    /**
     * Creates a circular initial 5x5 territory for a spawning player/bot.
     */
    fun spawnInitialTerritory(ownerId: Int, centerX: Int, centerY: Int, radius: Float = GameConfig.SPAWN_RADIUS) {
        val r = radius.toInt() + 1
        val rSq = radius * radius
        for (dy in -r..r) {
            for (dx in -r..r) {
                if (dx * dx + dy * dy <= rSq) {
                    val px = centerX + dx
                    val py = centerY + dy
                    if (isInside(px, py)) {
                        setOwner(px, py, ownerId)
                    }
                }
            }
        }
    }

    /**
     * Find a valid, unoccupied spawn location with radius margin.
     */
    fun findSpawnLocation(margin: Int = GameConfig.SPAWN_MARGIN): Pair<Int, Int> {
        val safeMin = margin
        val safeMax = size - margin
        var bestX = size / 2
        var bestY = size / 2
        var minOverlap = Int.MAX_VALUE

        // Try 20 random positions, pick the one with least existing territory
        for (attempt in 0..20) {
            val testX = safeMin + (Math.random() * (safeMax - safeMin)).toInt()
            val testY = safeMin + (Math.random() * (safeMax - safeMin)).toInt()
            var occupied = 0
            val checkRadius = 6
            for (dy in -checkRadius..checkRadius) {
                for (dx in -checkRadius..checkRadius) {
                    val tx = testX + dx
                    val ty = testY + dy
                    if (isInside(tx, ty) && getOwner(tx, ty) != 0) {
                        occupied++
                    }
                }
            }
            if (occupied == 0) {
                return Pair(testX, testY)
            }
            if (occupied < minOverlap) {
                minOverlap = occupied
                bestX = testX
                bestY = testY
            }
        }
        return Pair(bestX, bestY)
    }

    fun reset() {
        grid.fill(0)
        territoryCounts.fill(0)
        territoryCounts[0] = totalCells
        for (i in territoryVersions.indices) {
            territoryVersions[i]++
        }
    }
}

