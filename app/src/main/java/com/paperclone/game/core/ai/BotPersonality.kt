package com.paperclone.game.core.ai

enum class Difficulty {
    EASY,
    NORMAL,
    HARD
}

enum class Personality {
    GREEDY,    // Ventures far to enclose large territory
    CAUTIOUS,  // Takes small loops, rushes home at first sign of danger
    PREDATOR   // Actively hunts other players' trails
}

data class PersonalityConfig(
    val maxLoopDistance: Float,      // Max cells away from base before heading back
    val dangerSenseRadius: Float,    // Distance to enemy to trigger panic return
    val huntInterestRadius: Float,   // Distance within which predator pursues enemy trail
    val thinkIntervalSec: Float      // AI re-evaluation frequency
)

object BotConfigs {
    fun getConfig(personality: Personality, difficulty: Difficulty): PersonalityConfig {
        val thinkInterval = when (difficulty) {
            Difficulty.EASY -> 0.25f
            Difficulty.NORMAL -> 0.14f
            Difficulty.HARD -> 0.07f
        }

        return when (personality) {
            Personality.GREEDY -> PersonalityConfig(
                maxLoopDistance = when (difficulty) {
                    Difficulty.EASY -> 18f
                    Difficulty.NORMAL -> 24f
                    Difficulty.HARD -> 30f
                },
                dangerSenseRadius = when (difficulty) {
                    Difficulty.EASY -> 5f
                    Difficulty.NORMAL -> 7f
                    Difficulty.HARD -> 9f
                },
                huntInterestRadius = 8f,
                thinkIntervalSec = thinkInterval
            )
            Personality.CAUTIOUS -> PersonalityConfig(
                maxLoopDistance = when (difficulty) {
                    Difficulty.EASY -> 7f
                    Difficulty.NORMAL -> 9f
                    Difficulty.HARD -> 12f
                },
                dangerSenseRadius = when (difficulty) {
                    Difficulty.EASY -> 8f
                    Difficulty.NORMAL -> 11f
                    Difficulty.HARD -> 14f
                },
                huntInterestRadius = 6f,
                thinkIntervalSec = thinkInterval
            )
            Personality.PREDATOR -> PersonalityConfig(
                maxLoopDistance = when (difficulty) {
                    Difficulty.EASY -> 12f
                    Difficulty.NORMAL -> 16f
                    Difficulty.HARD -> 20f
                },
                dangerSenseRadius = when (difficulty) {
                    Difficulty.EASY -> 6f
                    Difficulty.NORMAL -> 8f
                    Difficulty.HARD -> 10f
                },
                huntInterestRadius = when (difficulty) {
                    Difficulty.EASY -> 14f
                    Difficulty.NORMAL -> 20f
                    Difficulty.HARD -> 26f
                },
                thinkIntervalSec = thinkInterval
            )
        }
    }
}

