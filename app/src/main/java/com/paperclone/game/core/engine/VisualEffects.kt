package com.paperclone.game.core.engine

import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.Path
import android.graphics.RectF
import kotlin.math.cos
import kotlin.math.sin

enum class ParticleType {
    CONFETTI,
    SPARKLE,
    RIPPLE_RING
}

class Particle {
    var active: Boolean = false
    var type: ParticleType = ParticleType.CONFETTI
    var x: Float = 0f
    var y: Float = 0f
    var vx: Float = 0f
    var vy: Float = 0f
    var sizeW: Float = 10f
    var sizeH: Float = 10f
    var rotation: Float = 0f
    var vRot: Float = 0f
    var color: Int = 0
    var alpha: Float = 1f
    var life: Float = 1f
    var maxLife: Float = 1f

    fun update(dt: Float) {
        if (!active) return
        life -= dt
        if (life <= 0f) {
            active = false
            return
        }
        x += vx * dt
        y += vy * dt
        rotation += vRot * dt
        alpha = (life / maxLife).coerceIn(0f, 1f)

        when (type) {
            ParticleType.CONFETTI -> {
                // Decelerate and gentle gravity
                vx *= 0.95f
                vy = (vy + 4.5f * dt) * 0.95f
            }
            ParticleType.SPARKLE -> {
                vx *= 0.91f
                vy *= 0.91f
            }
            ParticleType.RIPPLE_RING -> {
                sizeW += 22f * dt // expanding radius in grid cells
            }
        }
    }
}

class PowerUpItem(
    val id: Int,
    var x: Float,
    var y: Float
) {
    var isActive: Boolean = true
    var pulseTimer: Float = 0f
    var respawnTimer: Float = 0f

    fun update(dt: Float, gridMap: GridMap) {
        pulseTimer += dt * 3.5f
        if (!isActive) {
            respawnTimer -= dt
            if (respawnTimer <= 0f) {
                // Respawn at a new random empty location
                val (nx, ny) = gridMap.findSpawnLocation()
                x = nx.toFloat() + 0.5f
                y = ny.toFloat() + 0.5f
                isActive = true
            }
        }
    }

    fun collect() {
        isActive = false
        respawnTimer = 10f + (Math.random() * 5f).toFloat() // 10-15s respawn
    }
}

/**
 * High-performance object pool for particles and ripples.
 * Eliminates heap allocations during 60 FPS gameplay.
 */
class EffectManager(private val gridMap: GridMap) {
    private val maxParticles = 240
    val particles = Array(maxParticles) { Particle() }

    // Max 3 speed boost powerups on map
    val powerUps = ArrayList<PowerUpItem>(3)

    // Camera shake effect
    var shakeDuration = 0f
    var shakeIntensity = 0f
    var shakeOffsetX = 0f
    var shakeOffsetY = 0f

    init {
        // Initialize 3 speed boost items at random safe locations
        for (i in 1..3) {
            val (sx, sy) = gridMap.findSpawnLocation()
            powerUps.add(PowerUpItem(i, sx.toFloat() + 0.5f, sy.toFloat() + 0.5f))
        }
    }

    fun triggerCameraShake(duration: Float = 0.25f, intensity: Float = 6f) {
        if (!GameConfig.ENABLE_CAMERA_SHAKE) return
        shakeDuration = duration
        shakeIntensity = intensity
    }

    /**
     * Spawns 40 confetti particles with victim color + sparkling accents.
     */
    fun spawnConfettiExplosion(worldX: Float, worldY: Float, victimColorInt: Int, count: Int = 40) {
        if (!GameConfig.ENABLE_PARTICLES) return
        var spawned = 0
        val colors = intArrayOf(
            victimColorInt,
            0xFFFFD600.toInt(), // Candy Yellow
            0xFFFFFFFF.toInt(), // White
            0xFFFF3388.toInt(), // Candy Pink
            0xFF00E676.toInt(), // Candy Green
            0xFF00E5FF.toInt()  // Candy Cyan
        )

        for (p in particles) {
            if (!p.active) {
                p.active = true
                p.type = ParticleType.CONFETTI
                p.x = worldX
                p.y = worldY
                val angle = (Math.random() * Math.PI * 2.0).toFloat()
                val speed = 5f + (Math.random() * 12f).toFloat()
                p.vx = cos(angle) * speed
                p.vy = sin(angle) * speed
                p.sizeW = 0.35f + (Math.random() * 0.40f).toFloat()
                p.sizeH = 0.18f + (Math.random() * 0.25f).toFloat()
                p.rotation = (Math.random() * 360f).toFloat()
                p.vRot = (-240f + (Math.random() * 480f)).toFloat()
                p.color = colors[(Math.random() * colors.size).toInt()]
                p.maxLife = 0.7f + (Math.random() * 0.3f).toFloat()
                p.life = p.maxLife
                p.alpha = 1f
                spawned++
                if (spawned >= count) break
            }
        }
    }

    /**
     * Spawns a capture ripple expanding over 0.4s with 10-12 sparkle stars.
     */
    fun spawnCaptureRipple(centerX: Float, centerY: Float, colorInt: Int) {
        if (!GameConfig.ENABLE_CAPTURE_RIPPLE) return

        // 1. Expanding translucent ripple ring
        for (p in particles) {
            if (!p.active) {
                p.active = true
                p.type = ParticleType.RIPPLE_RING
                p.x = centerX
                p.y = centerY
                p.vx = 0f
                p.vy = 0f
                p.sizeW = 0.5f // initial radius in cells
                p.color = colorInt
                p.maxLife = 0.40f // 0.4s duration
                p.life = p.maxLife
                p.alpha = 1f
                break
            }
        }

        // 2. 10 sparkling stars
        if (GameConfig.ENABLE_PARTICLES) {
            var spawned = 0
            for (p in particles) {
                if (!p.active) {
                    p.active = true
                    p.type = ParticleType.SPARKLE
                    p.x = centerX + (-0.8f + (Math.random() * 1.6f)).toFloat()
                    p.y = centerY + (-0.8f + (Math.random() * 1.6f)).toFloat()
                    val angle = (Math.random() * Math.PI * 2.0).toFloat()
                    val speed = 2f + (Math.random() * 4.5f).toFloat()
                    p.vx = cos(angle) * speed
                    p.vy = sin(angle) * speed
                    p.sizeW = 0.26f + (Math.random() * 0.25f).toFloat()
                    p.color = 0xFFFFFFFF.toInt()
                    p.maxLife = 0.38f
                    p.life = p.maxLife
                    p.alpha = 1f
                    spawned++
                    if (spawned >= 10) break
                }
            }
        }
    }

    fun update(dt: Float) {
        // Update particles
        for (p in particles) {
            if (p.active) {
                p.update(dt)
            }
        }

        // Update powerups
        for (item in powerUps) {
            item.update(dt, gridMap)
        }

        // Update camera shake
        if (shakeDuration > 0f) {
            shakeDuration -= dt
            val currentIntensity = shakeIntensity * (shakeDuration / 0.25f).coerceIn(0f, 1f)
            shakeOffsetX = (-currentIntensity + (Math.random() * currentIntensity * 2f)).toFloat()
            shakeOffsetY = (-currentIntensity + (Math.random() * currentIntensity * 2f)).toFloat()
            if (shakeDuration <= 0f) {
                shakeOffsetX = 0f
                shakeOffsetY = 0f
            }
        }
    }
}
