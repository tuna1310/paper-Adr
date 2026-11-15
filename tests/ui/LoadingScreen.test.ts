import { describe, it, expect, vi, afterEach } from 'vitest';
import { LoadingScreen } from '../../src/ui/screens/LoadingScreen';

function installStubDom(drawnTexts: string[]) {
  const noop = vi.fn();
  const grad = { addColorStop: vi.fn() };
  const fakeCtx = {
    clearRect: noop,
    fillRect: noop,
    beginPath: noop,
    closePath: noop,
    moveTo: noop,
    lineTo: noop,
    quadraticCurveTo: noop,
    arc: noop,
    ellipse: noop,
    roundRect: noop,
    fill: noop,
    stroke: noop,
    save: noop,
    restore: noop,
    translate: noop,
    rotate: noop,
    setTransform: noop,
    createLinearGradient: vi.fn(() => grad),
    createRadialGradient: vi.fn(() => grad),
    strokeText: vi.fn(),
    fillText: vi.fn((txt: string) => drawnTexts.push(String(txt))),
    fillStyle: '#000',
    strokeStyle: '#000',
    lineWidth: 1,
    globalAlpha: 1,
    font: '12px sans-serif',
    textAlign: 'center',
    textBaseline: 'middle',
    lineJoin: 'round',
    lineCap: 'round',
    shadowColor: 'transparent',
    shadowBlur: 0,
  };

  function makeEl(tag: string) {
    const children: any[] = [];
    const attrs = new Map<string, string>();
    const el: any = {
      tagName: tag.toUpperCase(),
      className: '',
      classList: { add: vi.fn() },
      width: 390,
      height: 844,
      setAttribute: (k: string, v: string) => attrs.set(k, v),
      getAttribute: (k: string) => attrs.get(k) ?? null,
      appendChild: (c: any) => { children.push(c); return c; },
      remove: vi.fn(),
      getBoundingClientRect: () => ({ width: 390, height: 844 }),
      getContext: () => fakeCtx,
      children,
    };
    return el;
  }

  const rootContainer = makeEl('div');
  (globalThis as any).document = { createElement: (tag: string) => makeEl(tag) };
  return { rootContainer, fakeCtx };
}

describe('LoadingScreen (Screen 1)', () => {
  const prevDoc = (globalThis as any).document;

  afterEach(() => {
    (globalThis as any).document = prevDoc;
  });

  it('draws Paper Territory header, sky gradients, mascots, slope and cleans up on destroy', () => {
    const drawnTexts: string[] = [];
    const { rootContainer, fakeCtx } = installStubDom(drawnTexts);

    const screen = new LoadingScreen(rootContainer, { durationMs: Number.POSITIVE_INFINITY });
    expect(rootContainer.children).toHaveLength(1);
    expect(drawnTexts).toContain('PAPER STUDIO');
    expect(drawnTexts).toContain('PAPER');
    expect(drawnTexts).toContain('TERRITORY');
    expect(fakeCtx.arc).toHaveBeenCalled();

    screen.destroy();
    expect(screen.getElement().remove).toHaveBeenCalledTimes(1);
  });
});
