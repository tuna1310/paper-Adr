package com.paperclone.game.ui.screens

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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.paperclone.game.ui.theme.CandyPalette

data class LeaderboardEntry(
    val rank: Int,
    val name: String,
    val percentage: Float,
    val trophiesDelta: Int,
    val color: Color,
    val isUser: Boolean = false
)

/**
 * Post-round Leaderboard Screen.
 * Features stadium blue-purple theme, Top 3 podium (1st center highest, 2nd left, 3rd right),
 * scrollable ranking table with the human player highlighted in bright gold,
 * and Play Again / Home buttons.
 */
@Composable
fun LeaderboardScreen(
    percentage: Float,
    kills: Int,
    isVictory: Boolean,
    userName: String,
    onPlayAgainClick: () -> Unit,
    onHomeClick: () -> Unit
) {
    val isSpecialReward = percentage >= 90f
    val userTrophies = com.paperclone.game.data.GameRewardCalculator.calculateTrophiesDelta(percentage, kills, isVictory, isSpecialReward)
    val userCoins = com.paperclone.game.data.GameRewardCalculator.calculateCoinsEarned(percentage, kills, isVictory, isSpecialReward)
    val userRank = if (isVictory || percentage >= 60f) 1 else if (percentage >= 20f || kills >= 3) 2 else if (percentage >= 10f || kills >= 1) 3 else 4

    val entries = listOf(
        LeaderboardEntry(1, if (userRank == 1) userName else "Mia", if (userRank == 1) percentage else 28.4f, if (userRank == 1) userTrophies else 30, CandyPalette.PlayerYellow, userRank == 1),
        LeaderboardEntry(2, if (userRank == 2) userName else "Lucas", if (userRank == 2) percentage else 19.8f, if (userRank == 2) userTrophies else 22, CandyPalette.ElectricCyan, userRank == 2),
        LeaderboardEntry(3, if (userRank == 3) userName else "Sofia", if (userRank == 3) percentage else 14.2f, if (userRank == 3) userTrophies else 15, CandyPalette.BubblegumPink, userRank == 3),
        LeaderboardEntry(4, if (userRank == 4) userName else "Nate", if (userRank == 4) percentage else 9.5f, if (userRank == 4) userTrophies else 10, CandyPalette.VibrantGreen, userRank == 4),
        LeaderboardEntry(5, "chloe", 7.1f, 8, CandyPalette.CandyOrange),
        LeaderboardEntry(6, "max_07", 5.6f, 6, CandyPalette.ElectricPurple),
        LeaderboardEntry(7, "Alex", 4.3f, 5, CandyPalette.RoyalBlue),
        LeaderboardEntry(8, "Zoe", 3.0f, 3, CandyPalette.WatermelonRed)
    )

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(
                        Color(0xFF0F172A), // Deep stadium navy
                        Color(0xFF1E1B4B), // Indigo purple
                        Color(0xFF0D47A1)
                    )
                )
            )
            .statusBarsPadding()
            .navigationBarsPadding()
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 16.dp, vertical = 10.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // 1. MATCH OUTCOME TITLE
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = if (isVictory) "VICTORY!" else "MATCH RESULTS",
                    color = if (isVictory) Color(0xFFFFD600) else Color.White,
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Black,
                    letterSpacing = 2.sp
                )

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                    text = "Score: ${String.format("%.2f%%", percentage)}  •  Kills: $kills",
                    color = Color(0xFF38BDF8),
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold
                )

                Spacer(modifier = Modifier.height(2.dp))

                Text(
                    text = "Reward: +$userCoins Coins  •  ${if (userTrophies >= 0) "+$userTrophies" else "$userTrophies"} Trophies",
                    color = Color(0xFFFFD600),
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Black
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            // 2. TOP 3 PODIUM (1st Center Highest, 2nd Left, 3rd Right)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(180.dp),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.Bottom
            ) {
                // 2nd Place Podium (Left, Medium height 130dp)
                PodiumColumn(
                    entry = entries[1],
                    podiumHeight = 110.dp,
                    badgeColor = Color(0xFFB0BEC5), // Silver
                    rank = 2
                )

                Spacer(modifier = Modifier.width(12.dp))

                // 1st Place Podium (Center, Highest 160dp)
                PodiumColumn(
                    entry = entries[0],
                    podiumHeight = 145.dp,
                    badgeColor = Color(0xFFFFD214), // Gold
                    rank = 1,
                    hasCrown = true
                )

                Spacer(modifier = Modifier.width(12.dp))

                // 3rd Place Podium (Right, Lowest height 100dp)
                PodiumColumn(
                    entry = entries[2],
                    podiumHeight = 90.dp,
                    badgeColor = Color(0xFFCD7F32), // Bronze
                    rank = 3
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // 3. SCROLLABLE RANKINGS TABLE
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
                    .clip(RoundedCornerShape(20.dp))
                    .background(Color(0x33FFFFFF))
                    .border(1.5.dp, Color(0x44FFFFFF), RoundedCornerShape(20.dp))
                    .padding(8.dp)
            ) {
                LazyColumn(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    itemsIndexed(entries) { _, item ->
                        LeaderboardRowItem(item)
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // 4. ACTION BUTTONS (PLAY AGAIN & HOME)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Home Button
                Button(
                    onClick = onHomeClick,
                    shape = RoundedCornerShape(18.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1E293B)),
                    modifier = Modifier
                        .weight(1f)
                        .height(52.dp)
                        .border(1.5.dp, Color(0xFF38BDF8), RoundedCornerShape(18.dp))
                ) {
                    Icon(
                        imageVector = Icons.Default.Home,
                        contentDescription = "Home",
                        tint = Color.White
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "HOME",
                        color = Color.White,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                // Play Again Button (Primary Bouncy Yellow)
                Button(
                    onClick = onPlayAgainClick,
                    shape = RoundedCornerShape(18.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFFD600)),
                    modifier = Modifier
                        .weight(1.5f)
                        .height(52.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.PlayArrow,
                        contentDescription = "Play Again",
                        tint = Color(0xFF0D47A1)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "PLAY AGAIN",
                        color = Color(0xFF0D47A1),
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Black
                    )
                }
            }
        }
    }
}

