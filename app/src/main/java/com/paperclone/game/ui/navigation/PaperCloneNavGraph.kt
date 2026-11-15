package com.paperclone.game.ui.navigation

import androidx.activity.compose.BackHandler
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.compose.LocalLifecycleOwner
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.paperclone.game.core.audio.SoundManager
import com.paperclone.game.core.engine.GameEngine
import com.paperclone.game.data.SkinRepository
import com.paperclone.game.ui.screens.GameSurfaceView
import com.paperclone.game.ui.screens.HomeScreen
import com.paperclone.game.ui.screens.LeaderboardScreen
import com.paperclone.game.ui.screens.RewardScreen
import com.paperclone.game.ui.screens.SkinScreen
import com.paperclone.game.ui.screens.SplashScreen
import com.paperclone.game.ui.theme.CandyPalette
import com.paperclone.game.ui.viewmodel.GameViewModel

@Composable
fun PaperCloneNavGraph(
    navController: NavHostController,
    viewModel: GameViewModel
) {
    val context = LocalContext.current
    val soundManager = remember { SoundManager.getInstance(context) }
    val userPrefs by viewModel.userPreferences.collectAsState()

    NavHost(
        navController = navController,
        startDestination = Screen.Splash.route,
        modifier = Modifier.fillMaxSize(),
        enterTransition = { fadeIn(animationSpec = tween(350)) },
        exitTransition = { fadeOut(animationSpec = tween(350)) }
    ) {
        // 1. Splash Screen
        composable(route = Screen.Splash.route) {
            SplashScreen(
                onNavigateToHome = {
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Splash.route) { inclusive = true }
                    }
                }
            )
        }

        // 2. Home Screen
        composable(route = Screen.Home.route) {
            HomeScreen(
                preferences = userPrefs,
                onPlayClick = {
                    soundManager.playClick()
                    navController.navigate(Screen.Game.route)
                },
                onSkinsClick = {
                    soundManager.playClick()
                    navController.navigate(Screen.Skins.route)
                },
                onLeaderboardClick = {
                    soundManager.playClick()
                    navController.navigate(Screen.Leaderboard.createRoute(userPrefs.maxPercentage, userPrefs.totalKills, false))
                },
                onToggleSound = { viewModel.toggleSound(it) },
                onToggleMusic = { viewModel.toggleMusic(it) },
                onToggleVibration = { viewModel.toggleVibration(it) },
                onToggleParticles = { viewModel.toggleParticles(it) },
                onClaimDailyReward = {
                    soundManager.playClaimReward()
                    viewModel.claimDailyReward()
                }
            )
        }

        // 3. Gameplay Screen
        composable(route = Screen.Game.route) {
            val engine = remember { GameEngine() }
            val equippedSkin = SkinRepository.getSkinById(userPrefs.equippedSkinId)
            engine.humanPlayer.skinIndex = equippedSkin.characterType
            engine.humanPlayer.patternIndex = equippedSkin.getPatternIndex()
            engine.humanPlayer.customColorInt = equippedSkin.getTerritoryColorInt()
            engine.humanPlayer.customDarkColorInt = equippedSkin.getTerritoryDarkColorInt()

            var showExitDialog by remember { mutableStateOf(false) }
            var gameSurfaceViewRef by remember { mutableStateOf<GameSurfaceView?>(null) }
            val lifecycleOwner = LocalLifecycleOwner.current

            DisposableEffect(lifecycleOwner) {
                val observer = LifecycleEventObserver { _, event ->
                    when (event) {
                        Lifecycle.Event.ON_PAUSE -> gameSurfaceViewRef?.pause()
                        Lifecycle.Event.ON_RESUME -> gameSurfaceViewRef?.resume()
                        else -> {}
                    }
                }
                lifecycleOwner.lifecycle.addObserver(observer)
                onDispose {
                    lifecycleOwner.lifecycle.removeObserver(observer)
                    gameSurfaceViewRef?.release()
                }
            }

            // Android Back Button handler
            BackHandler(enabled = true) {
                soundManager.playClick()
                showExitDialog = true
            }

            if (showExitDialog) {
                AlertDialog(
                    onDismissRequest = { showExitDialog = false },
                    title = {
                        Text(
                            "Quit Match?",
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    },
                    text = {
                        Text(
                            "Your current round progress will be lost. Return to Main Menu?",
                            color = Color(0xFFCBD5E1)
                        )
                    },
                    confirmButton = {
                        Button(
                            onClick = {
                                soundManager.playClick()
                                showExitDialog = false
                                navController.navigate(Screen.Home.route) {
                                    popUpTo(Screen.Home.route) { inclusive = true }
                                }
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = CandyPalette.WatermelonRed)
                        ) {
                            Text("Quit", color = Color.White, fontWeight = FontWeight.Bold)
                        }
                    },
                    dismissButton = {
                        TextButton(onClick = {
                            soundManager.playClick()
                            showExitDialog = false
                        }) {
                            Text("Stay", color = CandyPalette.ElectricCyan, fontWeight = FontWeight.Bold)
                        }
                    },
                    containerColor = Color(0xFF1E293B),
                    shape = RoundedCornerShape(20.dp)
                )
            }

            AndroidView(
                modifier = Modifier.fillMaxSize(),
                factory = { ctx ->
                    GameSurfaceView(ctx, engine).apply {
                        gameSurfaceViewRef = this
                        showTutorial = !userPrefs.hasCompletedTutorial

                        onTutorialCompleted = {
                            viewModel.completeTutorial()
                        }

                        onToggleMute = { isMuted ->
                            viewModel.toggleSound(!isMuted)
                            viewModel.toggleMusic(!isMuted)
                        }

                        onExitToHome = {
                            showExitDialog = true
                        }

                        onGameOver = { percentage, kills ->
                            viewModel.onMatchFinished(percentage, kills, isVictory = false, isSpecialReward = false)
                            navController.navigate(Screen.Leaderboard.createRoute(percentage, kills, false)) {
                                popUpTo(Screen.Game.route) { inclusive = true }
                            }
                        }

                        onVictory = { percentage, kills ->
                            viewModel.onMatchFinished(percentage, kills, isVictory = true, isSpecialReward = false)
                            navController.navigate(Screen.Leaderboard.createRoute(percentage, kills, true)) {
                                popUpTo(Screen.Game.route) { inclusive = true }
                            }
                        }

                        onSpecialReward = { percentage, kills ->
                            viewModel.onMatchFinished(percentage, kills, isVictory = true, isSpecialReward = true)
                            navController.navigate(Screen.Reward.createRoute(percentage, kills)) {
                                popUpTo(Screen.Game.route) { inclusive = true }
                            }
                        }
                    }
                }
            )
        }

        // 4. Skins Selection Screen
        composable(route = Screen.Skins.route) {
            SkinScreen(
                preferences = userPrefs,
                onEquipSkin = { skinId ->
                    soundManager.playClick()
                    viewModel.equipSkin(skinId)
                },
                onUnlockSkin = { skin ->
                    val success = viewModel.unlockSkinWithCoins(skin)
                    if (success) {
                        soundManager.playUnlockSkin()
                    } else {
                        soundManager.playClick()
                    }
                    success
                },
                onClaimMissionSkin = { skin ->
                    val success = viewModel.claimSkinWithMission(skin)
                    if (success) {
                        soundManager.playUnlockSkin()
                    } else {
                        soundManager.playClick()
                    }
                    success
                },
                onHomeClick = {
                    soundManager.playClick()
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Home.route) { inclusive = true }
                    }
                }
            )
        }

        // 5. Post-round Leaderboard Screen
        composable(
            route = Screen.Leaderboard.route,
            arguments = listOf(
                navArgument("percentage") { type = NavType.FloatType },
                navArgument("kills") { type = NavType.IntType },
                navArgument("isVictory") { type = NavType.BoolType }
            )
        ) { backStackEntry ->
            val percentage = backStackEntry.arguments?.getFloat("percentage") ?: 0f
            val kills = backStackEntry.arguments?.getInt("kills") ?: 0
            val isVictory = backStackEntry.arguments?.getBoolean("isVictory") ?: false

            LeaderboardScreen(
                percentage = percentage,
                kills = kills,
                isVictory = isVictory,
                userName = userPrefs.playerName,
                onPlayAgainClick = {
                    soundManager.playClick()
                    navController.navigate(Screen.Game.route) {
                        popUpTo(Screen.Home.route)
                    }
                },
                onHomeClick = {
                    soundManager.playClick()
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Home.route) { inclusive = true }
                    }
                }
            )
        }

        // 6. Special Reward Screen (>= 90% Conquest)
        composable(
            route = Screen.Reward.route,
            arguments = listOf(
                navArgument("percentage") { type = NavType.FloatType },
                navArgument("kills") { type = NavType.IntType }
            )
        ) { backStackEntry ->
            val percentage = backStackEntry.arguments?.getFloat("percentage") ?: 90f
            val kills = backStackEntry.arguments?.getInt("kills") ?: 0

            RewardScreen(
                percentage = percentage,
                kills = kills,
                onClaimClick = {
                    soundManager.playClaimReward()
                    navController.navigate(Screen.Leaderboard.createRoute(percentage, kills, true)) {
                        popUpTo(Screen.Home.route)
                    }
                }
            )
        }
    }
}
