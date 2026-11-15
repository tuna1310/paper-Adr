package com.paperclone.game.core.engine

import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.Path
import android.graphics.RectF
import com.paperclone.game.ui.theme.CandyPalette
import kotlin.math.cos
import kotlin.math.sin

/**
 * Procedural Vector Character Renderer.
 * Draws 6 distinct, charming characters directly using Canvas paths and geometric primitives.
 * Features realistic dynamic body tilting during steering and soft ground drop shadows.
 */
class CharacterRenderer {

    private val bodyPaint = Paint().apply {
        style = Paint.Style.FILL
        isAntiAlias = true
    }

    private val detailPaint = Paint().apply {
        style = Paint.Style.FILL
        isAntiAlias = true
    }

    private val strokePaint = Paint().apply {
        style = Paint.Style.STROKE
        strokeWidth = 3f
        isAntiAlias = true
    }

    private val eyeWhitePaint = Paint().apply {
        color = 0xFFFFFFFF.toInt()
        style = Paint.Style.FILL
        isAntiAlias = true
    }

    private val pupilPaint = Paint().apply {
        color = 0xFF1976D2.toInt() // Blue
        style = Paint.Style.FILL
        isAntiAlias = true
    }

    private val groundShadowPaint = Paint().apply {
        color = 0x2A000000 // 16% black shadow
        style = Paint.Style.FILL
        isAntiAlias = true
    }

    // Reusable paths and rects to prevent allocations in render loop
    private val charPath = Path()
    private val tempRect = RectF()

    fun drawCharacter(
        canvas: Canvas,
        screenX: Float,
        screenY: Float,
        radius: Float,
        headingAngle: Float,
        turnRate: Float,
        skinIndex: Int,
        playerColorInt: Int
    ) {
        // 1. Draw ground drop shadow beneath character
        val shadowW = radius * 1.25f
        val shadowH = radius * 0.65f
        val shadowOffsetY = radius * 0.40f
        tempRect.set(
            screenX - shadowW,
            screenY + shadowOffsetY - shadowH * 0.5f,
            screenX + shadowW,
            screenY + shadowOffsetY + shadowH * 0.5f
        )
        canvas.drawOval(tempRect, groundShadowPaint)

        // 2. Dynamic tilt angle based on angular turning velocity
        val tiltAngleDeg = (-turnRate * 24f).coerceIn(-18f, 18f)
        val headingDeg = Math.toDegrees(headingAngle.toDouble()).toFloat()

        canvas.save()
        canvas.translate(screenX, screenY)
        canvas.rotate(headingDeg + 90f + tiltAngleDeg) // Align 0 rad (right) with character facing up

        val charType = skinIndex % 6
        when (charType) {
            0 -> drawCandyChick(canvas, radius, playerColorInt)
            1 -> drawStrawberry(canvas, radius, playerColorInt)
            2 -> drawCyberRobot(canvas, radius, playerColorInt)
            3 -> drawCandyKitty(canvas, radius, playerColorInt)
            4 -> drawWatermelonSlice(canvas, radius, playerColorInt)
            5 -> drawBoxerBunny(canvas, radius, playerColorInt)
        }

        canvas.restore()
    }

    // Character 0: Cute Candy Chick / Cube
    private fun drawCandyChick(canvas: Canvas, r: Float, colorInt: Int) {
        bodyPaint.color = colorInt
        tempRect.set(-r, -r, r, r)
        canvas.drawRoundRect(tempRect, r * 0.45f, r * 0.45f, bodyPaint)

        // Little crest / tuft on top (facing back/top)
        detailPaint.color = 0xFFFFAB00.toInt()
        canvas.drawCircle(0f, -r * 1.05f, r * 0.28f, detailPaint)

        // Cute cartoon eyes (facing forward/down in local coordinates)
        val eyeY = r * 0.15f
        val eyeR = r * 0.28f
        val pupilR = eyeR * 0.55f

        canvas.drawCircle(-r * 0.38f, eyeY, eyeR, eyeWhitePaint)
        canvas.drawCircle(r * 0.38f, eyeY, eyeR, eyeWhitePaint)

        pupilPaint.color = 0xFF1976D2.toInt()
        canvas.drawCircle(-r * 0.38f, eyeY + eyeR * 0.25f, pupilR, pupilPaint)
        canvas.drawCircle(r * 0.38f, eyeY + eyeR * 0.25f, pupilR, pupilPaint)

        // Orange beak
        detailPaint.color = 0xFFFF6D00.toInt()
        charPath.reset()
        charPath.moveTo(-r * 0.18f, eyeY + eyeR * 0.8f)
        charPath.lineTo(r * 0.18f, eyeY + eyeR * 0.8f)
        charPath.lineTo(0f, eyeY + eyeR * 1.4f)
        charPath.close()
        canvas.drawPath(charPath, detailPaint)
    }

