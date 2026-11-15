package com.paperclone.game.ui.screens

import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.geometry.RoundRect
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.paperclone.game.ui.theme.CandyPalette
import kotlinx.coroutines.delay

/**
 * Splash Screen inspired by Paper.io 2 Loading Screen (Screenshot 1).
 * Features bright candy sky backdrop with clouds, autumn leaf accents,
 * 3D bubbly vector logo "PaperClone", and circular loader.
 */
@Composable
fun SplashScreen(onNavigateToHome: () -> Unit) {
    LaunchedEffect(Unit) {
        delay(2000L)
        onNavigateToHome()
    }

    val infiniteTransition = rememberInfiniteTransition(label = "SplashAnim")
    val logoScale by infiniteTransition.animateFloat(
        initialValue = 0.96f,
        targetValue = 1.04f,
        animationSpec = infiniteRepeatable(
            animation = tween(1200, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "LogoScale"
    )

    val cloudOffset by infiniteTransition.animateFloat(
        initialValue = -20f,
        targetValue = 20f,
        animationSpec = infiniteRepeatable(
            animation = tween(2400, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "CloudOffset"
    )

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(
                        Color(0xFF00B0FF), // Vibrant sky blue
                        Color(0xFF29B6F6),
                        Color(0xFF81D4FA),
                        Color(0xFFB3E5FC)
                    )
                )
            ),
        contentAlignment = Alignment.Center
    ) {
        // Background Clouds & Decorative Leaves
        Canvas(modifier = Modifier.fillMaxSize()) {
            val w = size.width
            val h = size.height

            // 1. Soft Fluffy Clouds
            val cloudColor = Color(0xCCFFFFFF)
            drawCircle(cloudColor, radius = 90.dp.toPx(), center = Offset(w * 0.15f + cloudOffset, h * 0.18f))
            drawCircle(cloudColor, radius = 110.dp.toPx(), center = Offset(w * 0.35f + cloudOffset, h * 0.16f))
            drawCircle(cloudColor, radius = 80.dp.toPx(), center = Offset(w * 0.52f + cloudOffset, h * 0.19f))

            drawCircle(cloudColor, radius = 85.dp.toPx(), center = Offset(w * 0.85f - cloudOffset, h * 0.32f))
            drawCircle(cloudColor, radius = 105.dp.toPx(), center = Offset(w * 0.70f - cloudOffset, h * 0.35f))

            // 2. Autumn Orange Decorative Leaves (Corners)
            val leafOrange = Color(0xFFE65100)
            val leafYellow = Color(0xFFFF9800)

            // Top-left leaf cluster
            drawOval(
                brush = Brush.radialGradient(listOf(leafYellow, leafOrange)),
                topLeft = Offset(-40f, -40f),
                size = androidx.compose.ui.geometry.Size(160.dp.toPx(), 130.dp.toPx())
            )
            // Top-right leaf cluster
            drawOval(
                brush = Brush.radialGradient(listOf(leafYellow, leafOrange)),
                topLeft = Offset(w - 120.dp.toPx(), -30f),
                size = androidx.compose.ui.geometry.Size(160.dp.toPx(), 130.dp.toPx())
            )
            // Bottom leaves
            drawOval(
                brush = Brush.radialGradient(listOf(leafYellow, leafOrange)),
                topLeft = Offset(-30f, h - 90.dp.toPx()),
                size = androidx.compose.ui.geometry.Size(180.dp.toPx(), 140.dp.toPx())
            )
            drawOval(
                brush = Brush.radialGradient(listOf(leafYellow, leafOrange)),
                topLeft = Offset(w - 150.dp.toPx(), h - 100.dp.toPx()),
                size = androidx.compose.ui.geometry.Size(190.dp.toPx(), 150.dp.toPx())
            )
        }

        // Center Content: 3D Logo & Characters
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
            modifier = Modifier.padding(horizontal = 24.dp)
        ) {
            // 3D Bubble Logo Canvas
            Box(
                modifier = Modifier
                    .size(width = 330.dp, height = 150.dp)
                    .scale(logoScale),
                contentAlignment = Alignment.Center
            ) {
                PaperClone3DLogo()
            }

            Spacer(modifier = Modifier.height(28.dp))

            // Fun vector characters preview
            CandyCharactersBanner()

            Spacer(modifier = Modifier.height(55.dp))

            // Bottom loading spinner (matches Screenshot 1 bottom loader)
            CircularProgressIndicator(
                color = Color.White,
                strokeWidth = 4.dp,
                modifier = Modifier.size(46.dp)
            )

            Spacer(modifier = Modifier.height(14.dp))

            Text(
                text = "LOADING...",
                color = Color.White,
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 2.sp
            )
        }
    }
}

