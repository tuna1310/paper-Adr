import { describe, it, expect } from 'vitest';
import {
  coinSvg, gemSvg, gearSvg, avatarCubeSvg,
  shopAwningSvg, heroesSvg, playIconSvg, missionsSvg,
  globeSvg, chestSvg, lockSvg, starSvg, flagNicaraguaSvg, carChibiSvg
} from '../../src/ui/svgIcons';

describe('SVG Icons Builder', () => {
  it('generates valid SVG strings for all icon components', () => {
    const icons = [
      coinSvg(), gemSvg(), gearSvg(), avatarCubeSvg(),
      shopAwningSvg(), heroesSvg(), playIconSvg(), missionsSvg(),
      globeSvg(), chestSvg(), lockSvg(), starSvg(), flagNicaraguaSvg(), carChibiSvg()
    ];

    icons.forEach(svgStr => {
      expect(svgStr).toBeTruthy();
      expect(svgStr.startsWith('<svg')).toBe(true);
      expect(svgStr.endsWith('</svg>')).toBe(true);
      expect(svgStr).toContain('viewBox');
    });
  });
});

