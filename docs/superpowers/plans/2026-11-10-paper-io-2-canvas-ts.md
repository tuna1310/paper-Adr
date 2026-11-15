# Paper.io 2 (Canvas 2D + TypeScript) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a high-performance, mobile-optimized Paper.io 2 web clone using pure HTML5 Canvas 2D, TypeScript, and Vite, featuring smooth paper-blob territories, translucent ribbon trails, 9 autonomous bots, 60 FPS fixed-timestep engine, and visuals matching the reference gameplay video.

**Architecture:** The project strictly decouples pure game logic (`src/engine/` and `src/ai/`) from rendering (`src/render/`) and UI/Input (`src/ui/`, `src/input/`). The simulation runs at a deterministic 60Hz fixed timestep using a 1D `Uint8Array` grid in a circular arena. The Canvas 2D renderer utilizes marching-blob smoothing, layered paper-cut drop shadows, cached offscreen pattern shaders, and high-performance particle systems.

**Tech Stack:** TypeScript, Vite, HTML5 Canvas 2D, Vitest, Web Audio API.

**Spec Reference:** User specifications matching `media_1794274258504_280689db.mp4` and `media_1794274256360_6272f41f.jpg`.

---

## Global Constraints & Updated Rules

- **Platform:** Mobile-first web (optimized for mobile portrait viewports, e.g. iPhone 390x844, while responsive and playable on desktop mouse).
- **Zero external game engines:** Pure Canvas 2D only (no Phaser, PixiJS, or Three.js).
- **Engine purity:** `src/engine/` must have ZERO DOM dependencies (`window`, `document`, `HTMLCanvasElement` prohibited in engine) to ensure 100% headless testability in Vitest.
- **Performance:** Must run rock-solid at 60 FPS on mobile browsers.
- **Timestep:** Fixed 60Hz physics/logic update (`dt = 1/60`) independent of display refresh rate.
- **Map Model:** Circular arena inscribed in a 240x240 grid (`Uint8Array`) with continuous `(x, y)` float character positions.
- **Head-to-head Collision Rule:** When two heads collide, the player with the larger territory survives; if equal, both die.
- **Zero-Territory Rule:** Any player/bot whose territory count drops to 0 is immediately eliminated.
- **Loop Capture Rule:** Closing a loop claims all enclosed cells inside, including any rival territory caught in the loop.
- **Territory Blob Caching:** TerritoryRenderer MUST cache blob paths per owner and only regenerate on dirty flag when territory changes, never every frame.
- **Phase Gate:** Stop after Task 7 with simple debug rendering to allow playtesting the core rules before implementing Tasks 8-10. Power-ups and banners delayed until core runs solidly.

---

## File Structure & Module Responsibilities

```
paper.io adr/
├── index.html                      # Mobile-first viewport container & canvas mount
├── package.json                    # Vite, TypeScript, Vitest scripts & dependencies
├── tsconfig.json                   # Strict TypeScript compiler options
├── vite.config.ts                  # Vite bundler configuration
├── src/
│   ├── config.ts                   # Game tuning constants (speeds, arena radius, colors, dimensions)
│   ├── main.ts                     # Application bootstrap, screen orchestrator, and RAF game loop
│   ├── engine/
│   │   ├── types.ts                # Shared engine types (Point, PlayerState, SkinId, BotArchetype)
│   │   ├── GridMap.ts              # 1D Uint8Array circular arena grid, cell lookups, stats
│   │   ├── Player.ts               # Character state, continuous movement, steering interpolation
│   │   ├── Trail.ts                # Polyline trail recording, point decimation, path segments
│   │   ├── FloodFill.ts            # Bounded exterior flood fill for loop closure territory claims
│   │   ├── CollisionDetector.ts    # Head-to-trail segment distance, head-to-head, boundary checks
│   │   └── GameEngine.ts           # Central logic coordinator (ticks players, bots, collisions, scoring)
│   ├── ai/
│   │   └── BotController.ts        # 9 autonomous bots with 3 archetypes (Greedy, Cautious, Hunter)
│   ├── render/
│   │   ├── Camera.ts               # Smooth lerp camera tracking player with mobile viewport scaling
│   │   ├── PatternManager.ts       # Offscreen pattern canvases (Watermelon, Donut, Star, Cheese, Circuit)
│   │   ├── TerritoryRenderer.ts    # Marching blob smoothing, paper cut drop shadows, pattern fill
│   │   ├── TrailRenderer.ts        # Translucent ribbon trail with rounded joins & borders
│   │   ├── CharacterRenderer.ts    # Cute vector characters with rotational tilt, eyes, and skin details
│   │   ├── ParticleSystem.ts       # Capture ripple wave, sparkles, and death confetti explosion
│   │   └── BannerRenderer.ts       # Floating animated banners ("FIRST BLOOD!", "DOUBLE KILL!")
│   ├── input/
│   │   └── InputManager.ts         # Unified pointer/touch dragging with angle calculation
│   ├── audio/
│   │   └── SoundEffects.ts         # Synthesized Web Audio SFX (capture, kill, death, boost)
│   └── ui/
│       └── UIManager.ts            # Start Menu, Top % Capsule HUD, Game Over overlay
└── tests/
    ├── engine/
    │   ├── GridMap.test.ts
    │   ├── Player.test.ts
    │   ├── FloodFill.test.ts
    │   └── Collision.test.ts
    └── ai/
        └── BotController.test.ts
```

