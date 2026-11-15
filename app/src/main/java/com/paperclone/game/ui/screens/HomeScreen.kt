package com.paperclone.game.ui.screens

import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.material.icons.filled.CardGiftcard
import androidx.compose.material.icons.filled.Diamond
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.MonetizationOn
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Style
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.geometry.RoundRect
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.paperclone.game.data.SkinRepository
import com.paperclone.game.data.UserPreferences

/**
 * Home Screen directly matching the UI layout from Screenshots 3, 4, 5.
 * Features top currency bars, player profile pill, 3D character showcase,
 * large bouncy PLAY button, and bottom navigation bar.
 */
@Composable
fun HomeScreen(
    preferences: UserPreferences,
    onPlayClick: () -> Unit,
    onSkinsClick: () -> Unit,
    onLeaderboardClick: () -> Unit,
    onToggleSound: (Boolean) -> Unit,
    onToggleMusic: (Boolean) -> Unit,
    onToggleVibration: (Boolean) -> Unit,
    onToggleParticles: (Boolean) -> Unit,
    onClaimDailyReward: () -> Unit
) {
    var showSettingsDialog by remember { mutableStateOf(false) }
    var showProfileDialog by remember { mutableStateOf(false) }
    var showDailyRewardDialog by remember { mutableStateOf(false) }

    val equippedSkin = SkinRepository.getSkinById(preferences.equippedSkinId)

    val infiniteTransition = rememberInfiniteTransition(label = "HomeAnim")
    val playPulse by infiniteTransition.animateFloat(
        initialValue = 0.96f,
        targetValue = 1.05f,
        animationSpec = infiniteRepeatable(
            animation = tween(900, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "PlayPulse"
    )

    val floatAnim by infiniteTransition.animateFloat(
        initialValue = -8f,
        targetValue = 8f,
        animationSpec = infiniteRepeatable(
            animation = tween(1500, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "CharFloat"
    )

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(
                        Color(0xFF0288D1), // Sky candy blue
                        Color(0xFF29B6F6),
                        Color(0xFF81D4FA),
                        Color(0xFFE0F7FA)
                    )
                )
            )
            .statusBarsPadding()
            .navigationBarsPadding()
    ) {
        Column(
            modifier = Modifier.fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // 1. TOP BAR (Player Profile Pill + Currency Capsules + Settings)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                // Profile Avatar Pill (Matches Screenshot 3/4/5)
                Row(
                    modifier = Modifier
                        .clip(RoundedCornerShape(20.dp))
                        .background(Color(0xCC0D47A1))
                        .border(1.5.dp, Color(0xFF38BDF8), RoundedCornerShape(20.dp))
                        .clickable { showProfileDialog = true }
                        .padding(horizontal = 10.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(30.dp)
                            .clip(CircleShape)
                            .background(Color.White),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Person,
                            contentDescription = "Profile",
                            tint = Color(0xFF0288D1),
                            modifier = Modifier.size(20.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = preferences.playerName,
                        color = Color.White,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                // Currency capsules (Coins & Gems)
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Coin capsule
                    Row(
                        modifier = Modifier
                            .clip(RoundedCornerShape(16.dp))
                            .background(Color(0xCC0D47A1))
                            .border(1.5.dp, Color(0xFFFFD600), RoundedCornerShape(16.dp))
                            .padding(horizontal = 8.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.MonetizationOn,
                            contentDescription = "Coins",
                            tint = Color(0xFFFFD600),
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = preferences.coins.toString(),
                            color = Color.White,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Black
                        )
                    }

                    // Gem capsule
                    Row(
                        modifier = Modifier
                            .clip(RoundedCornerShape(16.dp))
                            .background(Color(0xCC0D47A1))
                            .border(1.5.dp, Color(0xFFFF3388), RoundedCornerShape(16.dp))
                            .padding(horizontal = 8.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.Diamond,
                            contentDescription = "Gems",
                            tint = Color(0xFFFF3388),
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = preferences.gems.toString(),
                            color = Color.White,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Black
                        )
                    }

                    // Settings Button (Matches Screenshot 3)
                    Box(
                        modifier = Modifier
                            .size(38.dp)
                            .clip(CircleShape)
                            .background(Color(0xCC0D47A1))
                            .border(1.5.dp, Color(0xFF38BDF8), CircleShape)
                            .clickable { showSettingsDialog = true },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Settings,
                            contentDescription = "Settings",
                            tint = Color.White,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // 2. CENTER CHARACTER SHOWCASE
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onSkinsClick() }
            ) {
                // 3D Pedestal and floating character
                Box(
                    modifier = Modifier.size(200.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Canvas(modifier = Modifier.fillMaxSize()) {
                        val cx = size.width / 2f
                        val cy = size.height / 2f + 35.dp.toPx()

                        // Pedestal 3D Shadow
                        drawOval(
                            color = Color(0x33000000),
                            topLeft = Offset(cx - 75.dp.toPx(), cy + 12.dp.toPx()),
                            size = androidx.compose.ui.geometry.Size(150.dp.toPx(), 45.dp.toPx())
                        )

                        // Pedestal Base Disc
                        drawOval(
                            brush = Brush.radialGradient(
                                listOf(Color(0xFFE0F7FA), Color(0xFF80DEEA))
                            ),
                            topLeft = Offset(cx - 70.dp.toPx(), cy - 10.dp.toPx()),
                            size = androidx.compose.ui.geometry.Size(140.dp.toPx(), 42.dp.toPx())
                        )
                    }

                    // Floating Vector Character
                    Box(modifier = Modifier.padding(bottom = (30 + floatAnim).dp)) {
                        HomeCharacterVector(equippedSkin.characterType)
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Skin Title Pill
                Row(
                    modifier = Modifier
                        .clip(RoundedCornerShape(16.dp))
                        .background(Color(0xCCFFFFFF))
                        .border(1.5.dp, Color(0xFF0288D1), RoundedCornerShape(16.dp))
                        .padding(horizontal = 16.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = equippedSkin.name,
                        color = Color(0xFF0F172A),
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Black
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "CHANGE",
                        color = Color(0xFF0288D1),
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            // 3. LARGE BOUNCY 3D PLAY BUTTON (Matches Screenshots 3 & 4)
            Box(
                modifier = Modifier
                    .size(118.dp)
                    .scale(playPulse)
                    .clip(CircleShape)
                    .background(Color(0xFFFFB300)) // 3D Bottom Bevel
                    .clickable { onPlayClick() },
                contentAlignment = Alignment.Center
            ) {
                // Front Yellow Face
                Box(
                    modifier = Modifier
                        .size(108.dp)
                        .clip(CircleShape)
                        .background(
                            brush = Brush.verticalGradient(
                                listOf(Color(0xFFFFF9C4), Color(0xFFFFD600), Color(0xFFFFC107))
                            )
                        )
                        .border(4.dp, Color(0xFFFFD600), CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.PlayArrow,
                        contentDescription = "PLAY",
                        tint = Color(0xFF0D47A1),
                        modifier = Modifier.size(62.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // 4. BOTTOM NAVIGATION BAR (Matches Screenshot 4)
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(84.dp)
                    .clip(RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp))
                    .background(Color(0xFF0D47A1))
                    .border(2.dp, Color(0xFF38BDF8), RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp))
                    .padding(horizontal = 24.dp),
                contentAlignment = Alignment.Center
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceAround,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Left: Skins Tab
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.clickable { onSkinsClick() }
                    ) {
                        Icon(
                            imageVector = Icons.Default.Style,
                            contentDescription = "Skins",
                            tint = Color(0xFF81D4FA),
                            modifier = Modifier.size(28.dp)
                        )
                        Text(
                            text = "SKINS",
                            color = Color(0xFF81D4FA),
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    // Center: Daily Gift Tab
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.clickable { showDailyRewardDialog = true }
                    ) {
                        Box(
                            modifier = Modifier
                                .size(46.dp)
                                .clip(CircleShape)
                                .background(Color(0xFFFFD600))
                                .border(2.dp, Color.White, CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.CardGiftcard,
                                contentDescription = "Daily Gift",
                                tint = Color(0xFF0D47A1),
                                modifier = Modifier.size(26.dp)
                            )
                        }
                        Text(
                            text = "DAILY GIFT",
                            color = Color(0xFFFFD600),
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Black
                        )
                    }

                    // Right: Leaderboard Tab
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.clickable { onLeaderboardClick() }
                    ) {
                        Icon(
                            imageVector = Icons.Default.EmojiEvents,
                            contentDescription = "Rankings",
                            tint = Color(0xFF81D4FA),
                            modifier = Modifier.size(28.dp)
                        )
                        Text(
                            text = "RANKINGS",
                            color = Color(0xFF81D4FA),
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }
    }

    // Dialogs
    if (showSettingsDialog) {
        SettingsDialog(
            soundEnabled = preferences.soundEnabled,
            musicEnabled = preferences.musicEnabled,
            vibrationEnabled = preferences.vibrationEnabled,
            particlesEnabled = preferences.particlesEnabled,
            onToggleSound = onToggleSound,
            onToggleMusic = onToggleMusic,
            onToggleVibration = onToggleVibration,
            onToggleParticles = onToggleParticles,
            onDismiss = { showSettingsDialog = false }
        )
    }

    if (showProfileDialog) {
        ProfileDialog(
            playerName = preferences.playerName,
            trophies = preferences.trophies,
            totalKills = preferences.totalKills,
            totalMatches = preferences.totalMatches,
            totalVictories = preferences.totalVictories,
            onDismiss = { showProfileDialog = false }
        )
    }

    if (showDailyRewardDialog) {
        DailyRewardDialog(
            streak = preferences.dailyStreak,
            lastClaimTimestamp = preferences.lastDailyClaimDate,
            onClaimReward = {
                onClaimDailyReward()
            },
            onDismiss = { showDailyRewardDialog = false }
        )
    }
}

/**
 * Draws the vector character for the Home showcase.
 */
@Composable
fun HomeCharacterVector(characterType: Int) {
    Canvas(modifier = Modifier.size(90.dp)) {
        val cx = size.width / 2f
        val cy = size.height / 2f
        val r = 36.dp.toPx()

        when (characterType) {
            4 -> { // Watermelon Slice (Matches Screenshot 2 & 4)
                drawCircle(Color(0xFF00E676), radius = r, center = Offset(cx, cy))
                drawCircle(Color(0xFFFF1744), radius = r * 0.85f, center = Offset(cx, cy))
                // Black seed dots
                drawCircle(Color.Black, radius = 3.5f, center = Offset(cx - 9f, cy - 8f))
                drawCircle(Color.Black, radius = 3.5f, center = Offset(cx + 9f, cy - 8f))
                drawCircle(Color.Black, radius = 3.5f, center = Offset(cx, cy + 9f))
                drawCircle(Color.Black, radius = 3.5f, center = Offset(cx - 12f, cy + 8f))
                drawCircle(Color.Black, radius = 3.5f, center = Offset(cx + 12f, cy + 8f))
            }
            0 -> { // Candy Chick
                val chickPath = Path().apply {
                    addRoundRect(
                        RoundRect(
                            rect = Rect(cx - r, cy - r, cx + r, cy + r),
                            radiusX = 18.dp.toPx(),
                            radiusY = 18.dp.toPx()
                        )
                    )
                }
                drawPath(chickPath, color = Color(0xFFFFD600))
                drawCircle(Color(0xFFFF6D00), radius = 9.dp.toPx(), center = Offset(cx, cy - r - 3.dp.toPx()))
                // Big cartoon eyes
                drawCircle(Color.White, radius = 10.dp.toPx(), center = Offset(cx - 11.dp.toPx(), cy + 4.dp.toPx()))
                drawCircle(Color.White, radius = 10.dp.toPx(), center = Offset(cx + 11.dp.toPx(), cy + 4.dp.toPx()))
                drawCircle(Color(0xFF1976D2), radius = 5.5.dp.toPx(), center = Offset(cx - 11.dp.toPx(), cy + 6.dp.toPx()))
                drawCircle(Color(0xFF1976D2), radius = 5.5.dp.toPx(), center = Offset(cx + 11.dp.toPx(), cy + 6.dp.toPx()))
            }
            1 -> { // Strawberry
                drawCircle(Color(0xFFFF1744), radius = r, center = Offset(cx, cy))
                drawCircle(Color(0xFF00E676), radius = 10.dp.toPx(), center = Offset(cx, cy - r))
                drawCircle(Color.White, radius = 2.5f, center = Offset(cx - 8f, cy - 5f))
                drawCircle(Color.White, radius = 2.5f, center = Offset(cx + 8f, cy - 5f))
                drawCircle(Color.White, radius = 2.5f, center = Offset(cx, cy + 8f))
            }
            2 -> { // Cyber Robot
                drawRoundRect(
                    color = Color(0xFF00E5FF),
                    topLeft = Offset(cx - r, cy - r),
                    size = androidx.compose.ui.geometry.Size(r * 2f, r * 2f),
                    cornerRadius = androidx.compose.ui.geometry.CornerRadius(12.dp.toPx(), 12.dp.toPx())
                )
                // Visor
                drawRoundRect(
                    color = Color(0xFF0F172A),
                    topLeft = Offset(cx - r * 0.75f, cy - r * 0.25f),
                    size = androidx.compose.ui.geometry.Size(r * 1.5f, r * 0.5f),
                    cornerRadius = androidx.compose.ui.geometry.CornerRadius(6.dp.toPx(), 6.dp.toPx())
                )
            }
            3 -> { // Candy Kitty
                drawCircle(Color(0xFFFF3388), radius = r, center = Offset(cx, cy))
                drawCircle(Color.White, radius = 7.dp.toPx(), center = Offset(cx - 9.dp.toPx(), cy))
                drawCircle(Color.White, radius = 7.dp.toPx(), center = Offset(cx + 9.dp.toPx(), cy))
                drawCircle(Color.Black, radius = 4.dp.toPx(), center = Offset(cx - 9.dp.toPx(), cy))
                drawCircle(Color.Black, radius = 4.dp.toPx(), center = Offset(cx + 9.dp.toPx(), cy))
            }
            else -> { // Boxer Bunny
                drawCircle(Color(0xFFFF80AB), radius = r, center = Offset(cx, cy))
                drawCircle(Color(0xFF00E5FF), radius = 10.dp.toPx(), center = Offset(cx - r * 0.8f, cy + r * 0.4f))
                drawCircle(Color(0xFF00E5FF), radius = 10.dp.toPx(), center = Offset(cx + r * 0.8f, cy + r * 0.4f))
            }
        }
    }
}

