package com.paperclone.game.core

import com.paperclone.game.core.engine.GameConfig
import com.paperclone.game.data.GameRewardCalculator
import com.paperclone.game.data.MissionType
import com.paperclone.game.data.SkinRepository
import com.paperclone.game.data.UserPreferences
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class GameLogicAndPreferencesTest {

    @Test
    fun testMatchRewardsCalculation() {
        // Case 1: Standard match (25.5% territory, 3 kills) -> High rank, no victory bonus
        val coins1 = GameRewardCalculator.calculateCoinsEarned(
            percentage = 25.5f,
            kills = 3,
            isVictory = false,
            isSpecialReward = false
        )
        // 25.5 * 10 = 255 + 3 * 25 = 75 -> 330
        assertEquals(330, coins1)

        val trophies1 = GameRewardCalculator.calculateTrophiesDelta(
            percentage = 25.5f,
            kills = 3,
            isVictory = false,
            isSpecialReward = false
        )
        assertEquals(20, trophies1)

        // Case 2: Victory (65.0% territory, 4 kills) -> +200 bonus coins, +35 trophies
        val coins2 = GameRewardCalculator.calculateCoinsEarned(
            percentage = 65.0f,
            kills = 4,
            isVictory = true,
            isSpecialReward = false
        )
        // 650 + 100 + 200 = 950
        assertEquals(950, coins2)

        val trophies2 = GameRewardCalculator.calculateTrophiesDelta(
            percentage = 65.0f,
            kills = 4,
            isVictory = true,
            isSpecialReward = false
        )
        assertEquals(35, trophies2)

        // Case 3: Special Reward (92.0% territory, 6 kills) -> +500 bonus coins, +60 trophies
        val coins3 = GameRewardCalculator.calculateCoinsEarned(
            percentage = 92.0f,
            kills = 6,
            isVictory = true,
            isSpecialReward = true
        )
        // 920 + 150 + 500 = 1570
        assertEquals(1570, coins3)

        val trophies3 = GameRewardCalculator.calculateTrophiesDelta(
            percentage = 92.0f,
            kills = 6,
            isVictory = true,
            isSpecialReward = true
        )
        assertEquals(60, trophies3)

        // Case 4: Early death (< 5% territory, 0 kills) -> -10 trophies, minimum 10 coins
        val coins4 = GameRewardCalculator.calculateCoinsEarned(
            percentage = 0.5f,
            kills = 0,
            isVictory = false,
            isSpecialReward = false
        )
        assertEquals(10, coins4) // Minimum 10 coins

        val trophies4 = GameRewardCalculator.calculateTrophiesDelta(
            percentage = 0.5f,
            kills = 0,
            isVictory = false,
            isSpecialReward = false
        )
        assertEquals(-10, trophies4)
    }

    @Test
    fun testTrophiesNeverDropBelowZero() {
        // Requirement: "Sửa lỗi cúp: không cho cúp xuống dưới 0"
        assertEquals(0, GameRewardCalculator.clampTrophies(currentTrophies = 0, delta = -10))
        assertEquals(0, GameRewardCalculator.clampTrophies(currentTrophies = 5, delta = -10))
        assertEquals(0, GameRewardCalculator.clampTrophies(currentTrophies = 9, delta = -10))
        assertEquals(5, GameRewardCalculator.clampTrophies(currentTrophies = 15, delta = -10))
        assertEquals(55, GameRewardCalculator.clampTrophies(currentTrophies = 20, delta = 35))
    }

    @Test
    fun testSkinUnlockLogic() {
        // Skin 3: Play 3 matches
        val skin3 = SkinRepository.getSkinById(3)
        assertEquals(MissionType.PLAY_MATCHES, skin3.missionType)
        assertEquals(3, skin3.missionTarget)

        val prefsUnder = createMockPreferences(totalMatches = 1, totalKills = 0, maxPercentage = 0f, totalVictories = 0)
        val progressUnder = GameRewardCalculator.calculateSkinProgress(skin3, prefsUnder)
        assertEquals(1f / 3f, progressUnder, 0.01f)
        assertFalse(GameRewardCalculator.canUnlockViaMission(skin3, prefsUnder))

        val prefsMet = createMockPreferences(totalMatches = 3, totalKills = 0, maxPercentage = 0f, totalVictories = 0)
        val progressMet = GameRewardCalculator.calculateSkinProgress(skin3, prefsMet)
        assertEquals(1.0f, progressMet, 0.01f)
        assertTrue(GameRewardCalculator.canUnlockViaMission(skin3, prefsMet))

        // Skin 4: Kill 5 enemies
        val skin4 = SkinRepository.getSkinById(4)
        val prefsKills = createMockPreferences(totalMatches = 0, totalKills = 6, maxPercentage = 0f, totalVictories = 0)
        assertTrue(GameRewardCalculator.canUnlockViaMission(skin4, prefsKills))

        // Skin 5: Capture 25% territory
        val skin5 = SkinRepository.getSkinById(5)
        val prefsTerritory = createMockPreferences(totalMatches = 0, totalKills = 0, maxPercentage = 27.5f, totalVictories = 0)
        assertTrue(GameRewardCalculator.canUnlockViaMission(skin5, prefsTerritory))

        // Skin 10: Win 1 match
        val skin10 = SkinRepository.getSkinById(10)
        val prefsVictory = createMockPreferences(totalMatches = 0, totalKills = 0, maxPercentage = 0f, totalVictories = 1)
        assertTrue(GameRewardCalculator.canUnlockViaMission(skin10, prefsVictory))
    }

    @Test
    fun testDailyRewardClaimLogic() {
        // 1. First claim ever (lastClaimEpochDay = 0)
        val day1Result = GameRewardCalculator.evaluateDailyReward(
            currentEpochDay = 100L,
            lastClaimEpochDay = 0L,
            currentStreak = 0
        )
        assertTrue("Day 1 should be claimable", day1Result.isClaimable)
        assertEquals(1, day1Result.newStreak)
        assertEquals(100, day1Result.rewardCoins)
        assertEquals(0, day1Result.rewardGems)

        // 2. Cannot claim again on the same day
        val sameDayResult = GameRewardCalculator.evaluateDailyReward(
            currentEpochDay = 100L,
            lastClaimEpochDay = 100L,
            currentStreak = 1
        )
        assertFalse("Same day claim should be rejected", sameDayResult.isClaimable)
        assertEquals(0, sameDayResult.rewardCoins)

        // 3. Consecutive claim on the next day (Day 2)
        val day2Result = GameRewardCalculator.evaluateDailyReward(
            currentEpochDay = 101L,
            lastClaimEpochDay = 100L,
            currentStreak = 1
        )
        assertTrue("Next day should be claimable", day2Result.isClaimable)
        assertEquals(2, day2Result.newStreak)
        assertEquals(150, day2Result.rewardCoins)

        // 4. Consecutive claim on Day 7 (Grand Prize)
        val day7Result = GameRewardCalculator.evaluateDailyReward(
            currentEpochDay = 106L,
            lastClaimEpochDay = 105L,
            currentStreak = 6
        )
        assertTrue("Day 7 should be claimable", day7Result.isClaimable)
        assertEquals(7, day7Result.newStreak)
        assertEquals(1000, day7Result.rewardCoins)
        assertEquals(50, day7Result.rewardGems)

        // 5. Day 8 Wrap Around to Day 1
        val day8WrapResult = GameRewardCalculator.evaluateDailyReward(
            currentEpochDay = 107L,
            lastClaimEpochDay = 106L,
            currentStreak = 7
        )
        assertTrue("Day 8 should wrap to Day 1", day8WrapResult.isClaimable)
        assertEquals(1, day8WrapResult.newStreak)
        assertEquals(100, day8WrapResult.rewardCoins)

        // 6. Missed a day (e.g. day 100 claimed, current is day 103 -> streak resets to 1)
        val streakResetResult = GameRewardCalculator.evaluateDailyReward(
            currentEpochDay = 103L,
            lastClaimEpochDay = 100L,
            currentStreak = 4
        )
        assertTrue("Missed day should reset streak to 1", streakResetResult.isClaimable)
        assertEquals(1, streakResetResult.newStreak)
        assertEquals(100, streakResetResult.rewardCoins)
    }

    @Test
    fun testTutorialFlagAndConfigToggles() {
        val prefsNew = createMockPreferences(totalMatches = 0, totalKills = 0, maxPercentage = 0f, totalVictories = 0, hasCompletedTutorial = false)
        assertFalse(prefsNew.hasCompletedTutorial)

        val prefsCompleted = createMockPreferences(totalMatches = 1, totalKills = 2, maxPercentage = 15f, totalVictories = 0, hasCompletedTutorial = true)
        assertTrue(prefsCompleted.hasCompletedTutorial)

        // Test GameConfig toggles
        GameConfig.DEBUG_FPS = true
        assertTrue(GameConfig.DEBUG_FPS)
        GameConfig.DEBUG_FPS = false
        assertFalse(GameConfig.DEBUG_FPS)
    }

    private fun createMockPreferences(
        totalMatches: Int,
        totalKills: Int,
        maxPercentage: Float,
        totalVictories: Int,
        hasCompletedTutorial: Boolean = false
    ): UserPreferences {
        return UserPreferences(
            coins = 500,
            gems = 10,
            trophies = 100,
            playerName = "TestPlayer",
            equippedSkinId = 1,
            unlockedSkinIds = setOf("1"),
            soundEnabled = true,
            musicEnabled = true,
            vibrationEnabled = true,
            particlesEnabled = true,
            totalMatches = totalMatches,
            totalKills = totalKills,
            totalVictories = totalVictories,
            maxPercentage = maxPercentage,
            lastDailyClaimDate = 0L,
            dailyStreak = 0,
            hasCompletedTutorial = hasCompletedTutorial
        )
    }
}
