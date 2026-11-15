package com.paperclone.game.core.ai

import com.paperclone.game.core.engine.GameConfig
import com.paperclone.game.core.engine.GameEngine
import com.paperclone.game.core.engine.GameStatus
import com.paperclone.game.core.engine.Player
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import kotlin.math.abs

class BotAITest {

    private lateinit var engine: GameEngine

    @Before
    fun setUp() {
        engine = GameEngine()
    }

    @Test
    fun testEightPlayersInitialized() {
        // 1 human + 7 bots = 8 players
        assertEquals(8, engine.players.size)
        assertTrue(engine.humanPlayer.isHuman)
        assertEquals(1, engine.humanPlayer.id)

        // All 7 bots are non-human with attached AI controllers
        for (i in 1..7) {
            val bot = engine.players[i]
            assertFalse(bot.isHuman)
            assertNotNull(bot.botController)
            assertTrue(bot.isAlive)
            assertTrue(engine.gridMap.getTerritoryCount(bot.id) > 0)
        }
    }

    @Test
    fun testBotAvoidsSelfTrail() {
        val bot = engine.players[1] // Bot ID 2
        bot.spawn(50f, 50f, initialAngle = 0f) // facing right

        // Create an older trail with 20 points forming a vertical wall at x=52 directly in front of bot
        for (y in 40..60) {
            bot.trail.addPoint(52f, y.toFloat())
        }
        // Add more trailing points so ignoreLastSegments=6 won't ignore the wall at x=52
        for (i in 1..10) {
            bot.trail.addPoint(50f - i, 40f)
        }

        bot.directionAngle = 0f
        bot.targetAngle = 0f

        // Bot performs AI decision
        bot.botController?.think(engine.gridMap, engine.players)

        // Bot must NOT choose 0 rad (straight into the trail wall at x=52)
        val turnDifference = abs(Player.normalizeAngle(bot.targetAngle - 0f))
        assertTrue("Bot should steer away from trail ahead, turnDiff=$turnDifference", turnDifference > 0.1f)
    }

    @Test
    fun testBotRespawnTiming() {
        val bot = engine.players[1] // Bot ID 2
        assertTrue(bot.isAlive)

        // Kill bot
        bot.kill()
        engine.gridMap.clearTerritory(bot.id)
        assertFalse(bot.isAlive)
        assertEquals(GameConfig.BOT_RESPAWN_DELAY_SEC, bot.respawnTimerSec, 0.01f)

        // Simulate 2.0 seconds passing (dt = 0.5f x 4)
        for (i in 1..4) {
            engine.tick(0.5f)
        }
        // Still dead at 2.0s
        assertFalse(bot.isAlive)

        // Simulate 0.6 seconds more (total 2.6s > 2.5s)
        engine.tick(0.6f)

        // Bot must now be respawned!
        assertTrue("Bot should respawn after 2.5s delay", bot.isAlive)
        assertTrue("Bot territory should be re-established", engine.gridMap.getTerritoryCount(bot.id) > 0)
    }

    @Test
    fun testRoundEndOnHumanDeath() {
        assertEquals(GameStatus.PLAYING, engine.gameStatus)

        // Human dies (e.g. out of bounds)
        engine.humanPlayer.x = -5f
        engine.tick(GameConfig.FIXED_TIMESTEP_SEC)

        assertEquals(GameStatus.GAME_OVER, engine.gameStatus)
    }

    @Test
    fun testRoundEndOnVictory60Percent() {
        assertEquals(GameStatus.PLAYING, engine.gameStatus)

        // Manually grant human 60% territory (60% of 57600 = 34560 cells)
        val requiredCells = (GameConfig.TOTAL_CELLS * 0.61f).toInt()
        for (i in 0 until requiredCells) {
            engine.gridMap.setOwner(i % GameConfig.GRID_SIZE, i / GameConfig.GRID_SIZE, engine.humanPlayer.id)
        }

        // Trigger loop closure to check win
        engine.humanPlayer.isOutsideTerritory = true
        engine.humanPlayer.trail.addPoint(engine.humanPlayer.x, engine.humanPlayer.y)
        engine.tick(GameConfig.FIXED_TIMESTEP_SEC)

        assertEquals(GameStatus.VICTORY, engine.gameStatus)
    }

    @Test
    fun testSpecialRewardOn90Percent() {
        // Manually grant human 90% territory
        val requiredCells = (GameConfig.TOTAL_CELLS * 0.91f).toInt()
        for (i in 0 until requiredCells) {
            engine.gridMap.setOwner(i % GameConfig.GRID_SIZE, i / GameConfig.GRID_SIZE, engine.humanPlayer.id)
        }

        engine.humanPlayer.isOutsideTerritory = true
        engine.humanPlayer.trail.addPoint(engine.humanPlayer.x, engine.humanPlayer.y)
        engine.tick(GameConfig.FIXED_TIMESTEP_SEC)

        assertEquals(GameStatus.SPECIAL_REWARD, engine.gameStatus)
    }

    @Test
    fun testDoubleKillStreakBanner() {
        val human = engine.humanPlayer
        val bot1 = engine.players[1]
        val bot2 = engine.players[2]

        // Human is alive at (50, 50)
        human.spawn(50f, 50f)

        // Bot 1 is outside with a trail passing through (50, 50)
        bot1.spawn(40f, 40f)
        bot1.isOutsideTerritory = true
        bot1.trail.addPoint(48f, 50f)
        bot1.trail.addPoint(52f, 50f)
        engine.tick(GameConfig.FIXED_TIMESTEP_SEC)

        assertEquals(1, human.kills)

        // Bot 2 is outside with a trail passing through human's current position
        bot2.spawn(60f, 60f)
        bot2.isOutsideTerritory = true
        bot2.trail.addPoint(human.x - 2f, human.y)
        bot2.trail.addPoint(human.x + 2f, human.y)
        engine.tick(GameConfig.FIXED_TIMESTEP_SEC)

        assertEquals(2, human.kills)
        assertEquals("DOUBLE KILL!", engine.bannerText)
        assertTrue(engine.bannerTimerSec > 0f)
    }

    @Test
    fun testPerformanceWithEightPlayers() {
        // Simulate 120 ticks (2 seconds of 60 FPS gameplay)
        val start = System.nanoTime()
        for (i in 0 until 120) {
            engine.tick(GameConfig.FIXED_TIMESTEP_SEC)
        }
        val durationMs = (System.nanoTime() - start) / 1_000_000.0

        // 120 ticks should easily execute in < 100ms on JVM (< 0.8ms per tick)
        assertTrue("120 ticks executed in $durationMs ms, well within 60 FPS budget", durationMs < 100.0)
    }
}
