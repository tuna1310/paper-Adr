package com.paperclone.game.core.engine

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

class CollisionTest {

    private lateinit var detector: CollisionDetector
    private lateinit var gridMap: GridMap

    @Before
    fun setUp() {
        detector = CollisionDetector(GameConfig.GRID_SIZE)
        gridMap = GridMap(GameConfig.GRID_SIZE)
    }

    @Test
    fun testOutOfBoundsCollision() {
        val p1 = Player(id = 1, name = "P1")
        p1.spawn(-1.0f, 50f) // negative x -> out of bounds

        val deaths = detector.checkCollisions(listOf(p1), gridMap)
        assertEquals(1, deaths.size)
        assertEquals(p1.id, deaths[0].victimId)
        assertTrue(deaths[0].reason is KillReason.OutOfBounds)
    }

    @Test
    fun testHeadHitsEnemyTrail() {
        val p1 = Player(id = 1, name = "Attacker")
        val p2 = Player(id = 2, name = "Victim")

        p1.spawn(30f, 30f)
        p2.spawn(50f, 50f)

        // P2 draws a trail passing through (30, 30)
        p2.trail.addPoint(25f, 30f)
        p2.trail.addPoint(35f, 30f)

        // P1's head at (30, 30) hits P2's trail
        val deaths = detector.checkCollisions(listOf(p1, p2), gridMap)
        assertEquals(1, deaths.size)
        assertEquals(p2.id, deaths[0].victimId) // P2 dies!
        assertEquals(p1.id, deaths[0].killerId) // P1 gets credit
        assertTrue(deaths[0].reason is KillReason.TrailHit)
    }

    @Test
    fun testSelfTrailCollision() {
        val p = Player(id = 1, name = "SelfCollider")
        p.spawn(50f, 50f)

        // Create a circular trail loop back to own head
        p.trail.addPoint(50f, 50f)
        p.trail.addPoint(60f, 50f)
        p.trail.addPoint(60f, 60f)
        p.trail.addPoint(50f, 60f)
        p.trail.addPoint(49.8f, 50.1f) // very close to start (50, 50)
        p.trail.addPoint(45f, 40f)     // moved further
        p.trail.addPoint(40f, 40f)
        p.trail.addPoint(35f, 40f)

        // Place head on the early part of trail (60, 50)
        p.x = 60f
        p.y = 50f

        val deaths = detector.checkCollisions(listOf(p), gridMap)
        assertEquals(1, deaths.size)
        assertEquals(p.id, deaths[0].victimId)
        assertTrue(deaths[0].reason is KillReason.SelfTrail)
    }

    @Test
    fun testHeadToHeadCollisionOutsideTerritory() {
        val p1 = Player(id = 1, name = "P1")
        val p2 = Player(id = 2, name = "P2")

        // Both at (70, 70), outside any territory (cell owner = 0)
        p1.spawn(70f, 70f)
        p2.spawn(70.2f, 70f)

        val deaths = detector.checkCollisions(listOf(p1, p2), gridMap)
        // Both should die!
        assertEquals(2, deaths.size)
        assertTrue(deaths.any { it.victimId == p1.id })
        assertTrue(deaths.any { it.victimId == p2.id })
    }

    @Test
    fun testHeadToHeadOneInsideOneOutside() {
        val p1 = Player(id = 1, name = "Defender")
        val p2 = Player(id = 2, name = "Invader")

        // P1's territory at (50, 50)
        gridMap.setOwner(50, 50, p1.id)

        // P1 is on own territory, P2 is touching P1
        p1.spawn(50.5f, 50.5f)
        p2.spawn(50.8f, 50.5f) // P2 is not in P2's territory (it's in P1's territory)

        val deaths = detector.checkCollisions(listOf(p1, p2), gridMap)
        // Only P2 (the invader outside own territory) dies!
        assertEquals(1, deaths.size)
        assertEquals(p2.id, deaths[0].victimId)
        assertEquals(p1.id, deaths[0].killerId)
    }
}

