import missionsData from '../../meta/data/missions.json';
import { metaManager } from '../../meta/MetaManager';
import { ChestRewardResult } from '../../meta/types';
import { chestSvg, coinSvg, gemSvg, rerollArrowsSvg, starSvg } from '../svgIcons';
import { uiSound } from '../uiSound';

export class MissionsScreen {
  private element: HTMLElement;
  private activeTab: 'daily' | 'lifetime' = 'daily';
  private lastChestReward: ChestRewardResult | null = null;
  private unsubscribeMeta: (() => void) | null = null;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'missions-screen ui-watermark-bg';
    this.render();
    this.unsubscribeMeta = metaManager.subscribe(() => this.render());
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  private formatResetCountdown(): string {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const msLeft = Math.max(0, midnight.getTime() - now.getTime());
    const hrs = Math.floor(msLeft / 3600000);
    const mins = Math.floor((msLeft % 3600000) / 60000);
    return `${hrs}g ${mins}p`;
  }

  private render(): void {
    const state = metaManager.getState();
    const dailyList = state.missions.daily;
    const pool = missionsData.dailyPool as any[];
    const completedDaily = dailyList.filter((m) => {
      const def = pool.find((d) => d.id === m.id);
      return m.completed || (def && m.progress >= def.target);
    }).length;
    const allDailyFinished = dailyList.length >= 3 && completedDaily >= 3;
    const canOpenChest = allDailyFinished && !state.missions.dailyChestClaimed;
    const countdown = this.formatResetCountdown();

    this.element.innerHTML = `
      <div class="missions-top-stage">
        <div class="missions-counter-pill">
          <span class="mc-icon">📋</span>
          <span>${completedDaily}/3</span>
        </div>

        <div class="missions-pedestal-wrap">
          <div class="pedestal-beam"></div>
          <div class="pedestal-showcase ${canOpenChest ? 'ready-bounce' : ''}" id="btn-pedestal-chest">
            ${chestSvg(86)}
            <div class="pedestal-ruby-tag">
              ${state.missions.dailyChestClaimed ? '✓ Đã mở' : canOpenChest ? 'MỞ RƯƠNG!' : '80% Vàng • 10% Ruby • 10% Skin'}
            </div>
          </div>
          <div class="pedestal-pink-disc"></div>
        </div>
      </div>

      <div class="missions-white-sheet">
        <div class="missions-tab-capsule">
          <button class="mtab-btn ${this.activeTab === 'daily' ? 'active' : ''}" data-mtab="daily">Hàng ngày</button>
          <button class="mtab-btn ${this.activeTab === 'lifetime' ? 'active' : ''}" data-mtab="lifetime">Trọn đời</button>
        </div>

        <div class="missions-timer-row">
          ${this.activeTab === 'daily' ? `Nhiệm vụ mới sau ${countdown}` : 'Thử thách thành tựu vĩnh viễn'}
        </div>

        <div class="missions-cards-scroll">
          ${this.activeTab === 'daily' ? this.renderDailyCards() : this.renderLifetimeCards()}
        </div>
      </div>

      ${this.lastChestReward ? this.renderChestRewardPopup(this.lastChestReward) : ''}
    `;

    this.bindEvents(canOpenChest);
  }

  private renderDailyCards(): string {
    const state = metaManager.getState();
    const pool = missionsData.dailyPool as any[];
    return state.missions.daily
      .map((m) => {
        const def = pool.find((d) => d.id === m.id) ?? { title: m.id, target: 5, rewardCoins: 250, rewardType: 'coins' };
        const pct = Math.min(100, Math.round((m.progress / def.target) * 100));
        const ready = (m.completed || m.progress >= def.target) && !m.claimed;
        const rewardAmt = def.rewardGems ?? def.rewardCoins ?? 250;
        const rewardIcon = def.rewardType === 'gems' ? gemSvg(22) : coinSvg(22);

        return `
          <div class="mission-white-card ${m.claimed ? 'done' : ''}">
            <button class="mission-reroll-circle ui-btn-3d" data-reroll="${m.id}" ${m.claimed ? 'disabled' : ''} title="Đổi nhiệm vụ">
              ${rerollArrowsSvg(20)}
            </button>

            <div class="mission-mid-col">
              <div class="mission-card-title">${def.title}</div>
              <div class="mission-bar-capsule">
                <div class="mission-bar-fill" style="width:${pct}%"></div>
                <span>${Math.min(m.progress, def.target)}/${def.target}</span>
              </div>
            </div>

            <div class="mission-reward-col">
              ${
                ready
                  ? `<button class="mission-claim-pill ui-btn-3d" data-claim-daily="${m.id}">Nhận +${rewardAmt}</button>`
                  : m.claimed
                  ? `<span class="mission-done-check">✓</span>`
                  : `<div class="mission-reward-badge">
                      ${rewardIcon}
                      <span>${rewardAmt}</span>
                    </div>`
              }
            </div>
          </div>
        `;
      })
      .join('');
  }

