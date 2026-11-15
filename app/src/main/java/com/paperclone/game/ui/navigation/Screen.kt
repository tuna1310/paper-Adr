package com.paperclone.game.ui.navigation

sealed class Screen(val route: String) {
    object Splash : Screen("splash")
    object Home : Screen("home")
    object Game : Screen("game")
    object Skins : Screen("skins")
    object Leaderboard : Screen("leaderboard/{percentage}/{kills}/{isVictory}") {
        fun createRoute(percentage: Float, kills: Int, isVictory: Boolean): String {
            return "leaderboard/$percentage/$kills/$isVictory"
        }
    }
    object Reward : Screen("reward/{percentage}/{kills}") {
        fun createRoute(percentage: Float, kills: Int): String {
            return "reward/$percentage/$kills"
        }
    }
}

