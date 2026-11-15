package com.paperclone.game.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

/**
 * Single source of truth for the PaperClone candy color palette.
 * High-saturation, fun, vibrant colors inspired by Paper.io 2.
 */
object CandyPalette {
    // Backgrounds
    val BackgroundMint = Color(0xFFF3FAF7)
    val BackgroundGridLine = Color(0xFFE2EFEA)
    val MapBorder = Color(0xFFB0D5C9)

    // Player & Bot Vibrant Candy Colors (High Saturation, Original Game Palette)
    val PlayerYellow = Color(0xFFFFD600)     // Candy Yellow
    val VibrantGreen = Color(0xFF00E676)     // Candy Green
    val BubblegumPink = Color(0xFFFF3388)    // Candy Pink
    val ElectricCyan = Color(0xFF00E5FF)     // Neon Cyan
    val SkyBlue = Color(0xFF00E5FF)          // Sky / Cyan Blue
    val CandyOrange = Color(0xFFFF6D00)      // Vivid Orange
    val ElectricPurple = Color(0xFFD500F9)   // Candy Purple
    val WatermelonRed = Color(0xFFFF1744)    // Watermelon Red
    val RoyalBlue = Color(0xFF2979FF)        // Candy Royal Blue

    // 3D Shadow and Highlight multipliers
    val ShadowTint = Color(0x33000000)       // 20% Black for 3D paper bottom/right edge
    val HighlightTint = Color(0x33FFFFFF)    // 20% White for top/left highlight

    // UI Colors
    val DeepNavy = Color(0xFF0F172A)
    val NavyCard = Color(0xFF1E293B)
    val NavyDialog = Color(0xFF193256)
    val DialogBorder = Color(0xFF38BDF8)
    val ProgressBarBg = Color(0xFF141938)
    val ProgressBarFill = Color(0xFFE040FB)
    val ProgressBarGlow = Color(0xFFFF80AB)
    val Gold = Color(0xFFFFD214)
    val Silver = Color(0xFFB0BEC5)
    val Bronze = Color(0xFFCD7F32)

    // Array of distinct candy colors for players and bots
    val PlayerColors = listOf(
        PlayerYellow,
        VibrantGreen,
        BubblegumPink,
        ElectricCyan,
        CandyOrange,
        ElectricPurple,
        WatermelonRed,
        RoyalBlue
    )

    fun getPlayerColor(id: Int): Color {
        if (id <= 0) return Color.Transparent
        val index = (id - 1) % PlayerColors.size
        return PlayerColors[index]
    }

    fun getPlayerColorInt(id: Int): Int {
        if (id <= 0) return 0
        val c = getPlayerColor(id)
        val a = (c.alpha * 255).toInt().coerceIn(0, 255)
        val r = (c.red * 255).toInt().coerceIn(0, 255)
        val g = (c.green * 255).toInt().coerceIn(0, 255)
        val b = (c.blue * 255).toInt().coerceIn(0, 255)
        return (a shl 24) or (r shl 16) or (g shl 8) or b
    }

    fun getPlayerDarkColorInt(id: Int): Int {
        if (id <= 0) return 0
        val c = getPlayerColor(id)
        val a = (c.alpha * 255).toInt().coerceIn(0, 255)
        val r = (c.red * 200).toInt().coerceIn(0, 255)
        val g = (c.green * 200).toInt().coerceIn(0, 255)
        val b = (c.blue * 200).toInt().coerceIn(0, 255)
        return (a shl 24) or (r shl 16) or (g shl 8) or b
    }
}

private val DarkColorScheme = darkColorScheme(
    primary = CandyPalette.PlayerYellow,
    secondary = CandyPalette.SkyBlue,
    tertiary = CandyPalette.WatermelonRed,
    background = CandyPalette.DeepNavy,
    surface = CandyPalette.NavyCard,
    onPrimary = Color.Black,
    onSecondary = Color.White,
    onBackground = Color.White,
    onSurface = Color.White
)

private val LightColorScheme = lightColorScheme(
    primary = CandyPalette.PlayerYellow,
    secondary = CandyPalette.SkyBlue,
    tertiary = CandyPalette.WatermelonRed,
    background = CandyPalette.BackgroundMint,
    surface = Color.White,
    onPrimary = Color.Black,
    onSecondary = Color.White,
    onBackground = CandyPalette.DeepNavy,
    onSurface = CandyPalette.DeepNavy
)

@Composable
fun PaperCloneTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme
    MaterialTheme(
        colorScheme = colorScheme,
        content = content
    )
}

