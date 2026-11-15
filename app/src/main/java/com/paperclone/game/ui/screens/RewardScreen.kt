package com.paperclone.game.ui.screens

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.MonetizationOn
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlin.math.cos
import kotlin.math.sin

/**
 * Special Reward Screen triggered when player captures >= 90% of the map.
 * Features falling animated coin and glowing golden ring rain,
 * golden celebration banner, and claim button.
 */
@Composable
fun RewardScreen(
    percentage: Float,
    kills: Int,
    onClaimClick: () -> Unit
) {
    val infiniteTransition = rememberInfiniteTransition(label = "RewardRain")
    val rainProgress by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(2800, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "CoinFall"
    )

    val spinAngle by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(4000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "SunburstSpin"
    )

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(
                        Color(0xFF1A103C), // Deep royal purple
                        Color(0xFF2E1065),
                        Color(0xFF0F172A)
                    )
                )
            )
            .statusBarsPadding()
            .navigationBarsPadding()
    ) {
        // 1. Procedural Falling Coins & Golden Rings Rain Canvas
        Canvas(modifier = Modifier.fillMaxSize()) {
            val w = size.width
            val h = size.height
            val cx = w / 2f
            val cy = h * 0.35f

            // Golden Sunburst Rays behind reward
            val rayCount = 16
            for (i in 0 until rayCount) {
                val rad = Math.toRadians((spinAngle + (i * 360f / rayCount)).toDouble())
                val rayLen = w * 0.9f
                val ex = cx + (cos(rad) * rayLen).toFloat()
                val ey = cy + (sin(rad) * rayLen).toFloat()
                drawLine(
                    color = Color(0x18FFD600),
                    start = Offset(cx, cy),
                    end = Offset(ex, ey),
                    strokeWidth = 24.dp.toPx()
                )
            }

            // Falling Coins and Rings
            val numItems = 28
            for (i in 0 until numItems) {
                val colX = (i * (w / numItems.toFloat())) + ((i * 17) % 30)
                val speedMultiplier = 0.8f + ((i % 5) * 0.15f)
                val curY = ((rainProgress * speedMultiplier * (h + 120f)) + (i * 45f)) % (h + 80f) - 40f

                val isRing = i % 2 == 0
                if (isRing) {
                    // Golden Ring
                    val ringRadius = 10.dp.toPx() + ((i % 3) * 3f)
                    drawCircle(
                        color = Color(0xFFFFD600),
                        radius = ringRadius,
                        center = Offset(colX, curY),
                        style = androidx.compose.ui.graphics.drawscope.Stroke(width = 3.5.dp.toPx())
                    )
                } else {
                    // Golden Coin
                    val coinRadius = 12.dp.toPx() + ((i % 2) * 2f)
                    drawCircle(
                        brush = Brush.radialGradient(
                            listOf(Color(0xFFFFF176), Color(0xFFFFB300))
                        ),
                        radius = coinRadius,
                        center = Offset(colX, curY)
                    )
                    // Inner rim
                    drawCircle(
                        color = Color(0xFFFF8F00),
                        radius = coinRadius * 0.75f,
                        center = Offset(colX, curY),
                        style = androidx.compose.ui.graphics.drawscope.Stroke(width = 1.8.dp.toPx())
                    )
                }
            }
        }

        // 2. Foreground Content: Title, Chest Badge, Reward Stats, Button
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // Header
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = "MAP CONQUEST!",
                    color = Color(0xFFFFD600),
                    fontSize = 32.sp,
                    fontWeight = FontWeight.Black,
                    letterSpacing = 2.sp
                )

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                    text = "DOMINATED ${String.format("%.1f", percentage)}% OF THE MAP",
                    color = Color(0xFFE0E7FF),
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp
                )
            }

            // Big 3D Trophy / Chest Icon
            Box(
                modifier = Modifier
                    .size(150.dp)
                    .clip(CircleShape)
                    .background(
                        brush = Brush.radialGradient(
                            listOf(Color(0xFFFFD54F), Color(0xFFFF8F00))
                        )
                    )
                    .border(5.dp, Color.White, CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.EmojiEvents,
                    contentDescription = "Trophy",
                    tint = Color(0xFF0F172A),
                    modifier = Modifier.size(85.dp)
                )
            }

            // Reward Card
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(24.dp))
                    .background(Color(0xCC0D47A1))
                    .border(2.5.dp, Color(0xFF38BDF8), RoundedCornerShape(24.dp))
                    .padding(20.dp)
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    Text(
                        text = "CONQUEST REWARDS",
                        color = Color.White,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Black
                    )

                    // Coin reward
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(14.dp))
                            .background(Color(0x33FFFFFF))
                            .padding(horizontal = 16.dp, vertical = 10.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.MonetizationOn,
                                contentDescription = null,
                                tint = Color(0xFFFFD600),
                                modifier = Modifier.size(28.dp)
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Text(
                                text = "Conquest Coins",
                                color = Color.White,
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                        Text(
                            text = "+1,000",
                            color = Color(0xFFFFD600),
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Black
                        )
                    }

                    // Trophy reward
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(14.dp))
                            .background(Color(0x33FFFFFF))
                            .padding(horizontal = 16.dp, vertical = 10.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.Star,
                                contentDescription = null,
                                tint = Color(0xFF00E5FF),
                                modifier = Modifier.size(28.dp)
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Text(
                                text = "Bonus Trophies",
                                color = Color.White,
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                        Text(
                            text = "+60",
                            color = Color(0xFF00E5FF),
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Black
                        )
                    }
                }
            }

            // Big Claim & Continue Button
            Button(
                onClick = onClaimClick,
                shape = RoundedCornerShape(22.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFFD600)),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(58.dp)
            ) {
                Text(
                    text = "CLAIM & CONTINUE",
                    color = Color(0xFF0D47A1),
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Black,
                    letterSpacing = 1.sp
                )
            }
        }
    }
}

