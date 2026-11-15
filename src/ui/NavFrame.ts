import './subpages.css';
import { metaManager } from '../meta/MetaManager';
import { coinSvg, gemSvg, gearSvg, avatarCubeSvg, shopAwningSvg, heroesSvg, missionsSvg, globeSvg, homeHouseSvg } from './svgIcons';
import { uiSound } from './uiSound';
import { HomeScreen } from './screens/HomeScreen';
import { ShopScreen } from './screens/ShopScreen';
import { HeroesScreen } from './screens/HeroesScreen';
import { MissionsScreen } from './screens/MissionsScreen';
import { WorldScreen } from './screens/WorldScreen';

export type NavTabId = 'shop' | 'heroes' | 'home' | 'missions' | 'world';

export class NavFrame {
  private container: HTMLElement;
  private currentTab: NavTabId = 'home';
  private currentScreenInstance: any = null;
  private onStartGameCallback: () => void;
  private unsubscribeMeta: (() => void) | null = null;

  constructor(container: HTMLElement, onStartGame: () => void) {
    this.container = container;
    this.onStartGameCallback = onStartGame;
    this.init();
  }

  private init(): void {
    this.container.innerHTML = `
      <div class="game-ui-layer">
        <!-- Top Navigation Bar -->
        <header class="top-nav-bar">
          <button class="top-avatar-btn ui-btn-3d" id="btn-avatar" title="Về màn hình chính">
            ${avatarCubeSvg(42)}
          </button>

          <div class="top-currency-container">
            <!-- Coin Pill -->
            <div class="currency-pill" id="pill-coins">
              <div class="currency-icon-wrap">
                <div class="currency-icon">${coinSvg(34)}</div>
                <button class="currency-add-btn ui-btn-3d" id="btn-add-coins">+</button>
              </div>
              <span class="currency-amount" id="val-coins">10,51K</span>
            </div>

            <!-- Gem Pill -->
            <div class="currency-pill" id="pill-gems">
              <div class="currency-icon-wrap">
                <div class="currency-icon">${gemSvg(32)}</div>
                <button class="currency-add-btn ui-btn-3d" id="btn-add-gems">+</button>
              </div>
              <span class="currency-amount" id="val-gems">44</span>
            </div>
          </div>

          <button class="top-settings-btn ui-btn-3d" id="btn-settings">
            ${gearSvg(34)}
          </button>
        </header>

        <!-- Main Screen Viewport -->
        <main class="screens-viewport" id="screens-viewport"></main>

        <!-- Bottom Navigation Bar (4 Flanking Tabs + Center Home/House Button) -->
        <nav class="bottom-nav-bar">
          <!-- 1. Shop -->
          <div class="nav-tab-item ui-btn-3d" data-tab="shop">
            <div class="nav-tab-card">
              ${shopAwningSvg(30)}
              <span class="nav-tab-label">Cửa hàng</span>
              <div class="tab-badge-notification">!</div>
            </div>
          </div>

          <!-- 2. Heroes -->
          <div class="nav-tab-item ui-btn-3d" data-tab="heroes">
            <div class="nav-tab-card">
              ${heroesSvg(30)}
              <span class="nav-tab-label">Anh hùng</span>
            </div>
          </div>

          <!-- Center Home Slot -->
          <div class="nav-tab-spacer">
            <button class="nav-center-home-btn ui-btn-3d" data-tab="home" id="btn-nav-home" style="display:none;">
              ${homeHouseSvg(28)}
            </button>
          </div>

          <!-- 4. Missions -->
          <div class="nav-tab-item ui-btn-3d" data-tab="missions">
            <div class="nav-tab-card">
              ${missionsSvg(30)}
              <span class="nav-tab-label">Nhiệm vụ</span>
              <div class="tab-badge-notification" id="badge-missions">3</div>
            </div>
          </div>

          <!-- 5. World -->
          <div class="nav-tab-item ui-btn-3d" data-tab="world">
            <div class="nav-tab-card">
              ${globeSvg(30)}
              <span class="nav-tab-label">Thế giới</span>
            </div>
          </div>
        </nav>
      </div>
    `;

    this.bindEvents();
    this.updateCurrencies();
    this.unsubscribeMeta = metaManager.subscribe(() => {
      this.updateCurrencies();
    });

    this.switchTab('home');
  }