---

## Task Breakdown

### Task 1: Project Scaffolding & Setup

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/config.ts`
- Create: `src/engine/types.ts`

**Interfaces:**
- Produces: `GameConfig` containing arena dimensions, colors, cell sizes, physics rates.
- Produces: `Point`, `PlayerId`, `SkinConfig`, `BotArchetype` type contracts.

- [ ] **Step 1: Create package.json and configuration files**

```json
{
  "name": "paper-io-2-canvas",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "devDependencies": {
    "typescript": "^5.5.4",
    "vite": "^5.4.2",
    "vitest": "^2.0.5"
  }
}
```

- [ ] **Step 2: Run npm install to verify clean installation**

Run: `npm install`
Expected: Dependencies installed without errors.

- [ ] **Step 3: Create index.html, tsconfig.json, vite.config.ts, config.ts, and types.ts**

Setup mobile portrait viewport meta (`viewport-fit=cover, user-scalable=no`), full screen canvas CSS, and core type definitions.

- [ ] **Step 4: Verify Vite build succeeds**

Run: `npm run build`
Expected: PASS with output in `dist/`.

---

### Task 2: Core GridMap & Circular Arena (`src/engine/GridMap.ts`)

**Files:**
- Create: `src/engine/GridMap.ts`
- Test: `tests/engine/GridMap.test.ts`

**Interfaces:**
- Consumes: `GameConfig` from `src/config.ts`.
- Produces: `GridMap` class with `get(x, y)`, `set(x, y, ownerId)`, `isInsideArena(x, y)`, `worldToGrid(wx, wy)`, `gridToWorld(gx, gy)`, `initTerritory(playerId, cx, cy, radius)`, `countCells(ownerId)`.

- [ ] **Step 1: Write failing unit tests for GridMap**

Test that cells inside circular radius $R$ are initialized, coordinate transforms are exact, initial circular territory stamps correct owner IDs, and cell percentage counts work.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/engine/GridMap.test.ts`
Expected: FAIL (cannot find module `GridMap`).

- [ ] **Step 3: Implement GridMap using 1D Uint8Array**

