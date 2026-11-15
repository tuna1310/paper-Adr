/**
 * Design Tokens trung tâm cho toàn bộ Paper Territory.
 * Mọi mã màu #HEX, tỉ lệ vị trí (%W / %H đo từ khung video chuẩn 720×1558),
 * font, bo góc, thời lượng hoạt ảnh và bảng 27 bậc Rank đều tập trung tại đây.
 */

export const DESIGN_REF = {
  WIDTH: 720,
  HEIGHT: 1558,
  ASPECT_RATIO: 720 / 1558, // 0.462
} as const;

export const TYPOGRAPHY = {
  DISPLAY_FONT: '"Fredoka", "Lilita One", -apple-system, BlinkMacSystemFont, sans-serif',
  UI_FONT: '"Fredoka", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  OUTLINE_NAVY: '#071A75',
  OUTLINE_DEEP: '#081B5B',
  OUTLINE_INDIGO: '#1E2566',
} as const;

export const TIMING_MS = {
  LOADING_MIN_DISPLAY: 1650,
  LOADING_FADE_OUT: 320,
  LOADING_SPINNER_REV: 900,
  BUTTON_PRESS: 110,
  TAB_SWITCH: 180,
  ORB_WAVE_DURATION: 2500,
  KO_CHAIN_WINDOW: 5000,
  HEART_REVIVE_SECONDS: 3,
} as const;

export const LOADING_THEME = {
  skyTop: '#0480EC',
  skyMid: '#1DAEFB',
  skyRight: '#07B6FC',
  sunHaloOuter: '#C3D8F8',
  sunHaloCore: '#01FDFC',
  cloudWhite: '#FFFFFF',
  cloudTint: '#D8F1FF',

  logoStrokeNavy: '#1E2566',
  logoExtrudeNavy: '#081B5B',
  logoFaceTop: '#FFFFFF',
  logoFaceBottom: '#CFEAFF',
  logoAccentTop: '#FFE928',
  logoAccentMid: '#FFC400',
  logoAccentBot: '#FF8C00',

  leafLight: '#FFB202',
  leafMid: '#FDA600',
  leafDark: '#E86E00',
  leafShadow: '#B84A00',
  slopeTop: '#FBC416',
  slopeBottom: '#FEC200',
  slopeHighlight: '#FFE45E',

  mascot: {
    chickTop: '#FFF66A',
    chickYellow: '#FCFA3E',
    chickGold: '#FDB801',
    chickTrail: '#FFAE00',
    bunnyPink: '#FF36B0',
    bunnyHighlight: '#FFEBFF',
    bunnyShade: '#C71485',
    gloveCyan: '#18D6FB',
    gloveShadow: '#0F77AF',
    batBlue: '#247CFC',
    batDark: '#12389E',
    batTrail: '#3248F0',
    watermelonRed: '#FF3B5C',
    watermelonGreen: '#4CD948',
    donutPink: '#FF70C2',
    donutCrust: '#E69F52',
    skaterWhite: '#F7FBFF',
    skaterHatGreen: '#2ECF3B',
  },

  spinnerTrack: 'rgba(255, 255, 255, 0.24)',
  spinnerArc: 'rgba(255, 255, 255, 0.88)',
  spinnerOutline: 'rgba(130, 82, 0, 0.35)',

  layout: {
    studioTopPct: 7.4,
    logoTopPct: 10.6,
    logoBottomPct: 27.6,
    sunCenterXPct: 50,
    sunCenterYPct: 18.2,
    slopeLeftYPct: 62.5,
    slopeRightYPct: 81.5,
    spinnerCenterYPct: 91.5,
    spinnerRadiusPct: 3.6, // relative to width
  },
} as const;

export const NAV_THEME = {
  bgTop: '#1DAEFB',
  bgCenterGlow: '#48E9EE',
  pillNavy: '#183BA1',
  pillStroke: '#071A75',
  avatarRingWhite: '#FFFFFF',
  avatarRingStroke: '#071A75',
  plusBadgeGreen: '#5CE61C',
  plusBadgeStroke: '#1D7306',

  playTop: '#FEFCFD',
  playGold: '#FFE804',
  playRimGold: '#FFC400',
  soonWing: '#3EBEFE',
  rankWing: '#F8A254',
  navBarLight: '#D4E8FD',
  navBarBorder: '#1665D8',
  navActiveBg: '#1994FA',

  layout: {
    coinPillTopPct: 8.3,
    coinPillBottomPct: 11.3,
    avatarLeftPct: 5.5,
    avatarDiameterPct: 10.5,
    playWidthPct: 29.4,
    playTopPct: 83.1,
    playBottomPct: 95.2,
    navBarTopPct: 89.1,
    navBarHeightPct: 10.9,
  },
} as const;

