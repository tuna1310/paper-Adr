package com.paperclone.game.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
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
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Diamond
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.MonetizationOn
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.paperclone.game.data.GameRewardCalculator
import com.paperclone.game.data.MissionType
import com.paperclone.game.data.Skin
import com.paperclone.game.data.SkinRepository
import com.paperclone.game.data.UserPreferences

/**
 * Skin Selection Screen directly matching Screenshot 4.
 * Features top currency bar, category tab ("Classic 2/20"),
 * grid of unlocked and locked skin cards with REAL progress bars,
 * and bottom navigation bar with central Yellow Home button.
 */
@Composable
fun SkinScreen(
    preferences: UserPreferences,
    onEquipSkin: (Int) -> Unit,
    onUnlockSkin: (Skin) -> Boolean,
    onClaimMissionSkin: (Skin) -> Boolean,
    onHomeClick: () -> Unit
) {
    var selectedCategory by remember { mutableStateOf("Classic") }
    val unlockedCount = SkinRepository.allSkins.count { preferences.unlockedSkinIds.contains(it.id.toString()) }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(
                        Color(0xFF0066FF), // Paper 2 Royal Blue
                        Color(0xFF0288D1),
                        Color(0xFF0D47A1)
                    )
                )
            )
            .statusBarsPadding()
            .navigationBarsPadding()
    ) {
        Column(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // 1. TOP CURRENCY BAR (Coins & Gems)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 12.dp),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Coins Pill
                Row(
                    modifier = Modifier
                        .clip(RoundedCornerShape(18.dp))
                        .background(Color(0xCC0D47A1))
                        .border(1.5.dp, Color(0xFFFFD600), RoundedCornerShape(18.dp))
                        .padding(horizontal = 14.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.MonetizationOn,
                        contentDescription = "Coins",
                        tint = Color(0xFFFFD600),
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = preferences.coins.toString(),
                        color = Color.White,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Black
                    )
                }

                Spacer(modifier = Modifier.width(16.dp))

                // Gems Pill
                Row(
                    modifier = Modifier
                        .clip(RoundedCornerShape(18.dp))
                        .background(Color(0xCC0D47A1))
                        .border(1.5.dp, Color(0xFFFF3388), RoundedCornerShape(18.dp))
                        .padding(horizontal = 14.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.Diamond,
                        contentDescription = "Gems",
                        tint = Color(0xFFFF3388),
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = preferences.gems.toString(),
                        color = Color.White,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Black
                    )
                }
            }

            // 2. CATEGORY SELECTOR (Matches Screenshot 4: "Classic 2/20")
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 6.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    modifier = Modifier
                        .clip(RoundedCornerShape(20.dp))
                        .background(Color.White)
                        .padding(horizontal = 16.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.Person,
                        contentDescription = null,
                        tint = Color(0xFF0066FF),
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "Classic",
                        color = Color(0xFF0D47A1),
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Black
                    )
                }

                Text(
                    text = "$unlockedCount/${SkinRepository.allSkins.size}",
                    color = Color.White,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Black
                )
            }

            // 3. SKIN CARDS GRID (3 columns)
            LazyVerticalGrid(
                columns = GridCells.Fixed(3),
                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp),
                modifier = Modifier.weight(1f)
            ) {
                items(SkinRepository.allSkins) { skin ->
                    val isUnlocked = preferences.unlockedSkinIds.contains(skin.id.toString())
                    val isEquipped = preferences.equippedSkinId == skin.id

                    SkinCardItem(
                        skin = skin,
                        isUnlocked = isUnlocked,
                        isEquipped = isEquipped,
                        preferences = preferences,
                        onEquip = { onEquipSkin(skin.id) },
                        onBuy = { onUnlockSkin(skin) },
                        onClaimMission = { onClaimMissionSkin(skin) }
                    )
                }
            }

            // 4. BOTTOM NAVIGATION BAR (Matches Screenshot 4 with Center Yellow Home Button)
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(84.dp)
                    .clip(RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp))
                    .background(Color(0xFFB3E5FC))
                    .padding(horizontal = 24.dp),
                contentAlignment = Alignment.Center
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceAround,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Left Tab: Heroes
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Box(
                            modifier = Modifier
                                .size(38.dp)
                                .clip(RoundedCornerShape(10.dp))
                                .background(Color(0xFF0066FF)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Person,
                                contentDescription = "Heroes",
                                tint = Color.White,
                                modifier = Modifier.size(24.dp)
                            )
                        }
                        Text(
                            text = "Heroes",
                            color = Color(0xFF0066FF),
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    // Center: Big Yellow Home Button (Matches Screenshot 4)
                    Box(
                        modifier = Modifier
                            .size(62.dp)
                            .clip(CircleShape)
                            .background(Color(0xFFFFB300))
                            .clickable { onHomeClick() },
                        contentAlignment = Alignment.Center
                    ) {
                        Box(
                            modifier = Modifier
                                .size(54.dp)
                                .clip(CircleShape)
                                .background(
                                    brush = Brush.verticalGradient(
                                        listOf(Color(0xFFFFF9C4), Color(0xFFFFD600))
                                    )
                                )
                                .border(3.dp, Color.White, CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Home,
                                contentDescription = "Home",
                                tint = Color(0xFF0D47A1),
                                modifier = Modifier.size(32.dp)
                            )
                        }
                    }

                    // Right Tab: Special
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Box(
                            modifier = Modifier
                                .size(38.dp)
                                .clip(CircleShape)
                                .background(Color(0x330066FF)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Lock,
                                contentDescription = "Special",
                                tint = Color(0xFF0066FF),
                                modifier = Modifier.size(20.dp)
                            )
                        }
                        Text(
                            text = "Special",
                            color = Color(0xFF0066FF),
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }
    }
}