  private renderLifetimeCards(): string {
    const state = metaManager.getState();
    const milestones = missionsData.lifetimeMilestones as any[];
    return milestones
      .map((def) => {
        const lm = state.missions.lifetime.find((x) => x.id === def.id) ?? { progress: 0, completed: false, claimed: false };
        const pct = Math.min(100, Math.round((lm.progress / def.target) * 100));
        const ready = (lm.completed || lm.progress >= def.target) && !lm.claimed;
        const rewardAmt = def.rewardStars ?? def.rewardCoins ?? 500;
        return `
          <div class="mission-white-card ${lm.claimed ? 'done' : ''}">
            <div class="mission-trophy-circle">${starSvg(22)}</div>
            <div class="mission-mid-col">
              <div class="mission-card-title">${def.title}</div>
              <div class="mission-bar-capsule">
                <div class="mission-bar-fill" style="width:${pct}%"></div>
                <span>${Math.min(lm.progress, def.target)}/${def.target}</span>
              </div>
            </div>
            <div class="mission-reward-col">
              ${
                ready
                  ? `<button class="mission-claim-pill ui-btn-3d" data-claim-life="${def.id}">Nhận +${rewardAmt}</button>`
                  : lm.claimed
                  ? `<span class="mission-done-check">✓</span>`
                  : `<div class="mission-reward-badge">
                      ${starSvg(22)}
                      <span>${rewardAmt}</span>
                    </div>`
              }
            </div>
          </div>
        `;
      })
      .join('');
  }

  private renderChestRewardPopup(res: ChestRewardResult): string {
    const icon = res.type === 'gold' ? coinSvg(64) : res.type === 'ruby' ? gemSvg(64) : chestSvg(64);
    const title = res.label || (res.type === 'gold' ? `+${res.amount} Xu Vàng!` : res.type === 'ruby' ? `+${res.amount} Ruby!` : `Skin: ${res.skinName}!`);
    return `
      <div class="hero-modal-backdrop" id="chest-reward-backdrop">
        <div class="chest-reward-dialog">
          <div class="crd-burst">✨ RƯƠNG KHO BÁU ✨</div>
          <div class="crd-icon">${icon}</div>
          <h3 class="crd-title">${title}</h3>
          <p class="crd-sub">Tỉ lệ rơi: 80% Vàng • 10% Ruby • 10% Skin hiếm</p>
          <button class="hm-btn equip ui-btn-3d" id="btn-close-chest-modal">Tuyệt vời!</button>
        </div>
      </div>
    `;
  }

  private bindEvents(canOpenChest: boolean): void {
    this.element.querySelectorAll('.mtab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        uiSound.playButtonPop();
        const t = btn.getAttribute('data-mtab') as 'daily' | 'lifetime';
        if (t) {
          this.activeTab = t;
          this.render();
        }
      });
    });

    this.element.querySelector('#btn-pedestal-chest')?.addEventListener('click', () => {
      if (!canOpenChest) return;
      uiSound.playButtonPop();
      const reward = metaManager.openDailyChest();
      if (reward) this.lastChestReward = reward;
      this.render();
    });

    this.element.querySelectorAll('[data-reroll]').forEach((btn) => {
      btn.addEventListener('click', () => {
        uiSound.playButtonPop();
        metaManager.rerollDailyMission(btn.getAttribute('data-reroll')!);
      });
    });

    this.element.querySelectorAll('[data-claim-daily]').forEach((btn) => {
      btn.addEventListener('click', () => {
        uiSound.playButtonPop();
        metaManager.claimDailyMission(btn.getAttribute('data-claim-daily')!);
      });
    });

    this.element.querySelectorAll('[data-claim-life]').forEach((btn) => {
      btn.addEventListener('click', () => {
        uiSound.playButtonPop();
        metaManager.claimLifetimeMission(btn.getAttribute('data-claim-life')!);
      });
    });

    this.element.querySelector('#btn-close-chest-modal')?.addEventListener('click', () => {
      this.lastChestReward = null;
      this.render();
    });
  }

  public destroy(): void {
    this.unsubscribeMeta?.();
    this.element.remove();
  }
}
