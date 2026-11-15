package com.paperclone.game.core.engine

import com.paperclone.game.core.ai.BotController
import com.paperclone.game.core.ai.Difficulty
import com.paperclone.game.core.ai.Personality
import kotlin.math.hypot

enum class GameStatus {
    READY,
    PLAYING,
    GAME_OVER,
    VICTORY,
    SPECIAL_REWARD
}

interface GameEventListener {
    fun onPlayerDied(killerName: String?, reason: KillReason)
    fun onKill(victimName: String, totalKills: Int)
    fun onKillStreak(streak: Int, bannerText: String)
    fun onTerritoryCaptured(capturedCells: Int, newPercentage: Float)
    fun onVictory(percentage: Float)
    fun onSpecialReward(percentage: Float)
    fun onSpeedBoostCollected() {}
}

/**
 * GameEngine managing the fixed 60 FPS loop, human player and 7 AI bots,
 * collisions, flood-fill captures, camera tracking, killstreaks, and win conditions.
 */
class GameEngine(
    val mapSize: Int = GameConfig.GRID_SIZE,
    var eventListener: GameEventListener? = null
) {
    val gridMap = GridMap(mapSize)
    val camera = Camera()
    val collisionDetector = CollisionDetector(mapSize)
    val floodFill = FloodFill(mapSize)
    val effectManager = EffectManager(gridMap)

    val players = ArrayList<Player>()
    lateinit var humanPlayer: Player

    var gameStatus: GameStatus = GameStatus.READY
        private set

    // Killstreak banner state for UI
    var bannerText: String? = null
    var bannerTimerSec: Float = 0f

    // Bot names pool
    private val botNames = listOf("Mia", "Nate", "chloe", "Lucas", "Sofia", "max_07", "Alex", "Zoe", "Leo", "Emma")

    init {
        initGame()
    }

    fun initGame() {
        players.clear()
        gridMap.reset()

        // 1. Human Player (ID = 1)
        humanPlayer = Player(id = 1, name = "You", isHuman = true)
        players.add(humanPlayer)

        val (playerSpawnX, playerSpawnY) = gridMap.findSpawnLocation()
        humanPlayer.spawn(playerSpawnX.toFloat() + 0.5f, playerSpawnY.toFloat() + 0.5f, 0f)
        gridMap.spawnInitialTerritory(humanPlayer.id, playerSpawnX, playerSpawnY)

        // 2. Initialize 7 Bots (IDs 2..8)
        val shuffledNames = botNames.shuffled()
        val personalities = listOf(
            Personality.GREEDY,
            Personality.CAUTIOUS,
            Personality.PREDATOR,
            Personality.GREEDY,
            Personality.CAUTIOUS,
            Personality.PREDATOR,
            Personality.CAUTIOUS
        )
        val difficulties = listOf(
            Difficulty.EASY,
            Difficulty.NORMAL,
            Difficulty.HARD,
            Difficulty.NORMAL,
            Difficulty.EASY,
            Difficulty.NORMAL,
            Difficulty.HARD
        )

        for (i in 0 until 7) {
            val botId = i + 2
            val name = shuffledNames.getOrElse(i) { "Bot_$botId" }
            val bot = Player(id = botId, name = name, isHuman = false)
            bot.skinIndex = (i + 1) % 6
            val controller = BotController(bot, personalities[i], difficulties[i])
            bot.botController = controller

            val (botSpawnX, botSpawnY) = gridMap.findSpawnLocation()
            val initialAngle = (Math.random() * Math.PI * 2.0).toFloat() - Math.PI.toFloat()
            bot.spawn(botSpawnX.toFloat() + 0.5f, botSpawnY.toFloat() + 0.5f, initialAngle)
            gridMap.spawnInitialTerritory(bot.id, botSpawnX, botSpawnY)
            controller.onSpawn(botSpawnX.toFloat() + 0.5f, botSpawnY.toFloat() + 0.5f)

            players.add(bot)
        }

        // Center camera immediately on human player
        camera.snapTo(humanPlayer.x, humanPlayer.y)

        bannerText = null
        bannerTimerSec = 0f
        gameStatus = GameStatus.PLAYING
    }

    /**
     * Steer the human player using touch drag vector.
     */
    fun handleTouchDirection(dx: Float, dy: Float) {
        if (gameStatus != GameStatus.PLAYING || !humanPlayer.isAlive) return
        if (hypot(dx, dy) > 8f) {
            val angle = Player.angleFromVector(dx, dy)
            humanPlayer.requestSteerAngle(angle)
        }
    }

    /**
     * Fixed timestep tick (called 60 times/sec).
     */
    fun tick(dt: Float = GameConfig.FIXED_TIMESTEP_SEC) {
        if (gameStatus != GameStatus.PLAYING) return

        // 0. Update banner timer
        if (bannerTimerSec > 0f) {
            bannerTimerSec -= dt
            if (bannerTimerSec <= 0f) {
                bannerText = null
            }
        }

        // 1. Update each player/bot
        for (player in players) {
            if (!player.isAlive) {
                // Respawn countdown for bots (2-3 seconds)
                if (!player.isHuman) {
                    player.respawnTimerSec -= dt
                    if (player.respawnTimerSec <= 0f) {
                        respawnBot(player)
                    }
                }
                continue
            }

            // AI bot steering update
            if (!player.isHuman) {
                player.botController?.update(dt, gridMap, players)
            }

            val prevX = player.x
            val prevY = player.y

            player.update(dt)

            // Check if player center or leading head boundary touches own territory
            val touchesOwn = gridMap.getOwnerAt(player.x, player.y) == player.id ||
                    gridMap.getOwnerAt(
                        player.x + kotlin.math.cos(player.directionAngle) * (GameConfig.HEAD_RADIUS * 0.75f),
                        player.y + kotlin.math.sin(player.directionAngle) * (GameConfig.HEAD_RADIUS * 0.75f)
                    ) == player.id

            if (!touchesOwn) {
                // Outside own territory -> recording trail
                if (!player.isOutsideTerritory) {
                    player.isOutsideTerritory = true
                    player.trail.clear()
                    player.trail.addPoint(prevX, prevY, mapSize)
                }

                val lastPoint = if (player.trail.points.isNotEmpty()) player.trail.points.last() else null
                val distFromLast = if (lastPoint != null) hypot(player.x - lastPoint.x, player.y - lastPoint.y) else 10f

                if (distFromLast >= GameConfig.TRAIL_POINT_MIN_DIST) {
                    player.trail.addPoint(player.x, player.y, mapSize)
                }
            } else {
                // Inside own territory
                if (player.isOutsideTerritory) {
                    // Closed a loop!
                    player.trail.addPoint(player.x, player.y, mapSize)
                    val captured = floodFill.capture(gridMap, player.id, player.trail)
                    player.trail.clear()
                    player.isOutsideTerritory = false

                    // Trigger capture ripple & sparkle effect
                    effectManager.spawnCaptureRipple(player.x, player.y, player.colorInt)

                    val newPct = gridMap.getPercentage(player.id)
                    if (player.isHuman) {
                        eventListener?.onTerritoryCaptured(captured, newPct)

                        // Check Special Reward condition (>= 90%)
                        if (newPct >= GameConfig.SPECIAL_REWARD_PERCENTAGE) {
                            gameStatus = GameStatus.SPECIAL_REWARD
                            eventListener?.onSpecialReward(newPct)
                        } else if (newPct >= GameConfig.WIN_PERCENTAGE) {
                            // Check Victory condition (>= 60%)
                            gameStatus = GameStatus.VICTORY
                            eventListener?.onVictory(newPct)
                        }
                    }
                }
            }
        }

        // 2. Collision checks
        val deaths = collisionDetector.checkCollisions(players, gridMap)
        for (death in deaths) {
            val victim = players.find { it.id == death.victimId } ?: continue
            if (!victim.isAlive) continue

            victim.kill()
            gridMap.clearTerritory(victim.id)

            // Trigger confetti explosion in victim's color
            effectManager.spawnConfettiExplosion(victim.x, victim.y, victim.colorInt, 35)

            val killer = death.killerId?.let { kId -> players.find { it.id == kId } }
            if (killer != null && killer.id != victim.id) {
                if (killer.isHuman || victim.isHuman) {
                    effectManager.triggerCameraShake(0.22f, 8f)
                }
                killer.kills++
                val now = System.currentTimeMillis()
                if (now - killer.lastKillTimeMs <= 3000L) {
                    killer.recentKillCount++
                } else {
                    killer.recentKillCount = 1
                }
                killer.lastKillTimeMs = now

                if (killer.isHuman) {
                    eventListener?.onKill(victim.name, killer.kills)
                    // Trigger multi-kill banner if 2+ kills in 3s
                    if (killer.recentKillCount >= 2) {
                        val text = when (killer.recentKillCount) {
                            2 -> "DOUBLE KILL!"
                            3 -> "TRIPLE KILL!"
                            else -> "MEGA KILL!"
                        }
                        bannerText = text
                        bannerTimerSec = 1.8f
                        eventListener?.onKillStreak(killer.recentKillCount, text)
                    }
                }
            }

            if (victim.isHuman) {
                gameStatus = GameStatus.GAME_OVER
                eventListener?.onPlayerDied(killer?.name, death.reason)
            }
        }

        // 3. Update Power-ups and Particle Effects
        effectManager.update(dt)
        for (item in effectManager.powerUps) {
            if (!item.isActive) continue
            for (p in players) {
                if (!p.isAlive) continue
                val dist = hypot(p.x - item.x, p.y - item.y)
                if (dist <= 1.2f) {
                    item.collect()
                    p.speedBoostTimerSec = GameConfig.SPEED_BOOST_DURATION_SEC
                    effectManager.spawnCaptureRipple(item.x, item.y, 0xFFFFD600.toInt())
                    if (p.isHuman) {
                        eventListener?.onSpeedBoostCollected()
                    }
                    break
                }
            }
        }

        // 4. Update Camera to smoothly track human player
        if (humanPlayer.isAlive) {
            camera.update(
                humanPlayer.x + effectManager.shakeOffsetX / camera.cellSizePixels,
                humanPlayer.y + effectManager.shakeOffsetY / camera.cellSizePixels,
                dt
            )
        }
    }

    /**
     * Respawns a dead bot after 2-3 seconds at an unoccupied location.
     */
    private fun respawnBot(bot: Player) {
        val (spawnX, spawnY) = gridMap.findSpawnLocation()
        val initialAngle = (Math.random() * Math.PI * 2.0).toFloat() - Math.PI.toFloat()
        bot.spawn(spawnX.toFloat() + 0.5f, spawnY.toFloat() + 0.5f, initialAngle)
        gridMap.spawnInitialTerritory(bot.id, spawnX, spawnY)
        bot.botController?.onSpawn(spawnX.toFloat() + 0.5f, spawnY.toFloat() + 0.5f)
    }

    /**
     * Returns the sorted leaderboard of all players by territory percentage descending.
     */
    fun getLeaderboard(): List<Player> {
        return players.sortedByDescending { gridMap.getTerritoryCount(it.id) }
    }

    fun restart() {
        initGame()
    }
}