export const SUBSCREEN_THEME = {
  rank: {
    lockedNavy: '#002C71',
    unlockedSky: '#0CA0FE',
    activeBlue: '#503AAD',
    bronzeBanner: '#31D1FA',
    trackGold: '#FFD600',
  },
  leaderboard: {
    skyTop: '#629FFD',
    headerNavy: '#063DC5',
    titleNavy: '#001368',
    goldPodium: '#F6AC19',
    silverPodium: '#AEBCE9',
    bronzePodium: '#E05D22',
    rowCyan: '#B9EBFF',
  },
  shop: {
    bgBlue: '#115AEB',
    awningWhite: '#FFFFFF',
    awningBlue: '#0F4CC9',
    gemCardBg: '#F77BFC',
    coinCardBg: '#FAC82B',
    tagRed: '#FF2442',
  },
  heroes: {
    bgBlue: '#1B3EC3',
    lockedCard: '#E0F5FF',
    headerCyan: '#06AFFC',
    activeGreenGlow: '#4CEB34',
  },
  carousel: {
    skyTop: '#175AF8',
    horizonGlow: '#97F1FC',
    floorBlue: '#1094FC',
    pedestalWhite: '#FAFBFE',
    btnCyan: '#46D4FA',
  },
  missions: {
    bgPurple: '#7F25F5',
    bgMagenta: '#FADBFC',
    panelNavy: '#003BD2',
    activeYellow: '#FDF8C3',
    cardWhite: '#DFF4FD',
    barGreen: '#56EE2E',
  },
  world: {
    oceanBlue: '#00ACFD',
    shallowShore: '#8DE5FF',
    coastWhite: '#FBFCFF',
    unlockedGreen: '#2DBF3A',
    lockedSlate: '#D4E4F7',
  },
  gameplay: {
    neutralMint: '#E2FBEF',
    progressTrackNavy: '#1D1391',
    barLeftPct: 8.9,
    barWidthPct: 83.6,
    barTopPct: 9.1,
    barHeightPct: 3.3,
    minimapLeftPct: 5,
    minimapWidthPct: 33,
    minimapTopPct: 73,
    minimapHeightPct: 9,
  },
  gameOver: {
    bgEdgeBlue: '#014FD8',
    bgGlowCyan: '#084587',
    heartDarkNavy: '#084587',
    heartRed: '#FB3738',
    reviveGreen: '#C4FD6A',
  },
} as const;

export interface RankTierDefinition {
  id: string;
  tierName: string;
  roman: 'I' | 'II' | 'III';
  displayName: string;
  minTrophies: number;
  topPercent: number;
  accentHex: string;
}

/**
 * 27 bậc thang hạng chuẩn theo Video A & xác nhận từ PO:
 * - Đồng I = 0 (Top 99%), Đồng II = 650 (Top 95%), Đồng III = 1300 (Top 91%)
 * - Các bậc từ Bạc I tới Huyền thoại III giữ đúng mốc đo từ Video A.
 */
