import skinsData from '../../meta/data/skins.json';
import { metaManager } from '../../meta/MetaManager';
import { buyCoinBundle, buyGemBundleVnd, HeroChestOpenResult, openHeroChestPack } from '../../meta/ShopActions';
import { chestSvg, coinSvg, gemSvg, skinCubeSvg } from '../svgIcons';
import { uiSound } from '../uiSound';

const HERO_CHESTS = [
  { id: 'c1', name: 'Phổ thông', gems: 10, cards: 8, coins: 120, tone: 'common' },
  { id: 'c2', name: 'Hiếm', gems: 70, cards: 22, coins: 450, tone: 'rare' },
  { id: 'c3', name: 'Sử thi', gems: 120, cards: 45, coins: 1200, tone: 'epic' },
  { id: 'c4', name: 'Huyền thoại', gems: 300, cards: 110, coins: 3500, tone: 'legendary' },
];

const GEM_PACKS = [
  { amount: 100, price: '29.000 đ', tag: '' },
  { amount: 250, price: '75.000 đ', tag: 'Phổ biến' },
  { amount: 650, price: '149.000 đ', tag: '' },
  { amount: 1400, price: '299.000 đ', tag: 'Giá trị nhất' },
];

const COIN_PACKS = [
  { coins: 3500, gems: 50 },
  { coins: 15000, gems: 180 },
  { coins: 50000, gems: 500 },
  { coins: 225000, gems: 1800 },
];

export class ShopScreen {
  private element: HTMLElement;
  private skinFilter: 'all' | 'free' | 'coins' | 'vnd' = 'all';
  private toastMsg = '';
  private lastChest: HeroChestOpenResult | null = null;
  private unsubscribeMeta: (() => void) | null = null;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'shop-screen ui-watermark-bg';
    this.render();
    this.unsubscribeMeta = metaManager.subscribe(() => this.render());
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  private render(): void {
    const state = metaManager.getState();
    const allSkins = skinsData.skins as any[];
    const filteredSkins = allSkins.filter((s) => {
      if (this.skinFilter === 'free') return s.isFree || s.priceCoins === 0;
      if (this.skinFilter === 'vnd') return (s.priceVnd ?? 0) > 0;
      if (this.skinFilter === 'coins') return !s.isFree && !(s.priceVnd > 0);
      return true;
    });

    this.element.innerHTML = `
      <div class="shop-awning"></div>

      <div class="shop-scroll-area">
        ${this.toastMsg ? `<div class="shop-toast-pill">${this.toastMsg}</div>` : ''}

        <div class="shop-ribbon-hdr"><span>Ưu đãi</span></div>
        <div class="shop-deals-grid">
          <button class="shop-card deal ui-btn-3d" id="btn-deal-free">
            <div class="sc-badge free">MIỄN PHÍ</div>
            <div class="sc-art">${coinSvg(46)}</div>
            <div class="sc-label">+150 Xu</div>
            <div class="sc-btn free">Nhận ngay</div>
          </button>
          <button class="shop-card deal ui-btn-3d" data-buy-gempack="100">
            <div class="sc-badge vnd">ƯU ĐÃI</div>
            <div class="sc-art">${gemSvg(46)}</div>
            <div class="sc-label">100 Đá quý</div>
            <div class="sc-btn vnd">29.000 đ</div>
          </button>
          <button class="shop-card deal ui-btn-3d" id="btn-deal-noads">
            <div class="sc-badge vnd">VIP</div>
            <div class="sc-art">🚫📺</div>
            <div class="sc-label">Bỏ Quảng Cáo</div>
            <div class="sc-btn vnd">49.000 đ</div>
          </button>
        </div>

        <div class="shop-ribbon-hdr"><span>Trang phục theo độ hiếm</span></div>
        <div class="shop-filter-row">
          <button class="sf-pill ${this.skinFilter === 'all' ? 'active' : ''}" data-sf="all">Tất cả (${allSkins.length})</button>
          <button class="sf-pill ${this.skinFilter === 'free' ? 'active' : ''}" data-sf="free">Miễn phí</button>
          <button class="sf-pill ${this.skinFilter === 'coins' ? 'active' : ''}" data-sf="coins">Xu Vàng</button>
          <button class="sf-pill ${this.skinFilter === 'vnd' ? 'active' : ''}" data-sf="vnd">VIP (VNĐ)</button>
        </div>
        <div class="shop-skins-grid3">
          ${filteredSkins.map((s) => this.renderSkinShopCard(s, state.ownedSkins.includes(s.id), state.activeSkinId === s.id)).join('')}
        </div>

        <div class="shop-ribbon-hdr"><span>Rương Anh Hùng</span></div>
        <div class="shop-grid-2">
          ${HERO_CHESTS.map(
            (ch) => `
            <button class="shop-card chest tone-${ch.tone} ui-btn-3d" data-chest="${ch.id}">
              <div class="sc-chest-name">${ch.name}</div>
              <div class="sc-art">${chestSvg(58)}</div>
              <div class="sc-sub">+${ch.cards} thẻ • +${ch.coins} xu</div>
              <div class="sc-btn gems">${gemSvg(16)} ${ch.gems}</div>
            </button>`
          ).join('')}
        </div>

        <div class="shop-ribbon-hdr"><span>Đá quý</span></div>
        <div class="shop-grid-2">
          ${GEM_PACKS.map(
            (gp) => `
            <button class="shop-card pack-gem ui-btn-3d" data-buy-gempack="${gp.amount}">
              ${gp.tag ? `<div class="sc-badge best">${gp.tag}</div>` : ''}
              <div class="sc-art">${gemSvg(54)}</div>
              <div class="sc-label">${gp.amount.toLocaleString('vi-VN')}</div>
              <div class="sc-btn vnd">${gp.price}</div>
            </button>`
          ).join('')}
        </div>

        <div class="shop-ribbon-hdr"><span>Xu</span></div>
        <div class="shop-grid-2">
          ${COIN_PACKS.map(
            (cp) => `
            <button class="shop-card pack-coin ui-btn-3d" data-coin-cost="${cp.gems}" data-coin-gain="${cp.coins}">
              <div class="sc-art">${coinSvg(52)}</div>
              <div class="sc-label">${cp.coins.toLocaleString('vi-VN')}</div>
              <div class="sc-btn gems">${gemSvg(16)} ${cp.gems}</div>
            </button>`
          ).join('')}
        </div>
      </div>

      ${this.lastChest ? this.renderChestPopup(this.lastChest) : ''}
    `;

    this.bindEvents();
  }

