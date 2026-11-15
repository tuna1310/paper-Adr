package com.paperclone.game.core.audio

import android.content.Context
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.media.SoundPool
import java.io.File
import java.io.FileOutputStream
import java.nio.ByteBuffer
import java.nio.ByteOrder
import kotlin.math.PI
import kotlin.math.sin

/**
 * Procedural Audio Synthesizer & SoundPool/MediaPlayer Audio Engine.
 * Generates 100% original, copyright-free candy arcade sound effects and background music
 * dynamically using 16-bit PCM mathematical synthesis.
 *
 * All audio is procedural and synthesized on-device, requiring 0 external audio assets.
 */
class SoundManager private constructor(private val context: Context) {

    private var soundPool: SoundPool? = null
    private var soundCaptureId: Int = 0
    private var soundKillId: Int = 0
    private var soundDeathId: Int = 0
    private var soundBoostId: Int = 0
    private var soundClickId: Int = 0
    private var soundRewardId: Int = 0
    private var soundUnlockId: Int = 0

    private var bgmPlayer: MediaPlayer? = null
    private var isBgmPrepared: Boolean = false

    var isSoundEnabled: Boolean = true
    var isMusicEnabled: Boolean = true
        set(value) {
            field = value
            if (value) {
                resumeBgm()
            } else {
                pauseBgm()
            }
        }

    init {
        val audioAttributes = AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_GAME)
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .build()

        soundPool = SoundPool.Builder()
            .setMaxStreams(8)
            .setAudioAttributes(audioAttributes)
            .build()

