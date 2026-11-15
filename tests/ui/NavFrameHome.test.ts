import { describe, it, expect, vi, afterEach } from 'vitest';
import { NavFrame } from '../../src/ui/NavFrame';
import { HomeScreen } from '../../src/ui/screens/HomeScreen';
import { FloatingIsland3D } from '../../src/ui/components/FloatingIsland3D';
import { metaManager } from '../../src/meta/MetaManager';

interface StubElement {
  tagName: string;
  id: string;
  className: string;
  classList: {
    add: (cls: string) => void;
    remove: (cls: string) => void;
    contains: (cls: string) => boolean;
  };
  style: Record<string, string>;
  attrs: Map<string, string>;
  children: StubElement[];
  listeners: Record<string, Array<(e?: any) => void>>;
  _innerHTML: string;
  _textContent: string;
  innerHTML: string;
  textContent: string;
  width: number;
  height: number;
  onclick: ((e?: any) => void) | null;
  setAttribute: (k: string, v: string) => void;
  getAttribute: (k: string) => string | null;
  appendChild: (c: StubElement) => StubElement;
  addEventListener: (ev: string, fn: (e?: any) => void) => void;
  click: () => void;
  remove: () => void;
  getBoundingClientRect: () => { width: number; height: number };
  getContext: () => any;
  querySelector: (sel: string) => StubElement | null;
  querySelectorAll: (sel: string) => StubElement[];
}

function createFakeCtx() {
  const noop = vi.fn();
  const grad = { addColorStop: vi.fn() };
  return {
    clearRect: noop,
    fillRect: noop,
    beginPath: noop,
    closePath: noop,
    moveTo: noop,
    lineTo: noop,
    bezierCurveTo: noop,
    quadraticCurveTo: noop,
    arc: noop,
    ellipse: noop,
    roundRect: noop,
    fill: vi.fn(),
    stroke: vi.fn(),
    clip: noop,
    save: noop,
    restore: noop,
    translate: noop,
    scale: noop,
    rotate: noop,
    setTransform: noop,
    createLinearGradient: vi.fn(() => grad),
    createRadialGradient: vi.fn(() => grad),
    fillStyle: '#000',
    strokeStyle: '#000',
    lineWidth: 1,
    lineCap: 'round',
    shadowColor: 'transparent',
    shadowBlur: 0,
  };
}

function parseTagAttributes(attrText: string, el: StubElement): void {
  const regex = /([\w-]+)="([^"]*)"/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(attrText)) !== null) {
    el.setAttribute(m[1], m[2]);
  }
}

function buildStubSubtree(html: string, makeEl: (tag: string) => StubElement): StubElement[] {
  const roots: StubElement[] = [];
  const stack: StubElement[] = [];
  const tokenRegex = /<(\/?)([a-zA-Z0-9-]+)([^>]*)>|([^<]+)/g;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(html)) !== null) {
    if (match[4]) {
      const text = match[4].replace(/\s+/g, ' ');
      if (stack.length > 0 && text.trim().length > 0) {
        stack[stack.length - 1]._textContent += text.trim();
      }
      continue;
    }

    const isClose = match[1] === '/';
    const tag = match[2].toLowerCase();
    const attrs = match[3] || '';
    const selfClose = attrs.trim().endsWith('/') || ['path', 'rect', 'circle', 'ellipse', 'polygon'].includes(tag);

    if (isClose) {
      if (stack.length > 0) stack.pop();
      continue;
    }

    const el = makeEl(tag);
    parseTagAttributes(attrs.replace(/\/$/, ''), el);
    if (stack.length > 0) {
      stack[stack.length - 1].appendChild(el);
    } else {
      roots.push(el);
    }
    if (!selfClose) {
      stack.push(el);
    }
  }
  return roots;
}

