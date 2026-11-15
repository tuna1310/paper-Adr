import { MapContinentZone, MapCountryNode } from './WorldMapData';

export class WorldMapCanvas {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width = 360;
  private height = 520;
  private dpr = 1;
  private panX = -620;
  private panY = -60;
  private worldW = 1600;
  private worldH = 920;

  private continents: MapContinentZone[] = [];
  private countries: MapCountryNode[] = [];
  private activeCountryId = '';
  private selectedCountryId = '';
  private skinColor = '#FF4757';

  private isDragging = false;
  private dragMoved = false;
  private startClientX = 0;
  private startClientY = 0;
  private startPanX = 0;
  private startPanY = 0;

  private onSelectCountry: (node: MapCountryNode) => void;
  private onOffscreenPinState?: (visible: boolean, dirX: number, dirY: number) => void;

  constructor(
    container: HTMLElement,
    onSelectCountry: (node: MapCountryNode) => void,
    onOffscreenPinState?: (visible: boolean, dirX: number, dirY: number) => void
  ) {
    this.onSelectCountry = onSelectCountry;
    this.onOffscreenPinState = onOffscreenPinState;

    this.canvas = document.createElement('canvas');
    this.canvas.className = 'world-map-canvas';
    container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d')!;

    this.resize();
    this.bindPointer();
  }

  public resize(): void {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    this.width = Math.max(300, parent.clientWidth || 360);
    this.height = Math.max(320, parent.clientHeight || 520);
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.clampPan();
    this.draw();
  }

  public setData(
    continents: MapContinentZone[],
    countries: MapCountryNode[],
    activeCountryId: string,
    selectedCountryId: string,
    skinColor: string,
    centerOnActive = false
  ): void {
    this.continents = continents;
    this.countries = countries;
    this.activeCountryId = activeCountryId;
    this.selectedCountryId = selectedCountryId;
    this.skinColor = skinColor || '#FF4757';
    if (centerOnActive) {
      this.centerOnCountry(selectedCountryId || activeCountryId);
    } else {
      this.draw();
    }
  }

  public centerOnCountry(countryId: string): void {
    const node = this.countries.find((c) => c.id === countryId);
    if (!node) return;
    this.panX = this.width / 2 - node.x;
    this.panY = this.height * 0.42 - node.y;
    this.clampPan();
    this.draw();
  }

  public centerOnContinent(continentId: string): void {
    const zone = this.continents.find((z) => z.id === continentId);
    if (!zone) return;
    this.panX = this.width / 2 - zone.cx;
    this.panY = this.height * 0.44 - zone.cy;
    this.clampPan();
    this.draw();
  }

  private clampPan(): void {
    const minX = Math.min(0, this.width - this.worldW);
    const minY = Math.min(0, this.height - this.worldH);
    this.panX = Math.max(minX - 60, Math.min(60, this.panX));
    this.panY = Math.max(minY - 60, Math.min(80, this.panY));
  }

  private bindPointer(): void {
    this.canvas.addEventListener('pointerdown', (e) => {
      this.isDragging = true;
      this.dragMoved = false;
      this.startClientX = e.clientX;
      this.startClientY = e.clientY;
      this.startPanX = this.panX;
      this.startPanY = this.panY;
      this.canvas.setPointerCapture(e.pointerId);
    });

    this.canvas.addEventListener('pointermove', (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.startClientX;
      const dy = e.clientY - this.startClientY;
      if (Math.hypot(dx, dy) > 6) this.dragMoved = true;
      this.panX = this.startPanX + dx;
      this.panY = this.startPanY + dy;
      this.clampPan();
      this.draw();
    });

    this.canvas.addEventListener('pointerup', (e) => {
      if (!this.isDragging) return;
      this.isDragging = false;
      if (!this.dragMoved) {
        const rect = this.canvas.getBoundingClientRect();
        const wx = e.clientX - rect.left - this.panX;
        const wy = e.clientY - rect.top - this.panY;
        this.handleTap(wx, wy);
      }
    });
  }

  private handleTap(wx: number, wy: number): void {
    let best: MapCountryNode | null = null;
    let bestDist = 48;
    for (const c of this.countries) {
      const d = Math.hypot(c.x - wx, c.y - wy);
      if (d < bestDist) {
        bestDist = d;
        best = c;
      }
    }
    if (best) this.onSelectCountry(best);
  }

  public draw(): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.scale(this.dpr, this.dpr);

