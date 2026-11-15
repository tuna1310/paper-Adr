package com.paperclone.game.core.engine

import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.Path
import android.graphics.RectF

enum class SkinPattern {
    CLASSIC_PLAIN,   // 0: Clean candy solid with subtle shine
    WATERMELON,      // 1: Red with black watermelon seeds
    POLKA_DOTS,      // 2: Pastel candy dots
    CANDY_STRIPES,   // 3: 45-degree diagonal stripes
    LITTLE_FLOWERS,  // 4: 5-petal cute mini daisies
    STARRY_NIGHT,    // 5: 4-pointed sparkle stars
    SWEET_HEARTS,    // 6: Floating mini hearts
    CARO_CHECKER     // 7: Checkerboard tile pattern
}

/**
 * Procedural pattern renderer for territories.
 * Draws rich, high-resolution textures purely with Canvas primitives (0 bitmap assets).
 */
class PatternRenderer {

    private val patternPaint = Paint().apply {
        style = Paint.Style.FILL
        isAntiAlias = true
    }

    private val strokePatternPaint = Paint().apply {
        style = Paint.Style.STROKE
        strokeWidth = 3f
        isAntiAlias = true
    }

    private val heartPath = Path()
    private val starPath = Path()

    fun drawPattern(
        canvas: Canvas,
        gx: Int,
        gy: Int,
        sx: Float,
        sy: Float,
        cellPx: Float,
        skinIndex: Int
    ) {
        val pattern = SkinPattern.entries[skinIndex % SkinPattern.entries.size]
        val cx = sx + cellPx * 0.5f
        val cy = sy + cellPx * 0.5f

        when (pattern) {
            SkinPattern.CLASSIC_PLAIN -> {
                // Subtle corner highlight dot
                if ((gx + gy) % 3 == 0) {
                    patternPaint.color = 0x22FFFFFF
                    canvas.drawCircle(sx + cellPx * 0.25f, sy + cellPx * 0.25f, cellPx * 0.12f, patternPaint)
                }
            }
            SkinPattern.WATERMELON -> {
                // Watermelon teardrop seeds scattered pseudo-randomly
                if ((gx * 31 + gy * 17) % 5 == 0) {
                    patternPaint.color = 0xDD1B1B1B.toInt()
                    val seedW = cellPx * 0.14f
                    val seedH = cellPx * 0.22f
                    canvas.drawOval(cx - seedW, cy - seedH, cx + seedW, cy + seedH, patternPaint)
                }
            }
            SkinPattern.POLKA_DOTS -> {
                // Alternating white and darker polka dots
                if ((gx + gy) % 2 == 0) {
                    patternPaint.color = 0x35FFFFFF
                    canvas.drawCircle(cx, cy, cellPx * 0.22f, patternPaint)
                }
            }
            SkinPattern.CANDY_STRIPES -> {
                // Diagonal 45-degree stripe
                strokePatternPaint.color = 0x30FFFFFF
                strokePatternPaint.strokeWidth = cellPx * 0.28f
                canvas.drawLine(sx, sy + cellPx, sx + cellPx, sy, strokePatternPaint)
            }
            SkinPattern.LITTLE_FLOWERS -> {
                // 5-petal mini daisy
                if ((gx * 19 + gy * 13) % 6 == 0) {
                    patternPaint.color = 0xCCFFFFFF.toInt()
                    val pr = cellPx * 0.10f
                    // 5 petals
                    for (i in 0 until 5) {
                        val angle = (i * Math.PI * 2.0 / 5.0).toFloat()
                        val px = cx + kotlin.math.cos(angle) * cellPx * 0.16f
                        val py = cy + kotlin.math.sin(angle) * cellPx * 0.16f
                        canvas.drawCircle(px, py, pr, patternPaint)
                    }
                    // Yellow flower center
                    patternPaint.color = 0xFFFFD214.toInt()
                    canvas.drawCircle(cx, cy, pr * 0.9f, patternPaint)
                }
            }
            SkinPattern.STARRY_NIGHT -> {
                // 4-point sparkle star
                if ((gx * 23 + gy * 7) % 5 == 0) {
                    patternPaint.color = 0xEEFFFFFF.toInt()
                    val r = cellPx * 0.24f
                    starPath.reset()
                    starPath.moveTo(cx, cy - r)
                    starPath.quadTo(cx, cy, cx + r, cy)
                    starPath.quadTo(cx, cy, cx, cy + r)
                    starPath.quadTo(cx, cy, cx - r, cy)
                    starPath.quadTo(cx, cy, cx, cy - r)
                    canvas.drawPath(starPath, patternPaint)
                }
            }
            SkinPattern.SWEET_HEARTS -> {
                // Cute mini heart
                if ((gx * 11 + gy * 29) % 6 == 0) {
                    patternPaint.color = 0x44FFFFFF
                    val hw = cellPx * 0.18f
                    heartPath.reset()
                    heartPath.moveTo(cx, cy + hw * 0.8f)
                    heartPath.cubicTo(cx - hw * 1.3f, cy - hw * 0.5f, cx - hw * 0.8f, cy - hw * 1.3f, cx, cy - hw * 0.5f)
                    heartPath.cubicTo(cx + hw * 0.8f, cy - hw * 1.3f, cx + hw * 1.3f, cy - hw * 0.5f, cx, cy + hw * 0.8f)
                    canvas.drawPath(heartPath, patternPaint)
                }
            }
            SkinPattern.CARO_CHECKER -> {
                // Checkerboard tile tint
                if ((gx + gy) % 2 == 1) {
                    patternPaint.color = 0x1A000000
                    canvas.drawRect(sx, sy, sx + cellPx, sy + cellPx, patternPaint)
                }
            }
        }
    }
}