        synthesizeAndLoadSounds()
        initializeBgm()
    }

    companion object {
        @Volatile
        private var instance: SoundManager? = null

        fun getInstance(context: Context): SoundManager {
            return instance ?: synchronized(this) {
                instance ?: SoundManager(context.applicationContext).also { instance = it }
            }
        }
    }

    private fun synthesizeAndLoadSounds() {
        val cacheDir = context.cacheDir

        try {
            // 1. Capture Sound (Ascending bright candy arpeggio C5 -> E5 -> G5)
            val captureWav = File(cacheDir, "synth_capture.wav")
            generateWavFile(captureWav, synthesizeCapturePcm())
            soundCaptureId = soundPool?.load(captureWav.absolutePath, 1) ?: 0

            // 2. Kill Sound (Punchy comic impact pop with fast pitch drop)
            val killWav = File(cacheDir, "synth_kill.wav")
            generateWavFile(killWav, synthesizeKillPcm())
            soundKillId = soundPool?.load(killWav.absolutePath, 1) ?: 0

            // 3. Death Sound (Descending wobble comic tone)
            val deathWav = File(cacheDir, "synth_death.wav")
            generateWavFile(deathWav, synthesizeDeathPcm())
            soundDeathId = soundPool?.load(deathWav.absolutePath, 1) ?: 0

            // 4. Boost Sound (Sparkly upward speed whoosh chime)
            val boostWav = File(cacheDir, "synth_boost.wav")
            generateWavFile(boostWav, synthesizeBoostPcm())
            soundBoostId = soundPool?.load(boostWav.absolutePath, 1) ?: 0

            // 5. Click Sound (Crisp UI bubble click)
            val clickWav = File(cacheDir, "synth_click.wav")
            generateWavFile(clickWav, synthesizeClickPcm())
            soundClickId = soundPool?.load(clickWav.absolutePath, 1) ?: 0

            // 6. Daily Reward Claim (Sparkly celebratory rising arpeggio C5 -> E5 -> G5 -> C6)
            val rewardWav = File(cacheDir, "synth_reward.wav")
            generateWavFile(rewardWav, synthesizeRewardPcm())
            soundRewardId = soundPool?.load(rewardWav.absolutePath, 1) ?: 0

            // 7. Skin Unlock Fanfare (Triumphant victory chord G4 -> C5 -> E5 -> G5)
            val unlockWav = File(cacheDir, "synth_unlock.wav")
            generateWavFile(unlockWav, synthesizeUnlockPcm())
            soundUnlockId = soundPool?.load(unlockWav.absolutePath, 1) ?: 0
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun initializeBgm() {
        try {
            val bgmWav = File(context.cacheDir, "synth_bgm_candy.wav")
            if (!bgmWav.exists() || bgmWav.length() < 1000) {
                generateWavFile(bgmWav, synthesizeBgmPcm())
            }

            bgmPlayer = MediaPlayer().apply {
                setDataSource(bgmWav.absolutePath)
                isLooping = true
                setVolume(0.25f, 0.25f)
                setOnPreparedListener {
                    isBgmPrepared = true
                    if (isMusicEnabled) {
                        try {
                            it.start()
                        } catch (e: Exception) {
                            // Ignored
                        }
                    }
                }
                prepareAsync()
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    fun startBgm() {
        if (!isMusicEnabled || !isBgmPrepared) return
        try {
            if (bgmPlayer?.isPlaying == false) {
                bgmPlayer?.start()
            }
        } catch (e: Exception) {
            // Ignored
        }
    }

    fun pauseBgm() {
        try {
            if (bgmPlayer?.isPlaying == true) {
                bgmPlayer?.pause()
            }
        } catch (e: Exception) {
            // Ignored
        }
    }

    fun resumeBgm() {
        if (!isMusicEnabled || !isBgmPrepared) return
        try {
            if (bgmPlayer?.isPlaying == false) {
                bgmPlayer?.start()
            }
        } catch (e: Exception) {
            // Ignored
        }
    }

    fun playCapture(pitchFactor: Float = 1.0f) {
        if (!isSoundEnabled || soundCaptureId == 0) return
        val clampedPitch = pitchFactor.coerceIn(0.8f, 1.5f)
        soundPool?.play(soundCaptureId, 0.85f, 0.85f, 1, 0, clampedPitch)
    }

    fun playKill() {
        if (!isSoundEnabled || soundKillId == 0) return
        soundPool?.play(soundKillId, 1.0f, 1.0f, 2, 0, 1.0f)
    }

    fun playDeath() {
        if (!isSoundEnabled || soundDeathId == 0) return
        soundPool?.play(soundDeathId, 1.0f, 1.0f, 3, 0, 1.0f)
    }

    fun playBoost() {
        if (!isSoundEnabled || soundBoostId == 0) return
        soundPool?.play(soundBoostId, 0.9f, 0.9f, 1, 0, 1.0f)
    }

    fun playClick() {
        if (!isSoundEnabled || soundClickId == 0) return
        soundPool?.play(soundClickId, 0.6f, 0.6f, 0, 0, 1.0f)
    }

    fun playClaimReward() {
        if (!isSoundEnabled || soundRewardId == 0) return
        soundPool?.play(soundRewardId, 0.95f, 0.95f, 2, 0, 1.0f)
    }

    fun playUnlockSkin() {
        if (!isSoundEnabled || soundUnlockId == 0) return
        soundPool?.play(soundUnlockId, 1.0f, 1.0f, 3, 0, 1.0f)
    }

    fun release() {
        try {
            soundPool?.release()
            soundPool = null

            bgmPlayer?.stop()
            bgmPlayer?.release()
            bgmPlayer = null
            isBgmPrepared = false
        } catch (e: Exception) {
            // Ignored
        }
    }

    // =========================================================================
    // Pure Mathematical PCM Sound Generators (44,100 Hz, 16-Bit Mono)
    // =========================================================================

    private val sampleRate = 44100

    private fun synthesizeCapturePcm(): ShortArray {
        val duration = 0.22f
        val numSamples = (sampleRate * duration).toInt()
        val samples = ShortArray(numSamples)

        val f1 = 523.25 // C5
        val f2 = 659.25 // E5
        val f3 = 783.99 // G5

        for (i in 0 until numSamples) {
            val t = i.toDouble() / sampleRate
            val freq = if (t < 0.07) f1 else if (t < 0.14) f2 else f3
            val envelope = (1.0 - (t / duration)).coerceIn(0.0, 1.0)
            val wave = sin(2.0 * PI * freq * t) * 0.75 + sin(4.0 * PI * freq * t) * 0.25
            val sample = (wave * envelope * Short.MAX_VALUE * 0.7).toInt()
            samples[i] = sample.coerceIn(Short.MIN_VALUE.toInt(), Short.MAX_VALUE.toInt()).toShort()
        }
        return samples
    }

    private fun synthesizeKillPcm(): ShortArray {
        val duration = 0.18f
        val numSamples = (sampleRate * duration).toInt()
        val samples = ShortArray(numSamples)

        for (i in 0 until numSamples) {
            val t = i.toDouble() / duration
            // Pitch rapidly sweeps from 550 Hz down to 110 Hz
            val freq = 550.0 - (440.0 * t * t)
            val envelope = (1.0 - t) * (1.0 - t)
            val noise = if (i < (sampleRate * 0.02)) (Math.random() * 2.0 - 1.0) * 0.35 else 0.0
            val wave = sin(2.0 * PI * freq * (i.toDouble() / sampleRate)) * 0.8 + noise
            val sample = (wave * envelope * Short.MAX_VALUE * 0.85).toInt()
            samples[i] = sample.coerceIn(Short.MIN_VALUE.toInt(), Short.MAX_VALUE.toInt()).toShort()
        }
        return samples
    }

    private fun synthesizeDeathPcm(): ShortArray {
        val duration = 0.35f
        val numSamples = (sampleRate * duration).toInt()
        val samples = ShortArray(numSamples)

        for (i in 0 until numSamples) {
            val t = i.toDouble() / duration
            // Pitch falls with 10 Hz vibrato
            val baseFreq = 400.0 - (260.0 * t)
            val vibrato = sin(2.0 * PI * 10.0 * (i.toDouble() / sampleRate)) * 25.0
            val freq = (baseFreq + vibrato).coerceAtLeast(60.0)
            val envelope = (1.0 - t).coerceIn(0.0, 1.0)
            val wave = sin(2.0 * PI * freq * (i.toDouble() / sampleRate))
            val sample = (wave * envelope * Short.MAX_VALUE * 0.75).toInt()
            samples[i] = sample.coerceIn(Short.MIN_VALUE.toInt(), Short.MAX_VALUE.toInt()).toShort()
        }
        return samples
    }

    private fun synthesizeBoostPcm(): ShortArray {
        val duration = 0.24f
        val numSamples = (sampleRate * duration).toInt()
        val samples = ShortArray(numSamples)

        for (i in 0 until numSamples) {
            val t = i.toDouble() / duration
            // Upward frequency sweep from 350 Hz to 1300 Hz
            val freq = 350.0 + (950.0 * t * t)
            val envelope = (1.0 - (t * t)).coerceIn(0.0, 1.0)
            val wave = sin(2.0 * PI * freq * (i.toDouble() / sampleRate)) * 0.65 +
                    sin(4.0 * PI * freq * (i.toDouble() / sampleRate)) * 0.35
            val sample = (wave * envelope * Short.MAX_VALUE * 0.7).toInt()
            samples[i] = sample.coerceIn(Short.MIN_VALUE.toInt(), Short.MAX_VALUE.toInt()).toShort()
        }
        return samples
    }

    private fun synthesizeClickPcm(): ShortArray {
        val duration = 0.04f
        val numSamples = (sampleRate * duration).toInt()
        val samples = ShortArray(numSamples)

        for (i in 0 until numSamples) {
            val t = i.toDouble() / duration
            val freq = 880.0
            val envelope = (1.0 - t) * (1.0 - t)
            val wave = sin(2.0 * PI * freq * (i.toDouble() / sampleRate))
            val sample = (wave * envelope * Short.MAX_VALUE * 0.55).toInt()
            samples[i] = sample.coerceIn(Short.MIN_VALUE.toInt(), Short.MAX_VALUE.toInt()).toShort()
        }
        return samples
    }

    private fun synthesizeRewardPcm(): ShortArray {
        val duration = 0.36f
        val numSamples = (sampleRate * duration).toInt()
        val samples = ShortArray(numSamples)

        val notes = doubleArrayOf(523.25, 659.25, 783.99, 1046.50) // C5, E5, G5, C6
        val step = duration / notes.size

        for (i in 0 until numSamples) {
            val t = i.toDouble() / sampleRate
            val noteIdx = (t / step).toInt().coerceIn(0, notes.size - 1)
            val freq = notes[noteIdx]
            val noteT = t - (noteIdx * step)
            val envelope = (1.0 - (noteT / step)).coerceIn(0.0, 1.0)
            val wave = sin(2.0 * PI * freq * t) * 0.7 + sin(4.0 * PI * freq * t) * 0.3
            val sample = (wave * envelope * Short.MAX_VALUE * 0.75).toInt()
            samples[i] = sample.coerceIn(Short.MIN_VALUE.toInt(), Short.MAX_VALUE.toInt()).toShort()
        }
        return samples
    }

    private fun synthesizeUnlockPcm(): ShortArray {
        val duration = 0.45f
        val numSamples = (sampleRate * duration).toInt()
        val samples = ShortArray(numSamples)

        // Triumphant Fanfare with warm chime chord
        val chord1 = doubleArrayOf(392.00, 523.25) // G4, C5
        val chord2 = doubleArrayOf(523.25, 659.25) // C5, E5
        val chord3 = doubleArrayOf(659.25, 783.99, 1046.50) // E5, G5, C6

        for (i in 0 until numSamples) {
            val t = i.toDouble() / sampleRate
            val chord = when {
                t < 0.12 -> chord1
                t < 0.24 -> chord2
                else -> chord3
            }
            var waveSum = 0.0
            for (freq in chord) {
                waveSum += sin(2.0 * PI * freq * t) / chord.size
            }
            val envelope = (1.0 - (t / duration)).coerceIn(0.0, 1.0)
            val sample = (waveSum * envelope * Short.MAX_VALUE * 0.8).toInt()
            samples[i] = sample.coerceIn(Short.MIN_VALUE.toInt(), Short.MAX_VALUE.toInt()).toShort()
        }
        return samples
    }

    /**
     * Synthesizes an 8-second upbeat, cheerful, soft candy arcade background music loop.
     * Uses classic I - vi - IV - V progression (C -> Am -> F -> G) with marimba-like notes.
     */
    private fun synthesizeBgmPcm(): ShortArray {
        val duration = 8.0f // 8 seconds, seamless loop
        val numSamples = (sampleRate * duration).toInt()
        val samples = ShortArray(numSamples)

        // 16 beats at 120 BPM = 0.5 sec per beat
        val beatSec = 0.5
        // Notes for 4 bars (each 4 beats)
        val melody = doubleArrayOf(
            523.25, 659.25, 783.99, 659.25, // Bar 1 (C Major): C5, E5, G5, E5
            440.00, 523.25, 659.25, 523.25, // Bar 2 (A Minor): A4, C5, E5, C5
            349.23, 440.00, 523.25, 659.25, // Bar 3 (F Major): F4, A4, C5, E5
            392.00, 493.88, 587.33, 783.99  // Bar 4 (G Major): G4, B4, D5, G5
        )
        val bassNotes = doubleArrayOf(
            130.81, 130.81, 130.81, 130.81, // C3
            110.00, 110.00, 110.00, 110.00, // A2
            87.31, 87.31, 87.31, 87.31,     // F2
            98.00, 98.00, 98.00, 98.00      // G2
        )

        for (i in 0 until numSamples) {
            val t = i.toDouble() / sampleRate
            val beatIdx = (t / beatSec).toInt().coerceIn(0, 15)
            val beatT = t - (beatIdx * beatSec)

            // Melody voice (Marimba/sine tone with soft decay)
            val freqMelody = melody[beatIdx]
            val envMelody = (1.0 - (beatT / beatSec)).coerceIn(0.0, 1.0)
            val waveMelody = sin(2.0 * PI * freqMelody * t) * 0.75 +
                    sin(4.0 * PI * freqMelody * t) * 0.25

            // Bass voice (Soft triangle-ish sub bass)
            val freqBass = bassNotes[beatIdx]
            val envBass = if (beatT < 0.35) (1.0 - (beatT / 0.35)) else 0.0
            val waveBass = sin(2.0 * PI * freqBass * t)

            // Mix
            val mixed = (waveMelody * envMelody * 0.40) + (waveBass * envBass * 0.35)

            // Loop boundary crossfade (15ms fade at start and end to avoid audio click)
            val fadeTime = 0.02
            val fade = when {
                t < fadeTime -> (t / fadeTime)
                t > duration - fadeTime -> ((duration - t) / fadeTime)
                else -> 1.0
            }.coerceIn(0.0, 1.0)

            val sample = (mixed * fade * Short.MAX_VALUE * 0.75).toInt()
            samples[i] = sample.coerceIn(Short.MIN_VALUE.toInt(), Short.MAX_VALUE.toInt()).toShort()
        }
        return samples
    }

    private fun generateWavFile(file: File, pcmData: ShortArray) {
        val byteData = ByteArray(pcmData.size * 2)
        ByteBuffer.wrap(byteData).order(ByteOrder.LITTLE_ENDIAN).asShortBuffer().put(pcmData)

        val totalDataLen = byteData.size + 36
        val sampleRateLong = sampleRate.toLong()
        val byteRate = sampleRateLong * 1 * 2 // 1 channel, 16 bits = 2 bytes

        FileOutputStream(file).use { out ->
            // RIFF header
            out.write("RIFF".toByteArray())
            out.write(intToByteArray(totalDataLen))
            out.write("WAVE".toByteArray())

            // 'fmt ' chunk
            out.write("fmt ".toByteArray())
            out.write(intToByteArray(16)) // Subchunk1Size (16 for PCM)
            out.write(shortToByteArray(1)) // AudioFormat 1 = PCM
            out.write(shortToByteArray(1)) // NumChannels (1 = Mono)
            out.write(intToByteArray(sampleRate))
            out.write(intToByteArray(byteRate.toInt()))
            out.write(shortToByteArray(2)) // BlockAlign (channels * bitsPerSample / 8)
            out.write(shortToByteArray(16)) // BitsPerSample

            // 'data' chunk
            out.write("data".toByteArray())
            out.write(intToByteArray(byteData.size))
            out.write(byteData)
        }
    }

    private fun intToByteArray(value: Int): ByteArray {
        return ByteBuffer.allocate(4).order(ByteOrder.LITTLE_ENDIAN).putInt(value).array()
    }

    private fun shortToByteArray(value: Short): ByteArray {
        return ByteBuffer.allocate(2).order(ByteOrder.LITTLE_ENDIAN).putShort(value).array()
    }
}
