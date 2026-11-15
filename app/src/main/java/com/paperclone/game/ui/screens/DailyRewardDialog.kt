package com.paperclone.game.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Diamond
import androidx.compose.material.icons.filled.MonetizationOn
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.paperclone.game.data.GameRewardCalculator

@Composable
fun DailyRewardDialog(
    streak: Int,
    lastClaimTimestamp: Long,
    onClaimReward: () -> Unit,
    onDismiss: () -> Unit
) {
    val now = System.currentTimeMillis()
    val currentEpochDay = now / 86400000L
    val lastClaimEpochDay = lastClaimTimestamp / 86400000L

    val evalResult = GameRewardCalculator.evaluateDailyReward(
        currentEpochDay = currentEpochDay,
        lastClaimEpochDay = lastClaimEpochDay,
        currentStreak = streak
    )

    val activeDayIndex = if (evalResult.isClaimable) {
        evalResult.newStreak - 1
    } else {
        (streak - 1).coerceIn(0, 6)
    }

    val msUntilTomorrow = ((currentEpochDay + 1) * 86400000L) - now
    val hoursUntilTomorrow = (msUntilTomorrow / 3600000L).coerceAtLeast(1)

    Dialog(onDismissRequest = onDismiss) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.fillMaxWidth()
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(28.dp))
                    .background(Color(0xFF0288D1))
                    .border(3.5.dp, Color(0xFF38BDF8), RoundedCornerShape(28.dp))
                    .padding(18.dp)
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = "DAILY REWARD",
                        color = Color.White,
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Black,
                        letterSpacing = 1.sp
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    Text(
                        text = "Current Streak: $streak Days",
                        color = Color(0xFFFFF176),
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    // 7-day row
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        for (i in 0 until 7) {
                            val isTargetDay = i == activeDayIndex
                            val isPastClaimed = !evalResult.isClaimable && i <= activeDayIndex
                            val coins = GameRewardCalculator.DAILY_COIN_REWARDS[i]
                            val gems = GameRewardCalculator.DAILY_GEM_REWARDS[i]

                            Box(
                                modifier = Modifier
                                    .size(width = 42.dp, height = 66.dp)
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(
                                        when {
                                            isTargetDay && evalResult.isClaimable -> Color(0xFFFFD54F)
                                            isPastClaimed -> Color(0xFF81D4FA)
                                            else -> Color.White
                                        }
                                    )
                                    .border(
                                        width = if (isTargetDay) 2.dp else 1.dp,
                                        color = if (isTargetDay) Color(0xFFFF8F00) else Color(0xFFB0BEC5),
                                        shape = RoundedCornerShape(10.dp)
                                    ),
                                contentAlignment = Alignment.Center
                            ) {
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text(
                                        text = "D${i + 1}",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = if (isTargetDay) Color(0xFFE65100) else Color(0xFF64748B)
                                    )
                                    Icon(
                                        imageVector = Icons.Default.MonetizationOn,
                                        contentDescription = "Coin",
                                        tint = Color(0xFFFFB300),
                                        modifier = Modifier.size(16.dp)
                                    )
                                    Text(
                                        text = "+$coins",
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Black,
                                        color = Color(0xFF0F172A)
                                    )
                                    if (gems > 0) {
                                        Text(
                                            text = "+$gems💎",
                                            fontSize = 8.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = Color(0xFFFF3388)
                                        )
                                    }
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    // Big Claim Button
                    Button(
                        onClick = {
                            if (evalResult.isClaimable) {
                                onClaimReward()
                                onDismiss()
                            }
                        },
                        enabled = evalResult.isClaimable,
                        shape = RoundedCornerShape(20.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFF00E676),
                            disabledContainerColor = Color(0xFFB0BEC5)
                        ),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(52.dp)
                    ) {
                        Text(
                            text = if (evalResult.isClaimable) {
                                "CLAIM DAY ${evalResult.newStreak} (+${evalResult.rewardCoins} COINS)"
                            } else {
                                "CLAIMED TODAY (Next in ${hoursUntilTomorrow}h)"
                            },
                            color = Color.White,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Black
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(18.dp))

            // Circular Close Button
            Box(
                modifier = Modifier
                    .size(54.dp)
                    .clip(CircleShape)
                    .background(Color.White)
                    .border(3.dp, Color(0xFF0288D1), CircleShape)
                    .clickable { onDismiss() },
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Close,
                    contentDescription = "Close",
                    tint = Color(0xFF0288D1),
                    modifier = Modifier.size(28.dp)
                )
            }
        }
    }
}