    // Character 1: Sweet Strawberry
    private fun drawStrawberry(canvas: Canvas, r: Float, colorInt: Int) {
        bodyPaint.color = if (colorInt != 0) colorInt else 0xFFFF1744.toInt()
        charPath.reset()
        charPath.moveTo(0f, r * 1.15f) // bottom tip
        charPath.cubicTo(r * 1.25f, r * 0.6f, r * 1.1f, -r * 0.8f, 0f, -r * 0.85f)
        charPath.cubicTo(-r * 1.1f, -r * 0.8f, -r * 1.25f, r * 0.6f, 0f, r * 1.15f)
        canvas.drawPath(charPath, bodyPaint)

        // Green leaf crown at top
        detailPaint.color = 0xFF00E676.toInt()
        canvas.drawCircle(-r * 0.45f, -r * 0.75f, r * 0.28f, detailPaint)
        canvas.drawCircle(0f, -r * 0.90f, r * 0.32f, detailPaint)
        canvas.drawCircle(r * 0.45f, -r * 0.75f, r * 0.28f, detailPaint)

        // Eyes
        val eyeY = r * 0.12f
        canvas.drawCircle(-r * 0.35f, eyeY, r * 0.24f, eyeWhitePaint)
        canvas.drawCircle(r * 0.35f, eyeY, r * 0.24f, eyeWhitePaint)

        pupilPaint.color = 0xFF212121.toInt()
        canvas.drawCircle(-r * 0.35f, eyeY + r * 0.08f, r * 0.14f, pupilPaint)
        canvas.drawCircle(r * 0.35f, eyeY + r * 0.08f, r * 0.14f, pupilPaint)

        // Rosy cheeks
        detailPaint.color = 0x55FF4081
        canvas.drawCircle(-r * 0.60f, eyeY + r * 0.25f, r * 0.18f, detailPaint)
        canvas.drawCircle(r * 0.60f, eyeY + r * 0.25f, r * 0.18f, detailPaint)
    }

    // Character 2: Cyber Candy Robot
    private fun drawCyberRobot(canvas: Canvas, r: Float, colorInt: Int) {
        bodyPaint.color = if (colorInt != 0) colorInt else 0xFF00B0FF.toInt()
        tempRect.set(-r * 0.95f, -r * 0.85f, r * 0.95f, r * 0.95f)
        canvas.drawRoundRect(tempRect, r * 0.35f, r * 0.35f, bodyPaint)

        // Antenna with glowing yellow orb
        strokePaint.color = 0xFFB0BEC5.toInt()
        strokePaint.strokeWidth = 4f
        canvas.drawLine(0f, -r * 0.85f, 0f, -r * 1.35f, strokePaint)
        detailPaint.color = 0xFFFFD54F.toInt()
        canvas.drawCircle(0f, -r * 1.35f, r * 0.22f, detailPaint)

        // Dark digital visor
        detailPaint.color = 0xFF102027.toInt()
        tempRect.set(-r * 0.75f, -r * 0.20f, r * 0.75f, r * 0.55f)
        canvas.drawRoundRect(tempRect, r * 0.22f, r * 0.22f, detailPaint)

        // Glowing cyan LED round eyes
        detailPaint.color = 0xFF00E5FF.toInt()
        canvas.drawCircle(-r * 0.38f, r * 0.18f, r * 0.16f, detailPaint)
        canvas.drawCircle(r * 0.38f, r * 0.18f, r * 0.16f, detailPaint)

        // Side ear bolts
        detailPaint.color = 0xFFCFD8DC.toInt()
        canvas.drawCircle(-r * 1.05f, 0f, r * 0.18f, detailPaint)
        canvas.drawCircle(r * 1.05f, 0f, r * 0.18f, detailPaint)
    }

    // Character 3: Candy Kitty
    private fun drawCandyKitty(canvas: Canvas, r: Float, colorInt: Int) {
        bodyPaint.color = if (colorInt != 0) colorInt else 0xFFA855F7.toInt()

        // Pointed cat ears
        charPath.reset()
        // Left ear
        charPath.moveTo(-r * 0.8f, -r * 0.3f)
        charPath.lineTo(-r * 0.75f, -r * 1.25f)
        charPath.lineTo(-r * 0.2f, -r * 0.75f)
        // Right ear
        charPath.moveTo(r * 0.2f, -r * 0.75f)
        charPath.lineTo(r * 0.75f, -r * 1.25f)
        charPath.lineTo(r * 0.8f, -r * 0.3f)
        canvas.drawPath(charPath, bodyPaint)

        // Round head
        canvas.drawCircle(0f, 0f, r * 0.92f, bodyPaint)

        // Pink inner ears
        detailPaint.color = 0xFFFF80AB.toInt()
        canvas.drawCircle(-r * 0.60f, -r * 0.80f, r * 0.20f, detailPaint)
        canvas.drawCircle(r * 0.60f, -r * 0.80f, r * 0.20f, detailPaint)

        // Eyes
        val eyeY = r * 0.05f
        canvas.drawCircle(-r * 0.36f, eyeY, r * 0.24f, eyeWhitePaint)
        canvas.drawCircle(r * 0.36f, eyeY, r * 0.24f, eyeWhitePaint)

        pupilPaint.color = 0xFF212121.toInt()
        canvas.drawCircle(-r * 0.36f, eyeY + r * 0.06f, r * 0.15f, pupilPaint)
        canvas.drawCircle(r * 0.36f, eyeY + r * 0.06f, r * 0.15f, pupilPaint)

        // Cute pink heart nose
        detailPaint.color = 0xFFFF4081.toInt()
        canvas.drawCircle(0f, eyeY + r * 0.32f, r * 0.10f, detailPaint)
    }