  private updateCurrencies(): void {
    const state = metaManager.getState();
    const coinEl = this.container.querySelector('#val-coins');
    const gemEl = this.container.querySelector('#val-gems');
    if (coinEl) {
      if (state.currencies.coins >= 10000) {
        coinEl.textContent = (state.currencies.coins / 1000).toFixed(2).replace('.', ',') + 'K';
      } else {
        coinEl.textContent = state.currencies.coins.toString();
      }
    }
    if (gemEl) gemEl.textContent = state.currencies.gems.toString();

    const badgeMissions = this.container.querySelector('#badge-missions') as HTMLElement;
    if (badgeMissions) {
      const unclaimed = state.missions.daily.filter(m => !m.claimed).length;
      badgeMissions.textContent = unclaimed.toString();
      badgeMissions.style.display = unclaimed > 0 ? 'flex' : 'none';
    }
  }

  private bindEvents(): void {
    const avatarBtn = this.container.querySelector('#btn-avatar');
    if (avatarBtn) {
      avatarBtn.addEventListener('click', () => {
        uiSound.playTabSwitch();
        this.switchTab('home');
      });
    }

    const addCoinsBtn = this.container.querySelector('#btn-add-coins');
    if (addCoinsBtn) {
      addCoinsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        uiSound.playRewardCoin();
        metaManager.addCoins(1000);
      });
    }

    const addGemsBtn = this.container.querySelector('#btn-add-gems');
    if (addGemsBtn) {
      addGemsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        uiSound.playRewardCoin();
        metaManager.addGems(50);
      });
    }

    const tabItems = this.container.querySelectorAll('[data-tab]');
    tabItems.forEach(item => {
      item.addEventListener('click', () => {
        const tab = item.getAttribute('data-tab') as NavTabId;
        if (tab) {
          uiSound.playTabSwitch();
          this.switchTab(tab);
        }
      });
    });
  }

  public getActiveTab(): NavTabId {
    return this.currentTab;
  }

  public switchTab(tabId: NavTabId): void {
    this.currentTab = tabId;

    const tabItems = this.container.querySelectorAll('.nav-tab-item');
    tabItems.forEach(item => {
      if (item.getAttribute('data-tab') === tabId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    const centerHomeBtn = this.container.querySelector('#btn-nav-home') as HTMLElement;
    if (centerHomeBtn) {
      centerHomeBtn.style.display = tabId === 'home' ? 'none' : 'inline-flex';
    }

    if (this.currentScreenInstance && typeof this.currentScreenInstance.destroy === 'function') {
      this.currentScreenInstance.destroy();
    }
    const viewport = this.container.querySelector('#screens-viewport') as HTMLElement;
    if (!viewport) return;
    viewport.innerHTML = '';

    const startGame = () => {
      this.hide();
      this.onStartGameCallback();
    };

    switch (tabId) {
      case 'home':
        this.currentScreenInstance = new HomeScreen(startGame);
        break;
      case 'shop':
        this.currentScreenInstance = new ShopScreen();
        break;
      case 'heroes':
        this.currentScreenInstance = new HeroesScreen();
        break;
      case 'missions':
        this.currentScreenInstance = new MissionsScreen();
        break;
      case 'world':
        this.currentScreenInstance = new WorldScreen(startGame);
        break;
    }

    if (this.currentScreenInstance) {
      viewport.appendChild(this.currentScreenInstance.getElement());
    }
  }

  public show(): void {
    const layer = this.container.querySelector('.game-ui-layer') as HTMLElement;
    if (layer) {
      layer.style.display = 'block';
      this.switchTab(this.currentTab);
    }
  }

  public hide(): void {
    const layer = this.container.querySelector('.game-ui-layer') as HTMLElement;
    if (layer) layer.style.display = 'none';
  }

  public destroy(): void {
    if (this.unsubscribeMeta) {
      this.unsubscribeMeta();
    }
    this.container.innerHTML = '';
  }
}
