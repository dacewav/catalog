// ═══ DACEWAV.STORE — Utility Tests ═══
import { describe, it, expect } from 'vitest';
import { hexRgba, formatTime, safeJSON, debounce } from '../src/utils.js';

describe('hexRgba', () => {
  it('converts hex to rgba', () => {
    expect(hexRgba('#ff0000', 0.5)).toBe('rgba(255,0,0,0.5)');
    expect(hexRgba('#00ff00', 1)).toBe('rgba(0,255,0,1)');
    expect(hexRgba('#0000ff', 0)).toBe('rgba(0,0,255,0)');
  });

  it('handles missing # prefix', () => {
    expect(hexRgba('ff0000', 0.5)).toBe('rgba(255,0,0,0.5)');
  });

  it('handles null/undefined by falling back to #000', () => {
    // null/undefined → '#000' fallback → strips '#' → '000' (len 3 < 6) → returns as-is
    expect(hexRgba(null, 0.5)).toBe('000');
    expect(hexRgba(undefined, 1)).toBe('000');
  });

  it('returns short hex as-is (no conversion)', () => {
    expect(hexRgba('#fff', 0.5)).toBe('fff');
    expect(hexRgba('#abc', 0.5)).toBe('abc');
  });
});

describe('formatTime', () => {
  it('formats seconds to M:SS', () => {
    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(59)).toBe('0:59');
    expect(formatTime(60)).toBe('1:00');
    expect(formatTime(125)).toBe('2:05');
    expect(formatTime(3599)).toBe('59:59');
  });
});

describe('safeJSON', () => {
  it('parses valid JSON', () => {
    expect(safeJSON('{"a":1}')).toEqual({ a: 1 });
    expect(safeJSON('[1,2,3]')).toEqual([1, 2, 3]);
    expect(safeJSON('"hello"')).toBe('hello');
    expect(safeJSON('42')).toBe(42);
    expect(safeJSON('null')).toBe(null);
  });

  it('returns fallback for invalid JSON', () => {
    expect(safeJSON('not json', [])).toEqual([]);
    expect(safeJSON('{broken}', null)).toBe(null);
    expect(safeJSON('')).toBe(null);
  });

  it('uses custom fallback', () => {
    expect(safeJSON('bad', 'default')).toBe('default');
    expect(safeJSON('bad', 42)).toBe(42);
  });
});

describe('debounce', () => {
  it('delays execution', async () => {
    let count = 0;
    const fn = debounce(() => { count++; }, 50);
    fn(); fn(); fn();
    expect(count).toBe(0);
    await new Promise((r) => setTimeout(r, 100));
    expect(count).toBe(1);
  });
});
