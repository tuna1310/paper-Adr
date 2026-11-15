import heroesData from '../../meta/data/heroes.json';
import skinsData from '../../meta/data/skins.json';
import { metaManager } from '../../meta/MetaManager';
import { lockPadlockSvg, skinCubeSvg } from '../svgIcons';
import { uiSound } from '../uiSound';

const SKILL_ICON: Record<string, string> = {
  dash: '⚡',
  shield: '🛡️',
  magnet: '🧲',
  pulse: '💥',
  wide_trail: '🔥',
  giant_aura: '👑',
};

export class HeroesScreen {
  private element: HTMLElement;
  private unsubscribeMeta: (() => void) | null = null;
  private activeDetailId: string | null = null;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'heroes-screen ui-watermark-bg';
    this.render();
    this.unsubscribeMeta = metaManager.subscribe(() => this.render());
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  private render(): void {
    const state = metaManager.getState();
    const heroes = heroesData.heroes as any[];
    const skins = skinsData.skins as any[];

    const groups: Array<{ key: string; title: string; items: any[] }> = [
      { key: 'common', title: 'Phổ biến', items: heroes.filter((h) => h.rarity === 'common') },
      { key: 'rare', title: 'Hiếm', items: heroes.filter((h) => h.rarity === 'rare') },
      { key: 'epic', title: 'Sử thi', items: heroes.filter((h) => h.rarity === 'epic') },
      { key: 'legendary', title: 'Huyền thoại', items: heroes.filter((h) => h.rarity === 'legendary') },
    ];

    const ownedSkinsSet = new Set(state.ownedSkins);
    const ownedClassicCount = skins.filter((s) => ownedSkinsSet.has(s.id)).length;
    const selectedHero = heroes.find((h) => h.id === this.activeDetailId);

    this.element.innerHTML = `
      <div class="heroes-scroll-area" id="heroes-scroll-area">
        ${groups
          .map((grp) => {
            const ownedCount = grp.items.filter((h) => Boolean((state.heroes as any)[h.id]?.unlocked)).length;
            return `
              <section class="hero-section">
                <div class="hero-section-header">
                  <span>${grp.title}</span>
                  <span class="hero-count-pill">${ownedCount}/${grp.items.length}</span>
                </div>
                <div class="hero-grid-3">
                  ${grp.items.map((h) => this.renderHeroCard(h, (state.heroes as any)[h.id], state.activeHeroId)).join('')}
                </div>
              </section>
            `;
          })
          .join('')}

        <section class="hero-section" id="classic-skins-anchor">
          <div class="hero-section-header">
            <span>Cổ điển</span>
            <span class="hero-count-pill">${ownedClassicCount}/${skins.length}</span>
          </div>
          <div class="hero-grid-3">
            ${skins.map((s) => this.renderSkinCard(s, ownedSkinsSet.has(s.id), state.activeSkinId === s.id)).join('')}
          </div>
        </section>
      </div>

      <button class="heroes-jump-fab ui-btn-3d" id="btn-heroes-jump" aria-label="Cuộn nhanh">⇅</button>

      ${selectedHero ? this.renderHeroDetailModal(selectedHero, (state.heroes as any)[selectedHero.id], state.activeHeroId) : ''}
    `;

    this.bindEvents();
  }

  private renderHeroCard(hero: any, hState: any, activeHeroId: string): string {
    const unlocked = Boolean(hState?.unlocked);
    const level = hState?.level ?? 1;
    const cards = hState?.cards ?? 0;
    const req = hero.cardsRequiredPerLevel[Math.min(level - 1, hero.cardsRequiredPerLevel.length - 1)] ?? 10;
    const pct = Math.min(100, Math.round((cards / req) * 100));
    const isEquipped = activeHeroId === hero.id;
    const icon = SKILL_ICON[hero.skill?.id] ?? '⚡';

    if (!unlocked) {
      return `
        <button class="hero-tile locked ui-btn-3d" data-hero-id="${hero.id}">
          <div class="tile-class-badge">${icon}</div>
          <div class="tile-lock-wrap">
            ${lockPadlockSvg(30)}
            <span class="tile-lock-label">Bị khóa</span>
          </div>
          <div class="tile-milestone-pill">Mở Rương Anh Hùng</div>
        </button>
      `;
    }

    return `
      <button class="hero-tile unlocked rarity-bg-${hero.rarity} ${isEquipped ? 'equipped' : ''} ui-btn-3d" data-hero-id="${hero.id}">
        <div class="tile-class-badge">${icon}</div>
        ${isEquipped ? `<div class="tile-new-badge">ĐANG DÙNG</div>` : cards >= req ? `<div class="tile-new-badge upgrade">NÂNG CẤP!</div>` : ''}
        <div class="tile-art-center">
          ${skinCubeSvg(hero.color, '#FFFFFF', 'face', 62)}
        </div>
        <div class="tile-level-tag">Cấp ${level}</div>
        <div class="tile-card-bar">
          <div class="tile-card-fill" style="width:${pct}%"></div>
          <span>${cards}/${req}</span>
        </div>
      </button>
    `;
  }

