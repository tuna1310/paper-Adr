import countriesData from '../../meta/data/countries.json';
import skinsData from '../../meta/data/skins.json';
import { metaManager } from '../../meta/MetaManager';
import { countryFlagSvg, skinCubeSvg } from '../svgIcons';
import { uiSound } from '../uiSound';
import { WorldMapCanvas } from '../components/WorldMapCanvas';
import { getContinentSlot, MapContinentZone, MapCountryNode } from '../components/WorldMapData';

export class WorldScreen {
  private element: HTMLElement;
  private onStartGame?: () => void;
  private mapCanvas: WorldMapCanvas | null = null;
  private selectedCountryId: string;
  private selectedContinentId: string;
  private unsubscribeMeta: (() => void) | null = null;

  constructor(onStartGame?: () => void) {
    this.onStartGame = onStartGame;
    this.element = document.createElement('div');
    this.element.className = 'world-screen';

    const state = metaManager.getState();
    this.selectedCountryId = state.activeCountryId;
    const cDef = countriesData.countries.find((c) => c.id === state.activeCountryId);
    this.selectedContinentId = cDef ? cDef.continentId : countriesData.continents[0].id;

    this.render(true);
    this.unsubscribeMeta = metaManager.subscribe(() => this.refreshOverlay());
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  private buildMapModels(): { continents: MapContinentZone[]; countries: MapCountryNode[]; skinColor: string } {
    const state = metaManager.getState();
    const activeSkin = skinsData.skins.find((s) => s.id === state.activeSkinId) ?? skinsData.skins[0];
    const countriesByContinent = new Map<string, any[]>();
    for (const c of countriesData.countries as any[]) {
      const list = countriesByContinent.get(c.continentId) ?? [];
      list.push(c);
      countriesByContinent.set(c.continentId, list);
    }

    const continents: MapContinentZone[] = [];
    const countries: MapCountryNode[] = [];

    (countriesData.continents as any[]).forEach((cont, idx) => {
      const slot = getContinentSlot(cont.id, idx);
      const prog = metaManager.getContinentProgress(cont.id);
      const unlocked = idx === 0 || prog.completed > 0 || (cont as any).unlockedByDefault === true || true;
      continents.push({
        id: cont.id,
        name: cont.name,
        completed: prog.completed,
        total: prog.total,
        unlocked,
        cx: slot.cx,
        cy: slot.cy,
        polygon: slot.poly,
      });

      const list = countriesByContinent.get(cont.id) ?? [];
      list.forEach((c, cIdx) => {
        const offset = slot.offsets[cIdx % slot.offsets.length];
        const cs = (state.countries as Record<string, any>)[c.id] ?? { percent: 0, completed: false };
        const pct = cs.percent ?? 0;
        const comp = Boolean(cs.completed || pct >= 100);
        countries.push({
          id: c.id,
          name: c.name,
          continentId: cont.id,
          code: (c.code ?? c.id.slice(0, 2)).toUpperCase(),
          flagColors: c.flagColors ?? ['#0067C6', '#FFFFFF', '#0067C6'],
          percent: pct,
          completed: comp,
          unlocked,
          x: slot.cx + offset[0],
          y: slot.cy + offset[1],
        });
      });
    });

    return { continents, countries, skinColor: activeSkin.color };
  }

  private render(centerInitial = false): void {
    const { continents, countries, skinColor } = this.buildMapModels();
    const activeSkin = skinsData.skins.find((s) => s.id === metaManager.getState().activeSkinId) ?? skinsData.skins[0];
    const totalDone = countries.filter((c) => c.completed).length;

    this.element.innerHTML = `
      <div class="world-map-stage" id="world-map-stage"></div>

      <div class="world-hud-top">
        <div class="world-unlock-pill" id="world-unlock-pill"></div>
        <div class="world-total-badge">🌍 ${totalDone}/${countries.length}</div>
      </div>

      <div class="world-continent-chips" id="world-continent-chips">
        ${continents
          .map(
            (z) => `
          <button class="world-chip-btn ui-btn-3d ${z.id === this.selectedContinentId ? 'active' : ''}" data-cont-id="${z.id}">
            <span>${z.name}</span>
            <span class="chip-count">${z.completed}/${z.total}</span>
          </button>`
          )
          .join('')}
      </div>

      <button class="world-offscreen-pin ui-btn-3d" id="world-offscreen-pin" style="display:none;">
        ${skinCubeSvg(activeSkin.color, (activeSkin as any).secondaryColor ?? '#FFFFFF', (activeSkin as any).pattern ?? 'solid', 32)}
      </button>

      <div class="world-bottom-dock" id="world-bottom-dock"></div>
    `;

    const stage = this.element.querySelector('#world-map-stage') as HTMLElement;
    const pinBtn = this.element.querySelector('#world-offscreen-pin') as HTMLElement;

    this.mapCanvas = new WorldMapCanvas(
      stage,
      (node) => {
        uiSound.playButtonPop();
        this.selectedCountryId = node.id;
        this.selectedContinentId = node.continentId;
        metaManager.setActiveCountry(node.id);
        this.refreshOverlay();
      },
      (visible, dirX, dirY) => {
        if (!pinBtn) return;
        pinBtn.style.display = visible ? 'flex' : 'none';
        if (visible) {
          const angle = Math.atan2(dirY, dirX);
          const tx = Math.cos(angle) * 110;
          const ty = Math.sin(angle) * 150;
          pinBtn.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px))`;
        }
      }
    );

    pinBtn?.addEventListener('click', () => {
      uiSound.playButtonPop();
      this.mapCanvas?.centerOnCountry(metaManager.getState().activeCountryId);
    });

    this.element.querySelectorAll('.world-chip-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        uiSound.playButtonPop();
        const contId = btn.getAttribute('data-cont-id')!;
        this.selectedContinentId = contId;
        const firstInCont = (countriesData.countries as any[]).find((c) => c.continentId === contId);
        if (firstInCont) this.selectedCountryId = firstInCont.id;
        this.mapCanvas?.centerOnContinent(contId);
        this.refreshOverlay();
      });
    });

    requestAnimationFrame(() => this.mapCanvas?.resize());
    this.mapCanvas.setData(continents, countries, metaManager.getState().activeCountryId, this.selectedCountryId, skinColor, centerInitial);
    this.refreshOverlay();
  }

  private refreshOverlay(): void {
    const { continents, countries, skinColor } = this.buildMapModels();
    const state = metaManager.getState();
    const selCont = continents.find((z) => z.id === this.selectedContinentId) ?? continents[0];
    const selCountry = countries.find((c) => c.id === this.selectedCountryId) ?? countries[0];
    const contCountries = countries.filter((c) => c.continentId === selCont.id);

    this.element.querySelectorAll('.world-chip-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-cont-id') === selCont.id);
    });

    const pill = this.element.querySelector('#world-unlock-pill');
    if (pill) {
      pill.innerHTML = `
        <div class="unlock-kicker">Mở khóa</div>
        <div class="unlock-cont-name">${selCont.name.toUpperCase()}</div>
        <div class="unlock-row">
          <span class="unlock-frac">${selCont.completed}/${selCont.total}</span>
          ${countryFlagSvg(selCountry.code, 28, 19)}
        </div>
      `;
    }

    const dock = this.element.querySelector('#world-bottom-dock');
    if (dock && selCountry) {
      dock.innerHTML = `
        <div class="world-mini-countries">
          ${contCountries
            .map(
              (c) => `
            <button class="world-mini-flag ${c.id === selCountry.id ? 'selected' : ''} ${c.completed ? 'done' : ''}" data-cid="${c.id}">
              ${countryFlagSvg(c.code, 22, 15)}
              <span>${c.name}</span>
            </button>`
            )
            .join('')}
        </div>
        <div class="world-country-card">
          <div class="wcc-left">
            ${countryFlagSvg(selCountry.code, 42, 28)}
            <div class="wcc-info">
              <div class="wcc-name">${selCountry.name}</div>
              <div class="wcc-sub">${selCountry.completed ? '✓ Đã chinh phục 100%' : `Tiến độ: ${selCountry.percent}% • ${selCont.name}`}</div>
            </div>
          </div>
          <button class="wcc-play-btn ui-btn-3d" id="btn-world-select-play">▶ Chơi ngay</button>
        </div>
      `;

      dock.querySelectorAll('.world-mini-flag').forEach((b) => {
        b.addEventListener('click', () => {
          uiSound.playButtonPop();
          this.selectedCountryId = b.getAttribute('data-cid')!;
          metaManager.setActiveCountry(this.selectedCountryId);
          this.mapCanvas?.centerOnCountry(this.selectedCountryId);
          this.refreshOverlay();
        });
      });

      dock.querySelector('#btn-world-select-play')?.addEventListener('click', () => {
        uiSound.playButtonPop();
        metaManager.setActiveCountry(selCountry.id);
        this.onStartGame?.();
      });
    }

    this.mapCanvas?.setData(continents, countries, state.activeCountryId, this.selectedCountryId, skinColor, false);
  }

  public destroy(): void {
    this.unsubscribeMeta?.();
    this.mapCanvas?.destroy();
    this.element.remove();
  }
}
