package com.paperclone.game.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.paperclone.game.data.DailyRewardResult
import com.paperclone.game.data.GamePreferences
import com.paperclone.game.data.GameRewardCalculator
import com.paperclone.game.data.Skin
import com.paperclone.game.data.UserPreferences
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

data class MatchResult(
    val percentage: Float = 0f,
    val kills: Int = 0,
    val isVictory: Boolean = false,
    val isSpecialReward: Boolean = false,
    val coinsEarned: Int = 0,
    val trophiesEarned: Int = 0
)

class GameViewModel(application: Application) : AndroidViewModel(application) {

    val preferences = GamePreferences(application.applicationContext)

    val userPreferences: StateFlow<UserPreferences> = preferences.userPreferencesFlow
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = UserPreferences(
                coins = 250,
                gems = 10,
                trophies = 0,
                playerName = "Player",
                equippedSkinId = 1,
                unlockedSkinIds = setOf("1"),
                soundEnabled = true,
                musicEnabled = true,
                vibrationEnabled = true,
                particlesEnabled = true,
                totalMatches = 0,
                totalKills = 0,
                totalVictories = 0,
                maxPercentage = 0f,
                lastDailyClaimDate = 0L,
                dailyStreak = 0,
                hasCompletedTutorial = false
            )
        )

    init {
        viewModelScope.launch {
            userPreferences.collect { prefs ->
                val soundMgr = com.paperclone.game.core.audio.SoundManager.getInstance(application)
                soundMgr.isSoundEnabled = prefs.soundEnabled
                soundMgr.isMusicEnabled = prefs.musicEnabled

                com.paperclone.game.core.engine.GameConfig.ENABLE_PARTICLES = prefs.particlesEnabled
                com.paperclone.game.core.engine.GameConfig.ENABLE_CAPTURE_RIPPLE = prefs.particlesEnabled
                com.paperclone.game.core.engine.GameConfig.ENABLE_CAMERA_SHAKE = prefs.particlesEnabled
                com.paperclone.game.core.engine.GameConfig.ENABLE_SPEED_BOOST_TRAIL = prefs.particlesEnabled
            }
        }
    }

    private val _lastMatchResult = MutableStateFlow(MatchResult())
    val lastMatchResult: StateFlow<MatchResult> = _lastMatchResult.asStateFlow()

    fun equipSkin(skinId: Int) {
        viewModelScope.launch {
            preferences.setEquippedSkinId(skinId)
        }
    }

    fun unlockSkinWithCoins(skin: Skin): Boolean {
        val currentCoins = userPreferences.value.coins
        if (currentCoins >= skin.priceCoins && skin.priceCoins > 0) {
            viewModelScope.launch {
                val success = preferences.spendCoins(skin.priceCoins)
                if (success) {
                    preferences.unlockSkin(skin.id)
                    preferences.setEquippedSkinId(skin.id)
                }
            }
            return true
        }
        return false
    }

    fun claimSkinWithMission(skin: Skin): Boolean {
        val canClaim = GameRewardCalculator.canUnlockViaMission(skin, userPreferences.value)
        if (canClaim) {
            viewModelScope.launch {
                preferences.unlockSkin(skin.id)
                preferences.setEquippedSkinId(skin.id)
            }
            return true
        }
        return false
    }

    fun setPlayerName(name: String) {
        viewModelScope.launch {
            preferences.setPlayerName(name)
        }
    }

    fun toggleSound(enabled: Boolean) {
        viewModelScope.launch {
            preferences.setSoundEnabled(enabled)
        }
    }

    fun toggleMusic(enabled: Boolean) {
        viewModelScope.launch {
            preferences.setMusicEnabled(enabled)
        }
    }

    fun toggleVibration(enabled: Boolean) {
        viewModelScope.launch {
            preferences.setVibrationEnabled(enabled)
        }
    }

    fun toggleParticles(enabled: Boolean) {
        viewModelScope.launch {
            preferences.setParticlesEnabled(enabled)
        }
    }

    fun completeTutorial() {
        viewModelScope.launch {
            preferences.setTutorialCompleted()
        }
    }

    fun onMatchFinished(percentage: Float, kills: Int, isVictory: Boolean, isSpecialReward: Boolean) {
        val coins = GameRewardCalculator.calculateCoinsEarned(percentage, kills, isVictory, isSpecialReward)
        val trophiesDelta = GameRewardCalculator.calculateTrophiesDelta(percentage, kills, isVictory, isSpecialReward)

        _lastMatchResult.value = MatchResult(
            percentage = percentage,
            kills = kills,
            isVictory = isVictory,
            isSpecialReward = isSpecialReward,
            coinsEarned = coins,
            trophiesEarned = trophiesDelta
        )

        viewModelScope.launch {
            preferences.addCoins(coins)
            preferences.updateTrophies(trophiesDelta)
            preferences.recordMatchFinished(kills, percentage, isVictory)
        }
    }

    fun claimDailyReward(): DailyRewardResult {
        val prefs = userPreferences.value
        val now = System.currentTimeMillis()
        val currentEpochDay = now / 86400000L
        val lastClaimEpochDay = prefs.lastDailyClaimDate / 86400000L

        val result = GameRewardCalculator.evaluateDailyReward(
            currentEpochDay = currentEpochDay,
            lastClaimEpochDay = lastClaimEpochDay,
            currentStreak = prefs.dailyStreak
        )

        if (result.isClaimable) {
            viewModelScope.launch {
                preferences.claimDailyReward(
                    rewardCoins = result.rewardCoins,
                    rewardGems = result.rewardGems,
                    newStreak = result.newStreak,
                    claimTimestamp = now
                )
            }
        }
        return result
    }
}
