import { PlayerConfig, SkinConfig, SkinId } from './engine/types';

export const GAME_CONFIG = {
  // Arena & Grid
  GRID_WIDTH: 240,
  GRID_HEIGHT: 240,
  CELL_SIZE: 10,
  ARENA_RADIUS_CELLS: 110,
  ARENA_CENTER_CELL_X: 120,
  ARENA_CENTER_CELL_Y: 120,

  // World coordinates (CELL_SIZE * cells)
  get WORLD_WIDTH() { return this.GRID_WIDTH * this.CELL_SIZE; },
  get WORLD_HEIGHT() { return this.GRID_HEIGHT * this.CELL_SIZE; },
  get ARENA_CENTER_X() { return this.ARENA_CENTER_CELL_X * this.CELL_SIZE; },
  get ARENA_CENTER_Y() { return this.ARENA_CENTER_CELL_Y * this.CELL_SIZE; },
  get ARENA_RADIUS() { return this.ARENA_RADIUS_CELLS * this.CELL_SIZE; },

  // Physics & Kinematics
  FIXED_TIMESTEP: 1 / 60,
  PLAYER_SPEED: 220, // World units/s
  MAX_TURN_RATE: 6.2, // rad/s
  CHARACTER_RADIUS: 14,
  TRAIL_WIDTH: 18,
  TRAIL_POINT_MIN_DIST: 5.0,

  // Head-on Knockback (Rule 3)
  KNOCKBACK_DISTANCE: 15.0, // ~1.5 cells
  KNOCKBACK_DURATION: 0.2, // seconds

  // Rim Sliding & Boost (Rule 4)
  get RIM_SLIDE_MAX_RADIUS() { return this.ARENA_RADIUS - this.CHARACTER_RADIUS; },
  RIM_BOOST_CHARGE_TIME: 2.0, // 2s to fully charge
  RIM_BOOST_MULTIPLIER: 1.6, // x1.6 peak boost
  RIM_BOOST_DURATION: 1.5, // 1.5s decay

  // Yellow Damage Aura Orb (Rule 5)
  DAMAGE_AURA_RADIUS: 50.0, // 5 cells
  DAMAGE_AURA_DURATION: 5.0, // 5 seconds
  DAMAGE_AURA_SHRINK_TIME: 1.2, // Shrinks in the last 1.2s

  // Magnet Attraction (Rule 6)
  MAGNET_ATTRACT_RADIUS: 40.0, // 4 cells
  MAGNET_PULL_ACCEL: 380.0, // units/s^2

  // Speed Items
  BOOST_SPEED_MULTIPLIER: 1.45,
  BOOST_DURATION_SEC: 4.0,

  // Spawning
  STARTER_TERRITORY_RADIUS_CELLS: 5,
  RESPAWN_DELAY_SEC: 2.5,

  // Territory Claiming Rules (Upgrades)
  CARVE_RADIUS_CELLS: 1, // Radius in cells carved underfoot when traversing rival territory
  TERRITORY_TRANSFER_WAVE_DURATION: 0.5, // Duration in seconds for color wave when absorbing victim land
  KILL_NOTIFICATION_DURATION: 2.5, // Duration for "Bạn đã hạ <tên>" on-screen banner

  // Colors
  BG_COLOR: '#EBF7F0',
  ARENA_BORDER_COLOR: '#80CBC4',
  ARENA_OUTSIDE_COLOR: '#B0BEC5',
  NEUTRAL_CELL: 0,
  BOUNDARY_CELL: 255,
};

/** Rendering performance knobs (tuned for 4GB-RAM mid/low-end Android). */
export const PERF_CONFIG = {
  MAX_RENDER_DPR: 1.5, // Never render the game canvas above this pixel ratio
  LOW_QUALITY_RENDER_DPR: 1.0, // Pixel ratio after adaptive downgrade
  TERRITORY_LAYER_SCALE: 1.0, // Offscreen territory layer pixels per world unit
  LOW_QUALITY_LAYER_SCALE: 0.7,
  TERRITORY_REBUILD_INTERVAL_MS: 50, // Min time between territory path rebuilds
  DIRTY_RECT_MARGIN_CELLS: 3, // Extra cells redrawn around changed cells
  MAX_SIM_STEPS_PER_FRAME: 3, // Avoid the "spiral of death" on slow frames
  MAX_PARTICLES: 140,
  LOW_QUALITY_MAX_PARTICLES: 50,
  ADAPTIVE_SAMPLE_FRAMES: 90, // Frames averaged before deciding to downgrade
  ADAPTIVE_SLOW_FRAME_MS: 21, // Average frame time that triggers low quality
};

