package com.paperclone.game.ui.screens

import android.content.Context
import android.graphics.Canvas
import android.graphics.CornerPathEffect
import android.graphics.Paint
import android.graphics.Path
import android.graphics.RectF
import android.os.Build
import android.view.MotionEvent
import android.view.SurfaceHolder
import android.view.SurfaceView
import com.paperclone.game.core.audio.SoundManager
import com.paperclone.game.core.engine.CharacterRenderer
import com.paperclone.game.core.engine.GameConfig
import com.paperclone.game.core.engine.GameEngine
import com.paperclone.game.core.engine.GameEventListener
import com.paperclone.game.core.engine.GameStatus
import com.paperclone.game.core.engine.HapticManager
import com.paperclone.game.core.engine.KillReason
import com.paperclone.game.core.engine.ParticleType
import com.paperclone.game.core.engine.Player
import com.paperclone.game.core.engine.TerritoryPathBuilder
import com.paperclone.game.core.engine.TexturePatternManager
import kotlin.math.cos
import kotlin.math.sin

/**
 * Phase 5: High-performance, low-latency Native Canvas Game View.
 *
 * Polished features:
 * - 0-allocation render loop (pre-allocated paths, buffers, and string caches).
 * - Procedural sound effects & background music playback with SoundManager integration.
 * - Tactile vibration effects with HapticManager.
 * - Interactive First-Time Hand Swipe Tutorial overlay.
 * - In-sync audio mute button connected to DataStore.
 * - Lifecycle pause/resume and resource management.
 * - Real-time FPS debug overlay (toggleable via GameConfig.DEBUG_FPS).
 */