/**
 * 3D Bubbly Vector Logo "PAPER CLONE"
 * Multi-layer drawing: Dark outline, 3D bottom bevel, and bright candy face.
 */
@Composable
fun PaperClone3DLogo() {
    Canvas(modifier = Modifier.fillMaxSize()) {
        val w = size.width
        val h = size.height
        val cx = w / 2f
        val cy = h / 2f

        // 3D Shadow layer
        val shadowPath = Path().apply {
            addRoundRect(
                RoundRect(
                    rect = Rect(12.dp.toPx(), 16.dp.toPx(), w - 12.dp.toPx(), h - 10.dp.toPx()),
                    radiusX = 32.dp.toPx(),
                    radiusY = 32.dp.toPx()
                )
            )
        }
        drawPath(shadowPath, color = Color(0x38002D62))

        // Blue outer 3D border
        val borderPath = Path().apply {
            addRoundRect(
                RoundRect(
                    rect = Rect(16.dp.toPx(), 12.dp.toPx(), w - 16.dp.toPx(), h - 16.dp.toPx()),
                    radiusX = 28.dp.toPx(),
                    radiusY = 28.dp.toPx()
                )
            )
        }
        drawPath(borderPath, color = Color(0xFF0D47A1))

        // 3D Bevel depth
        val bevelPath = Path().apply {
            addRoundRect(
                RoundRect(
                    rect = Rect(20.dp.toPx(), 14.dp.toPx(), w - 20.dp.toPx(), h - 22.dp.toPx()),
                    radiusX = 26.dp.toPx(),
                    radiusY = 26.dp.toPx()
                )
            )
        }
        drawPath(bevelPath, color = Color(0xFFFF8F00))

        // Front Face (Candy Yellow Gradient)
        val facePath = Path().apply {
            addRoundRect(
                RoundRect(
                    rect = Rect(20.dp.toPx(), 10.dp.toPx(), w - 20.dp.toPx(), h - 28.dp.toPx()),
                    radiusX = 25.dp.toPx(),
                    radiusY = 25.dp.toPx()
                )
            )
        }
        drawPath(
            facePath,
            brush = Brush.verticalGradient(
                colors = listOf(
                    Color(0xFFFFF9C4), // Soft cream shine
                    Color(0xFFFFD600), // Pure Candy Yellow
                    Color(0xFFFFB300)
                )
            )
        )

        // Glossy Top Highlight
        val highlightPath = Path().apply {
            addRoundRect(
                RoundRect(
                    rect = Rect(30.dp.toPx(), 15.dp.toPx(), w - 30.dp.toPx(), 42.dp.toPx()),
                    radiusX = 14.dp.toPx(),
                    radiusY = 14.dp.toPx()
                )
            )
        }
        drawPath(highlightPath, color = Color(0x66FFFFFF))
    }

    // Centered Typography "PAPER CLONE"
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(
                text = "PAPER",
                color = Color.White,
                fontSize = 38.sp,
                fontWeight = FontWeight.Black,
                letterSpacing = 3.sp
            )
            Text(
                text = "CLONE",
                color = Color(0xFF0D47A1),
                fontSize = 26.sp,
                fontWeight = FontWeight.Black,
                letterSpacing = 4.sp
            )
        }
    }
}

/**
 * Fun vector banner displaying the characters (Candy Chick, Watermelon, Kitty).
 */
