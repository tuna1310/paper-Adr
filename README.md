# PaperClone - Native Android 2D IO Game

**PaperClone** is a high-performance, 100% native Android clone inspired by the visuals and mechanics of the popular .io title *Paper.io 2*. Built from scratch with a vibrant, high-saturation candy aesthetic, portrait orientation, and smooth 60 FPS gameplay.

---

## 🎮 Highlights & Technical Features

- **100% Kotlin & Jetpack Compose**: Modern declarative UI for all menus, dialogs, shop, and navigation flows.
- **Custom Hardware-Accelerated Canvas Engine**: 
  - Rendered on Android `SurfaceView` with a fixed 60 FPS timestep (`1/60s`).
  - Zero external game engines (no Unity, no Godot, no LibGDX).
  - **0-Allocation Draw Loop**: All paths, paints, rects, object pools, and string caches are pre-allocated to eliminate GC stutters.
- **Visual Fidelity & 3D Layering**:
  - 3D paper territory with soft ambient drop shadows, bevel thickness, and rounded corners (`CornerPathEffect`).
  - 6 procedurally drawn texture shaders (`BitmapShader`) matching equipped skins (Polka dots, spots, flowers, swirl stripes, brain maze, checkerboard).
  - Glossy ribbon trails with rounded caps and glowing head particles.
  - 6 custom vector cartoon characters with dynamic turning tilt, drop shadow, and speed streak trails.
  - Particle effects: 40-piece confetti on kill/death, radial capture expansion ripples, star sparkles, and camera shake.
  - Dynamic "DOUBLE KILL!" & "TRIPLE KILL!" announcements with horizontal lens flares.
- **100% Procedural Copyright-Free Audio**:
  - In-house 16-bit 44.1 kHz PCM mathematical sound synthesizer producing original candy chiptune audio on-device.
  - Ambient looping background music (BGM) and responsive sound effects (capture, kill, death, speed boost, UI clicks, reward fanfares).
- **Tactile Haptic Feedback**: Multistage vibration for captures (light), kills (double pulse), and death (impact rumble).
- **Autonomous Multi-Tier Bot AI**:
  - 7 simultaneous bots with 3 personality archetypes (Greedy, Cautious, Predator) and 3 difficulty tiers (Easy, Normal, Hard).
  - Safe pathfinding with trail avoidance, territorial defense, player stalking, and automatic 2.5s respawns.
- **Jetpack DataStore Persistence**: Real-time asynchronous saving of coins, gems, trophies, equipped skins, unlocked skins, daily streaks, sound/music/haptic toggles, and match statistics.

---

## 📋 Technical Requirements

- **Android OS**: Android 8.0 (API Level 26) or higher. Target SDK: 35.
- **JDK**: Java Development Kit 17 or higher.
- **Gradle**: 8.13 (Gradle Wrapper included).

---

## 🚀 Building & Running

### 1. Run Unit Tests
```bash
./gradlew testDebugUnitTest
```
Runs the comprehensive test suite covering:
- 240x240 grid map initialization, coordinate conversion, and territory percentage calculations.
- Bounded BFS enclosure flood-fill algorithms.
- Segment-line collision detection (own-trail suicide, enemy trail hits, head-on collisions, territory invulnerability).
- AI avoidance routines, boundary turning, and respawn cycles.
- Match coin & trophy reward calculations (including clamping trophies $\ge 0$).
- Daily reward streak evaluation (missed day resets, day 7 wrap-around).
- Skin mission unlocks and DataStore preference synchronization.

### 2. Build Debug APK
```bash
./gradlew assembleDebug
```
The compiled APK will be generated at:
```
app/build/outputs/apk/debug/app-debug.apk
```

