package com.paperclone.game.core.engine

import kotlin.math.ceil
import kotlin.math.floor
import kotlin.math.max
import kotlin.math.min

/**
 * Smooth lerp camera tracking the player in world coordinates.
 * Configured so visible width is exactly ~18 grid cells.
 */
class Camera(
    var visibleCellsHorizontal: Float = GameConfig.VISIBLE_CELLS_HORIZONTAL
) {
    var x: Float = GameConfig.GRID_SIZE / 2f
    var y: Float = GameConfig.GRID_SIZE / 2f

    var screenWidth: Float = 1080f
    var screenHeight: Float = 1920f

    val cellSizePixels: Float
        get() = screenWidth / visibleCellsHorizontal

    fun setScreenDimensions(w: Float, h: Float) {
        if (w > 0f && h > 0f) {
            screenWidth = w
            screenHeight = h
        }
    }

    fun snapTo(targetX: Float, targetY: Float) {
        x = targetX
        y = targetY
    }

    /**
     * Frame-rate independent smooth tracking towards target.
     */
    fun update(targetX: Float, targetY: Float, dt: Float, smoothness: Float = 12f) {
        val t = 1.0f - kotlin.math.exp(-smoothness * dt)
        x += (targetX - x) * t
        y += (targetY - y) * t
    }

    fun worldToScreenX(wx: Float): Float = (wx - x) * cellSizePixels + screenWidth * 0.5f
    fun worldToScreenY(wy: Float): Float = (wy - y) * cellSizePixels + screenHeight * 0.5f

    fun screenToWorldX(sx: Float): Float = (sx - screenWidth * 0.5f) / cellSizePixels + x
    fun screenToWorldY(sy: Float): Float = (sy - screenHeight * 0.5f) / cellSizePixels + y

    /**
     * Returns visible grid cell range [minX, maxX, minY, maxY] for culling.
     */
    fun getVisibleCellBounds(mapSize: Int = GameConfig.GRID_SIZE, margin: Int = 2): IntArray {
        val minX = max(0, floor(screenToWorldX(0f)).toInt() - margin)
        val maxX = min(mapSize - 1, ceil(screenToWorldX(screenWidth)).toInt() + margin)
        val minY = max(0, floor(screenToWorldY(0f)).toInt() - margin)
        val maxY = min(mapSize - 1, ceil(screenToWorldY(screenHeight)).toInt() + margin)
        return intArrayOf(minX, maxX, minY, maxY)
    }
}

