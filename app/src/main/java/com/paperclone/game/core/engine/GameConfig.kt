package com.paperclone.game.core.engine

/**
 * Constants and engine configuration for PaperClone.
 */
object GameConfig {
    const val GRID_SIZE = 240
    const val TOTAL_CELLS = GRID_SIZE * GRID_SIZE // 57,600

    // Camera view config
    const val VISIBLE_CELLS_HORIZONTAL = 18.0f
    const val CAMERA_LERP = 0.12f

    // Movement & physics
    const val FIXED_FPS = 60
    const val FIXED_TIMESTEP_SEC = 1.0f / FIXED_FPS
    const val DEFAULT_MOVE_SPEED = 6.5f // cells / sec
    const val SPEED_BOOST_MULTIPLIER = 1.5f // 1.5x speed boost
    const val SPEED_BOOST_DURATION_SEC = 4.0f // 4 seconds duration

    // Steering limit
    const val MAX_TURN_ANGLE_RAD = (Math.PI / 2.0).toFloat() // 90 degrees max instant turn
    const val MAX_STEER_RATE = 14.0f // radians per second for smooth steering

    // Collision & sizes (in grid cell units)
    const val HEAD_RADIUS = 0.42f
    const val TRAIL_WIDTH = 0.40f
    const val TRAIL_POINT_MIN_DIST = 0.25f // record point every 0.25 cells

    // Spawn parameters
    const val SPAWN_RADIUS = 2.5f // 5x5 circular patch
    const val SPAWN_MARGIN = 20 // cells from outer map boundary
    const val BOT_RESPAWN_DELAY_SEC = 2.5f

    // Winning / milestone conditions
    const val WIN_PERCENTAGE = 60.0f
    const val SPECIAL_REWARD_PERCENTAGE = 90.0f

    // Visual Effects Configuration flags (easy toggle for testing and debugging)
    var ENABLE_PARTICLES = true
    var ENABLE_CAMERA_SHAKE = true
    var ENABLE_CAPTURE_RIPPLE = true
    var ENABLE_SPEED_BOOST_TRAIL = true
    var DEBUG_FPS = false
}