Implement circular arena masking where indices outside arena radius return `BOUNDARY_CELL (255)`. Use fast bit shifts/multiplications: `index = y * width + x`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test tests/engine/GridMap.test.ts`
Expected: All tests PASS.

---

### Task 3: Character Kinematics & Trail Polyline (`src/engine/Player.ts`, `src/engine/Trail.ts`)

**Files:**
- Create: `src/engine/Trail.ts`
- Create: `src/engine/Player.ts`
- Test: `tests/engine/Player.test.ts`

**Interfaces:**
- Consumes: `GridMap` from `src/engine/GridMap.ts`.
- Produces: `Player` class managing position `(x, y)`, angle, target angle, angular clamp $\omega_{\max}$, alive state, speed boost timers, and `Trail` recording.

- [ ] **Step 1: Write failing tests for Player kinematics and Trail logic**

Test:
1. When player is inside own territory, `trail.points.length === 0`.
2. When player leaves territory, trail appends consecutive points with minimum spatial threshold.
3. Steering angle clamps turn rate smoothly towards target angle (no instant 180° flips).

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/engine/Player.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement Player and Trail**

Implement smooth angle interpolation using shortest angular difference:
$$\Delta\theta = \text{atan2}(\sin(\theta_{\text{target}} - \theta), \cos(\theta_{\text{target}} - \theta))$$
Clamp $\Delta\theta$ by $\omega_{\max} \cdot \Delta t$.
Implement `Trail.addPoint(x, y)` with decimation threshold (min distance 5 units).

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test tests/engine/Player.test.ts`
Expected: PASS.

---

### Task 4: Enclosure & Bounded Flood Fill Algorithm (`src/engine/FloodFill.ts`)

**Files:**
- Create: `src/engine/FloodFill.ts`
- Test: `tests/engine/FloodFill.test.ts`

**Interfaces:**
- Consumes: `GridMap`, `Trail`.
- Produces: `closeLoopAndCapture(grid: GridMap, player: Player): CaptureResult` containing `capturedCellCount` and bounding box for ripple animation.

- [ ] **Step 1: Write failing tests for loop closure territory capture**

Test:
1. Drawing a rectangular loop starting and ending on own territory captures all enclosed neutral cells.
2. Drawing a loop over enemy cells successfully claims enemy territory.
3. Exterior flood fill does not leak across arena borders.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/engine/FloodFill.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement rasterization & bounded exterior flood fill**

1. Rasterize trail polyline segments to grid cells via Bresenham algorithm, temporarily stamping player ID.
2. Determine bounding box of `player.trail + ownTerritoryNearby` expanded by 2 cells.
3. Queue-based BFS flood fill from the bounding box perimeter (marking cells as "exterior").
4. Any non-exterior cell inside the bounding box is assigned to the player.
5. Clear trail and return captured bounding box.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test tests/engine/FloodFill.test.ts`
Expected: PASS.

---

### Task 5: Trail & Boundary Collision Detection (`src/engine/CollisionDetector.ts`)

**Files:**
- Create: `src/engine/CollisionDetector.ts`
- Test: `tests/engine/Collision.test.ts`

**Interfaces:**
- Consumes: `Player`, `GridMap`, `Trail`.
- Produces: `checkCollisions(players: Player[], grid: GridMap): CollisionEvent[]` (kills, self-collisions, boundary deaths).

- [ ] **Step 1: Write failing tests for point-to-segment trail collision**

Test:
1. Head intersecting opponent's trail triggers kill event for opponent.
2. Head intersecting own trail (outside safe head grace distance) triggers self-elimination.
3. Head exceeding arena circular radius triggers boundary death.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/engine/Collision.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement CollisionDetector**

Implement fast segment AABB pruning, followed by exact minimum distance from point $(P_x, P_y)$ to segment $(A, B)$:
$$t = \text{clamp}\left(\frac{(P - A) \cdot (B - A)}{\|B - A\|^2}, 0, 1\right), \quad \text{dist} = \|P - (A + t(B - A))\|$$
If $\text{dist} < \text{headRadius} + \text{trailRadius}$, trigger collision.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test tests/engine/Collision.test.ts`
Expected: PASS.

---

### Task 6: Autonomous Bot AI (`src/ai/BotController.ts`)

**Files:**
- Create: `src/ai/BotController.ts`
- Test: `tests/ai/BotController.test.ts`

**Interfaces:**
- Consumes: `Player`, `GridMap`, `CollisionDetector`.
- Produces: `BotController` managing 9 bots with 3 archetypes:
  - **Greedy:** Long wavy exploratory sweeps to grab big territory chunks.
  - **Cautious:** Short circular loops returning frequently to safety.
  - **Hunter:** Seeks nearby vulnerable player trails to cut them.
- Produces: Whisker raycast avoidance for self-trail and arena boundaries.

