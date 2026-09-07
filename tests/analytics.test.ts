import { describe, it, expect } from 'vitest';
import {
  formatRupiah,
  calculateKpiGrowth,
  resolveDateRange,
  generateSvgPath,
} from '../src/lib/intelligence/analytics';

describe('formatRupiah', () => {
  it('formats whole numbers properly into Indonesian Rupiah format', () => {
    expect(formatRupiah(250000)).toBe('Rp250.000');
    expect(formatRupiah(1500000)).toBe('Rp1.500.000');
    expect(formatRupiah(0)).toBe('Rp0');
  });

  it('rounds decimal numbers before formatting', () => {
    expect(formatRupiah(250000.4)).toBe('Rp250.000');
    expect(formatRupiah(250000.6)).toBe('Rp250.001');
  });
});

describe('calculateKpiGrowth', () => {
  it('handles previous = 0 cases', () => {
    const positiveGrowth = calculateKpiGrowth(100, 0);
    expect(positiveGrowth).toEqual({
      value: 100,
      label: '+100%',
      positive: true,
    });

    const flatGrowth = calculateKpiGrowth(0, 0);
    expect(flatGrowth).toEqual({
      value: 0,
      label: '0%',
      positive: true,
    });
  });

  it('computes positive growth with 1 decimal precision', () => {
    const result = calculateKpiGrowth(120, 100);
    expect(result).toEqual({
      value: 20,
      label: '+20%',
      positive: true,
    });

    const decimalResult = calculateKpiGrowth(115.4, 100);
    expect(decimalResult).toEqual({
      value: 15.4,
      label: '+15.4%',
      positive: true,
    });
  });

  it('computes negative growth correctly', () => {
    const result = calculateKpiGrowth(84.6, 100);
    expect(result).toEqual({
      value: -15.4,
      label: '-15.4%',
      positive: false,
    });
  });
});

describe('resolveDateRange', () => {
  const fixedNow = new Date('2026-09-07T10:00:00Z');

  it('resolves 7d preset correctly with identical length for previous', () => {
    const { current, previous } = resolveDateRange('7d', fixedNow);
    const currentDuration = current.end.getTime() - current.start.getTime();
    const prevDuration = previous.end.getTime() - previous.start.getTime();
    expect(currentDuration).toBe(prevDuration);
    expect(current.start.getTime()).toBeGreaterThan(previous.start.getTime());
  });

  it('resolves 30d preset correctly with identical length for previous', () => {
    const { current, previous } = resolveDateRange('30d', fixedNow);
    const currentDuration = current.end.getTime() - current.start.getTime();
    const prevDuration = previous.end.getTime() - previous.start.getTime();
    expect(currentDuration).toBe(prevDuration);
    expect(current.start.getTime()).toBeGreaterThan(previous.start.getTime());
  });

  it('resolves this_month preset', () => {
    const { current, previous } = resolveDateRange('this_month', fixedNow);
    expect(current.start.getUTCDate()).toBe(1);
    expect(previous.start.getUTCDate()).toBe(1);
    expect(current.start.getTime()).toBeGreaterThan(previous.start.getTime());
  });

  it('resolves last_month preset', () => {
    const { current, previous } = resolveDateRange('last_month', fixedNow);
    expect(current.start.getUTCDate()).toBe(1);
    expect(previous.start.getUTCDate()).toBe(1);
    expect(current.start.getTime()).toBeGreaterThan(previous.start.getTime());
  });
});

describe('generateSvgPath', () => {
  it('returns empty path for empty points array', () => {
    const result = generateSvgPath([]);
    expect(result).toEqual({ pathD: '', areaD: 'Z' });
  });

  it('generates correct path and enclosed area for points', () => {
    const points = [
      { x: 0, y: 50 },
      { x: 50, y: 20 },
      { x: 100, y: 80 },
    ];
    const result = generateSvgPath(points);
    expect(result.pathD).toBe('M 0 50 L 50 20 L 100 80');
    expect(result.areaD).toBe('M 0 50 L 50 20 L 100 80 L 100 100 L 0 100 Z');
  });
});
