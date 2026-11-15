import { describe, it, expect } from 'vitest';
import {
  coinSvg, gemSvg, gearSvg, avatarCubeSvg,
  shopAwningSvg, heroesSvg, playIconSvg, missionsSvg,
  globeSvg, chestSvg, lockSvg, starSvg, flagNicaraguaSvg, carChibiSvg,
  hangerSvg, worldContinentsWatermarkSvg, homeHouseSvg, countryFlagSvg,
} from '../../src/ui/svgIcons';

describe('SVG Icons Builder', () => {
  it('generates valid SVG strings for all icon components including Màn 2 assets', () => {
    const icons = [
      coinSvg(), gemSvg(), gearSvg(), avatarCubeSvg(),
      shopAwningSvg(), heroesSvg(), playIconSvg(), missionsSvg(),
      globeSvg(), chestSvg(), lockSvg(), starSvg(), flagNicaraguaSvg(), carChibiSvg(),
      hangerSvg(), worldContinentsWatermarkSvg(), homeHouseSvg(),
      countryFlagSvg('PA'), countryFlagSvg('NI'), countryFlagSvg('VN'),
    ];

    icons.forEach(svgStr => {
      expect(svgStr).toBeTruthy();
      expect(svgStr.startsWith('<svg')).toBe(true);
      expect(svgStr.endsWith('</svg>')).toBe(true);
      expect(svgStr).toContain('viewBox');
    });
  });
});