- [ ] **Step 1: Write failing tests for Bot AI steering decisions**

Test:
1. Bot detects upcoming arena boundary raycast and steers away.
2. Bot detects own trail raycast and steers away (never head-ons own trail).
3. Bot in danger or at max loop distance steers back toward own nearest territory cell.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/ai/BotController.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement BotController**

Implement multi-ray clearance evaluation (5 forward whiskers: $-60^\circ, -30^\circ, 0^\circ, +30^\circ, +60^\circ$), state machine (Expand, Hunt, ReturnToBase), and respawn timer (2.5s delay after death).

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test tests/ai/BotController.test.ts`
Expected: PASS.

---

### Task 7: Game Engine Facade & 60Hz Timestep Loop (`src/engine/GameEngine.ts`)

**Files:**
- Create: `src/engine/GameEngine.ts`
- Test: `tests/engine/GameEngine.test.ts`

**Interfaces:**
- Consumes: `GridMap`, `Player`, `CollisionDetector`, `FloodFill`, `BotController`.
- Produces: `GameEngine` class orchestrating all simulation updates in a deterministic 60Hz loop. Provides state snapshot for renderer.

- [ ] **Step 1: Write failing tests for GameEngine orchestration**

Test:
1. Stepping engine updates player positions, performs bot AI ticks, and handles loop closures.
2. When human player is eliminated, state transitions to `GAME_OVER`.
3. Cell percentage leaderboard updates accurately.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/engine/GameEngine.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement GameEngine**

Wire players (1 human + 9 bots), tick loop, power-up gifts, capture event hooks, and score tracking.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test tests/engine/GameEngine.test.ts`
Expected: PASS.

---

### Task 8: Canvas 2D Territory Renderer with Smooth Blobs & Paper Cut Shadows (`src/render/TerritoryRenderer.ts`, `src/render/PatternManager.ts`)

**Files:**
- Create: `src/render/PatternManager.ts`
- Create: `src/render/TerritoryRenderer.ts`

**Interfaces:**
- Consumes: `GridMap`, `GameConfig`.
- Produces: `PatternManager` creating seamless canvas patterns for 6 skins (Watermelon, Donut Sprinkles, Stars, Cheese Moon, Cucumber Slice, Neon Circuit).
- Produces: `TerritoryRenderer` rendering blob-smoothed contours with paper-cut drop shadows (`shadowBlur: 8`, `shadowOffsetY: 4`, `shadowColor: rgba(0,0,0,0.18)`).

- [ ] **Step 1: Implement PatternManager**

Generate procedural tile patterns on cached offscreen canvases:
- Watermelon: Red base, dark brown seeds, green rim.
- Donut: Light pink frosting, multi-colored pill sprinkles.
- Star/Space: Deep navy blue with golden sparkle dots.
- Cheese: Cheddar yellow with crater circles.
- Bamboo/Cucumber: Bright green with slice core rings.
- Circuit: Electric purple with glowing circuit traces.

- [ ] **Step 2: Implement TerritoryRenderer**

Extract territory contours with marching squares or contour smoothing. Render layered paper effect: base drop shadow -> pattern fill -> soft highlight border.

---

### Task 9: Trail Ribbon, Character Vector & Camera (`src/render/TrailRenderer.ts`, `src/render/CharacterRenderer.ts`, `src/render/Camera.ts`)

**Files:**
- Create: `src/render/Camera.ts`
- Create: `src/render/TrailRenderer.ts`
- Create: `src/render/CharacterRenderer.ts`

**Interfaces:**
- Consumes: `Player`, `Camera`.
- Produces: Smooth camera follow with lerp.
- Produces: Translucent ribbon trail (`lineJoin: round`, `lineCap: round`, darker borders, soft glow).
- Produces: Procedural cute 2D vector characters with rotation, cute blinking eyes, and custom skins (Watermelon slice, Donut, Cute Cat, Crown King, Bird, Gift Box).

- [ ] **Step 1: Implement Camera**

Viewport transformation mapping world coordinates to screen canvas, following player with damping (`lerp(cam, target, 0.1)`), scaling to fit mobile portrait width (aspect ratio ~9:19.5).

