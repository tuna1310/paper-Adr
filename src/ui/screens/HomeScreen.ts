import { metaManager } from '../../meta/MetaManager';
import { SkinPickerModal } from '../components/SkinPickerModal';
import skinsData from '../../meta/data/skins.json';
import countriesData from '../../meta/data/countries.json';
import { FloatingIsland3D } from '../components/FloatingIsland3D';
import { getRankTierByTrophies } from '../theme';
import {
  lockSvg,
  starSvg,
  countryFlagSvg,
  hangerSvg,
  skinCubeSvg,
  worldContinentsWatermarkSvg,
} from '../svgIcons';
import { uiSound } from '../uiSound';

export interface HomeScreenOptions {
  onOpenRankLadder?: () => void;
  onOpenNoAds?: () => void;
  onShowToast?: (message: string) => void;
}

export class HomeScreen {
  private element: HTMLElement;
  private island: FloatingIsland3D | null = null;
  private onStartPlay: () => void;
  private options: HomeScreenOptions;

  constructor(onStartPlay: () => void, options: HomeScreenOptions = {}) {
    this.onStartPlay = onStartPlay;
    this.options = options;
    this.element = document.createElement('div');
    this.element.className = 'screen-home';
    this.element.setAttribute('data-screen', 'home');
    this.render();
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  public destroy(): void {
    if (this.island) {
      this.island.destroy();
      this.island = null;
    }
    this.element.remove();
  }

  private getCountryCode(countryId: string): string {
    const codeMap: Record<string, string> = {
      nicaragua: 'NI',
      panama: 'PA',
      costa_rica: 'CR',
      cuba: 'CU',
      mexico: 'MX',
      usa: 'US',
      canada: 'CA',
      vietnam: 'VN',
      japan: 'JP',
      korea: 'KR',
      thailand: 'TH',
      singapore: 'SG',
      india: 'IN',
      china: 'CN',
      indonesia: 'ID',
      brazil: 'BR',
      argentina: 'AR',
      france: 'FR',
      germany: 'DE',
      italy: 'IT',
      spain: 'ES',
      uk: 'GB',
      russia: 'RU',
      australia: 'AU',
      new_zealand: 'NZ',
    };
    return codeMap[countryId] ?? 'NI';
  }

  private render(): void {
    const state = metaManager.getState();
    const activeCountry = state.countries[state.activeCountryId] || { percent: 63 };
    const countryDef = countriesData.countries.find((c) => c.id === state.activeCountryId);
    const countryName = countryDef ? countryDef.name : 'Nicaragua';
    const flagCode = this.getCountryCode(state.activeCountryId);
    const activeSkin = skinsData.skins.find((s) => s.id === state.activeSkinId) ?? skinsData.skins[0];
    const rankTier = getRankTierByTrophies(state.profile.trophies);

    this.element.innerHTML = `
      <!-- Faint World Continents Silhouette & Central Cyan Glow matching 0038.png -->
      <div class="home-world-watermark" aria-hidden="true">
        ${worldContinentsWatermarkSvg()}
      </div>
      <div class="home-center-glow" aria-hidden="true"></div>

      <!-- Right Utility Column (Daily Skin Preview 3g 43p + No Ads) under Settings -->
      <div class="home-right-dock">
        <button class="home-daily-skin-btn ui-btn-3d" id="btn-daily-skin" title="Xem trước Skin hàng ngày">
          <div class="daily-skin-orb">
            ${skinCubeSvg(activeSkin.color, (activeSkin as any).secondaryColor ?? '#FFFFFF', (activeSkin as any).pattern ?? 'solid', 38)}
          </div>
          <div class="daily-hanger-badge">${hangerSvg(20)}</div>
          <div class="daily-skin-timer">3g 43p</div>
        </button>

        <button class="sub-ads-right ui-btn-3d" id="btn-no-ads" title="Không có quảng cáo">
          <div class="sub-ads-circle">
            <span class="ads-text">AD</span>
            <div class="ads-slash"></div>
          </div>
          <div class="sub-ads-label">KHÔNG CÓ QUẢNG CÁO</div>
        </button>
      </div>

      <!-- Center Stage: Country Progress Speech Bubble + Floating 3D Skin Island -->
      <div class="home-center-stage">
        <div class="country-floating-group">
          <div class="country-header-title ui-text-outlined">${countryName}</div>
          <div class="country-pill-outer">
            <div class="country-pill-bar">
              <div class="pill-purple-fill" style="width: ${activeCountry.percent}%">
                <span class="pill-dot d1"></span>
                <span class="pill-dot d2"></span>
                <span class="pill-dot d3"></span>
                <span class="pill-dot d4"></span>
              </div>
              <span class="pill-percent-text">${activeCountry.percent}%</span>
            </div>
            <div class="pill-flag-tip">
              ${countryFlagSvg(flagCode, 34, 22)}
            </div>
            <div class="country-pill-pointer"></div>
          </div>
        </div>

        <!-- 3D Territory Island + Active Hero Voxel (Tap to switch skin) -->
        <div class="island-stage" id="island-stage" title="Chạm để đổi Skin"></div>
      </div>

      <!-- Bottom Flanking Arch Wings + Giant Center Play Sphere -->
      <div class="home-bottom-dock">
        <div class="flanking-hills-wrapper">
          <!-- Left Wing: SẮP RA MẮT -->
          <button class="hill-card hill-blue ui-btn-3d" id="btn-coming-soon">
            <div class="hill-pattern-q" aria-hidden="true">? &nbsp; ? &nbsp; ?</div>
            <div class="hill-white-oval">
              ${lockSvg(24)}
            </div>
            <div class="hill-label-text">SẮP RA MẮT</div>
          </button>

          <!-- Right Wing: Rank & Trophies -->
          <button class="hill-card hill-orange ui-btn-3d" id="btn-rank">
            <div class="hill-pattern-star" aria-hidden="true">★ &nbsp; ★ &nbsp; ★</div>
            <div class="hill-white-oval orange-avatar-oval">
              <div class="mini-orange-cube">
                <div class="mini-eye"></div>
                <div class="mini-eye"></div>
              </div>
            </div>
            <div class="hill-label-text orange-text">${rankTier.displayName}</div>
            <div class="hill-rank-bar">
              <div class="hill-star-badge">${starSvg(18)}</div>
              <span class="hill-rank-score">${state.profile.trophies}</span>
            </div>
          </button>
        </div>

        <!-- Giant Center Yellow Play Sphere overlapping Bottom Nav Bar -->
        <div class="play-circle-slot">
          <button class="big-yellow-play-circle ui-btn-3d" id="btn-play" aria-label="Chơi ngay">
            <div class="play-crescent-highlight"></div>
            <div class="play-sparkle s1">✦</div>
            <div class="play-sparkle s2">✦</div>
            <svg class="play-triangle-svg" width="52" height="56" viewBox="0 0 54 58">
              <path d="M12 8 C12 3, 18 1, 22 4 L46 23 C50 26, 50 32, 46 35 L22 54 C18 57, 12 55, 12 50 Z"
                fill="#FFFFFF" stroke="#071A75" stroke-width="4.2" stroke-linejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    `;

    const refreshIslandSkin = () => {
      const sId = metaManager.getState().activeSkinId;
      const sk = skinsData.skins.find((s) => s.id === sId) ?? skinsData.skins[0];
      if (sk && this.island) {
        this.island.setSkinAppearance(sk.color, (sk as any).secondaryColor ?? '#FFFFFF');
      }
      const orbEl = this.element.querySelector('.daily-skin-orb');
      if (orbEl && sk) {
        orbEl.innerHTML = skinCubeSvg(
          sk.color,
          (sk as any).secondaryColor ?? '#FFFFFF',
          (sk as any).pattern ?? 'solid',
          38,
        );
      }
    };

    const islandStage = this.element.querySelector('#island-stage') as HTMLElement | null;
    if (islandStage) {
      this.island = new FloatingIsland3D(islandStage, activeCountry.percent);
      refreshIslandSkin();
      islandStage.addEventListener('click', () => {
        uiSound.playButtonPop();
        const modalRoot = (document.querySelector('.game-ui-layer') as HTMLElement) ?? this.element;
        new SkinPickerModal().open(modalRoot, refreshIslandSkin);
      });
    }

    const dailySkinBtn = this.element.querySelector('#btn-daily-skin');
    if (dailySkinBtn) {
      dailySkinBtn.addEventListener('click', () => {
        uiSound.playButtonPop();
        const modalRoot = (document.querySelector('.game-ui-layer') as HTMLElement) ?? this.element;
        new SkinPickerModal().open(modalRoot, refreshIslandSkin);
      });
    }

    const noAdsBtn = this.element.querySelector('#btn-no-ads');
    if (noAdsBtn) {
      noAdsBtn.addEventListener('click', () => {
        uiSound.playButtonPop();
        if (this.options.onOpenNoAds) {
          this.options.onOpenNoAds();
        } else {
          this.options.onShowToast?.('Gói Không Quảng Cáo có sẵn trong Cửa hàng');
        }
      });
    }

    const playBtn = this.element.querySelector('#btn-play');
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        uiSound.playButtonPop();
        this.onStartPlay();
      });
    }

    const comingSoonBtn = this.element.querySelector('#btn-coming-soon');
    if (comingSoonBtn) {
      comingSoonBtn.addEventListener('click', () => {
        uiSound.playButtonPop();
        this.options.onShowToast?.('Chế độ mới sắp ra mắt!');
      });
    }

    const rankBtn = this.element.querySelector('#btn-rank');
    if (rankBtn) {
      rankBtn.addEventListener('click', () => {
        uiSound.playButtonPop();
        if (this.options.onOpenRankLadder) {
          this.options.onOpenRankLadder();
        } else {
          this.options.onShowToast?.(`Thang hạng (${rankTier.displayName}) sẽ mở ở Màn 3`);
        }
      });
    }
  }
}
