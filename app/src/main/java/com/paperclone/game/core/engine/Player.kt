package com.paperclone.game.core.engine

import com.paperclone.game.ui.theme.CandyPalette
import kotlin.math.abs
import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.sin

/**
 * Represents the human player or an AI bot in the game.
 */
class Player(
    val id: Int,
    var name: String,
    val isHuman: Boolean = false,
    var skinIndex: Int = 0
) {
    var x: Float = 0f
    var y: Float = 0f

    // Heading angles in radians (0 = Right, PI/2 = Down, PI = Left, -PI/2 = Up)
    var directionAngle: Float = 0f
    var targetAngle: Float = 0f

    var speed: Float = GameConfig.DEFAULT_MOVE_SPEED
    var speedBoostTimerSec: Float = 0f
    var isAlive: Boolean = true
    var isOutsideTerritory: Boolean = false

    val trail = Trail(id)

    // Score & stats
    var kills: Int = 0
    var lastKillTimeMs: Long = 0L
    var recentKillCount: Int = 0 // for double/triple kill banner
    var respawnTimerSec: Float = 0f

    // Bot AI controller if this player is a bot
    var botController: com.paperclone.game.core.ai.BotController? = null

    // Custom skin attributes
    var patternIndex: Int = 0
    var customColorInt: Int? = null
    var customDarkColorInt: Int? = null

    val colorInt: Int get() = customColorInt ?: CandyPalette.getPlayerColorInt(id)
    val darkColorInt: Int get() = customDarkColorInt ?: CandyPalette.getPlayerDarkColorInt(id)

    fun spawn(startX: Float, startY: Float, initialAngle: Float = 0f) {
        x = startX
        y = startY
        directionAngle = initialAngle
        targetAngle = initialAngle
        isAlive = true
        isOutsideTerritory = false
        trail.clear()
        respawnTimerSec = 0f
    }

    /**
     * Request steering toward a new angle.
     * Enforces the rule: maximum 90 degrees turn at once, cannot 180-reverse immediately.
     */
    fun requestSteerAngle(requestedAngle: Float) {
        if (!isAlive) return
        val diff = normalizeAngle(requestedAngle - directionAngle)

        // Ignore reversal (> 150 degrees) to prevent instant suicide
        if (abs(diff) > Math.PI * 0.85) {
            return
        }

        // Clamp turn request to at most 90 degrees from current heading
        val maxTurn = GameConfig.MAX_TURN_ANGLE_RAD
        val clampedDiff = diff.coerceIn(-maxTurn, maxTurn)
        targetAngle = normalizeAngle(directionAngle + clampedDiff)
    }

    /**
     * Updates position and steering for one fixed timestep (dt).
     */
    fun update(dt: Float) {
        if (!isAlive) return

        // Handle speed boost (1.5x speed for 4s)
        if (speedBoostTimerSec > 0f) {
            speedBoostTimerSec -= dt
            speed = GameConfig.DEFAULT_MOVE_SPEED * GameConfig.SPEED_BOOST_MULTIPLIER
        } else {
            speed = GameConfig.DEFAULT_MOVE_SPEED
        }

        // Smooth steering toward targetAngle
        val angleDiff = normalizeAngle(targetAngle - directionAngle)
        val maxStep = GameConfig.MAX_STEER_RATE * dt
        if (abs(angleDiff) <= maxStep) {
            directionAngle = targetAngle
        } else {
            directionAngle += if (angleDiff > 0) maxStep else -maxStep
            directionAngle = normalizeAngle(directionAngle)
        }

        // Advance position
        x += cos(directionAngle) * speed * dt
        y += sin(directionAngle) * speed * dt
    }

    fun kill() {
        isAlive = false
        trail.clear()
        isOutsideTerritory = false
        respawnTimerSec = GameConfig.BOT_RESPAWN_DELAY_SEC
    }

    companion object {
        fun normalizeAngle(angle: Float): Float {
            var a = angle
            while (a > Math.PI) a -= (2 * Math.PI).toFloat()
            while (a < -Math.PI) a += (2 * Math.PI).toFloat()
            return a
        }

        fun angleFromVector(dx: Float, dy: Float): Float {
            return atan2(dy, dx)
        }
    }
}

