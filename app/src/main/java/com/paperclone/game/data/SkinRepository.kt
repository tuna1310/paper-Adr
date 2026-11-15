package com.paperclone.game.data

import androidx.compose.ui.graphics.Color
import com.paperclone.game.core.engine.SkinPattern
import com.paperclone.game.ui.theme.CandyPalette

enum class MissionType {
    NONE,
    PLAY_MATCHES,
    KILL_ENEMIES,
    CAPTURE_PERCENTAGE,
    WIN_MATCHES
}

data class Skin(
    val id: Int,
    val name: String,
    val characterType: Int, // 0: CandyChick, 1: Strawberry, 2: CyberRobot, 3: Kitty, 4: Watermelon, 5: Bunny
    val territoryColor: Color,
    val pattern: SkinPattern,
    val priceCoins: Int,
    val unlockMission: String,
    val missionType: MissionType = MissionType.NONE,
    val missionTarget: Int = 0,
    val category: String = "Classic"
) {
    fun getPatternIndex(): Int = when (pattern) {
        SkinPattern.POLKA_DOTS -> 0
        SkinPattern.WATERMELON -> 1
        SkinPattern.LITTLE_FLOWERS, SkinPattern.SWEET_HEARTS -> 2
        SkinPattern.CANDY_STRIPES, SkinPattern.CLASSIC_PLAIN -> 3
        SkinPattern.STARRY_NIGHT -> 4
        SkinPattern.CARO_CHECKER -> 5
    }

    fun getTerritoryColorInt(): Int {
        val a = (territoryColor.alpha * 255).toInt().coerceIn(0, 255)
        val r = (territoryColor.red * 255).toInt().coerceIn(0, 255)
        val g = (territoryColor.green * 255).toInt().coerceIn(0, 255)
        val b = (territoryColor.blue * 255).toInt().coerceIn(0, 255)
        return (a shl 24) or (r shl 16) or (g shl 8) or b
    }

    fun getTerritoryDarkColorInt(): Int {
        val a = (territoryColor.alpha * 255).toInt().coerceIn(0, 255)
        val r = (territoryColor.red * 200).toInt().coerceIn(0, 255)
        val g = (territoryColor.green * 200).toInt().coerceIn(0, 255)
        val b = (territoryColor.blue * 200).toInt().coerceIn(0, 255)
        return (a shl 24) or (r shl 16) or (g shl 8) or b
    }
}