    const bg = ctx.createLinearGradient(0, 0, 0, this.height);
    bg.addColorStop(0, '#0088EE');
    bg.addColorStop(1, '#089EFF');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.save();
    ctx.translate(this.panX, this.panY);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= this.worldW; x += 120) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, this.worldH); ctx.stroke();
    }
    for (let y = 0; y <= this.worldH; y += 120) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(this.worldW, y); ctx.stroke();
    }

    for (const zone of this.continents) this.drawContinentPolygon(ctx, zone);
    for (const c of this.countries) this.drawCountryPin(ctx, c);

    const activeNode = this.countries.find((c) => c.id === this.activeCountryId);
    if (activeNode) {
      this.drawActivePlayerOnMap(ctx, activeNode);
      const sx = activeNode.x + this.panX;
      const sy = activeNode.y + this.panY;
      const off = sx < 24 || sx > this.width - 24 || sy < 60 || sy > this.height - 90;
      this.onOffscreenPinState?.(off, sx - this.width / 2, sy - this.height / 2);
    }

    ctx.restore();
    ctx.restore();
  }

  private drawContinentPolygon(ctx: CanvasRenderingContext2D, zone: MapContinentZone): void {
    const isComplete = zone.completed >= zone.total && zone.total > 0;
    const pts = zone.polygon;
    if (pts.length < 3) return;

    const tracePoly = (dy: number) => {
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1] + dy);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1] + dy);
      ctx.closePath();
    };

    tracePoly(12);
    ctx.fillStyle = !zone.unlocked ? 'rgba(0, 82, 168, 0.35)' : isComplete ? '#14863C' : '#C5DAE8';
    ctx.fill();

    tracePoly(0);
    ctx.fillStyle = !zone.unlocked ? 'rgba(0, 108, 204, 0.36)' : isComplete ? '#1DB954' : '#FFFFFF';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = !zone.unlocked ? 'rgba(255,255,255,0.16)' : isComplete ? '#169644' : '#DCE8F2';
    ctx.stroke();

    ctx.fillStyle = !zone.unlocked ? 'rgba(255,255,255,0.5)' : isComplete ? '#FFFFFF' : '#244A73';
    ctx.font = '800 15px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${zone.name} (${zone.completed}/${zone.total})`, zone.cx, zone.cy + 10);
  }

  private drawCountryPin(ctx: CanvasRenderingContext2D, c: MapCountryNode): void {
    const isSel = c.id === this.selectedCountryId;
    if (c.completed) {
      ctx.beginPath();
      ctx.arc(c.x, c.y, 26, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(29, 185, 84, 0.28)';
      ctx.fill();
    }

    const w = isSel ? 28 : 22;
    const h = isSel ? 19 : 15;
    const x = c.x - w / 2;
    const y = c.y - h / 2;

    if (isSel) {
      ctx.beginPath();
      ctx.arc(c.x, c.y, 20, 0, Math.PI * 2);
      ctx.strokeStyle = '#FFD200';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 3);
    ctx.clip();
    ctx.fillStyle = c.flagColors[0] || '#1E90FF';
    ctx.fillRect(x, y, w, h / 3 + 1);
    ctx.fillStyle = c.flagColors[1] || '#FFFFFF';
    ctx.fillRect(x, y + h / 3, w, h / 3 + 1);
    ctx.fillStyle = c.flagColors[2] || c.flagColors[0] || '#1E90FF';
    ctx.fillRect(x, y + (h * 2) / 3, w, h / 3 + 1);
    ctx.restore();

    ctx.strokeStyle = c.completed ? '#1DB954' : '#FFFFFF';
    ctx.lineWidth = isSel ? 2.4 : 1.5;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 3);
    ctx.stroke();

    if (c.completed) {
      ctx.fillStyle = '#1DB954';
      ctx.beginPath();
      ctx.arc(x + w - 1, y + 1, 5.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawActivePlayerOnMap(ctx: CanvasRenderingContext2D, node: MapCountryNode): void {
    ctx.beginPath();
    ctx.moveTo(node.x - 18, node.y + 16);
    ctx.quadraticCurveTo(node.x + 8, node.y + 18, node.x, node.y - 16);
    ctx.strokeStyle = this.skinColor;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.fillStyle = this.skinColor;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(node.x - 10, node.y - 30, 20, 20, 5);
    ctx.fill();
    ctx.stroke();
  }

  public destroy(): void {
    this.canvas.remove();
  }
}
