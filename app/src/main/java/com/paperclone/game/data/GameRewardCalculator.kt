package com.paperclone.game.data

import kotlin.math.roundToInt

data class DailyRewardResult(
    val isClaimable: Boolean,
    val newStreak: Int,
    val rewardCoins: Int,
    val rewardGems: Int,
    val message: String
)

/**
 * Pure business logic for match rewards, skin unlocking, and daily streak rewards.
 * 100% deterministic and unit-testable without Android framework dependencies.
 */
object GameRewardCalculator {

    val DAILY_COIN_REWARDS = listOf(100, 150, 200, 300, 450, 600, 1000)
    val DAILY_GEM_REWARDS = listOf(0, 0, 5, 5, 10, 15, 50)

    /**
     * Calculates coins earned from a match based on territory %, kills, and win condition.
     */
    fun calculateCoinsEarned(
        percentage: Float,
        kills: Int,
        isVictory: Boolean,
        isSpecialReward: Boolean
    ): Int {
        val territoryCoins = (percentage * 10f).roundToInt()
        val killCoins = kills * 25
        val bonus = when {
            isSpecialReward -> 500
            isVictory -> 200
            else -> 0
        }
        val total = territoryCoins + killCoins + bonus
        // Minimum 10 coins earned per match for participation
        return total.coerceAtLeast(10)
    }

    /**
     * Calculates trophies gained or lost after a match.
     */
    fun calculateTrophiesDelta(
        percentage: Float,
        kills: Int,
        isVictory: Boolean,
        isSpecialReward: Boolean
    ): Int {
        return when {
            isSpecialReward -> 60
            isVictory -> 35
            percentage >= 20f || kills >= 3 -> 20
            percentage >= 10f || kills >= 1 -> 10
            percentage >= 5f -> 5
            else -> -10 // Lost early with < 5% and 0 kills
        }
    }

    /**
     * Applies trophies delta ensuring trophies never drop below 0.
     */
    fun clampTrophies(currentTrophies: Int, delta: Int): Int {
        return (currentTrophies + delta).coerceAtLeast(0)
    }

    /**
     * Evaluates daily reward status based on calendar epoch days.
     * @param currentEpochDay Day number (e.g. timestamp / 86,400,000L)
     * @param lastClaimEpochDay Last day the user claimed, or 0 if never
     * @param currentStreak The user's active streak (1..7)
     */
    fun evaluateDailyReward(
        currentEpochDay: Long,
        lastClaimEpochDay: Long,
        currentStreak: Int
    ): DailyRewardResult {
        if (lastClaimEpochDay > 0L && currentEpochDay == lastClaimEpochDay) {
            return DailyRewardResult(
                isClaimable = false,
                newStreak = currentStreak.coerceIn(1, 7),
                rewardCoins = 0,
                rewardGems = 0,
                message = "Already claimed today"
            )
        }

        val newStreak = when {
            lastClaimEpochDay == 0L -> 1
            currentEpochDay == lastClaimEpochDay + 1 -> {
                if (currentStreak >= 7) 1 else currentStreak + 1
            }
            else -> 1 // Missed 1 or more days -> resets to Day 1
        }

        val index = (newStreak - 1).coerceIn(0, 6)
        return DailyRewardResult(
            isClaimable = true,
            newStreak = newStreak,
            rewardCoins = DAILY_COIN_REWARDS[index],
            rewardGems = DAILY_GEM_REWARDS[index],
            message = "Claim Day $newStreak Reward!"
        )
    }

    /**
     * Calculates progress ratio (0.0 to 1.0) for a skin mission based on user preferences.
     */
    fun calculateSkinProgress(skin: Skin, userPrefs: UserPreferences): Float {
        if (skin.missionTarget <= 0) return 1.0f
        val current = when (skin.missionType) {
            MissionType.NONE -> skin.missionTarget
            MissionType.PLAY_MATCHES -> userPrefs.totalMatches
            MissionType.KILL_ENEMIES -> userPrefs.totalKills
            MissionType.CAPTURE_PERCENTAGE -> userPrefs.maxPercentage.toInt()
            MissionType.WIN_MATCHES -> userPrefs.totalVictories
        }
        return (current.toFloat() / skin.missionTarget.toFloat()).coerceIn(0f, 1f)
    }

    /**
     * Checks if a skin can be unlocked for free via mission progress.
     */
    fun canUnlockViaMission(skin: Skin, userPrefs: UserPreferences): Boolean {
        if (skin.missionType == MissionType.NONE) return false
        return calculateSkinProgress(skin, userPrefs) >= 1.0f
    }
}

