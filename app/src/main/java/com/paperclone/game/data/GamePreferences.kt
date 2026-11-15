package com.paperclone.game.data

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.longPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.core.stringSetPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "paperclone_preferences")

data class UserPreferences(
    val coins: Int,
    val gems: Int,
    val trophies: Int,
    val playerName: String,
    val equippedSkinId: Int,
    val unlockedSkinIds: Set<String>,
    val soundEnabled: Boolean,
    val musicEnabled: Boolean,
    val vibrationEnabled: Boolean,
    val particlesEnabled: Boolean,
    val totalMatches: Int,
    val totalKills: Int,
    val totalVictories: Int,
    val maxPercentage: Float,
    val lastDailyClaimDate: Long,
    val dailyStreak: Int,
    val hasCompletedTutorial: Boolean = false
)

class GamePreferences(private val context: Context) {

    companion object {
        val COINS_KEY = intPreferencesKey("user_coins")
        val GEMS_KEY = intPreferencesKey("user_gems")
        val TROPHIES_KEY = intPreferencesKey("user_trophies")
        val PLAYER_NAME_KEY = stringPreferencesKey("player_name")
        val EQUIPPED_SKIN_ID_KEY = intPreferencesKey("equipped_skin_id")
        val UNLOCKED_SKINS_KEY = stringSetPreferencesKey("unlocked_skin_ids")
        val SOUND_ENABLED_KEY = booleanPreferencesKey("sound_enabled")
        val MUSIC_ENABLED_KEY = booleanPreferencesKey("music_enabled")
        val VIBRATION_ENABLED_KEY = booleanPreferencesKey("vibration_enabled")
        val PARTICLES_ENABLED_KEY = booleanPreferencesKey("particles_enabled")
        val TOTAL_MATCHES_KEY = intPreferencesKey("total_matches")
        val TOTAL_Kills_KEY = intPreferencesKey("total_kills")
        val TOTAL_VICTORIES_KEY = intPreferencesKey("total_victories")
        val MAX_PERCENTAGE_KEY = stringPreferencesKey("max_percentage")
        val LAST_DAILY_CLAIM_DATE_KEY = longPreferencesKey("last_daily_claim_date")
        val DAILY_STREAK_KEY = intPreferencesKey("daily_streak")
        val HAS_COMPLETED_TUTORIAL_KEY = booleanPreferencesKey("has_completed_tutorial")
    }

    val userPreferencesFlow: Flow<UserPreferences> = context.dataStore.data.map { prefs ->
        val savedName = prefs[PLAYER_NAME_KEY]
        val name = if (savedName.isNullOrEmpty()) {
            "Player_" + (1000..9999).random()
        } else {
            savedName
        }

        UserPreferences(
            coins = prefs[COINS_KEY] ?: 250,
            gems = prefs[GEMS_KEY] ?: 10,
            trophies = prefs[TROPHIES_KEY] ?: 0,
            playerName = name,
            equippedSkinId = prefs[EQUIPPED_SKIN_ID_KEY] ?: 1,
            unlockedSkinIds = prefs[UNLOCKED_SKINS_KEY] ?: setOf("1"),
            soundEnabled = prefs[SOUND_ENABLED_KEY] ?: true,
            musicEnabled = prefs[MUSIC_ENABLED_KEY] ?: true,
            vibrationEnabled = prefs[VIBRATION_ENABLED_KEY] ?: true,
            particlesEnabled = prefs[PARTICLES_ENABLED_KEY] ?: true,
            totalMatches = prefs[TOTAL_MATCHES_KEY] ?: 0,
            totalKills = prefs[TOTAL_Kills_KEY] ?: 0,
            totalVictories = prefs[TOTAL_VICTORIES_KEY] ?: 0,
            maxPercentage = prefs[MAX_PERCENTAGE_KEY]?.toFloatOrNull() ?: 0.0f,
            lastDailyClaimDate = prefs[LAST_DAILY_CLAIM_DATE_KEY] ?: 0L,
            dailyStreak = prefs[DAILY_STREAK_KEY] ?: 0,
            hasCompletedTutorial = prefs[HAS_COMPLETED_TUTORIAL_KEY] ?: false
        )
    }

