package com.paperclone.game.core.engine

import android.graphics.Bitmap
import android.graphics.BitmapShader
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.Path
import android.graphics.Shader

enum class ProceduralPatternType {
    POLKA_DOTS,    // 0: Chấm bi
    ORGANIC_SPOTS, // 1: Đốm
    FLOWERS,       // 2: Hoa nhỏ
    SWIRL_STRIPES, // 3: Sọc xoắn
    BRAIN_MAZE,    // 4: Hình não
    CARO           // 5: Caro
}

/**
 * Manages 6 cached procedural texture patterns rendered via hardware-accelerated BitmapShader.
 * Generated entirely through Canvas code (0 external bitmap assets, 0 heap allocations during gameplay).
 */
class TexturePatternManager {

    private val tileSize = 64
    private val shaders = ArrayList<BitmapShader>()
    private val bitmaps = ArrayList<Bitmap>()

    init {
        generateShaders()
    }

    private fun generateShaders() {
        release()
        val paint = Paint().apply { isAntiAlias = true }

        // 1. POLKA_DOTS (Chấm bi)
        val bmpDots = Bitmap.createBitmap(tileSize, tileSize, Bitmap.Config.ARGB_8888)
        val cDots = Canvas(bmpDots)
        paint.color = 0x2AFFFFFF
        paint.style = Paint.Style.FILL
        cDots.drawCircle(16f, 16f, 6f, paint)
        cDots.drawCircle(48f, 16f, 4f, paint)
        cDots.drawCircle(16f, 48f, 4f, paint)
        cDots.drawCircle(48f, 48f, 6f, paint)
        cDots.drawCircle(32f, 32f, 5f, paint)
        bitmaps.add(bmpDots)
        shaders.add(BitmapShader(bmpDots, Shader.TileMode.REPEAT, Shader.TileMode.REPEAT))

        // 2. ORGANIC_SPOTS (Đốm kẹo)
        val bmpSpots = Bitmap.createBitmap(tileSize, tileSize, Bitmap.Config.ARGB_8888)
        val cSpots = Canvas(bmpSpots)
        paint.color = 0x30FFFFFF
        cSpots.drawOval(8f, 12f, 24f, 20f, paint)
        cSpots.drawOval(36f, 40f, 56f, 52f, paint)
        cSpots.drawOval(40f, 10f, 52f, 26f, paint)
        cSpots.drawOval(10f, 42f, 22f, 58f, paint)
        bitmaps.add(bmpSpots)
        shaders.add(BitmapShader(bmpSpots, Shader.TileMode.REPEAT, Shader.TileMode.REPEAT))

        // 3. FLOWERS (Hoa nhỏ 5 cánh)
        val bmpFlowers = Bitmap.createBitmap(tileSize, tileSize, Bitmap.Config.ARGB_8888)
        val cFlowers = Canvas(bmpFlowers)
        drawMiniFlower(cFlowers, 20f, 20f, 7f, paint)
        drawMiniFlower(cFlowers, 52f, 48f, 6f, paint)
        bitmaps.add(bmpFlowers)
        shaders.add(BitmapShader(bmpFlowers, Shader.TileMode.REPEAT, Shader.TileMode.REPEAT))

        // 4. SWIRL_STRIPES (Sọc xoắn)
        val bmpStripes = Bitmap.createBitmap(tileSize, tileSize, Bitmap.Config.ARGB_8888)
        val cStripes = Canvas(bmpStripes)
        paint.style = Paint.Style.STROKE
        paint.strokeWidth = 10f
        paint.color = 0x24FFFFFF
        cStripes.drawLine(-10f, 22f, 22f, -10f, paint)
        cStripes.drawLine(0f, 64f, 64f, 0f, paint)
        cStripes.drawLine(42f, 74f, 74f, 42f, paint)
        bitmaps.add(bmpStripes)
        shaders.add(BitmapShader(bmpStripes, Shader.TileMode.REPEAT, Shader.TileMode.REPEAT))

        // 5. BRAIN_MAZE (Hình não / rạn san hô)
        val bmpBrain = Bitmap.createBitmap(tileSize, tileSize, Bitmap.Config.ARGB_8888)
        val cBrain = Canvas(bmpBrain)
        paint.style = Paint.Style.STROKE
        paint.strokeWidth = 5f
        paint.strokeCap = Paint.Cap.ROUND
        paint.color = 0x2EFFFFFF
        val brainPath = Path()
        brainPath.moveTo(6f, 16f)
        brainPath.cubicTo(20f, 6f, 44f, 6f, 58f, 18f)
        brainPath.cubicTo(48f, 32f, 20f, 28f, 14f, 44f)
        brainPath.cubicTo(22f, 58f, 50f, 54f, 58f, 48f)
        cBrain.drawPath(brainPath, paint)
        bitmaps.add(bmpBrain)
        shaders.add(BitmapShader(bmpBrain, Shader.TileMode.REPEAT, Shader.TileMode.REPEAT))

        // 6. CARO (Bàn cờ caro)
        val bmpCaro = Bitmap.createBitmap(tileSize, tileSize, Bitmap.Config.ARGB_8888)
        val cCaro = Canvas(bmpCaro)
        paint.style = Paint.Style.FILL
        paint.color = 0x14000000
        cCaro.drawRect(0f, 0f, 32f, 32f, paint)
        cCaro.drawRect(32f, 32f, 64f, 64f, paint)
        bitmaps.add(bmpCaro)
        shaders.add(BitmapShader(bmpCaro, Shader.TileMode.REPEAT, Shader.TileMode.REPEAT))
    }

    private fun drawMiniFlower(canvas: Canvas, cx: Float, cy: Float, radius: Float, paint: Paint) {
        paint.style = Paint.Style.FILL
        paint.color = 0x3EFFFFFF
        for (i in 0 until 5) {
            val a = (i * Math.PI * 2.0 / 5.0).toFloat()
            val px = cx + kotlin.math.cos(a) * radius * 0.9f
            val py = cy + kotlin.math.sin(a) * radius * 0.9f
            canvas.drawCircle(px, py, radius * 0.55f, paint)
        }
        paint.color = 0x77FFD54F
        canvas.drawCircle(cx, cy, radius * 0.45f, paint)
    }

    fun getShader(patternIndex: Int): BitmapShader {
        if (shaders.isEmpty()) {
            generateShaders()
        }
        val idx = (patternIndex % shaders.size + shaders.size) % shaders.size
        return shaders[idx]
    }

    fun release() {
        for (bmp in bitmaps) {
            if (!bmp.isRecycled) {
                bmp.recycle()
            }
        }
        bitmaps.clear()
        shaders.clear()
    }
}