class GameSurfaceView(
    context: Context,
    val engine: GameEngine
) : SurfaceView(context), SurfaceHolder.Callback, Runnable {

    private var gameThread: Thread? = null
    @Volatile
    private var isRunning = false

    // Subsystems
    private val pathBuilder = TerritoryPathBuilder(engine.mapSize)
    private val patternManager = TexturePatternManager()
    private val characterRenderer = CharacterRenderer()
    private val soundManager = SoundManager.getInstance(context)
    private val hapticManager = HapticManager(context)

    var isMuted = !soundManager.isSoundEnabled

    // First-time tutorial state
    var showTutorial: Boolean = false
    var onTutorialCompleted: (() -> Unit)? = null
    var onToggleMute: ((isMuted: Boolean) -> Unit)? = null

    // FPS calculation state
    private var frameCount = 0
    private var lastFpsTimestamp = System.currentTimeMillis()
    private var currentFps = 60

    // Cached HUD strings to eliminate allocations
    private var lastHumanPct: Float = -1f
    private var cachedHumanPctStr: String = "0.00%"

    // Cached Leaderboard slots (in-place update, 0 allocation)
    data class LbSlot(
        var id: Int = 0,
        var rank: Int = 1,
        var pct: Float = 0f,
        var colorInt: Int = 0,
        var isHuman: Boolean = false,
        var pctStr: String = "0.00%"
    )
    private val cachedTop3 = Array(3) { LbSlot() }
    private val cachedUserSlot = LbSlot()
    private var lastLbUpdateSec = 0f

    // Territory 3D Paper Paints
    private val territoryShadowPaint = Paint().apply {
        style = Paint.Style.FILL
        color = 0x2E000000
        isAntiAlias = true
    }

    private val territoryBevelPaint = Paint().apply {
        style = Paint.Style.FILL
        isAntiAlias = true
    }

    private val territorySurfacePaint = Paint().apply {
        style = Paint.Style.FILL
        isAntiAlias = true
    }

    private val territoryPatternPaint = Paint().apply {
        style = Paint.Style.FILL
        isAntiAlias = true
    }

    private val territoryBorderPaint = Paint().apply {
        style = Paint.Style.STROKE
        strokeWidth = 0.16f
        strokeCap = Paint.Cap.ROUND
        strokeJoin = Paint.Join.ROUND
        isAntiAlias = true
        pathEffect = CornerPathEffect(0.55f)
    }

    // Trail paints
    private val trailShadowPaint = Paint().apply {
        style = Paint.Style.STROKE
        strokeCap = Paint.Cap.ROUND
        strokeJoin = Paint.Join.ROUND
        color = 0x2E000000
        isAntiAlias = true
    }

    private val trailMainPaint = Paint().apply {
        style = Paint.Style.STROKE
        strokeCap = Paint.Cap.ROUND
        strokeJoin = Paint.Join.ROUND
        isAntiAlias = true
    }

    private val trailGlowPaint = Paint().apply {
        style = Paint.Style.FILL
        isAntiAlias = true
    }

    // Background & Map border paints
    private val bgPaint = Paint().apply {
        color = 0xFFF2FAF7.toInt()
        style = Paint.Style.FILL
    }

    private val bgDotPaint = Paint().apply {
        color = 0x0A000000
        style = Paint.Style.FILL
        isAntiAlias = true
    }

    private val mapGlowBorderPaint = Paint().apply {
        style = Paint.Style.STROKE
        strokeWidth = 24f
        color = 0x2A26A69A
        strokeCap = Paint.Cap.ROUND
        strokeJoin = Paint.Join.ROUND
        isAntiAlias = true
    }

    private val mapInnerBorderPaint = Paint().apply {
        style = Paint.Style.STROKE
        strokeWidth = 6f
        color = 0x5500B0FF
        strokeCap = Paint.Cap.ROUND
        strokeJoin = Paint.Join.ROUND
        isAntiAlias = true
    }

    // Particle & Effect Paints
    private val particlePaint = Paint().apply {
        style = Paint.Style.FILL
        isAntiAlias = true
    }

    private val ripplePaint = Paint().apply {
        style = Paint.Style.STROKE
        strokeWidth = 6f
        isAntiAlias = true
    }

    private val powerUpAuraPaint = Paint().apply {
        style = Paint.Style.STROKE
        strokeWidth = 5f
        color = 0x88F472B6.toInt()
        isAntiAlias = true
    }

    private val powerUpFillPaint = Paint().apply {
        style = Paint.Style.FILL
        color = 0x22FFE4E6.toInt()
        isAntiAlias = true
    }

    private val powerUpBoxPaint = Paint().apply {
        style = Paint.Style.FILL
        color = 0xFFFF1744.toInt()
        isAntiAlias = true
    }

    private val powerUpRibbonPaint = Paint().apply {
        style = Paint.Style.FILL
        color = 0xFFFFD600.toInt()
        isAntiAlias = true
    }

    private val speedStreakPaint = Paint().apply {
        style = Paint.Style.STROKE
        strokeCap = Paint.Cap.ROUND
        strokeWidth = 8f
        color = 0x66FFD600
        isAntiAlias = true
    }

    // Killstreak Banner Paints
    private val bannerOutlinePaint = Paint().apply {
        style = Paint.Style.STROKE
        strokeWidth = 16f
        color = 0xFF3B0764.toInt()
        strokeJoin = Paint.Join.ROUND
        strokeCap = Paint.Cap.ROUND
        setShadowLayer(22f, 0f, 6f, 0xFFE040FB.toInt())
        isFakeBoldText = true
        isAntiAlias = true
    }

    private val bannerFillPaint = Paint().apply {
        style = Paint.Style.FILL
        color = 0xFFFFFFFF.toInt()
        isFakeBoldText = true
        isAntiAlias = true
    }

    private val flareStreakPaint = Paint().apply {
        style = Paint.Style.STROKE
        strokeCap = Paint.Cap.ROUND
        strokeWidth = 6f
        color = 0xE6FFFFFF.toInt()
        isAntiAlias = true
    }

    // HUD Paints
    private val hudCapsuleBgPaint = Paint().apply {
        color = 0xFF141938.toInt()
        style = Paint.Style.FILL
        isAntiAlias = true
    }

    private val hudFillPaint = Paint().apply {
        color = 0xFFE040FB.toInt()
        style = Paint.Style.FILL
        isAntiAlias = true
    }

    private val hudTextPaint = Paint().apply {
        color = 0xFFFFFFFF.toInt()
        textSize = 28f
        isFakeBoldText = true
        isAntiAlias = true
    }

    private val hudButtonBgPaint = Paint().apply {
        color = 0xE6FFFFFF.toInt()
        style = Paint.Style.FILL
        setShadowLayer(8f, 0f, 4f, 0x33000000)
        isAntiAlias = true
    }

    private val hudButtonIconPaint = Paint().apply {
        color = 0xFF1E293B.toInt()
        style = Paint.Style.STROKE
        strokeWidth = 5f
        strokeCap = Paint.Cap.ROUND
        isAntiAlias = true
    }

    private val crownPaint = Paint().apply {
        color = 0xFFFFD214.toInt()
        style = Paint.Style.FILL
        isAntiAlias = true
    }

    private val killBadgeBgPaint = Paint().apply {
        color = 0xEEFFFFFF.toInt()
        style = Paint.Style.FILL
        setShadowLayer(6f, 0f, 3f, 0x22000000)
        isAntiAlias = true
    }

    private val killBadgeTextPaint = Paint().apply {
        color = 0xFF0F172A.toInt()
        textSize = 24f
        isFakeBoldText = true
        isAntiAlias = true
    }

    private val skullPaint = Paint().apply {
        color = 0xFF1E293B.toInt()
        style = Paint.Style.FILL
        isAntiAlias = true
    }

    private val miniLbBgPaint = Paint().apply {
        style = Paint.Style.FILL
        isAntiAlias = true
    }

    private val miniLbBorderPaint = Paint().apply {
        style = Paint.Style.STROKE
        strokeWidth = 3f
        isAntiAlias = true
    }

    private val miniLbTextPaint = Paint().apply {
        color = 0xFFFFFFFF.toInt()
        textSize = 19f
        isFakeBoldText = true
        isAntiAlias = true
    }

    private val eyeWhitePaint = Paint().apply {
        color = 0xFFFFFFFF.toInt()
        style = Paint.Style.FILL
        isAntiAlias = true
    }

    private val detailPaint = Paint().apply {
        style = Paint.Style.FILL
        isAntiAlias = true
    }

    // Tutorial Paints
    private val tutorialBgPaint = Paint().apply {
        style = Paint.Style.FILL
        isAntiAlias = true
    }

    private val tutorialTextPaint = Paint().apply {
        style = Paint.Style.FILL
        isFakeBoldText = true
        isAntiAlias = true
    }

    private val tutorialSubTextPaint = Paint().apply {
        style = Paint.Style.FILL
        isAntiAlias = true
    }

    private val tutorialGuidePaint = Paint().apply {
        style = Paint.Style.STROKE
        strokeCap = Paint.Cap.ROUND
        isAntiAlias = true
    }

    private val tutorialFingerPaint = Paint().apply {
        style = Paint.Style.FILL
        isAntiAlias = true
    }

    // Debug FPS Paints
    private val fpsBgPaint = Paint().apply {
        color = 0xB3000000.toInt()
        style = Paint.Style.FILL
        isAntiAlias = true
    }

    private val fpsTextPaint = Paint().apply {
        color = 0xFF00E676.toInt()
        textSize = 22f
        isFakeBoldText = true
        isAntiAlias = true
    }

    // Callbacks for Compose Navigation
    var onExitToHome: (() -> Unit)? = null
    var onGameOver: ((percentage: Float, kills: Int) -> Unit)? = null
    var onVictory: ((percentage: Float, kills: Int) -> Unit)? = null
    var onSpecialReward: ((percentage: Float, kills: Int) -> Unit)? = null

    // Reusable buffers
    private val trailPath = Path()
    private val tempRect = RectF()
    private val crownPath = Path()
    private val starPath = Path()

    // Touch tracking
    private var touchStartX = 0f
    private var touchStartY = 0f
    private var isDragging = false

    // Button bounds for touch detection
    private val closeButtonCenter = floatArrayOf(0f, 0f)
    private val muteButtonCenter = floatArrayOf(0f, 0f)
    private val buttonRadius = 42f

    // Guard against multiple end-game events or leaks on detached view
    private var isGameEndTriggered = false
    private var pendingEndGameRunnable: Runnable? = null

    init {
        holder.addCallback(this)
        isFocusable = true

        engine.eventListener = object : GameEventListener {
            override fun onPlayerDied(killerName: String?, reason: KillReason) {
                if (isGameEndTriggered) return
                isGameEndTriggered = true
                soundManager.playDeath()
                hapticManager.vibrateDeath()
                val pct = engine.gridMap.getPercentage(engine.humanPlayer.id)
                val kills = engine.humanPlayer.kills
                val r = Runnable {
                    onGameOver?.invoke(pct, kills)
                }
                pendingEndGameRunnable = r
                postDelayed(r, 750L)
            }

            override fun onKill(victimName: String, totalKills: Int) {
                soundManager.playKill()
                hapticManager.vibrateKill()
            }

            override fun onKillStreak(streak: Int, bannerText: String) {}

            override fun onTerritoryCaptured(capturedCells: Int, newPercentage: Float) {
                val pitch = 1.0f + (newPercentage / 75f)
                soundManager.playCapture(pitch)
                hapticManager.vibrateCapture()
            }

            override fun onSpeedBoostCollected() {
                soundManager.playBoost()
            }

            override fun onVictory(percentage: Float) {
                if (isGameEndTriggered) return
                isGameEndTriggered = true
                soundManager.playClaimReward()
                val kills = engine.humanPlayer.kills
                val r = Runnable {
                    onVictory?.invoke(percentage, kills)
                }
                pendingEndGameRunnable = r
                postDelayed(r, 900L)
            }

            override fun onSpecialReward(percentage: Float) {
                if (isGameEndTriggered) return
                isGameEndTriggered = true
                soundManager.playUnlockSkin()
                val kills = engine.humanPlayer.kills
                val r = Runnable {
                    onSpecialReward?.invoke(percentage, kills)
                }
                pendingEndGameRunnable = r
                postDelayed(r, 900L)
            }
        }
    }

    override fun surfaceCreated(holder: SurfaceHolder) {
        engine.camera.setScreenDimensions(width.toFloat(), height.toFloat())
        isRunning = true
        gameThread = Thread(this, "PaperClone-VisualLoop").apply { start() }
        soundManager.resumeBgm()
    }

    override fun surfaceChanged(holder: SurfaceHolder, format: Int, width: Int, height: Int) {
        engine.camera.setScreenDimensions(width.toFloat(), height.toFloat())
    }

    override fun surfaceDestroyed(holder: SurfaceHolder) {
        pause()
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        release()
    }

    fun pause() {
        isRunning = false
        pendingEndGameRunnable?.let {
            removeCallbacks(it)
            pendingEndGameRunnable = null
        }
        var retry = true
        while (retry) {
            try {
                gameThread?.join(300)
                retry = false
            } catch (e: InterruptedException) {
                Thread.currentThread().interrupt()
                break
            }
        }
        gameThread = null
        soundManager.pauseBgm()
    }

    fun resume() {
        if (!isRunning && holder.surface.isValid) {
            isRunning = true
            gameThread = Thread(this, "PaperClone-VisualLoop").apply { start() }
        }
        soundManager.resumeBgm()
    }

    fun release() {
        pause()
        patternManager.release()
    }

    override fun run() {
        val targetFrameTimeNs = 1_000_000_000L / GameConfig.FIXED_FPS
        var lastTimeNs = System.nanoTime()
        var lagNs = 0L

        while (isRunning) {
            val nowNs = System.nanoTime()
            val elapsedNs = nowNs - lastTimeNs
            lastTimeNs = nowNs
            lagNs += elapsedNs

            if (lagNs > targetFrameTimeNs * 5) {
                lagNs = targetFrameTimeNs * 5
            }

            while (lagNs >= targetFrameTimeNs) {
                engine.tick(GameConfig.FIXED_TIMESTEP_SEC)
                lagNs -= targetFrameTimeNs
            }

            updateCachedLeaderboard(GameConfig.FIXED_TIMESTEP_SEC)
            renderFrame()

            val frameProcessingNs = System.nanoTime() - nowNs
            val sleepNs = targetFrameTimeNs - frameProcessingNs
            if (sleepNs > 1_000_000L) {
                try {
                    Thread.sleep(sleepNs / 1_000_000L, (sleepNs % 1_000_000L).toInt())
                } catch (e: InterruptedException) {
                    break
                }
            }
        }
    }

    private fun updateCachedLeaderboard(dt: Float) {
        lastLbUpdateSec += dt
        if (lastLbUpdateSec < 0.20f) return // Update at 5 Hz to eliminate GC pressure
        lastLbUpdateSec = 0f

        val players = engine.players
        // Simple 8-item insertion sort in local array (no allocations)
        val sorted = players.sortedByDescending { engine.gridMap.getPercentage(it.id) }
        val topCount = minOf(3, sorted.size)
        for (i in 0 until topCount) {
            val p = sorted[i]
            val pct = engine.gridMap.getPercentage(p.id)
            val slot = cachedTop3[i]
            slot.id = p.id
            slot.rank = i + 1
            slot.pct = pct
            slot.colorInt = p.colorInt
            slot.isHuman = p.isHuman
            slot.pctStr = String.format("%.2f%%", pct)
        }

        val humanIndex = sorted.indexOfFirst { it.isHuman }
        if (humanIndex >= 0) {
            val hp = sorted[humanIndex]
            val hpPct = engine.gridMap.getPercentage(hp.id)
            cachedUserSlot.id = hp.id
            cachedUserSlot.rank = humanIndex + 1
            cachedUserSlot.pct = hpPct
            cachedUserSlot.colorInt = hp.colorInt
            cachedUserSlot.isHuman = true
            cachedUserSlot.pctStr = String.format("%.2f%%", hpPct)
        }
    }

    private fun renderFrame() {
        val canvas: Canvas = try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                holder.lockHardwareCanvas() ?: holder.lockCanvas() ?: return
            } else {
                holder.lockCanvas() ?: return
            }
        } catch (e: Exception) {
            return
        }

        try {
            drawGame(canvas)

            // Calculate FPS
            frameCount++
            val nowMs = System.currentTimeMillis()
            if (nowMs - lastFpsTimestamp >= 500) {
                currentFps = ((frameCount * 1000f) / (nowMs - lastFpsTimestamp)).toInt()
                frameCount = 0
                lastFpsTimestamp = nowMs
            }

            if (GameConfig.DEBUG_FPS) {
                drawFpsCounter(canvas)
            }
        } finally {
            try {
                holder.unlockCanvasAndPost(canvas)
            } catch (e: Exception) {
                // Surface released
            }
        }
    }

    private fun drawFpsCounter(canvas: Canvas) {
        val fpsStr = "$currentFps FPS"
        val textWidth = fpsTextPaint.measureText(fpsStr)
        val pillW = textWidth + 24f
        val pillH = 34f
        val pillLeft = 24f
        val pillBottom = height - 30f
        val pillTop = pillBottom - pillH

        tempRect.set(pillLeft, pillTop, pillLeft + pillW, pillBottom)
        canvas.drawRoundRect(tempRect, pillH * 0.5f, pillH * 0.5f, fpsBgPaint)
        canvas.drawText(fpsStr, pillLeft + 12f, pillTop + 24f, fpsTextPaint)
    }

    private fun drawGame(canvas: Canvas) {
        val cam = engine.camera
        val cellPixels = cam.cellSizePixels

        // 1. Clear background (Soft mint / ivory paper)
        canvas.drawRect(0f, 0f, width.toFloat(), height.toFloat(), bgPaint)

        // Draw very faint micro-dot pattern (40px spacing, no harsh grids)
        val startDotX = ((cam.worldToScreenX(0f) % 40f) + 40f) % 40f
        val startDotY = ((cam.worldToScreenY(0f) % 40f) + 40f) % 40f
        var dy = startDotY
        while (dy < height) {
            var dx = startDotX
            while (dx < width) {
                canvas.drawCircle(dx, dy, 2f, bgDotPaint)
                dx += 40f
            }
            dy += 40f
        }

        // 2. Soft Glowing Map Boundary
        val mapLeft = cam.worldToScreenX(0f)
        val mapTop = cam.worldToScreenY(0f)
        val mapRight = cam.worldToScreenX(engine.mapSize.toFloat())
        val mapBottom = cam.worldToScreenY(engine.mapSize.toFloat())
        tempRect.set(mapLeft, mapTop, mapRight, mapBottom)
        canvas.drawRoundRect(tempRect, 32f, 32f, mapGlowBorderPaint)
        canvas.drawRoundRect(tempRect, 32f, 32f, mapInnerBorderPaint)

        // 3. Draw 3D Paper Layered Territories
        val translateX = -cam.x * cellPixels + width * 0.5f
        val translateY = -cam.y * cellPixels + height * 0.5f

        for (player in engine.players) {
            val version = engine.gridMap.territoryVersions[player.id]
            val path = pathBuilder.getPlayerPath(player.id, engine.gridMap, version) ?: continue

            canvas.save()
            canvas.translate(translateX, translateY)
            canvas.scale(cellPixels, cellPixels)

            // Layer 1: Drop Shadow (+0.12, +0.20 cell offset)
            canvas.save()
            canvas.translate(0.12f, 0.20f)
            canvas.drawPath(path, territoryShadowPaint)
            canvas.restore()

            // Layer 2: 3D Paper Bevel Thickness (+0.06, +0.10 cell offset)
            territoryBevelPaint.color = player.darkColorInt
            canvas.save()
            canvas.translate(0.06f, 0.10f)
            canvas.drawPath(path, territoryBevelPaint)
            canvas.restore()

            // Layer 3: Paper Top Surface
            territorySurfacePaint.color = player.colorInt
            canvas.drawPath(path, territorySurfacePaint)

            // Layer 4: Procedural Pattern Texture
            val patternShader = patternManager.getShader(player.patternIndex)
            territoryPatternPaint.shader = patternShader
            canvas.drawPath(path, territoryPatternPaint)

            // Layer 5: Smooth Rounded Border Stroke
            territoryBorderPaint.color = player.darkColorInt
            canvas.drawPath(path, territoryBorderPaint)

            canvas.restore()
        }

        // 4. Draw Trails with Drop Shadow and Glossy Tube Finish
        val trailWidthPixels = cellPixels * GameConfig.TRAIL_WIDTH
        trailMainPaint.strokeWidth = trailWidthPixels
        trailShadowPaint.strokeWidth = trailWidthPixels

        for (p in engine.players) {
            if (!p.isAlive || p.trail.points.size < 2) continue

            trailPath.reset()
            val pts = p.trail.points
            val p0 = pts[0]
            trailPath.moveTo(cam.worldToScreenX(p0.x), cam.worldToScreenY(p0.y))
            for (i in 1 until pts.size) {
                val pt = pts[i]
                trailPath.lineTo(cam.worldToScreenX(pt.x), cam.worldToScreenY(pt.y))
            }
            trailPath.lineTo(cam.worldToScreenX(p.x), cam.worldToScreenY(p.y))

            // Drop Shadow
            canvas.save()
            canvas.translate(4f, 6f)
            canvas.drawPath(trailPath, trailShadowPaint)
            canvas.restore()

            // Main Trail Ribbon
            trailMainPaint.color = p.colorInt
            canvas.drawPath(trailPath, trailMainPaint)

            // Glowing Head Sparkle at leading point
            val headSx = cam.worldToScreenX(p.x)
            val headSy = cam.worldToScreenY(p.y)
            trailGlowPaint.color = 0x55FFFFFF
            canvas.drawCircle(headSx, headSy, trailWidthPixels * 0.95f, trailGlowPaint)
            trailGlowPaint.color = 0xAAFFFFFF.toInt()
            canvas.drawCircle(headSx, headSy, trailWidthPixels * 0.45f, trailGlowPaint)
        }

        // 5. Draw Power-Up Items on Map (Gift boxes with glowing ring)
        drawPowerUps(canvas, cam, cellPixels)

        // 6. Draw 6 Procedural Vector Characters with Steering Tilt & Speed Boost Streak
        val headRadiusPixels = cellPixels * GameConfig.HEAD_RADIUS
        for (p in engine.players) {
            if (!p.isAlive) continue

            val sx = cam.worldToScreenX(p.x)
            val sy = cam.worldToScreenY(p.y)

            // Speed boost trailing streak
            if (p.speedBoostTimerSec > 0f && GameConfig.ENABLE_SPEED_BOOST_TRAIL) {
                val oppAngle = p.directionAngle + Math.PI.toFloat()
                val streakLen = headRadiusPixels * 1.6f
                val streakX = sx + cos(oppAngle) * streakLen
                val streakY = sy + sin(oppAngle) * streakLen
                canvas.drawLine(sx, sy, streakX, streakY, speedStreakPaint)
            }

            val turnDiff = Player.normalizeAngle(p.targetAngle - p.directionAngle)

            characterRenderer.drawCharacter(
                canvas = canvas,
                screenX = sx,
                screenY = sy,
                radius = headRadiusPixels,
                headingAngle = p.directionAngle,
                turnRate = turnDiff,
                skinIndex = p.skinIndex,
                playerColorInt = p.colorInt
            )
        }

        // 7. Draw Visual Effects (Capture Ripples, Sparkling Stars, Confetti)
        if (GameConfig.ENABLE_PARTICLES) {
            drawParticles(canvas, cam, cellPixels)
        }

        // 8. Draw Clean Paper.io 2 HUD (Top capsule + X + Mute buttons)
        drawPaperHud(canvas)

        // 9. Draw Killstreak Banner
        drawKillstreakBanner(canvas)

        // 10. Draw First-time Hand Swipe Tutorial if active
        if (showTutorial) {
            drawTutorialOverlay(canvas)
        }
    }

    private fun drawPowerUps(canvas: Canvas, cam: com.paperclone.game.core.engine.Camera, cellPixels: Float) {
        val bounds = cam.getVisibleCellBounds(engine.mapSize, margin = 2)
        val minX = bounds[0].toFloat()
        val maxX = bounds[1].toFloat()
        val minY = bounds[2].toFloat()
        val maxY = bounds[3].toFloat()

        for (item in engine.effectManager.powerUps) {
            if (!item.isActive) continue
            if (item.x !in minX..maxX || item.y !in minY..maxY) continue

            val sx = cam.worldToScreenX(item.x)
            val sy = cam.worldToScreenY(item.y)

            // Pulsing glowing ring in soft white-pink
            val pulseR = cellPixels * (0.85f + 0.12f * sin(item.pulseTimer))
            canvas.drawCircle(sx, sy, pulseR, powerUpFillPaint)
            canvas.drawCircle(sx, sy, pulseR, powerUpAuraPaint)

            // Candy Gift Box
            val boxR = cellPixels * 0.35f
            tempRect.set(sx - boxR, sy - boxR, sx + boxR, sy + boxR)
            canvas.drawRoundRect(tempRect, boxR * 0.25f, boxR * 0.25f, powerUpBoxPaint)

            // Golden ribbon cross
            val ribW = boxR * 0.32f
            tempRect.set(sx - ribW * 0.5f, sy - boxR, sx + ribW * 0.5f, sy + boxR)
            canvas.drawRect(tempRect, powerUpRibbonPaint)
            tempRect.set(sx - boxR, sy - ribW * 0.5f, sx + boxR, sy + ribW * 0.5f)
            canvas.drawRect(tempRect, powerUpRibbonPaint)

            // Ribbon bow on top
            canvas.drawCircle(sx, sy - boxR * 0.9f, boxR * 0.24f, powerUpRibbonPaint)
        }
    }

    private fun drawParticles(canvas: Canvas, cam: com.paperclone.game.core.engine.Camera, cellPixels: Float) {
        for (p in engine.effectManager.particles) {
            if (!p.active) continue

            val sx = cam.worldToScreenX(p.x)
            val sy = cam.worldToScreenY(p.y)

            when (p.type) {
                ParticleType.RIPPLE_RING -> {
                    val rippleRadiusPixels = p.sizeW * cellPixels
                    val alphaInt = ((p.alpha.coerceIn(0f, 1f)) * 160).toInt()
                    ripplePaint.color = (p.color and 0x00FFFFFF) or (alphaInt shl 24)
                    canvas.drawCircle(sx, sy, rippleRadiusPixels, ripplePaint)
                }
                ParticleType.CONFETTI -> {
                    val wPx = p.sizeW * cellPixels
                    val hPx = p.sizeH * cellPixels
                    val alphaInt = ((p.alpha.coerceIn(0f, 1f)) * 255).toInt()
                    particlePaint.color = (p.color and 0x00FFFFFF) or (alphaInt shl 24)

                    canvas.save()
                    canvas.translate(sx, sy)
                    canvas.rotate(p.rotation)
                    tempRect.set(-wPx * 0.5f, -hPx * 0.5f, wPx * 0.5f, hPx * 0.5f)
                    canvas.drawRect(tempRect, particlePaint)
                    canvas.restore()
                }
                ParticleType.SPARKLE -> {
                    val rPx = p.sizeW * cellPixels
                    val alphaInt = ((p.alpha.coerceIn(0f, 1f)) * 255).toInt()
                    particlePaint.color = (0x00FFFFFF) or (alphaInt shl 24)

                    canvas.save()
                    canvas.translate(sx, sy)
                    canvas.rotate(p.rotation)
                    starPath.reset()
                    starPath.moveTo(0f, -rPx)
                    starPath.quadTo(0f, 0f, rPx, 0f)
                    starPath.quadTo(0f, 0f, 0f, rPx)
                    starPath.quadTo(0f, 0f, -rPx, 0f)
                    starPath.quadTo(0f, 0f, 0f, -rPx)
                    canvas.drawPath(starPath, particlePaint)
                    canvas.restore()
                }
            }
        }
    }

    private fun drawKillstreakBanner(canvas: Canvas) {
        val banner = engine.bannerText ?: return
        val timer = engine.bannerTimerSec
        if (timer <= 0f) return

        val bannerCenterX = width * 0.5f
        val bannerCenterY = height * 0.22f

        val elapsed = 1.8f - timer
        val scale = when {
            elapsed < 0.35f -> {
                val t = elapsed / 0.35f
                0.4f + 0.6f * t + 0.32f * sin(t * Math.PI).toFloat()
            }
            timer < 0.4f -> {
                (timer / 0.4f).coerceIn(0f, 1f)
            }
            else -> 1.0f
        }

        val alphaInt = if (timer < 0.4f) ((timer / 0.4f) * 255).toInt().coerceIn(0, 255) else 255
        val textSizeSp = if (banner.contains("TRIPLE") || banner.contains("MEGA")) 78f else 68f

        bannerOutlinePaint.textSize = textSizeSp
        bannerFillPaint.textSize = textSizeSp
        bannerOutlinePaint.alpha = alphaInt
        bannerFillPaint.alpha = alphaInt

        val textWidth = bannerFillPaint.measureText(banner)

        canvas.save()
        canvas.translate(bannerCenterX, bannerCenterY)
        canvas.scale(scale, scale)

        canvas.drawText(banner, -textWidth * 0.5f, 0f, bannerOutlinePaint)
        canvas.drawText(banner, -textWidth * 0.5f, 0f, bannerFillPaint)

        val sweepT = (elapsed / 1.8f).coerceIn(0f, 1f)
        val flareX = -textWidth * 0.6f + sweepT * (textWidth * 1.2f)
        val flareY = -textSizeSp * 0.35f
        val flareLen = 90f

        flareStreakPaint.alpha = (alphaInt * 0.9f).toInt()
        canvas.drawLine(flareX - flareLen, flareY, flareX + flareLen, flareY, flareStreakPaint)
        canvas.drawCircle(flareX, flareY, 12f, flareStreakPaint)

        canvas.restore()
    }

    private fun drawPaperHud(canvas: Canvas) {
        val topMargin = 55f

        // 1. Top Progress Bar Capsule
        val barWidth = width * 0.62f
        val barHeight = 44f
        val barLeft = (width - barWidth) / 2f
        val barTop = topMargin

        tempRect.set(barLeft, barTop, barLeft + barWidth, barTop + barHeight)
        canvas.drawRoundRect(tempRect, barHeight / 2f, barHeight / 2f, hudCapsuleBgPaint)

        // Fill Progress
        val pct = engine.gridMap.getPercentage(engine.humanPlayer.id).coerceIn(0f, 100f)
        val fillWidth = (barWidth * (pct / 100f)).coerceAtLeast(barHeight)
        tempRect.set(barLeft, barTop, barLeft + fillWidth, barTop + barHeight)
        canvas.drawRoundRect(tempRect, barHeight / 2f, barHeight / 2f, hudFillPaint)

        // Recompute string only if changed
        if ((pct * 100).toInt() != (lastHumanPct * 100).toInt()) {
            lastHumanPct = pct
            cachedHumanPctStr = String.format("%.2f%%", pct)
        }

        hudTextPaint.textSize = 26f
        canvas.drawText(cachedHumanPctStr, barLeft + 20f, barTop + 31f, hudTextPaint)

        // Golden Crown Star on Right End
        val crownX = barLeft + barWidth - 24f
        val crownY = barTop + barHeight * 0.5f
        drawCrown(canvas, crownX, crownY, 14f)

        // 2. Kill Counter Badge on Upper Left
        val killBadgeLeft = 24f
        val killBadgeTop = topMargin + barHeight + 14f
        val killBadgeWidth = 115f
        val killBadgeHeight = 42f
        tempRect.set(killBadgeLeft, killBadgeTop, killBadgeLeft + killBadgeWidth, killBadgeTop + killBadgeHeight)
        canvas.drawRoundRect(tempRect, killBadgeHeight / 2f, killBadgeHeight / 2f, killBadgeBgPaint)

        val skullCx = killBadgeLeft + 22f
        val skullCy = killBadgeTop + killBadgeHeight * 0.48f
        canvas.drawCircle(skullCx, skullCy - 2f, 9f, skullPaint)
        tempRect.set(skullCx - 5f, skullCy + 4f, skullCx + 5f, skullCy + 10f)
        canvas.drawRoundRect(tempRect, 2f, 2f, skullPaint)
        canvas.drawCircle(skullCx - 3.5f, skullCy - 2f, 2.2f, eyeWhitePaint)
        canvas.drawCircle(skullCx + 3.5f, skullCy - 2f, 2.2f, eyeWhitePaint)

        val killsStr = engine.humanPlayer.kills.toString()
        canvas.drawText(killsStr, killBadgeLeft + 52f, killBadgeTop + 29f, killBadgeTextPaint)

        // 3. Mini Leaderboard on Upper Right (Top 3 + User Row)
        val lbWidth = 138f
        val lbHeight = 36f
        val lbRight = width - 20f
        val lbLeft = lbRight - lbWidth
        var curLbY = topMargin + barHeight + 14f

        for (slot in cachedTop3) {
            if (slot.id == 0) continue
            tempRect.set(lbLeft, curLbY, lbRight, curLbY + lbHeight)

            miniLbBgPaint.color = when (slot.rank) {
                1 -> 0xFF2979FF.toInt()
                2 -> 0xFF3D5AFE.toInt()
                else -> 0xFF651FFF.toInt()
            }
            canvas.drawRoundRect(tempRect, lbHeight / 2f, lbHeight / 2f, miniLbBgPaint)

            val avCx = lbLeft + 20f
            val avCy = curLbY + lbHeight * 0.5f
            detailPaint.color = slot.colorInt
            canvas.drawCircle(avCx, avCy, 11f, detailPaint)

            if (slot.rank == 1) {
                drawCrown(canvas, avCx - 4f, avCy - 10f, 6f)
            }

            miniLbTextPaint.textSize = 17f
            canvas.drawText("${slot.rank}", lbLeft + 36f, curLbY + 24f, miniLbTextPaint)
            canvas.drawText(slot.pctStr, lbLeft + 58f, curLbY + 24f, miniLbTextPaint)

            curLbY += lbHeight + 8f
        }

        // 4th row: User if outside top 3
        if (cachedUserSlot.rank > 3) {
            tempRect.set(lbLeft, curLbY, lbRight, curLbY + lbHeight)
            miniLbBgPaint.color = 0xFF0284C7.toInt()
            canvas.drawRoundRect(tempRect, lbHeight / 2f, lbHeight / 2f, miniLbBgPaint)

            miniLbBorderPaint.color = 0xFF00E5FF.toInt()
            canvas.drawRoundRect(tempRect, lbHeight / 2f, lbHeight / 2f, miniLbBorderPaint)

            val avCx = lbLeft + 20f
            val avCy = curLbY + lbHeight * 0.5f
            detailPaint.color = cachedUserSlot.colorInt
            canvas.drawCircle(avCx, avCy, 11f, detailPaint)

            canvas.drawText("${cachedUserSlot.rank}", lbLeft + 36f, curLbY + 24f, miniLbTextPaint)
            canvas.drawText(cachedUserSlot.pctStr, lbLeft + 58f, curLbY + 24f, miniLbTextPaint)
        }

        // 4. Left Button: Close / Exit (X)
        closeButtonCenter[0] = 52f
        closeButtonCenter[1] = topMargin + barHeight * 0.5f
        canvas.drawCircle(closeButtonCenter[0], closeButtonCenter[1], buttonRadius * 0.45f, hudButtonBgPaint)
        val cr = 9f
        canvas.drawLine(closeButtonCenter[0] - cr, closeButtonCenter[1] - cr, closeButtonCenter[0] + cr, closeButtonCenter[1] + cr, hudButtonIconPaint)
        canvas.drawLine(closeButtonCenter[0] + cr, closeButtonCenter[1] - cr, closeButtonCenter[0] - cr, closeButtonCenter[1] + cr, hudButtonIconPaint)

        // 5. Right Button: Sound Toggle (Mute/Unmute)
        muteButtonCenter[0] = width - 52f
        muteButtonCenter[1] = topMargin + barHeight * 0.5f
        canvas.drawCircle(muteButtonCenter[0], muteButtonCenter[1], buttonRadius * 0.45f, hudButtonBgPaint)

        val spkX = muteButtonCenter[0]
        val spkY = muteButtonCenter[1]
        hudButtonIconPaint.strokeWidth = 3f
        canvas.drawLine(spkX - 8f, spkY - 6f, spkX - 8f, spkY + 6f, hudButtonIconPaint)
        canvas.drawLine(spkX - 8f, spkY - 6f, spkX - 2f, spkY - 6f, hudButtonIconPaint)
        canvas.drawLine(spkX - 2f, spkY - 6f, spkX + 6f, spkY - 10f, hudButtonIconPaint)
        canvas.drawLine(spkX + 6f, spkY - 10f, spkX + 6f, spkY + 10f, hudButtonIconPaint)
        canvas.drawLine(spkX + 6f, spkY + 10f, spkX - 2f, spkY + 6f, hudButtonIconPaint)
        canvas.drawLine(spkX - 2f, spkY + 6f, spkX - 8f, spkY + 6f, hudButtonIconPaint)

        if (isMuted) {
            hudButtonIconPaint.color = 0xFFFF1744.toInt()
            hudButtonIconPaint.strokeWidth = 4f
            canvas.drawLine(spkX - 10f, spkY + 10f, spkX + 10f, spkY - 10f, hudButtonIconPaint)
            hudButtonIconPaint.color = 0xFF1E293B.toInt()
        }
    }

    private fun drawTutorialOverlay(canvas: Canvas) {
        val centerX = width * 0.5f
        val centerY = height * 0.56f

        // Oscillating finger swipe offset (-90px to +90px)
        val animTime = (System.currentTimeMillis() % 1600L) / 800.0f
        val swipeOffset = sin(animTime * Math.PI.toFloat()) * 95f

        // Instruction Capsule Card
        val cardW = 340f
        val cardH = 80f
        tempRect.set(centerX - cardW * 0.5f, centerY - 95f, centerX + cardW * 0.5f, centerY - 15f)
        tutorialBgPaint.color = 0xDD0F172A.toInt()
        canvas.drawRoundRect(tempRect, 24f, 24f, tutorialBgPaint)

        // Instruction Text (100% English)
        tutorialTextPaint.textSize = 27f
        tutorialTextPaint.color = 0xFFFFFFFF.toInt()
        val text = "SWIPE TO STEER"
        val textW = tutorialTextPaint.measureText(text)
        canvas.drawText(text, centerX - textW * 0.5f, centerY - 54f, tutorialTextPaint)

        tutorialSubTextPaint.textSize = 17f
        tutorialSubTextPaint.color = 0xFF38BDF8.toInt()
        val subText = "Drag to guide your paper trail"
        val subW = tutorialSubTextPaint.measureText(subText)
        canvas.drawText(subText, centerX - subW * 0.5f, centerY - 28f, tutorialSubTextPaint)

        // Motion Guide Arc
        val fingerY = centerY + 55f
        tutorialGuidePaint.strokeWidth = 6f
        tutorialGuidePaint.color = 0x4400E5FF
        canvas.drawLine(centerX - 95f, fingerY, centerX + 95f, fingerY, tutorialGuidePaint)

        // Animated Finger Pointer Indicator
        val fingerX = centerX + swipeOffset
        tutorialFingerPaint.color = 0x4400E5FF
        canvas.drawCircle(fingerX, fingerY, 32f, tutorialFingerPaint)
        tutorialFingerPaint.color = 0xDDFFFFFF.toInt()
        canvas.drawCircle(fingerX, fingerY, 18f, tutorialFingerPaint)
        tutorialFingerPaint.color = 0xFFFFD214.toInt()
        canvas.drawCircle(fingerX, fingerY, 9f, tutorialFingerPaint)
    }

    private fun drawCrown(canvas: Canvas, cx: Float, cy: Float, size: Float) {
        crownPath.reset()
        crownPath.moveTo(cx - size, cy + size * 0.6f)
        crownPath.lineTo(cx - size, cy - size * 0.3f)
        crownPath.lineTo(cx - size * 0.5f, cy + size * 0.1f)
        crownPath.lineTo(cx, cy - size * 0.6f)
        crownPath.lineTo(cx + size * 0.5f, cy + size * 0.1f)
        crownPath.lineTo(cx + size, cy - size * 0.3f)
        crownPath.lineTo(cx + size, cy + size * 0.6f)
        crownPath.close()
        canvas.drawPath(crownPath, crownPaint)
    }

    override fun onTouchEvent(event: MotionEvent): Boolean {
        when (event.actionMasked) {
            MotionEvent.ACTION_DOWN -> {
                val dxClose = event.x - closeButtonCenter[0]
                val dyClose = event.y - closeButtonCenter[1]
                if (dxClose * dxClose + dyClose * dyClose <= buttonRadius * buttonRadius) {
                    soundManager.playClick()
                    hapticManager.vibrateClick()
                    post { onExitToHome?.invoke() }
                    return true
                }

                val dxMute = event.x - muteButtonCenter[0]
                val dyMute = event.y - muteButtonCenter[1]
                if (dxMute * dxMute + dyMute * dyMute <= buttonRadius * buttonRadius) {
                    isMuted = !isMuted
                    soundManager.isSoundEnabled = !isMuted
                    soundManager.isMusicEnabled = !isMuted
                    soundManager.playClick()
                    hapticManager.vibrateClick()
                    onToggleMute?.invoke(isMuted)
                    return true
                }

                if (showTutorial) {
                    showTutorial = false
                    onTutorialCompleted?.invoke()
                }

                if (engine.gameStatus == GameStatus.GAME_OVER ||
                    engine.gameStatus == GameStatus.VICTORY ||
                    engine.gameStatus == GameStatus.SPECIAL_REWARD
                ) {
                    return true
                }

                touchStartX = event.x
                touchStartY = event.y
                isDragging = true
                return true
            }
            MotionEvent.ACTION_MOVE -> {
                if (showTutorial) {
                    showTutorial = false
                    onTutorialCompleted?.invoke()
                }

                if (isDragging) {
                    val dx = event.x - touchStartX
                    val dy = event.y - touchStartY
                    engine.handleTouchDirection(dx, dy)
                    if (kotlin.math.hypot(dx, dy) > 20f) {
                        touchStartX = event.x
                        touchStartY = event.y
                    }
                }
                return true
            }
            MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                isDragging = false
                return true
            }
        }
        return super.onTouchEvent(event)
    }
}
