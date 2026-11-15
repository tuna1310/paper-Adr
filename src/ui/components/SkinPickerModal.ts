import skinsData from '../../meta/data/skins.json';
import { metaManager } from '../../meta/MetaManager';
import { coinSvg, gemSvg, skinCubeSvg } from '../svgIcons';

export interface SkinEntry {
  id: string;
  name: string;
  rarity: string;
  color: string;
  secondaryColor?: string;
  pattern?: string;
  isFree?: boolean;
  priceCoins?: number;
  priceGems?: number;
  priceVnd?: number;
}

const RARITY_LABELS: Record<string, string> = {
  common: 'Phổ biến',
  rare: 'Hiếm',
  epic: 'Sử thi',
  legendary: 'Huyền thoại',
};

export class SkinPickerModal {
  private overlay: HTMLElement | null = null;
  private filterMode: 'all' | 'owned' = 'all';
  private currentIndex = 0;
  private onChanged?: () => void;

  public open(parentEl: HTMLElement, onChanged?: () => void): void {
    this.close();
    this.onChanged = onChanged;
    const list = this.getFilteredSkins();
    const activeId = metaManager.getState().activeSkinId;
    const found = list.findIndex((s) => s.id === activeId);
    this.currentIndex = found >= 0 ? found : 0;

    const modal = document.createElement('div');
    modal.className = 'skin-picker-overlay ui-watermark-bg';
    this.overlay = modal;
    parentEl.appendChild(modal);
    this.render();
  }

  public close(): void {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
  }

  private getFilteredSkins(): SkinEntry[] {
    const all = skinsData.skins as SkinEntry[];
    if (this.filterMode === 'owned') {
      const owned = new Set(metaManager.getState().ownedSkins);
      return all.filter((s) => owned.has(s.id));
    }
    return all;
  }

  private render(): void {
    if (!this.overlay) return;
    const list = this.getFilteredSkins();
    if (list.length === 0) return;
    this.currentIndex = ((this.currentIndex % list.length) + list.length) % list.length;

    const skin = list[this.currentIndex];
    const state = metaManager.getState();
    const isOwned = state.ownedSkins.includes(skin.id);
    const isActive = state.activeSkinId === skin.id;
    const rarityVi = RARITY_LABELS[skin.rarity] ?? 'Cổ điển';

    this.overlay.innerHTML = `
      <div class="skin-modal-topbar">
        <div class="skin-modal-filter-pills">
          <button class="skin-filter-pill ${this.filterMode === 'all' ? 'active' : ''}" data-filter="all">Tất cả (${skinsData.skins.length})</button>
          <button class="skin-filter-pill ${this.filterMode === 'owned' ? 'active' : ''}" data-filter="owned">Đã sở hữu (${state.ownedSkins.length})</button>
        </div>
        <div class="skin-rarity-header">
          <span class="skin-rarity-tag rarity-${skin.rarity}">${rarityVi}</span>
          <h2 class="skin-modal-title">${skin.name}</h2>
          <div class="skin-modal-index">${this.currentIndex + 1} / ${list.length}</div>
        </div>
      </div>

      <div class="skin-stage-wrap">
        <button class="skin-nav-arrow ui-btn-3d" id="skin-prev-btn" aria-label="Trước">‹</button>

        <div class="skin-pedestal-stage">
          <div class="skin-spotlight-glow" style="background: radial-gradient(circle, ${skin.color}44 0%, rgba(255,255,255,0) 70%);"></div>
          <div class="skin-pedestal-trail" style="background: linear-gradient(135deg, ${skin.color}, ${skin.secondaryColor ?? skin.color});"></div>
          <div class="skin-pedestal-disc"></div>
          <div class="skin-character-hero ${isOwned ? '' : 'locked-preview'}">
            ${skinCubeSvg(skin.color, skin.secondaryColor ?? '#FFFFFF', skin.pattern ?? 'solid', 124)}
          </div>
          ${isActive ? `<div class="skin-equipped-check">✓</div>` : ''}
        </div>

        <button class="skin-nav-arrow ui-btn-3d" id="skin-next-btn" aria-label="Sau">›</button>
      </div>

      <div class="skin-modal-actions">
        ${this.renderActionButton(skin, isOwned, isActive)}
        <button class="skin-modal-close-btn ui-btn-3d" id="skin-modal-close" aria-label="Đóng">✕</button>
      </div>
    `;

    this.bindEvents(skin, isOwned, isActive);
  }

  private renderActionButton(skin: SkinEntry, isOwned: boolean, isActive: boolean): string {
    if (isActive) {
      return `<button class="skin-use-btn equipped" disabled>✓ Đang dùng</button>`;
    }
    if (isOwned) {
      return `<button class="skin-use-btn ready ui-btn-3d" id="skin-action-btn">Dùng ngay</button>`;
    }
    if (skin.isFree || (skin.priceCoins !== undefined && skin.priceCoins === 0)) {
      return `<button class="skin-use-btn free ui-btn-3d" id="skin-action-btn">Nhận Miễn phí</button>`;
    }
    if (skin.priceVnd && skin.priceVnd > 0) {
      const formatted = skin.priceVnd.toLocaleString('vi-VN') + 'đ';
      return `<button class="skin-use-btn vnd ui-btn-3d" id="skin-action-btn">Mua ${formatted}</button>`;
    }
    if (skin.priceGems && skin.priceGems > 0) {
      return `<button class="skin-use-btn gems ui-btn-3d" id="skin-action-btn">${gemSvg(18)} Mua ${skin.priceGems}</button>`;
    }
    const coins = skin.priceCoins ?? 500;
    return `<button class="skin-use-btn coins ui-btn-3d" id="skin-action-btn">${coinSvg(18)} Mua ${coins.toLocaleString('vi-VN')}</button>`;
  }

  private bindEvents(skin: SkinEntry, isOwned: boolean, isActive: boolean): void {
    if (!this.overlay) return;

    this.overlay.querySelectorAll('.skin-filter-pill').forEach((btn) => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-filter') as 'all' | 'owned';
        if (mode && mode !== this.filterMode) {
          this.filterMode = mode;
          this.currentIndex = 0;
          this.render();
        }
      });
    });

    this.overlay.querySelector('#skin-prev-btn')?.addEventListener('click', () => {
      this.currentIndex -= 1;
      this.render();
    });
    this.overlay.querySelector('#skin-next-btn')?.addEventListener('click', () => {
      this.currentIndex += 1;
      this.render();
    });

    this.overlay.querySelector('#skin-modal-close')?.addEventListener('click', () => this.close());

    this.overlay.querySelector('#skin-action-btn')?.addEventListener('click', () => {
      if (isActive) return;
      if (isOwned) {
        metaManager.setActiveSkin(skin.id);
        this.onChanged?.();
        this.render();
        return;
      }
      const ok = metaManager.buySkin(skin.id);
      if (ok) {
        metaManager.setActiveSkin(skin.id);
        this.onChanged?.();
        this.render();
      } else {
        const btn = this.overlay?.querySelector('#skin-action-btn') as HTMLElement | null;
        if (btn) {
          btn.textContent = 'Không đủ tiền!';
          setTimeout(() => this.render(), 900);
        }
      }
    });
  }
}