  private renderSkinCard(skin: any, unlocked: boolean, isEquipped: boolean): string {
    if (!unlocked) {
      const priceHint = skin.isFree || skin.priceCoins === 0
        ? 'Miễn phí'
        : skin.priceVnd
        ? `${skin.priceVnd.toLocaleString('vi-VN')}đ`
        : `${skin.priceCoins ?? 500} Xu`;
      return `
        <button class="hero-tile locked skin-tile ui-btn-3d" data-skin-id="${skin.id}">
          <div class="tile-art-dim">${skinCubeSvg(skin.color, skin.secondaryColor ?? '#FFFFFF', skin.pattern ?? 'solid', 46)}</div>
          <div class="tile-lock-overlay">${lockPadlockSvg(26)}</div>
          <div class="tile-milestone-pill">${priceHint}</div>
        </button>
      `;
    }

    return `
      <button class="hero-tile unlocked skin-tile ${isEquipped ? 'equipped' : ''} ui-btn-3d" data-skin-id="${skin.id}">
        ${isEquipped ? `<div class="tile-new-badge">✓</div>` : ''}
        <div class="tile-art-center">
          ${skinCubeSvg(skin.color, skin.secondaryColor ?? '#FFFFFF', skin.pattern ?? 'solid', 58)}
        </div>
        <div class="tile-skin-name">${skin.name}</div>
      </button>
    `;
  }

  private renderHeroDetailModal(hero: any, hState: any, activeHeroId: string): string {
    const unlocked = Boolean(hState?.unlocked);
    const level = hState?.level ?? 1;
    const cards = hState?.cards ?? 0;
    const req = hero.cardsRequiredPerLevel[Math.min(level - 1, hero.cardsRequiredPerLevel.length - 1)] ?? 10;
    const coinCost = hero.coinsPerLevel[Math.min(level - 1, hero.coinsPerLevel.length - 1)] ?? 100;
    const isEquipped = activeHeroId === hero.id;
    const canUpgrade = unlocked && cards >= req && level < hero.maxLevel;

    return `
      <div class="hero-modal-backdrop" id="hero-modal-backdrop">
        <div class="hero-modal-card">
          <button class="hero-modal-close" id="btn-hero-modal-close">✕</button>
          <div class="hm-top">
            ${skinCubeSvg(hero.color, '#FFFFFF', 'face', 74)}
            <div>
              <div class="hm-rarity">${hero.rarityLabel} • Cấp ${level}</div>
              <h3 class="hm-name">${hero.name}</h3>
            </div>
          </div>
          <div class="hm-skill-box">
            <strong>Kỹ năng: ${hero.skill.name}</strong>
            <p>${hero.skill.desc}</p>
          </div>
          <div class="hm-actions">
            ${
              unlocked
                ? `<button class="hm-btn equip ui-btn-3d" id="btn-hero-equip" ${isEquipped ? 'disabled' : ''}>${
                    isEquipped ? 'Đang chọn ✓' : 'Sử dụng'
                  }</button>
                  <button class="hm-btn upgrade ui-btn-3d" id="btn-hero-upgrade" ${canUpgrade ? '' : 'disabled'}>
                    Nâng cấp (${coinCost} Xu)
                  </button>`
                : `<div class="hm-lock-note">Mở Rương Anh Hùng tại Cửa hàng để sưu tập thẻ ${hero.name}.</div>`
            }
          </div>
        </div>
      </div>
    `;
  }

  private bindEvents(): void {
    this.element.querySelectorAll('.hero-tile[data-hero-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        uiSound.playButtonPop();
        this.activeDetailId = btn.getAttribute('data-hero-id');
        this.render();
      });
    });

    this.element.querySelectorAll('.hero-tile[data-skin-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        uiSound.playButtonPop();
        const skinId = btn.getAttribute('data-skin-id')!;
        const state = metaManager.getState();
        if (state.ownedSkins.includes(skinId)) {
          metaManager.setActiveSkin(skinId);
        } else {
          const ok = metaManager.buySkin(skinId);
          if (ok) metaManager.setActiveSkin(skinId);
        }
      });
    });

    const scrollArea = this.element.querySelector('#heroes-scroll-area') as HTMLElement | null;
    const classicAnchor = this.element.querySelector('#classic-skins-anchor') as HTMLElement | null;
    this.element.querySelector('#btn-heroes-jump')?.addEventListener('click', () => {
      uiSound.playButtonPop();
      if (!scrollArea) return;
      if (scrollArea.scrollTop < 120 && classicAnchor) {
        scrollArea.scrollTo({ top: classicAnchor.offsetTop - 10, behavior: 'smooth' });
      } else {
        scrollArea.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });

    this.element.querySelector('#btn-hero-modal-close')?.addEventListener('click', () => {
      this.activeDetailId = null;
      this.render();
    });

    this.element.querySelector('#btn-hero-equip')?.addEventListener('click', () => {
      if (this.activeDetailId) metaManager.setActiveHero(this.activeDetailId);
    });

    this.element.querySelector('#btn-hero-upgrade')?.addEventListener('click', () => {
      if (this.activeDetailId) metaManager.upgradeHero(this.activeDetailId);
    });
  }

  public destroy(): void {
    this.unsubscribeMeta?.();
    this.element.remove();
  }
}
