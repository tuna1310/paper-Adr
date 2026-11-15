package com.paperclone.game.core.engine

import kotlin.math.max
import kotlin.math.min

/**
 * FloodFill implementation for PaperClone with robust enclosure detection
 * and mathematical bounds guarantees preventing map overflow ("tràn map").
 *
 * Algorithm:
 * 1. Mark barriers: trail cells and capturing player's territory.
 * 2. Build bounding box around trail + connected territory, dynamically expanding
 *    any border that cuts through territory until perimeter is in open space.
 * 3. Multi-source BFS from the open perimeter of the bounding box to flood all outside cells.
 * 4. Any unvisited cell inside the bounding box is part of the closed enclosure.
 * 5. Isoperimetric sanity check: An enclosed region cannot exceed the theoretical
 *    maximum area bounded by a loop of length L (A <= L^2 / 2).
 */
class FloodFill(private val mapSize: Int = GameConfig.GRID_SIZE) {
    private val totalCells = mapSize * mapSize

    // Reusable arrays to avoid GC allocations during 60 FPS gameplay
    private val queue = IntArray(totalCells)
    private val visited = BooleanArray(totalCells)
    private val isBarrier = BooleanArray(totalCells)
    private val candidateCells = IntArray(totalCells)

    /**
     * Executes the territory enclosure capture.
     *
     * @param gridMap The game grid map.
     * @param playerId The ID of the capturing player.
     * @param trail The trail just closed by the player.
     * @return Number of new cells captured (including trail cells).
     */
    fun capture(gridMap: GridMap, playerId: Int, trail: Trail): Int {
        if (trail.isEmpty) return 0

        // Reset buffers
        visited.fill(false)
        isBarrier.fill(false)

        // 1. Mark barriers: trail cells and player's own existing territory
        for (idx in trail.cells) {
            if (idx in 0 until totalCells) {
                isBarrier[idx] = true
            }
        }
        for (i in 0 until totalCells) {
            if (gridMap.grid[i] == playerId) {
                isBarrier[i] = true
            }
        }

        // 2. Determine initial bounding box from trail
        var minX = mapSize - 1
        var maxX = 0
        var minY = mapSize - 1
        var maxY = 0

        for (idx in trail.cells) {
            val x = idx % mapSize
            val y = idx / mapSize
            if (x < minX) minX = x
            if (x > maxX) maxX = x
            if (y < minY) minY = y
            if (y > maxY) maxY = y
        }

        // Expand initial bounding box by 6 cells margin
        var boxMinX = max(0, minX - 6)
        var boxMaxX = min(mapSize - 1, maxX + 6)
        var boxMinY = max(0, minY - 6)
        var boxMaxY = min(mapSize - 1, maxY + 6)

        // Dynamically expand borders if they cut through the player's territory
        // to guarantee the perimeter is in clear open space
        while (boxMinX > 0 && hasTerritoryOnColumn(gridMap, playerId, boxMinX, boxMinY, boxMaxY)) {
            boxMinX = max(0, boxMinX - 4)
        }
        while (boxMaxX < mapSize - 1 && hasTerritoryOnColumn(gridMap, playerId, boxMaxX, boxMinY, boxMaxY)) {
            boxMaxX = min(mapSize - 1, boxMaxX + 4)
        }
        while (boxMinY > 0 && hasTerritoryOnRow(gridMap, playerId, boxMinY, boxMinX, boxMaxX)) {
            boxMinY = max(0, boxMinY - 4)
        }
        while (boxMaxY < mapSize - 1 && hasTerritoryOnRow(gridMap, playerId, boxMaxY, boxMinX, boxMaxX)) {
            boxMaxY = min(mapSize - 1, boxMaxY + 4)
        }

        // 3. Multi-source BFS from the perimeter of the bounding box
        var qHead = 0
        var qTail = 0

        fun enqueue(x: Int, y: Int) {
            val idx = y * mapSize + x
            if (!visited[idx] && !isBarrier[idx]) {
                visited[idx] = true
                queue[qTail++] = idx
            }
        }

        // Enqueue perimeter of bounding box
        for (x in boxMinX..boxMaxX) {
            enqueue(x, boxMinY)
            enqueue(x, boxMaxY)
        }
        for (y in (boxMinY + 1) until boxMaxY) {
            enqueue(boxMinX, y)
            enqueue(boxMaxX, y)
        }

        // BFS flood through non-barrier cells within the bounding box
        while (qHead < qTail) {
            val curr = queue[qHead++]
            val cx = curr % mapSize
            val cy = curr / mapSize

            // 4-neighborhood
            if (cx > boxMinX) {
                val next = curr - 1
                if (!visited[next] && !isBarrier[next]) {
                    visited[next] = true
                    queue[qTail++] = next
                }
            }
            if (cx < boxMaxX) {
                val next = curr + 1
                if (!visited[next] && !isBarrier[next]) {
                    visited[next] = true
                    queue[qTail++] = next
                }
            }
            if (cy > boxMinY) {
                val next = curr - mapSize
                if (!visited[next] && !isBarrier[next]) {
                    visited[next] = true
                    queue[qTail++] = next
                }
            }
            if (cy < boxMaxY) {
                val next = curr + mapSize
                if (!visited[next] && !isBarrier[next]) {
                    visited[next] = true
                    queue[qTail++] = next
                }
            }
        }

        // 4. Collect candidate enclosed cells
        var candidateCount = 0
        for (y in boxMinY..boxMaxY) {
            val rowOffset = y * mapSize
            for (x in boxMinX..boxMaxX) {
                val idx = rowOffset + x
                // If not visited from outside border, it's enclosed or part of trail
                if (!visited[idx]) {
                    val prevOwner = gridMap.grid[idx]
                    if (prevOwner != playerId) {
                        candidateCells[candidateCount++] = idx
                    }
                }
            }
        }

        // 5. Mathematical Isoperimetric Sanity Check against "tràn map":
        // A loop of perimeter L cannot physically enclose an area > L^2 / (2 * pi).
        // If candidateCount exceeds a generous 2x safety ceiling, a breach occurred -> only claim trail cells.
        val trailLen = max(trail.cells.size, 10)
        val maxSafeEnclosure = (trailLen * trailLen) * 2

        val claimAllCandidates = candidateCount <= maxSafeEnclosure

        var capturedCount = 0
        if (claimAllCandidates) {
            for (i in 0 until candidateCount) {
                val idx = candidateCells[i]
                val x = idx % mapSize
                val y = idx / mapSize
                gridMap.setOwner(x, y, playerId)
                capturedCount++
            }
        } else {
            // Safety fallback: only capture the trail cells
            for (idx in trail.cells) {
                if (idx in 0 until totalCells && gridMap.grid[idx] != playerId) {
                    val x = idx % mapSize
                    val y = idx / mapSize
                    gridMap.setOwner(x, y, playerId)
                    capturedCount++
                }
            }
        }

        return capturedCount
    }

    private fun hasTerritoryOnColumn(gridMap: GridMap, playerId: Int, x: Int, minY: Int, maxY: Int): Boolean {
        for (y in minY..maxY) {
            if (gridMap.getOwner(x, y) == playerId) return true
        }
        return false
    }

    private fun hasTerritoryOnRow(gridMap: GridMap, playerId: Int, y: Int, minX: Int, maxX: Int): Boolean {
        val rowOffset = y * mapSize
        for (x in minX..maxX) {
            if (gridMap.grid[rowOffset + x] == playerId) return true
        }
        return false
    }
}