  private renderSkinShopCard(s: any, owned: boolean, active: boolean): string {
    let btnHtml = '';
    if (active) btnHtml = `<div class="sc-btn equipped">Đang dùng ✓</div>`;
    else if (owned) btnHtml = `<div class="sc-btn use">Dùng</div>`;
    else if (s.isFree || s.priceCoins === 0) btnHtml = `<div class="sc-btn free">Miễn phí</div>`;
    else if (s.priceVnd > 0) btnHtml = `<div class="sc-btn vnd">${s.priceVnd.toLocaleString('vi-VN')} đ</div>`;
    else btnHtml = `<div class="sc-btn coins">${coinSvg(14)} ${s.priceCoins ?? 500}</div>`;

    return `
      <button class="shop-card skin ${s.priceVnd > 0 ? 'vip-card' : ''} ui-btn-3d" data-shop-skin="${s.id}">
        <div class="sc-skin-name">${s.name}</div>
        <div class="sc-art">${skinCubeSvg(s.color, s.secondaryColor ?? '#FFFFFF', s.pattern ?? 'solid', 48)}</div>
        ${btnHtml}
      </button>
    `;
  }

  private renderChestPopup(res: HeroChestOpenResult): string {
    return `
      <div class="hero-modal-backdrop">
        <div class="chest-reward-dialog">
          <div class="crd-burst">🎉 MỞ RƯƠNG ANH HÙNG</div>
          <div class="crd-icon">${chestSvg(64)}</div>
          <h3 class="crd-title">+${res.cardsGained} Thẻ ${res.heroName}</h3>
          <p class="crd-sub">Kèm thêm +${res.coinsGained} Xu vàng</p>
          <button class="hm-btn equip ui-btn-3d" id="btn-close-shop-chest">Nhận!</button>
        </div>
      </div>
    `;
  }

  private showToast(msg: string): void {
    this.toastMsg = msg;
    this.render();
    setTimeout(() => {
      this.toastMsg = '';
      this.render();
    }, 1800);
  }

  private bindEvents(): void {
    this.element.querySelectorAll('[data-sf]').forEach((b) => {
      b.addEventListener('click', () => {
        uiSound.playButtonPop();
        this.skinFilter = b.getAttribute('data-sf') as any;
        this.render();
      });
    });

    this.element.querySelector('#btn-deal-free')?.addEventListener('click', () => {
      uiSound.playButtonPop();
      metaManager.addCoins(150);
      this.showToast('Đã nhận +150 Xu miễn phí!');
    });

    this.element.querySelector('#btn-deal-noads')?.addEventListener('click', () => {
      uiSound.playButtonPop();
      this.showToast('Đã kích hoạt Không Quảng Cáo (Demo VNĐ)!');
    });

    this.element.querySelectorAll('[data-shop-skin]').forEach((b) => {
      b.addEventListener('click', () => {
        uiSound.playButtonPop();
        const id = b.getAttribute('data-shop-skin')!;
        if (metaManager.getState().ownedSkins.includes(id)) {
          metaManager.setActiveSkin(id);
        } else if (metaManager.buySkin(id)) {
          metaManager.setActiveSkin(id);
          this.showToast('Mở khóa & trang bị Skin thành công!');
        } else {
          this.showToast('Chưa đủ Xu / Đá quý để mua Skin này!');
        }
      });
    });

    this.element.querySelectorAll('[data-chest]').forEach((b) => {
      b.addEventListener('click', () => {
        uiSound.playButtonPop();
        const ch = HERO_CHESTS.find((x) => x.id === b.getAttribute('data-chest'));
        if (!ch) return;
        const res = openHeroChestPack(ch.gems, ch.cards, ch.coins);
        if (res) {
          this.lastChest = res;
          this.render();
        } else {
          this.showToast('Không đủ Đá quý!');
        }
      });
    });

    this.element.querySelectorAll('[data-buy-gempack]').forEach((b) => {
      b.addEventListener('click', () => {
        uiSound.playButtonPop();
        const amt = Number(b.getAttribute('data-buy-gempack') || '0');
        buyGemBundleVnd(amt);
        this.showToast(`Đã nạp +${amt} Đá quý!`);
      });
    });

    this.element.querySelectorAll('[data-coin-cost]').forEach((b) => {
      b.addEventListener('click', () => {
        uiSound.playButtonPop();
        const cost = Number(b.getAttribute('data-coin-cost') || '0');
        const gain = Number(b.getAttribute('data-coin-gain') || '0');
        if (buyCoinBundle(cost, gain)) this.showToast(`Đã đổi +${gain.toLocaleString('vi-VN')} Xu!`);
        else this.showToast('Không đủ Đá quý!');
      });
    });

    this.element.querySelector('#btn-close-shop-chest')?.addEventListener('click', () => {
      this.lastChest = null;
      this.render();
    });
  }

  public destroy(): void {
    this.unsubscribeMeta?.();
    this.element.remove();
  }
}