@Composable
fun PodiumColumn(
    entry: LeaderboardEntry,
    podiumHeight: androidx.compose.ui.unit.Dp,
    badgeColor: Color,
    rank: Int,
    hasCrown: Boolean = false
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Bottom
    ) {
        // Crown above #1
        if (hasCrown) {
            Icon(
                imageVector = Icons.Default.EmojiEvents,
                contentDescription = "Crown",
                tint = Color(0xFFFFD600),
                modifier = Modifier.size(24.dp)
            )
        }

        // Avatar Circle
        Box(
            modifier = Modifier
                .size(44.dp)
                .clip(CircleShape)
                .background(entry.color)
                .border(2.5.dp, badgeColor, CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = entry.name.take(1).uppercase(),
                color = Color.White,
                fontSize = 18.sp,
                fontWeight = FontWeight.Black
            )
        }

        Spacer(modifier = Modifier.height(4.dp))

        Text(
            text = entry.name,
            color = Color.White,
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold,
            maxLines = 1
        )

        Spacer(modifier = Modifier.height(4.dp))

        // Podium Block
        Box(
            modifier = Modifier
                .width(82.dp)
                .height(podiumHeight)
                .clip(RoundedCornerShape(topStart = 14.dp, topEnd = 14.dp))
                .background(
                    brush = Brush.verticalGradient(
                        listOf(badgeColor, badgeColor.copy(alpha = 0.6f))
                    )
                )
                .border(2.dp, Color.White.copy(alpha = 0.4f), RoundedCornerShape(topStart = 14.dp, topEnd = 14.dp)),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = "#$rank",
                    color = Color(0xFF0F172A),
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Black
                )
                Text(
                    text = if (entry.trophiesDelta >= 0) "+${entry.trophiesDelta}" else "${entry.trophiesDelta}",
                    color = Color(0xFF0F172A),
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}

@Composable
fun LeaderboardRowItem(item: LeaderboardEntry) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(if (item.isUser) Color(0xFFFFD600) else Color(0x441E293B))
            .border(
                width = if (item.isUser) 2.dp else 1.dp,
                color = if (item.isUser) Color.White else Color(0x33FFFFFF),
                shape = RoundedCornerShape(12.dp)
            )
            .padding(horizontal = 12.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
                text = "#${item.rank}",
                color = if (item.isUser) Color(0xFF0F172A) else Color.White,
                fontSize = 14.sp,
                fontWeight = FontWeight.Black,
                modifier = Modifier.width(28.dp)
            )

            Box(
                modifier = Modifier
                    .size(28.dp)
                    .clip(CircleShape)
                    .background(item.color),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = item.name.take(1).uppercase(),
                    color = Color.White,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Black
                )
            }

            Spacer(modifier = Modifier.width(10.dp))

            Text(
                text = if (item.isUser) "${item.name} (YOU)" else item.name,
                color = if (item.isUser) Color(0xFF0F172A) else Color.White,
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold
            )
        }

        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
                text = "${String.format("%.1f", item.percentage)}%",
                color = if (item.isUser) Color(0xFF0F172A) else Color(0xFF38BDF8),
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.width(10.dp))

            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Default.Star,
                    contentDescription = "Trophies",
                    tint = if (item.isUser) Color(0xFF0F172A) else Color(0xFFFFD600),
                    modifier = Modifier.size(16.dp)
                )
                Text(
                    text = if (item.trophiesDelta >= 0) "+${item.trophiesDelta}" else "${item.trophiesDelta}",
                    color = if (item.isUser) Color(0xFF0F172A) else Color(0xFFFFD600),
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Black
                )
            }
        }
    }
}

