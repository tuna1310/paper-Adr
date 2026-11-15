package com.paperclone.game.core.engine

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

class FloodFillTest {

    private lateinit var gridMap: GridMap
    private lateinit var floodFill: FloodFill

    @Before
    fun setUp() {
        gridMap = GridMap(GameConfig.GRID_SIZE)
        floodFill = FloodFill(GameConfig.GRID_SIZE)
    }

    @Test
    fun testCaptureRectangularLoop() {
        val playerId = 1
        // Create initial territory: vertical bar at x=50, y=50..55
        for (y in 50..55) {
            gridMap.setOwner(50, y, playerId)
        }
        val initialCount = gridMap.getTerritoryCount(playerId)
        assertEquals(6, initialCount)

        // Player leaves at (50, 50), moves right to (60, 50), down to (60, 55), left to (50, 55)
        val trail = Trail(playerId)
        // Segment 1: (50, 50) -> (60, 50)
        for (x in 50..60) trail.addPoint(x.toFloat(), 50f)
        // Segment 2: (60, 50) -> (60, 55)
        for (y in 50..55) trail.addPoint(60f, y.toFloat())
        // Segment 3: (60, 55) -> (50, 55)
        for (x in 60 downTo 50) trail.addPoint(x.toFloat(), 55f)

        val captured = floodFill.capture(gridMap, playerId, trail)
        assertTrue("Captured count should be positive", captured > 0)

        // Check that interior cell (55, 52) is now owned by player 1
        assertEquals(playerId, gridMap.getOwner(55, 52))
        // Check that boundary trail cell (60, 53) is owned by player 1
        assertEquals(playerId, gridMap.getOwner(60, 53))
        // Check that cell outside (65, 52) is NOT owned
        assertEquals(0, gridMap.getOwner(65, 52))

        // Total territory should equal rectangle 50..60 by 50..55 = 11 * 6 = 66 cells
        assertEquals(66, gridMap.getTerritoryCount(playerId))
    }

    @Test
    fun testCaptureStealsEnemyTerritory() {
        val p1 = 1
        val p2 = 2

        // Player 2 has a 3x3 territory at (54, 52)
        for (y in 51..53) {
            for (x in 54..56) {
                gridMap.setOwner(x, y, p2)
            }
        }
        assertEquals(9, gridMap.getTerritoryCount(p2))

        // Player 1 has base at x=50
        for (y in 50..55) {
            gridMap.setOwner(50, y, p1)
        }

        // Player 1 encloses the area containing Player 2's territory
        val trail = Trail(p1)
        for (x in 50..60) trail.addPoint(x.toFloat(), 50f)
        for (y in 50..55) trail.addPoint(60f, y.toFloat())
        for (x in 60 downTo 50) trail.addPoint(x.toFloat(), 55f)

        floodFill.capture(gridMap, p1, trail)

        // Player 2's cells inside the loop should now be stolen by Player 1
        assertEquals(0, gridMap.getTerritoryCount(p2))
        assertEquals(p1, gridMap.getOwner(55, 52))
        assertEquals(66, gridMap.getTerritoryCount(p1))
    }

    @Test
    fun testFloodFillPerformance() {
        val playerId = 1
        for (y in 40..60) gridMap.setOwner(40, y, playerId)

        val trail = Trail(playerId)
        for (x in 40..80) trail.addPoint(x.toFloat(), 40f)
        for (y in 40..60) trail.addPoint(80f, y.toFloat())
        for (x in 80 downTo 40) trail.addPoint(x.toFloat(), 60f)

        val start = System.nanoTime()
        val captured = floodFill.capture(gridMap, playerId, trail)
        val durationMs = (System.nanoTime() - start) / 1_000_000.0

        assertTrue("Captured cells: $captured", captured > 0)
        assertTrue("Execution took $durationMs ms, should be < 10ms", durationMs < 10.0)
    }
}

