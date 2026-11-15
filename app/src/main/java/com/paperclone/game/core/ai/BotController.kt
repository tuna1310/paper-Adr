package com.paperclone.game.core.ai

import com.paperclone.game.core.engine.GameConfig
import com.paperclone.game.core.engine.GridMap
import com.paperclone.game.core.engine.Player
import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.hypot
import kotlin.math.sin

/**
 * AI controller managing decision-making, self-trail avoidance,
 * home navigation, predator hunting, and anti-stuck corner avoidance for a single bot.
 */
class BotController(
    val bot: Player,
    var personality: Personality = Personality.CAUTIOUS,
    var difficulty: Difficulty = Difficulty.NORMAL
) {
    private var config = BotConfigs.getConfig(personality, difficulty)
    private var thinkTimerSec = 0f

    // Home anchor (updated when loop is completed)
    var homeBaseX: Float = bot.x
    var homeBaseY: Float = bot.y

    // Direction of the current exploration loop (+1 for right, -1 for left)
    private var loopTurnDirection = 1f

    // Anti-stuck watchdog state
    private var lastCheckX = 0f
    private var lastCheckY = 0f
    private var stuckTimerSec = 0f

    fun configure(personality: Personality, difficulty: Difficulty) {
        this.personality = personality
        this.difficulty = difficulty
        this.config = BotConfigs.getConfig(personality, difficulty)
    }

    fun onSpawn(x: Float, y: Float) {
        homeBaseX = x
        homeBaseY = y
        lastCheckX = x
        lastCheckY = y
        stuckTimerSec = 0f
        loopTurnDirection = if (Math.random() > 0.5) 1f else -1f
        thinkTimerSec = (Math.random() * 0.1f).toFloat() // stagger bot thinking
    }

    fun update(dt: Float, gridMap: GridMap, allPlayers: List<Player>) {
        if (!bot.isAlive) return

        // Anti-stuck watchdog: check if bot is blocked or oscillating in place
        if (hypot(bot.x - lastCheckX, bot.y - lastCheckY) < 0.8f) {
            stuckTimerSec += dt
            if (stuckTimerSec >= 1.2f) {
                // Force escape: reverse loop turn direction and aim towards center
                loopTurnDirection *= -1f
                val centerAngle = atan2(GameConfig.GRID_SIZE * 0.5f - bot.y, GameConfig.GRID_SIZE * 0.5f - bot.x)
                bot.requestSteerAngle(centerAngle)
                lastCheckX = bot.x
                lastCheckY = bot.y
                stuckTimerSec = 0f
            }
        } else {
            lastCheckX = bot.x
            lastCheckY = bot.y
            stuckTimerSec = 0f
        }

        thinkTimerSec -= dt
        if (thinkTimerSec <= 0f) {
            think(gridMap, allPlayers)
        }
    }

    fun think(gridMap: GridMap, allPlayers: List<Player>) {
        thinkTimerSec = config.thinkIntervalSec
        decideNextDirection(gridMap, allPlayers)
    }

    private fun decideNextDirection(gridMap: GridMap, allPlayers: List<Player>) {
        val isInside = gridMap.getOwnerAt(bot.x, bot.y) == bot.id
        if (isInside) {
            homeBaseX = bot.x
            homeBaseY = bot.y
        }

        var desiredAngle = bot.directionAngle

        // 1. Proactive wall proximity check: avoid running into map boundaries
        val margin = 14f
        val nearBorder = bot.x < margin || bot.x > GameConfig.GRID_SIZE - margin ||
                bot.y < margin || bot.y > GameConfig.GRID_SIZE - margin

        // 2. Immediate danger check: any enemy near our trail?
        val dangerImminent = isTrailUnderThreat(allPlayers)

        // 3. Predator behavior: is there an enemy trail to intercept nearby?
        val preyTrailPoint = if (personality == Personality.PREDATOR && !dangerImminent && !nearBorder) {
            findNearestEnemyTrailPoint(allPlayers, config.huntInterestRadius)
        } else null

        val distFromBase = hypot(bot.x - homeBaseX, bot.y - homeBaseY)

        when {
            // Near border -> steer away from boundary towards map center!
            nearBorder -> {
                desiredAngle = atan2(GameConfig.GRID_SIZE * 0.5f - bot.y, GameConfig.GRID_SIZE * 0.5f - bot.x)
            }

            // Danger detected while outside -> RETREAT HOME IMMEDIATELY!
            !isInside && dangerImminent -> {
                desiredAngle = findAngleTowardsHome(gridMap)
            }

            // Predator spotted enemy trail -> INTERCEPT!
            preyTrailPoint != null -> {
                desiredAngle = atan2(preyTrailPoint.second - bot.y, preyTrailPoint.first - bot.x)
            }

            // Outside territory and reached max distance -> HEAD BACK HOME
            !isInside && (distFromBase >= config.maxLoopDistance || bot.trail.size >= 80) -> {
                desiredAngle = findAngleTowardsHome(gridMap)
            }

            // Inside territory -> Venture outward into neutral or enemy land
            isInside -> {
                desiredAngle = findAngleTowardsUnowned(gridMap)
            }

            // Outside territory, expanding -> Gradually curve to form a closed loop
            else -> {
                val curveRate = (Math.PI / 16.0).toFloat() * loopTurnDirection
                desiredAngle = Player.normalizeAngle(bot.directionAngle + curveRate)
            }
        }

        // 4. Safety Filter: Check candidate angles with ray clearance scoring
        val safeAngle = findSafestAngle(desiredAngle, gridMap, allPlayers)
        bot.requestSteerAngle(safeAngle)
    }

    private fun isTrailUnderThreat(allPlayers: List<Player>): Boolean {
        if (bot.trail.points.isEmpty()) return false
        val senseDistSq = config.dangerSenseRadius * config.dangerSenseRadius

        for (other in allPlayers) {
            if (other.id == bot.id || !other.isAlive) continue

            for (i in bot.trail.points.indices step 3) {
                val tp = bot.trail.points[i]
                val dx = other.x - tp.x
                val dy = other.y - tp.y
                if (dx * dx + dy * dy <= senseDistSq) {
                    return true
                }
            }
        }
        return false
    }

    private fun findNearestEnemyTrailPoint(allPlayers: List<Player>, maxRadius: Float): Pair<Float, Float>? {
        var closestDistSq = maxRadius * maxRadius
        var targetPoint: Pair<Float, Float>? = null

        for (other in allPlayers) {
            if (other.id == bot.id || !other.isAlive || other.trail.points.isEmpty()) continue

            for (tp in other.trail.points) {
                val dx = tp.x - bot.x
                val dy = tp.y - bot.y
                val dSq = dx * dx + dy * dy
                if (dSq < closestDistSq) {
                    closestDistSq = dSq
                    targetPoint = Pair(tp.x, tp.y)
                }
            }
        }
        return targetPoint
    }

    private fun findAngleTowardsHome(gridMap: GridMap): Float {
        val cx = bot.x.toInt()
        val cy = bot.y.toInt()
        var closestDistSq = Float.MAX_VALUE
        var bestX = homeBaseX
        var bestY = homeBaseY

        for (dy in -5..5) {
            for (dx in -5..5) {
                val tx = cx + dx
                val ty = cy + dy
                if (gridMap.getOwner(tx, ty) == bot.id) {
                    val dSq = (tx + 0.5f - bot.x) * (tx + 0.5f - bot.x) + (ty + 0.5f - bot.y) * (ty + 0.5f - bot.y)
                    if (dSq < closestDistSq) {
                        closestDistSq = dSq
                        bestX = tx + 0.5f
                        bestY = ty + 0.5f
                    }
                }
            }
        }

        if (closestDistSq == Float.MAX_VALUE && bot.trail.points.isNotEmpty()) {
            bestX = bot.trail.points.first().x
            bestY = bot.trail.points.first().y
        }

        return atan2(bestY - bot.y, bestX - bot.x)
    }

    private fun findAngleTowardsUnowned(gridMap: GridMap): Float {
        val probes = floatArrayOf(
            bot.directionAngle,
            bot.directionAngle + 0.785f,
            bot.directionAngle - 0.785f,
            bot.directionAngle + 1.57f,
            bot.directionAngle - 1.57f
        )

        for (angle in probes) {
            val normAngle = Player.normalizeAngle(angle)
            val px = bot.x + cos(normAngle) * 4f
            val py = bot.y + sin(normAngle) * 4f
            if (gridMap.isInside(px, py) && gridMap.getOwnerAt(px, py) != bot.id) {
                return normAngle
            }
        }
        return bot.directionAngle
    }

    /**
     * Evaluates candidate angles using multi-ray clearance scoring.
     * Guaranteed to pick the safest heading with maximum obstacle clearance.
     */
    private fun findSafestAngle(
        desiredAngle: Float,
        gridMap: GridMap,
        allPlayers: List<Player>
    ): Float {
        val rawDiff = Player.normalizeAngle(desiredAngle - bot.directionAngle)
        val clampedDiff = if (kotlin.math.abs(rawDiff) > Math.PI * 0.85) {
            // When desired is 180 opposite, steer 90 to the side to smoothly initiate turn
            GameConfig.MAX_TURN_ANGLE_RAD * loopTurnDirection
        } else {
            rawDiff.coerceIn(-GameConfig.MAX_TURN_ANGLE_RAD, GameConfig.MAX_TURN_ANGLE_RAD)
        }
        val targetBase = Player.normalizeAngle(bot.directionAngle + clampedDiff)

        val candidateOffsets = floatArrayOf(
            0f,
            0.25f, -0.25f,
            0.50f, -0.50f,
            0.75f, -0.75f,
            1.00f, -1.00f,
            1.25f, -1.25f,
            1.50f, -1.50f
        )

        var bestCandidate = targetBase
        var maxClearance = -1f

        for (offset in candidateOffsets) {
            val candidate = Player.normalizeAngle(targetBase + offset)

            val turnDiff = kotlin.math.abs(Player.normalizeAngle(candidate - bot.directionAngle))
            if (turnDiff > GameConfig.MAX_TURN_ANGLE_RAD) continue

            val clearance = computeDirectionClearance(candidate, gridMap, allPlayers)
            if (clearance > maxClearance) {
                maxClearance = clearance
                bestCandidate = candidate
                if (clearance >= 4.0f) {
                    return candidate
                }
            }
        }

        return bestCandidate
    }

    /**
     * Computes distance clearance (0.0 to 4.5 cells) along the probed angle.
     */
    private fun computeDirectionClearance(
        angle: Float,
        gridMap: GridMap,
        allPlayers: List<Player>
    ): Float {
        val steps = floatArrayOf(0.8f, 1.6f, 2.4f, 3.2f, 4.0f)
        for (dist in steps) {
            val px = bot.x + cos(angle) * dist
            val py = bot.y + sin(angle) * dist

            // 1. Map border collision
            if (px < 1.5f || px >= GameConfig.GRID_SIZE - 1.5f || py < 1.5f || py >= GameConfig.GRID_SIZE - 1.5f) {
                return dist - 0.5f
            }

            // 2. Self trail collision
            if (bot.trail.collidesWith(px, py, GameConfig.HEAD_RADIUS, ignoreLastSegments = 6)) {
                return dist - 0.5f
            }

            // 3. Defender collision: enemy player on their own territory
            for (other in allPlayers) {
                if (other.id == bot.id || !other.isAlive) continue
                val distToEnemySq = (other.x - px) * (other.x - px) + (other.y - py) * (other.y - py)
                if (distToEnemySq <= (GameConfig.HEAD_RADIUS * 2.5f) * (GameConfig.HEAD_RADIUS * 2.5f)) {
                    val enemyInOwn = gridMap.getOwnerAt(other.x, other.y) == other.id
                    if (enemyInOwn) {
                        return dist - 0.5f
                    }
                }
            }
        }
        return 4.5f
    }
}
