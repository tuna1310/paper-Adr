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
import androidx.compose.material.icons.filled.MusicNote
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.VolumeUp
import androidx.compose.material.icons.filled.Vibration
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
import com.paperclone.game.ui.theme.CandyPalette

/**
 * Settings Dialog inspired directly by Screenshot 3.
 * Blue rounded card with cyan border, vibrant audio toggles, vibration pill,
 * and circular bottom close button.
 */
@Composable
fun SettingsDialog(
    soundEnabled: Boolean,
    musicEnabled: Boolean,
    vibrationEnabled: Boolean,
    particlesEnabled: Boolean,
    onToggleSound: (Boolean) -> Unit,
    onToggleMusic: (Boolean) -> Unit,
    onToggleVibration: (Boolean) -> Unit,
    onToggleParticles: (Boolean) -> Unit,
    onDismiss: () -> Unit
) {
    Dialog(onDismissRequest = onDismiss) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.fillMaxWidth()
        ) {
            // Main Modal Card
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(28.dp))
                    .background(Color(0xFF0288D1)) // Bright Blue Header
                    .border(3.5.dp, Color(0xFF38BDF8), RoundedCornerShape(28.dp))
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.padding(18.dp)
                ) {
                    // Title
                    Text(
                        text = "SETTINGS",
                        color = Color.White,
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Black,
                        letterSpacing = 1.sp
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    // Inner White/Cyan Content Box
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(20.dp))
                            .background(Color(0xFFB3E5FC))
                            .border(2.dp, Color(0xFF81D4FA), RoundedCornerShape(20.dp))
                            .padding(14.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        // Sound FX Toggle
                        SettingToggleRow(
                            title = "SOUND FX",
                            icon = Icons.Default.VolumeUp,
                            isEnabled = soundEnabled,
                            onToggle = { onToggleSound(!soundEnabled) }
                        )

                        // Music Toggle
                        SettingToggleRow(
                            title = "MUSIC",
                            icon = Icons.Default.MusicNote,
                            isEnabled = musicEnabled,
                            onToggle = { onToggleMusic(!musicEnabled) }
                        )

                        // Vibration Toggle
                        SettingToggleRow(
                            title = "VIBRATION",
                            icon = Icons.Default.Vibration,
                            isEnabled = vibrationEnabled,
                            onToggle = { onToggleVibration(!vibrationEnabled) }
                        )

                        // Particle Effects Toggle
                        SettingToggleRow(
                            title = "PARTICLES",
                            icon = Icons.Default.Notifications,
                            isEnabled = particlesEnabled,
                            onToggle = { onToggleParticles(!particlesEnabled) }
                        )
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Version text
                    Text(
                        text = "PaperClone v1.0.0 (Native)",
                        color = Color(0xCCFFFFFF),
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium
                    )
                }
            }

            Spacer(modifier = Modifier.height(18.dp))

            // Circular Close Button (Matches Screenshot 3 bottom X)
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

@Composable
fun SettingToggleRow(
    title: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    isEnabled: Boolean,
    onToggle: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(14.dp))
            .background(Color.White)
            .border(1.5.dp, Color(0xFF81D4FA), RoundedCornerShape(14.dp))
            .padding(horizontal = 12.dp, vertical = 9.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(
                imageVector = icon,
                contentDescription = title,
                tint = Color(0xFF0288D1),
                modifier = Modifier.size(24.dp)
            )
            Spacer(modifier = Modifier.width(10.dp))
            Text(
                text = title,
                color = Color(0xFF0F172A),
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold
            )
        }

        // Pill Switch Button
        Box(
            modifier = Modifier
                .size(width = 66.dp, height = 32.dp)
                .clip(RoundedCornerShape(16.dp))
                .background(if (isEnabled) Color(0xFF00E676) else Color(0xFFFF5252))
                .clickable { onToggle() },
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = if (isEnabled) "ON" else "OFF",
                color = Color.White,
                fontSize = 13.sp,
                fontWeight = FontWeight.Black
            )
        }
    }
}