function matchesSelector(el: StubElement, selector: string): boolean {
  if (selector.startsWith('#')) {
    return el.id === selector.slice(1);
  }
  if (selector.startsWith('.')) {
    const cls = selector.slice(1);
    return el.classList.contains(cls);
  }
  if (selector.startsWith('[') && selector.endsWith(']')) {
    const inner = selector.slice(1, -1);
    if (inner.includes('=')) {
      const [k, rawV] = inner.split('=');
      return el.getAttribute(k) === rawV.replace(/^["']|["']$/g, '');
    }
    return el.getAttribute(inner) !== null;
  }
  return el.tagName.toLowerCase() === selector.toLowerCase();
}

function collectMatches(node: StubElement, selector: string, out: StubElement[]): void {
  for (const child of node.children) {
    if (matchesSelector(child, selector)) {
      out.push(child);
    }
    collectMatches(child, selector, out);
  }
}

function installRichStubDom() {
  const fakeCtx = createFakeCtx();

  function makeEl(tag: string): StubElement {
    const el: StubElement = {
      tagName: tag.toUpperCase(),
      id: '',
      className: '',
      style: {},
      attrs: new Map<string, string>(),
      children: [],
      listeners: {},
      _innerHTML: '',
      _textContent: '',
      width: 360,
      height: 260,
      onclick: null,
      classList: {
        add(cls: string) {
          const parts = new Set((el.className || '').split(/\s+/).filter(Boolean));
          parts.add(cls);
          el.className = Array.from(parts).join(' ');
        },
        remove(cls: string) {
          const parts = new Set((el.className || '').split(/\s+/).filter(Boolean));
          parts.delete(cls);
          el.className = Array.from(parts).join(' ');
        },
        contains(cls: string) {
          return (el.className || '').split(/\s+/).includes(cls);
        },
      },
      get innerHTML() {
        return el._innerHTML;
      },
      set innerHTML(val: string) {
        el._innerHTML = val;
        el._textContent = '';
        el.children = val ? buildStubSubtree(val, makeEl) : [];
      },
      get textContent() {
        return [el._textContent, ...el.children.map((c) => c.textContent)].filter(Boolean).join(' ').trim();
      },
      set textContent(val: string) {
        el._textContent = val;
        el.children = [];
      },
      setAttribute(k: string, v: string) {
        el.attrs.set(k, v);
        if (k === 'id') el.id = v;
        if (k === 'class') el.className = v;
      },
      getAttribute(k: string) {
        if (k === 'id' && el.id) return el.id;
        if (k === 'class' && el.className) return el.className;
        return el.attrs.get(k) ?? null;
      },
      appendChild(c: StubElement) {
        el.children.push(c);
        return c;
      },
      addEventListener(ev: string, fn: (e?: any) => void) {
        if (!el.listeners[ev]) el.listeners[ev] = [];
        el.listeners[ev].push(fn);
      },
      click() {
        const eventObj = { target: el, stopPropagation: vi.fn() };
        (el.listeners.click ?? []).forEach((fn) => fn(eventObj));
        if (typeof el.onclick === 'function') el.onclick(eventObj);
      },
      remove: vi.fn(),
      getBoundingClientRect: () => ({ width: 390, height: 260 }),
      getContext: () => fakeCtx,
      querySelector(sel: string) {
        const all = el.querySelectorAll(sel);
        return all[0] ?? null;
      },
      querySelectorAll(sel: string) {
        const parts = sel.trim().split(/\s+/);
        if (parts.length === 1) {
          const out: StubElement[] = [];
          collectMatches(el, parts[0], out);
          return out;
        }
        let current: StubElement[] = [el];
        for (const p of parts) {
          const next: StubElement[] = [];
          for (const node of current) {
            collectMatches(node, p, next);
          }
          current = next;
        }
        return current;
      },
    };
    return el;
  }

  const root = makeEl('div');
  (globalThis as any).document = {
    createElement: (tag: string) => makeEl(tag),
    querySelector: (sel: string) => root.querySelector(sel),
  };
  (globalThis as any).window = {
    devicePixelRatio: 1,
    setTimeout: globalThis.setTimeout,
    clearTimeout: globalThis.clearTimeout,
  };
  (globalThis as any).Path2D = class {
    moveTo() {}
    bezierCurveTo() {}
    lineTo() {}
    closePath() {}
  };
  (globalThis as any).requestAnimationFrame = vi.fn(() => 1);
  (globalThis as any).cancelAnimationFrame = vi.fn();

  return { root, fakeCtx };
}

describe('NavFrame & HomeScreen (Màn 2)', () => {
  const prevDoc = (globalThis as any).document;
  const prevWin = (globalThis as any).window;
  const prevPath2D = (globalThis as any).Path2D;
  const prevRaf = (globalThis as any).requestAnimationFrame;
  const prevCaf = (globalThis as any).cancelAnimationFrame;

  afterEach(() => {
    (globalThis as any).document = prevDoc;
    (globalThis as any).window = prevWin;
    (globalThis as any).Path2D = prevPath2D;
    (globalThis as any).requestAnimationFrame = prevRaf;
    (globalThis as any).cancelAnimationFrame = prevCaf;
  });

  it('renders clean Màn 2 Home DOM without cluttered elements and wires Play & Toasts', () => {
    installRichStubDom();
    const onPlay = vi.fn();
    const onToast = vi.fn();
    const home = new HomeScreen(onPlay, { onShowToast: onToast });
    const el = home.getElement();

    // Absent legacy clutter elements (moved to subtabs/removed per video A 0038.png)
    expect(el.querySelector('.sub-event-left')).toBeNull();
    expect(el.querySelector('.bubble-x5-box')).toBeNull();
    expect(el.querySelector('.home-skin-quick-pill')).toBeNull();

    // Required Màn 2 video elements present
    expect(el.querySelector('#btn-daily-skin')).not.toBeNull();
    expect(el.querySelector('#btn-no-ads')).not.toBeNull();
    expect(el.querySelector('#btn-coming-soon')).not.toBeNull();
    expect(el.querySelector('#btn-rank')).not.toBeNull();
    expect(el.querySelector('#btn-play')).not.toBeNull();
    expect(el.querySelector('.home-world-watermark')).not.toBeNull();

    // Rank tier matches player trophies (1090 -> ĐỒNG II)
    expect(el.querySelector('#btn-rank')!.textContent).toContain('ĐỒNG II');

    (el.querySelector('#btn-coming-soon') as HTMLElement).click();
    expect(onToast).toHaveBeenCalledWith('Chế độ mới sắp ra mắt!');

    (el.querySelector('#btn-play') as HTMLElement).click();
    expect(onPlay).toHaveBeenCalledTimes(1);

    home.destroy();
  });

  it('FloatingIsland3D draws skin-colored territory wedge, glowing trail and hero voxel', () => {
    const { root, fakeCtx } = installRichStubDom();
    const island = new FloatingIsland3D(root as unknown as HTMLElement, 74);
    island.setSkinAppearance('#E91E63', '#FFFFFF');
    island.draw(120);

    expect(fakeCtx.fill).toHaveBeenCalled();
    expect(fakeCtx.stroke).toHaveBeenCalled();

    island.destroy();
  });

  it('NavFrame manages Settings modal, Login toast and Home center button across tabs', () => {
    const { root } = installRichStubDom();
    const onStartGame = vi.fn();
    const nav = new NavFrame(root as unknown as HTMLElement, onStartGame);

    // Home state: center house button hidden
    const homeCenterBtn = root.querySelector('#btn-nav-home')!;
    expect(homeCenterBtn.style.display).toBe('none');

    // Login toast shows player name
    nav.showLoginToast('Player');
    const toast = root.querySelector('#nav-login-toast')!;
    expect(toast.style.display).toBe('inline-flex');
    expect(toast.textContent).toBe('Đã đăng nhập với tên Player');

    // Settings gear opens modal & toggles meta setting
    const prevSound = metaManager.getState().settings.soundEnabled;
    root.querySelector('#btn-settings')!.click();
    const modal = root.querySelector('#nav-settings-modal')!;
    expect(modal.style.display).toBe('flex');
    const soundBtn = modal.querySelector('[data-setting-key="soundEnabled"]')!;
    soundBtn.click();
    expect(metaManager.getState().settings.soundEnabled).toBe(!prevSound);
    metaManager.updateSettings({ soundEnabled: prevSound });

    // Switching away from home reveals center house button and highlights active tab
    nav.switchTab('shop');
    expect(nav.getActiveTab()).toBe('shop');
    expect(homeCenterBtn.style.display).toBe('inline-flex');

    // Switching back to home hides center house button
    nav.switchTab('home');
    expect(nav.getActiveTab()).toBe('home');
    expect(homeCenterBtn.style.display).toBe('none');

    nav.destroy();
  });
});