object SkinRepository {
    val allSkins = listOf(
        Skin(
            id = 1,
            name = "Classic Cube",
            characterType = 0,
            territoryColor = CandyPalette.PlayerYellow,
            pattern = SkinPattern.CLASSIC_PLAIN,
            priceCoins = 0,
            unlockMission = "Default unlocked",
            missionType = MissionType.NONE,
            category = "Classic"
        ),
        Skin(
            id = 2,
            name = "Watermelon Wedge",
            characterType = 4,
            territoryColor = CandyPalette.WatermelonRed,
            pattern = SkinPattern.WATERMELON,
            priceCoins = 0,
            unlockMission = "Play 1 match",
            missionType = MissionType.PLAY_MATCHES,
            missionTarget = 1,
            category = "Classic"
        ),
        Skin(
            id = 3,
            name = "Candy Chick",
            characterType = 0,
            territoryColor = CandyPalette.CandyOrange,
            pattern = SkinPattern.POLKA_DOTS,
            priceCoins = 150,
            unlockMission = "Play 3 matches",
            missionType = MissionType.PLAY_MATCHES,
            missionTarget = 3,
            category = "Classic"
        ),
        Skin(
            id = 4,
            name = "Boxer Bunny",
            characterType = 5,
            territoryColor = CandyPalette.BubblegumPink,
            pattern = SkinPattern.SWEET_HEARTS,
            priceCoins = 250,
            unlockMission = "Kill 5 enemies",
            missionType = MissionType.KILL_ENEMIES,
            missionTarget = 5,
            category = "Classic"
        ),
        Skin(
            id = 5,
            name = "Cyber Robot",
            characterType = 2,
            territoryColor = CandyPalette.ElectricCyan,
            pattern = SkinPattern.CARO_CHECKER,
            priceCoins = 350,
            unlockMission = "Capture 25% territory",
            missionType = MissionType.CAPTURE_PERCENTAGE,
            missionTarget = 25,
            category = "Classic"
        ),
        Skin(
            id = 6,
            name = "Candy Kitty",
            characterType = 3,
            territoryColor = CandyPalette.ElectricPurple,
            pattern = SkinPattern.LITTLE_FLOWERS,
            priceCoins = 450,
            unlockMission = "Kill 10 enemies",
            missionType = MissionType.KILL_ENEMIES,
            missionTarget = 10,
            category = "Classic"
        ),
        Skin(
            id = 7,
            name = "Sweet Strawberry",
            characterType = 1,
            territoryColor = CandyPalette.WatermelonRed,
            pattern = SkinPattern.POLKA_DOTS,
            priceCoins = 500,
            unlockMission = "Play 7 matches",
            missionType = MissionType.PLAY_MATCHES,
            missionTarget = 7,
            category = "Classic"
        ),
        Skin(
            id = 8,
            name = "Mint Kitty",
            characterType = 3,
            territoryColor = CandyPalette.VibrantGreen,
            pattern = SkinPattern.POLKA_DOTS,
            priceCoins = 600,
            unlockMission = "Kill 15 enemies",
            missionType = MissionType.KILL_ENEMIES,
            missionTarget = 15,
            category = "Classic"
        ),
        Skin(
            id = 9,
            name = "Neon Bot",
            characterType = 2,
            territoryColor = CandyPalette.RoyalBlue,
            pattern = SkinPattern.CANDY_STRIPES,
            priceCoins = 750,
            unlockMission = "Play 15 matches",
            missionType = MissionType.PLAY_MATCHES,
            missionTarget = 15,
            category = "Special"
        ),
        Skin(
            id = 10,
            name = "Bunny Champion",
            characterType = 5,
            territoryColor = CandyPalette.PlayerYellow,
            pattern = SkinPattern.STARRY_NIGHT,
            priceCoins = 850,
            unlockMission = "Win 1 match",
            missionType = MissionType.WIN_MATCHES,
            missionTarget = 1,
            category = "Special"
        ),
        Skin(
            id = 11,
            name = "Sunny Chick",
            characterType = 0,
            territoryColor = CandyPalette.PlayerYellow,
            pattern = SkinPattern.LITTLE_FLOWERS,
            priceCoins = 900,
            unlockMission = "Play 20 matches",
            missionType = MissionType.PLAY_MATCHES,
            missionTarget = 20,
            category = "Special"
        ),
        Skin(
            id = 12,
            name = "Berry Blast",
            characterType = 1,
            territoryColor = CandyPalette.BubblegumPink,
            pattern = SkinPattern.SWEET_HEARTS,
            priceCoins = 1000,
            unlockMission = "Capture 35% territory",
            missionType = MissionType.CAPTURE_PERCENTAGE,
            missionTarget = 35,
            category = "Special"
        ),
        Skin(
            id = 13,
            name = "Glacier Melon",
            characterType = 4,
            territoryColor = CandyPalette.ElectricCyan,
            pattern = SkinPattern.WATERMELON,
            priceCoins = 1200,
            unlockMission = "Kill 25 enemies",
            missionType = MissionType.KILL_ENEMIES,
            missionTarget = 25,
            category = "Special"
        ),
        Skin(
            id = 14,
            name = "Midnight Kitty",
            characterType = 3,
            territoryColor = CandyPalette.DeepNavy,
            pattern = SkinPattern.STARRY_NIGHT,
            priceCoins = 1400,
            unlockMission = "Kill 35 enemies",
            missionType = MissionType.KILL_ENEMIES,
            missionTarget = 35,
            category = "Special"
        ),
        Skin(
            id = 15,
            name = "Golden Crown",
            characterType = 0,
            territoryColor = CandyPalette.Gold,
            pattern = SkinPattern.STARRY_NIGHT,
            priceCoins = 1600,
            unlockMission = "Win 3 matches",
            missionType = MissionType.WIN_MATCHES,
            missionTarget = 3,
            category = "Special"
        ),
        Skin(
            id = 16,
            name = "Crimson Boxer",
            characterType = 5,
            territoryColor = CandyPalette.WatermelonRed,
            pattern = SkinPattern.CANDY_STRIPES,
            priceCoins = 1800,
            unlockMission = "Play 30 matches",
            missionType = MissionType.PLAY_MATCHES,
            missionTarget = 30,
            category = "Special"
        ),
        Skin(
            id = 17,
            name = "Cosmic Android",
            characterType = 2,
            territoryColor = CandyPalette.ElectricPurple,
            pattern = SkinPattern.CARO_CHECKER,
            priceCoins = 2000,
            unlockMission = "Kill 50 enemies",
            missionType = MissionType.KILL_ENEMIES,
            missionTarget = 50,
            category = "Special"
        ),
        Skin(
            id = 18,
            name = "Emerald Melon",
            characterType = 4,
            territoryColor = CandyPalette.VibrantGreen,
            pattern = SkinPattern.WATERMELON,
            priceCoins = 2200,
            unlockMission = "Capture 50% territory",
            missionType = MissionType.CAPTURE_PERCENTAGE,
            missionTarget = 50,
            category = "Special"
        ),
        Skin(
            id = 19,
            name = "Royal Strawberry",
            characterType = 1,
            territoryColor = CandyPalette.RoyalBlue,
            pattern = SkinPattern.LITTLE_FLOWERS,
            priceCoins = 2500,
            unlockMission = "Win 5 matches",
            missionType = MissionType.WIN_MATCHES,
            missionTarget = 5,
            category = "Special"
        ),
        Skin(
            id = 20,
            name = "Galaxy Star",
            characterType = 0,
            territoryColor = CandyPalette.ElectricPurple,
            pattern = SkinPattern.STARRY_NIGHT,
            priceCoins = 3000,
            unlockMission = "Capture 60% territory",
            missionType = MissionType.CAPTURE_PERCENTAGE,
            missionTarget = 60,
            category = "Special"
        )
    )

    fun getSkinById(id: Int): Skin {
        return allSkins.find { it.id == id } ?: allSkins[0]
    }
}