/** Floating 360-degree virtual joystick. */
export const JOYSTICK_CONFIG = {
  RADIUS: 58, // Base radius in CSS px
  KNOB_RADIUS: 26,
  DEADZONE: 8, // Finger travel (px) before steering starts
  IDLE_BOTTOM_OFFSET: 135, // Idle joystick center distance from screen bottom
  IDLE_ALPHA: 0.42,
  ACTIVE_ALPHA: 0.92,
};

/** Meta & Daily Chest probabilities (80% Gold, 10% Ruby, 10% Skin) and 24h cycle. */
export const META_CONFIG = {
  DAILY_MISSIONS_COUNT: 3,
  DAILY_RESET_HOURS: 24,
  DAILY_RESET_MS: 24 * 60 * 60 * 1000,
  CONTINENT_COUNTRIES_COUNT: 8,
  CHEST_GOLD_CHANCE: 0.80,
  CHEST_RUBY_CHANCE: 0.10,
  CHEST_SKIN_CHANCE: 0.10,
  CHEST_GOLD_MIN: 800,
  CHEST_GOLD_MAX: 1500,
  CHEST_RUBY_MIN: 15,
  CHEST_RUBY_MAX: 35,
};

export const SKINS: Record<SkinId, SkinConfig> = {
  watermelon: { id: 'watermelon', name: 'Watermelon', baseColor: '#FF2A6D', darkColor: '#D81B60', trailColor: 'rgba(255, 42, 109, 0.65)', patternType: 'seeds' },
  donut: { id: 'donut', name: 'Donut Sprinkles', baseColor: '#FF69B4', darkColor: '#C2185B', trailColor: 'rgba(255, 105, 180, 0.65)', patternType: 'sprinkles' },
  star: { id: 'star', name: 'Cosmic Star', baseColor: '#1E3C72', darkColor: '#0F1E3D', trailColor: 'rgba(33, 150, 243, 0.65)', patternType: 'stars' },
  cheese: { id: 'cheese', name: 'Moon Cheese', baseColor: '#FFD166', darkColor: '#FFA000', trailColor: 'rgba(255, 209, 102, 0.65)', patternType: 'craters' },
  bamboo: { id: 'bamboo', name: 'Fresh Bamboo', baseColor: '#06D6A0', darkColor: '#00B894', trailColor: 'rgba(6, 214, 160, 0.65)', patternType: 'rings' },
  circuit: { id: 'circuit', name: 'Cyber Neon', baseColor: '#8338EC', darkColor: '#59168B', trailColor: 'rgba(131, 56, 236, 0.65)', patternType: 'circuits' },
};

/** Bots: fixed distinct colors, pattern borrowed from a catalog skin. */
export const DEFAULT_PLAYERS_CONFIG: PlayerConfig[] = [
  { id: 1, name: 'Bạn', color: '#FF2A6D', darkColor: '#D81B60', skinId: 'skin_watermelon', isBot: false },
  { id: 2, name: 'Mia', color: '#FF69B4', darkColor: '#C2185B', skinId: 'skin_donut', isBot: true, archetype: 'cautious' },
  { id: 3, name: 'Lucas', color: '#2196F3', darkColor: '#1976D2', skinId: 'skin_star', isBot: true, archetype: 'hunter' },
  { id: 4, name: 'Sofia', color: '#FFD166', darkColor: '#FFA000', skinId: 'skin_lemon', isBot: true, archetype: 'greedy' },
  { id: 5, name: 'Nate', color: '#06D6A0', darkColor: '#00B894', skinId: 'skin_kiwi', isBot: true, archetype: 'cautious' },
  { id: 6, name: 'Chloe', color: '#8338EC', darkColor: '#59168B', skinId: 'skin_cyber', isBot: true, archetype: 'hunter' },
  { id: 7, name: 'Max', color: '#FF9100', darkColor: '#E65100', skinId: 'skin_tiger', isBot: true, archetype: 'greedy' },
  { id: 8, name: 'Oliver', color: '#00E5FF', darkColor: '#00B8D4', skinId: 'skin_snowflake', isBot: true, archetype: 'hunter' },
  { id: 9, name: 'Emma', color: '#E040FB', darkColor: '#AA00FF', skinId: 'skin_grape', isBot: true, archetype: 'cautious' },
  { id: 10, name: 'Leo', color: '#76FF03', darkColor: '#64DD17', skinId: 'skin_leaf', isBot: true, archetype: 'greedy' }
];