export const RANK_TIERS: readonly RankTierDefinition[] = [
  { id: 'bronze_1', tierName: 'ĐỒNG', roman: 'I', displayName: 'ĐỒNG I', minTrophies: 0, topPercent: 99, accentHex: '#E06D2B' },
  { id: 'bronze_2', tierName: 'ĐỒNG', roman: 'II', displayName: 'ĐỒNG II', minTrophies: 650, topPercent: 95, accentHex: '#E06D2B' },
  { id: 'bronze_3', tierName: 'ĐỒNG', roman: 'III', displayName: 'ĐỒNG III', minTrophies: 1300, topPercent: 91, accentHex: '#E06D2B' },

  { id: 'silver_1', tierName: 'BẠC', roman: 'I', displayName: 'BẠC I', minTrophies: 2620, topPercent: 88, accentHex: '#AEBCE9' },
  { id: 'silver_2', tierName: 'BẠC', roman: 'II', displayName: 'BẠC II', minTrophies: 3860, topPercent: 84, accentHex: '#AEBCE9' },
  { id: 'silver_3', tierName: 'BẠC', roman: 'III', displayName: 'BẠC III', minTrophies: 5350, topPercent: 80, accentHex: '#AEBCE9' },

  { id: 'gold_1', tierName: 'VÀNG', roman: 'I', displayName: 'VÀNG I', minTrophies: 7140, topPercent: 76, accentHex: '#F6AC19' },
  { id: 'gold_2', tierName: 'VÀNG', roman: 'II', displayName: 'VÀNG II', minTrophies: 9290, topPercent: 73, accentHex: '#F6AC19' },
  { id: 'gold_3', tierName: 'VÀNG', roman: 'III', displayName: 'VÀNG III', minTrophies: 11870, topPercent: 69, accentHex: '#F6AC19' },

  { id: 'platinum_1', tierName: 'BẠCH KIM', roman: 'I', displayName: 'BẠCH KIM I', minTrophies: 14970, topPercent: 65, accentHex: '#31D1FA' },
  { id: 'platinum_2', tierName: 'BẠCH KIM', roman: 'II', displayName: 'BẠCH KIM II', minTrophies: 18690, topPercent: 61, accentHex: '#31D1FA' },
  { id: 'platinum_3', tierName: 'BẠCH KIM', roman: 'III', displayName: 'BẠCH KIM III', minTrophies: 23150, topPercent: 58, accentHex: '#31D1FA' },

  { id: 'diamond_1', tierName: 'KIM CƯƠNG', roman: 'I', displayName: 'KIM CƯƠNG I', minTrophies: 28500, topPercent: 54, accentHex: '#5CE8FF' },
  { id: 'diamond_2', tierName: 'KIM CƯƠNG', roman: 'II', displayName: 'KIM CƯƠNG II', minTrophies: 34920, topPercent: 50, accentHex: '#5CE8FF' },
  { id: 'diamond_3', tierName: 'KIM CƯƠNG', roman: 'III', displayName: 'KIM CƯƠNG III', minTrophies: 42620, topPercent: 46, accentHex: '#5CE8FF' },

  { id: 'elite_1', tierName: 'ƯU TÚ', roman: 'I', displayName: 'ƯU TÚ I', minTrophies: 51860, topPercent: 42, accentHex: '#A755FF' },
  { id: 'elite_2', tierName: 'ƯU TÚ', roman: 'II', displayName: 'ƯU TÚ II', minTrophies: 62950, topPercent: 39, accentHex: '#A755FF' },
  { id: 'elite_3', tierName: 'ƯU TÚ', roman: 'III', displayName: 'ƯU TÚ III', minTrophies: 76260, topPercent: 35, accentHex: '#A755FF' },

  { id: 'master_1', tierName: 'BẬC THẦY', roman: 'I', displayName: 'BẬC THẦY I', minTrophies: 92230, topPercent: 31, accentHex: '#F752A3' },
  { id: 'master_2', tierName: 'BẬC THẦY', roman: 'II', displayName: 'BẬC THẦY II', minTrophies: 111400, topPercent: 27, accentHex: '#F752A3' },
  { id: 'master_3', tierName: 'BẬC THẦY', roman: 'III', displayName: 'BẬC THẦY III', minTrophies: 134400, topPercent: 24, accentHex: '#F752A3' },

  { id: 'champion_1', tierName: 'NHÀ VÔ ĐỊCH', roman: 'I', displayName: 'NHÀ VÔ ĐỊCH I', minTrophies: 162000, topPercent: 20, accentHex: '#FF4E4E' },
  { id: 'champion_2', tierName: 'NHÀ VÔ ĐỊCH', roman: 'II', displayName: 'NHÀ VÔ ĐỊCH II', minTrophies: 195120, topPercent: 16, accentHex: '#FF4E4E' },
  { id: 'champion_3', tierName: 'NHÀ VÔ ĐỊCH', roman: 'III', displayName: 'NHÀ VÔ ĐỊCH III', minTrophies: 234870, topPercent: 12, accentHex: '#FF4E4E' },

  { id: 'legend_1', tierName: 'HUYỀN THOẠI', roman: 'I', displayName: 'HUYỀN THOẠI I', minTrophies: 282570, topPercent: 9, accentHex: '#FFE438' },
  { id: 'legend_2', tierName: 'HUYỀN THOẠI', roman: 'II', displayName: 'HUYỀN THOẠI II', minTrophies: 339810, topPercent: 5, accentHex: '#FFE438' },
  { id: 'legend_3', tierName: 'HUYỀN THOẠI', roman: 'III', displayName: 'HUYỀN THOẠI III', minTrophies: 408490, topPercent: 1, accentHex: '#FFE438' },
] as const;

export function getRankTierByTrophies(trophies: number): RankTierDefinition {
  let matched = RANK_TIERS[0];
  for (const tier of RANK_TIERS) {
    if (trophies >= tier.minTrophies) matched = tier;
    else break;
  }
  return matched;
}