@Composable
fun CandyCharactersBanner() {
    Canvas(
        modifier = Modifier
            .size(width = 240.dp, height = 75.dp)
    ) {
        val w = size.width
        val h = size.height

        // 1. Watermelon Wedge (Left)
        val wmX = w * 0.22f
        val wmY = h * 0.55f
        val wmR = 24.dp.toPx()
        // Shadow
        drawOval(Color(0x2A000000), topLeft = Offset(wmX - wmR, wmY + 12f), size = androidx.compose.ui.geometry.Size(wmR * 2f, 12.dp.toPx()))
        // Green rind
        drawCircle(Color(0xFF00E676), radius = wmR, center = Offset(wmX, wmY))
        // Red fruit
        drawCircle(Color(0xFFFF1744), radius = wmR * 0.85f, center = Offset(wmX, wmY))
        // Seeds
        drawCircle(Color.Black, radius = 2.5f, center = Offset(wmX - 6f, wmY - 4f))
        drawCircle(Color.Black, radius = 2.5f, center = Offset(wmX + 6f, wmY - 4f))
        drawCircle(Color.Black, radius = 2.5f, center = Offset(wmX, wmY + 7f))

        // 2. Candy Chick (Center, slightly larger)
        val chickX = w * 0.52f
        val chickY = h * 0.45f
        val chickR = 30.dp.toPx()
        drawOval(Color(0x2A000000), topLeft = Offset(chickX - chickR, chickY + 16f), size = androidx.compose.ui.geometry.Size(chickR * 2f, 15.dp.toPx()))
        // Rounded body
        val chickPath = Path().apply {
            addRoundRect(
                RoundRect(
                    rect = Rect(chickX - chickR, chickY - chickR, chickX + chickR, chickY + chickR),
                    radiusX = 14.dp.toPx(),
                    radiusY = 14.dp.toPx()
                )
            )
        }
        drawPath(chickPath, color = Color(0xFFFFD600))
        // Crest tuft
        drawCircle(Color(0xFFFF6D00), radius = 7.dp.toPx(), center = Offset(chickX, chickY - chickR - 2.dp.toPx()))
        // Big cartoon eyes
        drawCircle(Color.White, radius = 8.dp.toPx(), center = Offset(chickX - 9.dp.toPx(), chickY + 3.dp.toPx()))
        drawCircle(Color.White, radius = 8.dp.toPx(), center = Offset(chickX + 9.dp.toPx(), chickY + 3.dp.toPx()))
        drawCircle(Color(0xFF1976D2), radius = 4.5.dp.toPx(), center = Offset(chickX - 9.dp.toPx(), chickY + 5.dp.toPx()))
        drawCircle(Color(0xFF1976D2), radius = 4.5.dp.toPx(), center = Offset(chickX + 9.dp.toPx(), chickY + 5.dp.toPx()))

        // 3. Pink Kitty (Right)
        val kitX = w * 0.82f
        val kitY = h * 0.55f
        val kitR = 24.dp.toPx()
        drawOval(Color(0x2A000000), topLeft = Offset(kitX - kitR, kitY + 12f), size = androidx.compose.ui.geometry.Size(kitR * 2f, 12.dp.toPx()))
        // Round pink body
        drawCircle(Color(0xFFFF3388), radius = kitR, center = Offset(kitX, kitY))
        // Ears
        val leftEar = Path().apply {
            moveTo(kitX - kitR * 0.7f, kitY - kitR * 0.5f)
            lineTo(kitX - kitR * 0.6f, kitY - kitR * 1.15f)
            lineTo(kitX - kitR * 0.15f, kitY - kitR * 0.75f)
            close()
        }
        val rightEar = Path().apply {
            moveTo(kitX + kitR * 0.7f, kitY - kitR * 0.5f)
            lineTo(kitX + kitR * 0.6f, kitY - kitR * 1.15f)
            lineTo(kitX + kitR * 0.15f, kitY - kitR * 0.75f)
            close()
        }
        drawPath(leftEar, Color(0xFFFF3388))
        drawPath(rightEar, Color(0xFFFF3388))
        // Eyes
        drawCircle(Color.White, radius = 5.dp.toPx(), center = Offset(kitX - 6.dp.toPx(), kitY))
        drawCircle(Color.White, radius = 5.dp.toPx(), center = Offset(kitX + 6.dp.toPx(), kitY))
        drawCircle(Color(0xFF0F172A), radius = 3.dp.toPx(), center = Offset(kitX - 6.dp.toPx(), kitY + 1.dp.toPx()))
        drawCircle(Color(0xFF0F172A), radius = 3.dp.toPx(), center = Offset(kitX + 6.dp.toPx(), kitY + 1.dp.toPx()))
    }
}