/**
 * Individual Skin Card (Matches Screenshot 4).
 * Shows white card for unlocked items, dark blue card with real mission progress/buy button.
 */
@Composable
fun SkinCardItem(
    skin: Skin,
    isUnlocked: Boolean,
    isEquipped: Boolean,
    preferences: UserPreferences,
    onEquip: () -> Unit,
    onBuy: () -> Unit,
    onClaimMission: () -> Unit
) {
    val progressRatio = GameRewardCalculator.calculateSkinProgress(skin, preferences)
    val canClaimFree = !isUnlocked && GameRewardCalculator.canUnlockViaMission(skin, preferences)
    val canAffordCoins = !isUnlocked && skin.priceCoins in 1..preferences.coins

    val currentVal = when (skin.missionType) {
        MissionType.NONE -> skin.missionTarget
        MissionType.PLAY_MATCHES -> preferences.totalMatches
        MissionType.KILL_ENEMIES -> preferences.totalKills
        MissionType.CAPTURE_PERCENTAGE -> preferences.maxPercentage.toInt()
        MissionType.WIN_MATCHES -> preferences.totalVictories
    }

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(138.dp)
            .clip(RoundedCornerShape(18.dp))
            .background(if (isUnlocked) Color.White else Color(0x66002984))
            .border(
                width = if (isEquipped) 3.5.dp else 1.5.dp,
                color = if (isEquipped) Color(0xFF00E676) else if (isUnlocked) Color(0xFF81D4FA) else Color(0xFF1E40AF),
                shape = RoundedCornerShape(18.dp)
            )
            .clickable {
                when {
                    isUnlocked -> onEquip()
                    canClaimFree -> onClaimMission()
                    canAffordCoins -> onBuy()
                }
            }
            .padding(8.dp),
        contentAlignment = Alignment.Center
    ) {
        if (isUnlocked) {
            // Unlocked Card: Character Preview + Checkmark
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Box(
                    modifier = Modifier.size(60.dp),
                    contentAlignment = Alignment.Center
                ) {
                    HomeCharacterVector(skin.characterType)
                }

                Spacer(modifier = Modifier.height(6.dp))

                Text(
                    text = skin.name,
                    color = Color(0xFF0F172A),
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    maxLines = 1
                )
            }

            // Green Checkmark badge on bottom-right (Matches Screenshot 4)
            if (isEquipped) {
                Box(
                    modifier = Modifier
                        .size(24.dp)
                        .clip(CircleShape)
                        .background(Color(0xFF00E676))
                        .align(Alignment.BottomEnd),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Check,
                        contentDescription = "Equipped",
                        tint = Color.White,
                        modifier = Modifier.size(16.dp)
                    )
                }
            }
        } else {
            // Locked Card: Dark card with Lock + Real Progress / Buy / Claim (Matches Screenshot 4)
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Lock,
                    contentDescription = "Locked",
                    tint = Color.White,
                    modifier = Modifier.size(24.dp)
                )

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                    text = skin.unlockMission,
                    color = Color(0xCCFFFFFF),
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    maxLines = 2,
                    lineHeight = 12.sp
                )

                Spacer(modifier = Modifier.height(6.dp))

                // Actions: Claim free / Buy with coins / Show real progress
                when {
                    canClaimFree -> {
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(10.dp))
                                .background(Color(0xFF00E676))
                                .padding(horizontal = 8.dp, vertical = 3.dp)
                        ) {
                            Text(
                                text = "CLAIM!",
                                color = Color.White,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Black
                            )
                        }
                    }
                    skin.priceCoins > 0 -> {
                        Row(
                            modifier = Modifier
                                .clip(RoundedCornerShape(10.dp))
                                .background(if (canAffordCoins) Color(0xFFFFD600) else Color(0x66FFFFFF))
                                .padding(horizontal = 6.dp, vertical = 2.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.MonetizationOn,
                                contentDescription = null,
                                tint = Color(0xFF0D47A1),
                                modifier = Modifier.size(12.dp)
                            )
                            Text(
                                text = skin.priceCoins.toString(),
                                color = Color(0xFF0D47A1),
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Black
                            )
                        }
                    }
                    skin.missionTarget > 0 -> {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            LinearProgressIndicator(
                                progress = { progressRatio },
                                color = Color(0xFF00E676),
                                trackColor = Color(0x44FFFFFF),
                                modifier = Modifier
                                    .fillMaxWidth(0.85f)
                                    .height(6.dp)
                                    .clip(RoundedCornerShape(3.dp))
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = "$currentVal/${skin.missionTarget}",
                                color = Color(0xCCFFFFFF),
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }
        }
    }
}