### 3. Install on Device or Emulator
```bash
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

---

## 🕹️ Controls & Game Rules

1. **Movement**:
   - The player moves continuously at a constant speed.
   - **Swipe/Drag** your finger across the screen to steer your character. Turns are clamped to a maximum of 90° to prevent instant 180° self-collisions.
2. **Expanding Territory**:
   - Exit your colored territory to draw a paper ribbon trail.
   - Enclose an area and reconnect to your territory to claim all enclosed cells.
3. **Eliminations**:
   - Cut through any opponent's active trail to eliminate them instantly.
   - You are invincible inside your own territory. If you collide with an enemy inside your territory, they are eliminated.
   - If an opponent hits your trail while you are outside, you are eliminated!
4. **Power-Ups**:
   - Speed boost gift boxes appear in safe areas on the map. Collecting one grants 1.5x speed for 4 seconds.
5. **Winning Conditions**:
   - **Victory**: Conquer **$\ge 60\%$** of the entire grid map.
   - **Grand Trophy Reward**: Conquer **$\ge 90\%$** of the map for special falling coins and ring celebration!

---

## 🏛️ Project Architecture

```
app/src/main/java/com/paperclone/game/
├── MainActivity.kt               # Entry point, lifecycle pause/resume
├── core/
│   ├── ai/
│   │   ├── BotController.kt      # AI steering, trail avoidance, state machine
│   │   └── BotPersonality.kt     # Personalities (Greedy, Cautious, Predator) & difficulty tiers
│   ├── audio/
│   │   └── SoundManager.kt       # Procedural 44.1kHz PCM synthesizer, BGM player, SoundPool
│   └── engine/
│       ├── Camera.kt             # Smooth lerp camera tracking 18 cells wide
│       ├── CharacterRenderer.kt  # 6 procedural cartoon vector characters with steering tilt
│       ├── CollisionDetector.kt  # Segment collision & invulnerability logic
│       ├── FloodFill.kt          # Bounded BFS territory enclosure algorithm
│       ├── GameConfig.kt         # Timestep, speed, particle, and debug FPS flags
│       ├── GameEngine.kt         # Master 60 FPS tick orchestrator, killstreaks, win checks
│       ├── GridMap.kt            # 240x240 short array map & territory counters
│       ├── HapticManager.kt      # Android VibrationEffect manager
│       ├── Player.kt             # Player physics, speed boost, steering clamp
│       ├── TerritoryPathBuilder.kt # 3D paper bevel & border Path builder with version cache
│       ├── TexturePatternManager.kt # 6 procedural BitmapShaders for skins
│       ├── Trail.kt              # Spatial trail points & line segment tests
│       └── VisualEffects.kt      # Object pool for confetti, ripples, sparkles, camera shake
├── data/
│   ├── GamePreferences.kt        # Jetpack DataStore asynchronous settings & stats
│   ├── GameRewardCalculator.kt   # Pure deterministic business logic for rewards & missions
│   └── SkinRepository.kt         # 20 unlockable skins with mission goals
├── ui/
│   ├── navigation/
│   │   ├── PaperCloneNavGraph.kt # Compose Navigation with BackHandler & Lifecycle observers
│   │   └── Screen.kt             # Route definitions
│   ├── screens/
│   │   ├── DailyRewardDialog.kt  # 7-day reward calendar popup
│   │   ├── GameSurfaceView.kt    # 60 FPS Native Canvas SurfaceView renderer & HUD
│   │   ├── HomeScreen.kt         # Candy 3D pedestal home screen & buttons
│   │   ├── LeaderboardScreen.kt  # Post-round Olympic podium & ranking board
│   │   ├── ProfileDialog.kt      # Player statistics dialog
│   │   ├── RewardScreen.kt       # 90%+ conquest celebration screen with coin rain
│   │   ├── SettingsDialog.kt     # Sound, Music, Vibration, Particles toggles
│   │   ├── SkinScreen.kt         # Skin grid with live progress bars & purchases
│   │   └── SplashScreen.kt       # 3D puffy letters logo "PaperClone"
│   ├── theme/
│   │   └── Theme.kt              # CandyPalette & Typography definitions
│   └── viewmodel/
│       └── GameViewModel.kt      # StateFlow MVVM coordinating DataStore and UI
```

---

## 🎨 Asset Integrity & Compliance

- **No Copyrighted Assets**: All icons, vector characters, 3D buttons, logos, textures, and sounds are generated purely via code (Canvas primitives and mathematical PCM audio synthesis).
- **100% English UI**: All menus, dialogs, buttons, instructions, and banners are rendered in clear, friendly English.

---

## 🔍 QA & Physical Device Test Checklist

| Category | Test Case | Expected Behavior |
| :--- | :--- | :--- |
| **Controls** | Steering by Drag | Character steers smoothly with maximum 90° turn clamp; no instant 180° suicide. |
| **Enclosure** | Territory Capture | Loop closes upon reaching territory, fills enclosed cells, triggers ripple and ascending sound. |
| **Enclosure** | Border Enclosure | Enclosing against map boundaries captures area correctly without map overflow ("tràn map"). |
| **Combat** | Eliminating Enemies | Crossing opponent's trail eliminates them with confetti explosion and comic pop SFX. |
| **Combat** | Base Invulnerability | Player inside their territory cannot be killed by enemy heads or own trail. |
| **AI Bots** | Movement & Avoidance | 7 bots navigate autonomously, avoid self-trails, turn away from walls, and never freeze. |
| **AI Bots** | Respawn Cycle | Eliminated bots respawn after exactly 2.5 seconds at safe empty locations. |
| **Power-Ups** | Speed Boost Gift Box | Collecting box grants 1.5x speed boost for 4s with yellow streak trail and sound. |
| **Audio** | Music & SFX Toggles | Settings toggles for Sound and Music immediately control playback; in-game speaker syncs. |
| **Haptics** | Tactile Feedback | Distinct vibrations trigger for capture (light), kill (double pulse), and death (strong). |
| **Tutorial** | First-Time Guidance | "SWIPE TO STEER" hand overlay appears on first match and disappears permanently on swipe. |
| **Lifecycle** | App Backgrounding | Pressing Home/Switching apps pauses rendering and audio; resumes cleanly without crash. |
| **Lifecycle** | Back Button | Pressing Back during gameplay opens "Quit Match?" confirmation dialog. |
| **Economy** | Skin Unlocks & Saves | Coins and trophies earned post-match persist in DataStore; purchased skins equip immediately. |
| **Economy** | Daily Rewards | 7-day streak calendar claims correctly; same-day claims are blocked. |