- [ ] **Step 2: Implement TrailRenderer**

Render semi-transparent ribbon (`alpha: 0.65`) with darker border strokes (`lineWidth: 18`, border `lineWidth: 2`).

- [ ] **Step 3: Implement CharacterRenderer**

Draw expressive 2D characters oriented along their movement vector $\theta$, with bobbing animation and paper drop shadow under feet.

---

### Task 10: Particles, Floating Banners & Power-up Gifts (`src/render/ParticleSystem.ts`, `src/render/BannerRenderer.ts`, `src/engine/PowerUpManager.ts`)

**Files:**
- Create: `src/engine/PowerUpManager.ts`
- Create: `src/render/ParticleSystem.ts`
- Create: `src/render/BannerRenderer.ts`

**Interfaces:**
- Consumes: Capture events, kill events, character positions.
- Produces:
  - Capture ripple shockwave expanding across claimed polygon with sparkles.
  - Confetti particle explosion upon character death (40 colored paper flakes).
  - Floating animated banners ("FIRST BLOOD!", "DOUBLE KILL!") in yellow with purple border and light flare beam (matching frame_004).
  - Speed gift box spawn/collection (1.4x speed for 4 seconds).

- [ ] **Step 1: Implement PowerUpManager**

Randomly spawn up to 3 gift boxes in empty arena locations; handle pickup detection and speed boost timer.

- [ ] **Step 2: Implement ParticleSystem**

Sparkle particles for territory capture; physics confetti with gravity, rotational spin, and alpha fade for player/bot deaths.

- [ ] **Step 3: Implement BannerRenderer**

Scale-in bounce animation with horizontal flare sweep for kill streaks.

---

### Task 11: UI Screens, Touch/Mouse Input & Audio Integration (`src/ui/UIManager.ts`, `src/input/InputManager.ts`, `src/audio/SoundEffects.ts`, `src/main.ts`)

**Files:**
- Create: `src/input/InputManager.ts`
- Create: `src/audio/SoundEffects.ts`
- Create: `src/ui/UIManager.ts`
- Modify: `src/main.ts`

**Interfaces:**
- Produces:
  - `InputManager`: Touch drag on mobile + mouse drag on desktop, computing relative steering angle.
  - `SoundEffects`: Synthesized Web Audio chimes for capture, pop for kill, thud for death, whoosh for speed boost.
  - `UIManager`:
    - Menu Screen: 3D "Paper.io 2" logo, character preview, "PLAY" button.
    - Top HUD: Purple capsule progress bar with % display and ranking.
    - Game Over Screen: Final %, rank, kills, "PLAY AGAIN" button.

- [ ] **Step 1: Implement InputManager**

Handle `pointerdown`, `pointermove`, `pointerup` with `touch-action: none`. Calculate target angle from pointer offset.

- [ ] **Step 2: Implement SoundEffects using Web Audio API**

Zero external audio assets required. Procedurally synthesize crisp retro/arcade sound effects using Web Audio oscillators and gain envelopes.

- [ ] **Step 3: Implement UIManager & wire Main Loop**

Assemble game states (`MENU`, `PLAYING`, `GAME_OVER`). Render top % capsule HUD matching the video reference (purple capsule, colored progress bar, bold % font).

---

### Task 12: End-to-End Verification & Browser Gameplay Capture

**Files:**
- Verify: Full game running on `http://localhost:5173`
- Tool: Browser testing with DevTools / curl / screenshot inspection

- [ ] **Step 1: Run all Vitest unit tests**

Run: `npm test`
Expected: 100% of test suites PASS.

- [ ] **Step 2: Build production bundle**

Run: `npm run build`
Expected: Zero TypeScript or Vite bundling errors.

- [ ] **Step 3: Launch preview server & capture gameplay screenshots**

Start Vite dev/preview server. Use browser automation / devtools to verify:
1. 60 FPS performance.
2. Smooth touch/drag steering.
3. Trail loop closure and territory capture ripple.
4. Kill banner animation ("FIRST BLOOD!").
5. Top HUD percentage capsule.
Capture screenshot and compare directly with reference video frames.

