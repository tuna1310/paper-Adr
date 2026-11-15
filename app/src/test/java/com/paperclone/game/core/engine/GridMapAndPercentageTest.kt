package com.paperclone.game.core.engine

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

class GridMapAndPercentageTest {

    private lateinit var gridMap: GridMap

    @Before
    fun setUp() {
        gridMap = GridMap(GameConfig.GRID_SIZE)
    }

    @Test
    fun testInitialSpawnTerritory() {
        // Player 1 spawns at (50, 50)
        gridMap.spawnInitialTerritory(ownerId = 1, centerX = 50, centerY = 50, radius = 2.5f)

        val count = gridMap.getTerritoryCount(1)
        // A 5x5 circle with radius 2.5 contains 21 grid cells
        assertEquals(21, count)

        val pct = gridMap.getPercentage(1)
        val expectedPct = (21f / 57600f) * 100f
        assertEquals(expectedPct, pct, 0.001f)
    }

    @Test
    fun testClearTerritoryOnDeath() {
        gridMap.spawnInitialTerritory(ownerId = 2, centerX = 100, centerY = 100)
        assertTrue(gridMap.getTerritoryCount(2) > 0)

        // Kill player 2
        gridMap.clearTerritory(2)
        assertEquals(0, gridMap.getTerritoryCount(2))
        assertEquals(0f, gridMap.getPercentage(2), 0.0001f)
        assertEquals(0, gridMap.getOwner(100, 100))
    }

    @Test
    fun testSteeringLimitAndNo180Reversal() {
        val player = Player(id = 1, name = "Tester")
        player.spawn(50f, 50f, initialAngle = 0f) // Facing Right (angle 0)

        // Request 180 degree reversal (PI)
        player.requestSteerAngle(Math.PI.toFloat())
        // Should be rejected! Target angle remains 0
        assertEquals(0f, player.targetAngle, 0.001f)

        // Request 120 degree turn (2.09 rad)
        player.requestSteerAngle((2.0 * Math.PI / 3.0).toFloat())
        // Should be clamped to 90 degrees (PI / 2)
        assertEquals((Math.PI / 2.0).toFloat(), player.targetAngle, 0.01f)

        // Request 45 degree turn (PI / 4)
        player.requestSteerAngle((Math.PI / 4.0).toFloat())
        // Within 90 degrees -> accepted
        assertEquals((Math.PI / 4.0).toFloat(), player.targetAngle, 0.01f)
    }
}