    suspend fun addCoins(amount: Int) {
        context.dataStore.edit { prefs ->
            val current = prefs[COINS_KEY] ?: 250
            prefs[COINS_KEY] = (current + amount).coerceAtLeast(0)
        }
    }

    suspend fun spendCoins(amount: Int): Boolean {
        var success = false
        context.dataStore.edit { prefs ->
            val current = prefs[COINS_KEY] ?: 250
            if (current >= amount) {
                prefs[COINS_KEY] = current - amount
                success = true
            }
        }
        return success
    }

    suspend fun addGems(amount: Int) {
        context.dataStore.edit { prefs ->
            val current = prefs[GEMS_KEY] ?: 10
            prefs[GEMS_KEY] = (current + amount).coerceAtLeast(0)
        }
    }

    suspend fun updateTrophies(delta: Int) {
        context.dataStore.edit { prefs ->
            val current = prefs[TROPHIES_KEY] ?: 0
            prefs[TROPHIES_KEY] = (current + delta).coerceAtLeast(0)
        }
    }

    suspend fun addTrophies(amount: Int) {
        updateTrophies(amount)
    }

    suspend fun setPlayerName(name: String) {
        context.dataStore.edit { prefs ->
            prefs[PLAYER_NAME_KEY] = name.trim().ifEmpty { "Player" }
        }
    }

    suspend fun setEquippedSkinId(skinId: Int) {
        context.dataStore.edit { prefs ->
            prefs[EQUIPPED_SKIN_ID_KEY] = skinId
        }
    }

    suspend fun unlockSkin(skinId: Int) {
        context.dataStore.edit { prefs ->
            val currentSet = prefs[UNLOCKED_SKINS_KEY]?.toMutableSet() ?: mutableSetOf("1")
            currentSet.add(skinId.toString())
            prefs[UNLOCKED_SKINS_KEY] = currentSet
        }
    }

    suspend fun setSoundEnabled(enabled: Boolean) {
        context.dataStore.edit { prefs ->
            prefs[SOUND_ENABLED_KEY] = enabled
        }
    }

    suspend fun setMusicEnabled(enabled: Boolean) {
        context.dataStore.edit { prefs ->
            prefs[MUSIC_ENABLED_KEY] = enabled
        }
    }

    suspend fun setVibrationEnabled(enabled: Boolean) {
        context.dataStore.edit { prefs ->
            prefs[VIBRATION_ENABLED_KEY] = enabled
        }
    }

    suspend fun setParticlesEnabled(enabled: Boolean) {
        context.dataStore.edit { prefs ->
            prefs[PARTICLES_ENABLED_KEY] = enabled
        }
    }

    suspend fun setTutorialCompleted() {
        context.dataStore.edit { prefs ->
            prefs[HAS_COMPLETED_TUTORIAL_KEY] = true
        }
    }

    suspend fun recordMatchFinished(kills: Int, percentage: Float, isVictory: Boolean) {
        context.dataStore.edit { prefs ->
            prefs[TOTAL_MATCHES_KEY] = (prefs[TOTAL_MATCHES_KEY] ?: 0) + 1
            prefs[TOTAL_Kills_KEY] = (prefs[TOTAL_Kills_KEY] ?: 0) + kills
            if (isVictory) {
                prefs[TOTAL_VICTORIES_KEY] = (prefs[TOTAL_VICTORIES_KEY] ?: 0) + 1
            }
            val bestPct = prefs[MAX_PERCENTAGE_KEY]?.toFloatOrNull() ?: 0f
            if (percentage > bestPct) {
                prefs[MAX_PERCENTAGE_KEY] = percentage.toString()
            }
        }
    }

    suspend fun claimDailyReward(rewardCoins: Int, rewardGems: Int, newStreak: Int, claimTimestamp: Long) {
        context.dataStore.edit { prefs ->
            val currentCoins = prefs[COINS_KEY] ?: 250
            val currentGems = prefs[GEMS_KEY] ?: 10
            prefs[COINS_KEY] = currentCoins + rewardCoins
            prefs[GEMS_KEY] = currentGems + rewardGems
            prefs[DAILY_STREAK_KEY] = newStreak
            prefs[LAST_DAILY_CLAIM_DATE_KEY] = claimTimestamp
        }
    }
}