    // Character 4: Juicy Watermelon Slice
    private fun drawWatermelonSlice(canvas: Canvas, r: Float, colorInt: Int) {
        // Red fleshy triangle pointing forward
        bodyPaint.color = 0xFFFF3366.toInt()
        charPath.reset()
        charPath.moveTo(0f, r * 1.25f) // point forward
        charPath.lineTo(r * 1.05f, -r * 0.8f)
        charPath.lineTo(-r * 1.05f, -r * 0.8f)
        charPath.close()
        canvas.drawPath(charPath, bodyPaint)

        // Green curved rind at back
        detailPaint.color = 0xFF00E676.toInt()
        tempRect.set(-r * 1.15f, -r * 1.05f, r * 1.15f, -r * 0.65f)
        canvas.drawRoundRect(tempRect, r * 0.2f, r * 0.2f, detailPaint)

        // Cartoon eyes
        val eyeY = r * 0.08f
        canvas.drawCircle(-r * 0.32f, eyeY, r * 0.24f, eyeWhitePaint)
        canvas.drawCircle(r * 0.32f, eyeY, r * 0.24f, eyeWhitePaint)

        pupilPaint.color = 0xFF212121.toInt()
        canvas.drawCircle(-r * 0.32f, eyeY + r * 0.08f, r * 0.14f, pupilPaint)
        canvas.drawCircle(r * 0.32f, eyeY + r * 0.08f, r * 0.14f, pupilPaint)

        // Watermelon seeds
        detailPaint.color = 0xFF212121.toInt()
        canvas.drawCircle(0f, r * 0.65f, r * 0.08f, detailPaint)
        canvas.drawCircle(-r * 0.35f, -r * 0.35f, r * 0.07f, detailPaint)
        canvas.drawCircle(r * 0.35f, -r * 0.35f, r * 0.07f, detailPaint)
    }

    // Character 5: Boxer Bunny
    private fun drawBoxerBunny(canvas: Canvas, r: Float, colorInt: Int) {
        bodyPaint.color = if (colorInt != 0) colorInt else 0xFFFF66B2.toInt()

        // Tall bunny ears
        tempRect.set(-r * 0.7f, -r * 1.45f, -r * 0.25f, -r * 0.4f)
        canvas.drawRoundRect(tempRect, r * 0.25f, r * 0.25f, bodyPaint)
        tempRect.set(r * 0.25f, -r * 1.45f, r * 0.7f, -r * 0.4f)
        canvas.drawRoundRect(tempRect, r * 0.25f, r * 0.25f, bodyPaint)

        // Body
        tempRect.set(-r * 0.9f, -r * 0.8f, r * 0.9f, r * 0.95f)
        canvas.drawRoundRect(tempRect, r * 0.4f, r * 0.4f, bodyPaint)

        // White inner ears
        detailPaint.color = 0x99FFFFFF.toInt()
        tempRect.set(-r * 0.6f, -r * 1.35f, -r * 0.35f, -r * 0.55f)
        canvas.drawRoundRect(tempRect, r * 0.15f, r * 0.15f, detailPaint)
        tempRect.set(r * 0.35f, -r * 1.35f, r * 0.6f, -r * 0.55f)
        canvas.drawRoundRect(tempRect, r * 0.15f, r * 0.15f, detailPaint)

        // Eyes
        val eyeY = r * 0.15f
        canvas.drawCircle(-r * 0.36f, eyeY, r * 0.24f, eyeWhitePaint)
        canvas.drawCircle(r * 0.36f, eyeY, r * 0.24f, eyeWhitePaint)

        pupilPaint.color = 0xFF212121.toInt()
        canvas.drawCircle(-r * 0.36f, eyeY + r * 0.06f, r * 0.14f, pupilPaint)
        canvas.drawCircle(r * 0.36f, eyeY + r * 0.06f, r * 0.14f, pupilPaint)
    }
}
