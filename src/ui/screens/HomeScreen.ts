import { metaManager } from '../../meta/MetaManager';
import { SkinPickerModal } from '../components/SkinPickerModal';
import skinsData from '../../meta/data/skins.json';
import countriesData from '../../meta/data/countries.json';
import { FloatingIsland3D } from '../components/FloatingIsland3D';
import { lockSvg, starSvg, flagNicaraguaSvg, movieClapperSvg } from '../svgIcons';
import { uiSound } from '../uiSound';

export class HomeScreen {
  private element: HTMLElement;
  private island: FloatingIsland3D | null = null;
  private onStartPlay: () => void;

  constructor(onStartPlay: () => void) {
    this.onStartPlay = onStartPlay;
    this.element = document.createElement('div');
    this.element.className = 'screen-home';
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

  private renderCountryFlag(colors?: string[]): string {
    if (!colors || colors.length < 3) return flagNicaraguaSvg(32, 22);
    return `<svg width="32" height="22" viewBox="0 0 60 40" style="border-radius:4px;overflow:hidden;box-shadow:0 2px 4px rgba(0,0,0,0.3);border:1.5px solid #FFFFFF;">
      <rect width="60" height="13.4" fill="${colors[0]}" />
      <rect y="13.3" width="60" height="13.4" fill="${colors[1]}" />
      <rect y="26.6" width="60" height="13.4" fill="${colors[2]}" />
    </svg>`;
  }

  private render(): void {
    const state = metaManager.getState();
    const activeCountry = state.countries[state.activeCountryId] || { percent: 63 };
    const countryDef = countriesData.countries.find(c => c.id === state.activeCountryId);
    const countryName = countryDef ? countryDef.name : 'Nicaragua';

    this.element.innerHTML = `
      <div class="home-sky-clouds">
        <svg class="cloud-blob c1" viewBox="0 0 100 60"><ellipse cx="50" cy="30" rx="45" ry="22" fill="rgba(255,255,255,0.22)"/></svg>
        <svg class="cloud-blob c2" viewBox="0 0 120 70"><ellipse cx="60" cy="35" rx="55" ry="25" fill="rgba(255,255,255,0.18)"/></svg>
        <svg class="cloud-blob c3" viewBox="0 0 90 50"><ellipse cx="45" cy="25" rx="40" ry="18" fill="rgba(255,255,255,0.2)"/></svg>
      </div>

      <!-- Sub-row under Top Bar -->
      <div class="home-sub-row">
        <!-- Event badge left -->
        <div class="sub-event-left ui-btn-3d">
          <div class="sub-event-circle">
            <div class="sub-event-avatar"></div>
            <div class="sub-event-count">6</div>
          </div>
          <div class="sub-event-timer">1n 14g</div>
        </div>

        <!-- No Ads badge right -->
        <div class="sub-ads-right ui-btn-3d">
          <div class="sub-ads-circle">
            <span class="ads-text">AD</span>
            <div class="ads-slash"></div>
          </div>
          <div class="sub-ads-label">KHÔNG CÓ QUẢNG CÁO</div>
        </div>
      </div>

      <!-- Center Stage: Floating Title + Speech-Bubble Pill + 3D Island -->
      <div class="home-center-stage">
        <div class="country-floating-group">
          <div class="country-header-title ui-text-outlined">${countryName}</div>
          <div class="country-pill-outer">
            <div class="country-pill-bar">
              <div class="pill-gray-fill" style="width: ${activeCountry.percent}%">
                <span class="pill-dot d1"></span>
                <span class="pill-dot d2"></span>
                <span class="pill-dot d3"></span>
              </div>
              <div class="pill-blue-fill" style="width: ${100 - activeCountry.percent}%"></div>
              <span class="pill-percent-text">${activeCountry.percent}%</span>
            </div>
            <div class="pill-flag-tip">
              ${this.renderCountryFlag(countryDef?.flagColors)}
            </div>
            <div class="country-pill-pointer"></div>
          </div>
        </div>

        <!-- 3D Island Canvas Stage (Tap to open Skin Picker) -->
        <div class="island-stage" id="island-stage" title="Chạm để đổi Skin"></div>
        <button class="home-skin-quick-pill ui-btn-3d" id="btn-open-skins">
          <span class="skin-dot-swatch" id="home-skin-swatch"></span>
          <span id="home-skin-name">Đổi Skin</span>
        </button>
      </div>

      <!-- Bottom Controls Area -->
      <div class="home-bottom-dock">
        <!-- Speech Bubble x5 directly above Play Circle -->
        <div class="bubble-x5-box ui-btn-3d" id="btn-x5-bubble">
          <div class="bubble-clapper-badge">${movieClapperSvg(22)}</div>
          <div class="bubble-x5-inner">
            <div class="bubble-row-top">Bắt đầu</div>
            <div class="bubble-row-mid">x5</div>
            <div class="bubble-row-bot">Lớn hơn</div>
          </div>
          <div class="bubble-pointer-down"></div>
        </div>

        <!-- Flanking Hills & Giant Play Button Anchor -->
        <div class="flanking-hills-wrapper">
          <!-- Left Hill: SẮP RA MẮT -->
          <button class="hill-card hill-blue ui-btn-3d" id="btn-coming-soon">
            <div class="hill-white-oval">
              ${lockSvg(24)}
            </div>
            <div class="hill-label-text">SẮP RA MẮT</div>
          </button>

          <!-- Center Giant Round Yellow Play Button -->
          <div class="play-circle-slot">
            <button class="big-yellow-play-circle ui-btn-3d" id="btn-play">
              <div class="play-crescent-highlight"></div>
              <svg class="play-triangle-svg" width="54" height="58" viewBox="0 0 54 58">
                <path d="M12 8 C12 3, 18 1, 22 4 L46 23 C50 26, 50 32, 46 35 L22 54 C18 57, 12 55, 12 50 Z"
                  fill="#FFFFFF" stroke="#0E2963" stroke-width="4" stroke-linejoin="round" />
              </svg>
            </button>
          </div>

          <!-- Right Hill: Rank -->
          <button class="hill-card hill-orange ui-btn-3d" id="btn-rank">
            <div class="hill-white-oval orange-avatar-oval">
              <div class="mini-orange-cube">
                <div class="mini-eye"></div>
                <div class="mini-eye"></div>
              </div>
            </div>
            <div class="hill-label-text orange-text">${state.profile.rankName}</div>
            <div class="hill-rank-bar">
              <div class="hill-star-badge">${starSvg(18)}</div>
              <span class="hill-rank-score">${state.profile.trophies}</span>
            </div>
          </button>
        </div>
      </div>
    `;

    const activeSkin = skinsData.skins.find((s) => s.id === state.activeSkinId) ?? skinsData.skins[0];
    const swatchEl = this.element.querySelector('#home-skin-swatch') as HTMLElement | null;
    const skinNameEl = this.element.querySelector('#home-skin-name');
    if (swatchEl && activeSkin) swatchEl.style.background = activeSkin.color;
    if (skinNameEl && activeSkin) skinNameEl.textContent = activeSkin.name;

    const refreshIslandSkin = () => {
      const sId = metaManager.getState().activeSkinId;
      const sk = skinsData.skins.find((s) => s.id === sId) ?? skinsData.skins[0];
      if (sk && this.island) {
        this.island.setSkinAppearance(sk.color, (sk as any).secondaryColor ?? '#FFFFFF');
      }
      if (swatchEl && sk) swatchEl.style.background = sk.color;
      if (skinNameEl && sk) skinNameEl.textContent = sk.name;
    };

    const islandStage = this.element.querySelector('#island-stage') as HTMLElement;
    if (islandStage) {
      this.island = new FloatingIsland3D(islandStage, activeCountry.percent);
      refreshIslandSkin();
      islandStage.addEventListener('click', () => {
        uiSound.playButtonPop();
        const modalRoot = (document.querySelector('.game-ui-layer') as HTMLElement) ?? this.element;
        new SkinPickerModal().open(modalRoot, refreshIslandSkin);
      });
    }

    const openSkinsBtn = this.element.querySelector('#btn-open-skins');
    if (openSkinsBtn) {
      openSkinsBtn.addEventListener('click', () => {
        uiSound.playButtonPop();
        const modalRoot = (document.querySelector('.game-ui-layer') as HTMLElement) ?? this.element;
        new SkinPickerModal().open(modalRoot, refreshIslandSkin);
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
      comingSoonBtn.addEventListener('click', () => uiSound.playButtonPop());
    }

    const rankBtn = this.element.querySelector('#btn-rank');
    if (rankBtn) {
      rankBtn.addEventListener('click', () => uiSound.playButtonPop());
    }

    const x5Bubble = this.element.querySelector('#btn-x5-bubble');
    if (x5Bubble) {
      x5Bubble.addEventListener('click', () => {
        uiSound.playButtonPop();
        this.onStartPlay();
      });
    }
  }
}
