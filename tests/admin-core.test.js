// ═══ Tests: Admin — computeGlowCSS & collectTheme ═══
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockVal, mockChecked, mockHexRgba } = vi.hoisted(() => {
  const mockVal = vi.fn(() => '');
  const mockChecked = vi.fn(() => false);
  const mockHexRgba = vi.fn((color, alpha) => {
    if (/^rgba/.test(color)) return color;
    const r = parseInt(color.slice(1,3), 16), g2 = parseInt(color.slice(3,5), 16), b = parseInt(color.slice(5,7), 16);
    return 'rgba(' + r + ',' + g2 + ',' + b + ',' + alpha + ')';
  });
  return { mockVal, mockChecked, mockHexRgba };
});

vi.mock('../src/admin/helpers.js', () => ({
  g: vi.fn(() => null),
  val: mockVal,
  setVal: vi.fn(),
  checked: mockChecked,
  setChecked: vi.fn(),
  hexRgba: mockHexRgba,
  hexFromRgba: vi.fn(c => c),
  rgbaFromHex: vi.fn(c => c),
  loadFont: vi.fn(),
  showToast: vi.fn(),
  showSaving: vi.fn(),
  fmt: vi.fn(v => v),
  sv: vi.fn(),
  resetSlider: vi.fn(),
  toggleCard: vi.fn(),
  setAutoSaveRef: vi.fn(),
}));

vi.mock('../src/admin/state.js', () => ({
  db: null, setDb: vi.fn(),
  T: {}, setT: vi.fn(),
  siteSettings: {}, customEmojis: [], floatingEls: {},
  _undoStack: [], _redoStack: [], _lastSavedTheme: '', _undoDebounce: null,
  _iframeReady: false, setIframeReady: vi.fn(),
  _ldTheme: false, _ldSettings: false, _ldBeats: false,
  setLdTheme: vi.fn(), setLdSettings: vi.fn(), setLdBeats: vi.fn(),
  _changeLog: [], _lastChangeValues: {},
  ppCtx: null, ppParts: null, ppAnim: null,
  setPpCtx: vi.fn(), setPpParts: vi.fn(), setPpAnim: vi.fn(),
  _gradStops: [], setGradStops: vi.fn(),
  _gradRerenderTimer: null, setGradRerenderTimer: vi.fn(),
}));

vi.mock('../src/admin/config.js', () => ({
  ANIMS: {},
}));

vi.mock('../src/admin/colors.js', () => ({
  loadColorValues: vi.fn(),
  setColorRefs: vi.fn(),
}));

import { computeGlowCSS, collectTheme } from '../src/admin/core.js';

describe('computeGlowCSS', () => {
  it('text-shadow type returns textShadow property', () => {
    const result = computeGlowCSS('text-shadow', 20, 0, 1, '#dc2626');
    expect(result.textShadow).toContain('20px');
    expect(result.boxShadow).toBe('none');
    expect(result.filter).toBe('none');
  });

  it('box-shadow type returns boxShadow property', () => {
    const result = computeGlowCSS('box-shadow', 15, 5, 0.8, '#00ff00');
    expect(result.boxShadow).toContain('15px');
    expect(result.boxShadow).toContain('5px');
    expect(result.textShadow).toBe('none');
  });

  it('drop-shadow type uses filter', () => {
    const result = computeGlowCSS('drop-shadow', 10, 0, 1, '#0000ff');
    expect(result.filter).toContain('drop-shadow');
    expect(result.filter).toContain('10px');
    expect(result.textShadow).toBe('none');
    expect(result.boxShadow).toBe('none');
  });

  it('neon-blur uses multiple text-shadows with scaled blur', () => {
    const result = computeGlowCSS('neon-blur', 30, 0, 1, '#ff00ff');
    expect(result.textShadow).toContain(',');
    expect(result.textShadow).toContain('9px'); // 30 * 0.3
  });

  it('neon-sign uses text and box shadows', () => {
    const result = computeGlowCSS('neon-sign', 20, 4, 1, '#ff0000');
    expect(result.textShadow).toContain(',');
    expect(result.boxShadow).not.toBe('none');
  });

  it('outer-glow uses box shadow with doubled spread', () => {
    const result = computeGlowCSS('outer-glow', 25, 5, 0.5, '#ff6600');
    expect(result.textShadow).toBe('none');
    expect(result.boxShadow).toContain('25px');
    expect(result.boxShadow).toContain('10px'); // spread * 2
  });

  it('inner-glow uses inset box shadow', () => {
    const result = computeGlowCSS('inner-glow', 20, 3, 1, '#333333');
    expect(result.textShadow).toBe('none');
    expect(result.boxShadow).toContain('inset');
  });

  it('unknown type falls back to text-shadow', () => {
    const result = computeGlowCSS('unknown', 10, 0, 1, '#ffffff');
    expect(result.textShadow).toContain('10px');
    expect(result.boxShadow).toBe('none');
  });

  it('applies alpha via hexRgba', () => {
    const result = computeGlowCSS('text-shadow', 10, 0, 0.5, '#ff0000');
    expect(result.textShadow).toContain('rgba(255,0,0,0.5)');
  });
});

describe('collectTheme', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockVal.mockReturnValue('');
    mockChecked.mockReturnValue(false);
  });

  it('returns object with expected top-level keys', () => {
    const theme = collectTheme();
    expect(theme).toHaveProperty('bg');
    expect(theme).toHaveProperty('accent');
    expect(theme).toHaveProperty('glowActive');
    expect(theme).toHaveProperty('fontDisplay');
    expect(theme).toHaveProperty('fontBody');
    expect(theme).toHaveProperty('particlesOn');
    expect(theme).toHaveProperty('bannerText');
    expect(theme).toHaveProperty('layout');
    expect(theme).toHaveProperty('animLogo');
    expect(theme).toHaveProperty('animTitle');
    expect(theme).toHaveProperty('animPlayer');
    expect(theme).toHaveProperty('animCards');
    expect(theme).toHaveProperty('animButtons');
    expect(theme).toHaveProperty('animWaveform');
  });

  it('returns defaults when val returns empty', () => {
    const theme = collectTheme();
    expect(theme.bg).toBe('#060404');
    expect(theme.accent).toBe('#dc2626');
    expect(theme.fontDisplay).toBe('Syne');
    expect(theme.fontBody).toBe('DM Mono');
    expect(theme.fontSize).toBe(14);
  });

  it('uses val values when provided', () => {
    mockVal.mockImplementation(id => {
      if (id === 'tc-bg-h') return '#111111';
      if (id === 'tc-accent-h') return '#00ff00';
      return '';
    });
    const theme = collectTheme();
    expect(theme.bg).toBe('#111111');
    expect(theme.accent).toBe('#00ff00');
  });

  it('collects layout sub-object with defaults', () => {
    const theme = collectTheme();
    expect(theme.layout).toEqual({
      heroMarginTop: 7,
      playerBottom: 0,
      logoOffsetX: 0,
    });
  });

  it('collects particles config', () => {
    mockChecked.mockImplementation(id => id === 'p-on');
    const theme = collectTheme();
    expect(theme.particlesOn).toBe(true);
    expect(theme.particlesColor).toBe('#dc2626');
    expect(theme.particlesCount).toBe(40);
  });
});
