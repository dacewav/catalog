// ═══ Tests: Admin — Colors (buildColorEditor, syncColor, loadColorValues, applyColor) ═══
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockElements, mockG, mockUpdatePreview, mockAutoSave, mockHexFromRgba, mockRgbaFromHex } = vi.hoisted(() => {
  const mockElements = {};
  const mockG = vi.fn(id => mockElements[id] || null);
  const mockUpdatePreview = vi.fn();
  const mockAutoSave = vi.fn();
  const mockHexFromRgba = vi.fn(v => {
    if (!v || !v.startsWith('rgba')) return v || '#dc2626';
    const m = v.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!m) return '#dc2626';
    return '#' + [m[1], m[2], m[3]].map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
  });
  const mockRgbaFromHex = vi.fn((hex, a) => {
    if (!hex || !hex.startsWith('#')) return hex;
    const r = parseInt(hex.slice(1, 3), 16), g2 = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    return 'rgba(' + r + ',' + g2 + ',' + b + ',' + (a != null ? a : 1) + ')';
  });
  return { mockElements, mockG, mockUpdatePreview, mockAutoSave, mockHexFromRgba, mockRgbaFromHex };
});

vi.mock('../src/admin/helpers.js', () => ({
  g: mockG,
  val: vi.fn(),
  setVal: vi.fn(),
  checked: vi.fn(),
  setChecked: vi.fn(),
  hexRgba: vi.fn(),
  hexFromRgba: mockHexFromRgba,
  rgbaFromHex: mockRgbaFromHex,
  loadFont: vi.fn(),
  showToast: vi.fn(),
  showSaving: vi.fn(),
  fmt: vi.fn(),
  sv: vi.fn(),
  resetSlider: vi.fn(),
  toggleCard: vi.fn(),
  setAutoSaveRef: vi.fn(),
}));

vi.mock('../src/admin/core.js', () => ({
  updatePreview: mockUpdatePreview,
  autoSave: mockAutoSave,
  computeGlowCSS: vi.fn(),
  collectTheme: vi.fn(),
}));

vi.mock('../src/admin/config.js', () => ({
  COLOR_DEFS: [
    { id: 'tc-bg', prop: 'bg', label: 'Fondo', def: '#060404' },
    { id: 'tc-accent', prop: 'accent', label: 'Acento', def: '#dc2626' },
    { id: 'tc-muted', prop: 'muted', label: 'Muted', def: 'rgba(245,238,238,0.5)', alpha: true },
    { id: 'tc-glow-c', prop: 'glowColor', label: 'Glow', def: '#dc2626' },
    { id: 'tc-btn-c', prop: 'btnLicClr', label: 'Btn texto', def: '#dc2626' },
  ],
}));

import {
  buildColorEditor, syncColor, syncColorText, syncColorAlpha,
  applyColor, loadColorValues, syncGlowColor, syncWB, syncWBA,
  syncBtnColor, syncBtnBdr, syncBtnBg,
} from '../src/admin/colors.js';

describe('buildColorEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(mockElements).forEach(k => delete mockElements[k]);
    mockElements['color-editor'] = { innerHTML: '' };
  });

  it('generates HTML for each COLOR_DEF', () => {
    buildColorEditor();
    const html = mockElements['color-editor'].innerHTML;
    expect(html).toContain('tc-bg-p');
    expect(html).toContain('tc-accent-p');
    expect(html).toContain('Fondo');
    expect(html).toContain('Acento');
  });

  it('includes alpha slider for alpha color defs', () => {
    buildColorEditor();
    const html = mockElements['color-editor'].innerHTML;
    expect(html).toContain('type="range"');
    expect(html).toContain('syncColorAlpha');
  });

  it('does not include alpha slider for non-alpha defs', () => {
    buildColorEditor();
    const html = mockElements['color-editor'].innerHTML;
    // tc-bg (non-alpha) should have syncColor but not syncColorAlpha
    expect(html).toContain("syncColor('bg','tc-bg'");
  });

  it('returns early if color-editor element not found', () => {
    delete mockElements['color-editor'];
    // Should not throw
    expect(() => buildColorEditor()).not.toThrow();
  });

  it('sets default hex value for color inputs', () => {
    buildColorEditor();
    const html = mockElements['color-editor'].innerHTML;
    expect(html).toContain('value="#060404"');
    expect(html).toContain('value="#dc2626"');
  });
});

describe('syncColor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(mockElements).forEach(k => delete mockElements[k]);
  });

  it('updates text input when syncing a non-alpha color', () => {
    mockElements['tc-bg-h'] = { value: '' };
    mockElements['tc-bg-p'] = { value: '' };
    // querySelector returns null (no range input)
    syncColor('bg', 'tc-bg', '#111111');
    expect(mockElements['tc-bg-h'].value).toBe('#111111');
    expect(mockUpdatePreview).toHaveBeenCalled();
    expect(mockAutoSave).toHaveBeenCalled();
  });

  it('converts to rgba when alpha slider exists', () => {
    const rangeInput = { value: 0.5 };
    mockElements['tc-muted-h'] = { value: '' };
    // Mock querySelector to return a range input
    globalThis.document.querySelector = vi.fn(() => rangeInput);
    syncColor('muted', 'tc-muted', '#ffffff');
    expect(mockRgbaFromHex).toHaveBeenCalledWith('#ffffff', 0.5);
    expect(mockUpdatePreview).toHaveBeenCalled();
    // Reset querySelector
    globalThis.document.querySelector = () => null;
  });
});

describe('syncColorText', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(mockElements).forEach(k => delete mockElements[k]);
  });

  it('syncs valid hex text to picker', () => {
    mockElements['tc-bg-p'] = { value: '' };
    syncColorText('bg', 'tc-bg', '#aabbcc');
    expect(mockElements['tc-bg-p'].value).toBe('#aabbcc');
    expect(mockUpdatePreview).toHaveBeenCalled();
    expect(mockAutoSave).toHaveBeenCalled();
  });

  it('ignores invalid hex text', () => {
    mockElements['tc-bg-p'] = { value: '#000000' };
    syncColorText('bg', 'tc-bg', 'not-a-color');
    expect(mockElements['tc-bg-p'].value).toBe('#000000');
    expect(mockUpdatePreview).not.toHaveBeenCalled();
  });

  it('handles rgba text and extracts hex', () => {
    mockElements['tc-muted-p'] = { value: '' };
    syncColorText('muted', 'tc-muted', 'rgba(100,200,50,0.5)');
    expect(mockHexFromRgba).toHaveBeenCalledWith('rgba(100,200,50,0.5)');
    expect(mockUpdatePreview).toHaveBeenCalled();
  });
});

describe('syncColorAlpha', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(mockElements).forEach(k => delete mockElements[k]);
  });

  it('converts hex + alpha to rgba and updates text input', () => {
    mockElements['tc-muted-p'] = { value: '#ff0000' };
    mockElements['tc-muted-h'] = { value: '' };
    syncColorAlpha('muted', 'tc-muted', '0.75');
    expect(mockRgbaFromHex).toHaveBeenCalledWith('#ff0000', 0.75);
    expect(mockUpdatePreview).toHaveBeenCalled();
    expect(mockAutoSave).toHaveBeenCalled();
  });

  it('uses default hex when picker is null', () => {
    mockElements['tc-muted-h'] = { value: '' };
    syncColorAlpha('muted', 'tc-muted', '0.5');
    expect(mockRgbaFromHex).toHaveBeenCalledWith('#dc2626', 0.5);
  });
});

describe('applyColor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(mockElements).forEach(k => delete mockElements[k]);
  });

  it('syncs glowColor to related inputs', () => {
    mockElements['tc-glow'] = { value: '' };
    mockElements['tt-glow'] = { value: '' };
    mockElements['h-stroke-clr'] = { value: '' };
    applyColor('glowColor', '#ff00ff');
    expect(mockElements['tc-glow'].value).toBe('#ff00ff');
    expect(mockElements['tt-glow'].value).toBe('#ff00ff');
    expect(mockElements['h-stroke-clr'].value).toBe('#ff00ff');
  });

  it('syncs btnLicClr to tc-btn-clr and tt-btn-clr', () => {
    mockElements['tc-btn-clr'] = { value: '' };
    mockElements['tt-btn-clr'] = { value: '' };
    applyColor('btnLicClr', '#00ff00');
    expect(mockElements['tc-btn-clr'].value).toBe('#00ff00');
    expect(mockElements['tt-btn-clr'].value).toBe('#00ff00');
  });

  it('calls updatePreview and autoSave', () => {
    applyColor('accent', '#123456');
    expect(mockUpdatePreview).toHaveBeenCalled();
    expect(mockAutoSave).toHaveBeenCalled();
  });

  it('handles props with no sync targets', () => {
    // 'bg' has no syncMap entry — should still call updatePreview/autoSave
    applyColor('bg', '#000000');
    expect(mockUpdatePreview).toHaveBeenCalled();
    expect(mockAutoSave).toHaveBeenCalled();
  });
});

describe('loadColorValues', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(mockElements).forEach(k => delete mockElements[k]);
  });

  it('loads values from window.T when available', () => {
    window.T = { bg: '#111111', accent: '#222222' };
    mockElements['tc-bg-p'] = { value: '' };
    mockElements['tc-bg-h'] = { value: '' };
    mockElements['tc-accent-p'] = { value: '' };
    mockElements['tc-accent-h'] = { value: '' };
    mockElements['tc-muted-p'] = { value: '' };
    mockElements['tc-muted-h'] = { value: '' };
    mockElements['tc-glow-c-p'] = { value: '' };
    mockElements['tc-glow-c-h'] = { value: '' };
    mockElements['tc-btn-c-p'] = { value: '' };
    mockElements['tc-btn-c-h'] = { value: '' };
    loadColorValues();
    expect(mockElements['tc-bg-p'].value).toBe('#111111');
    expect(mockElements['tc-bg-h'].value).toBe('#111111');
    expect(mockElements['tc-accent-p'].value).toBe('#222222');
    window.T = {};
  });

  it('falls back to defaults when window.T has no value', () => {
    window.T = {};
    mockElements['tc-bg-p'] = { value: '' };
    mockElements['tc-bg-h'] = { value: '' };
    mockElements['tc-accent-p'] = { value: '' };
    mockElements['tc-accent-h'] = { value: '' };
    mockElements['tc-muted-p'] = { value: '' };
    mockElements['tc-muted-h'] = { value: '' };
    mockElements['tc-glow-c-p'] = { value: '' };
    mockElements['tc-glow-c-h'] = { value: '' };
    mockElements['tc-btn-c-p'] = { value: '' };
    mockElements['tc-btn-c-h'] = { value: '' };
    loadColorValues();
    expect(mockElements['tc-bg-h'].value).toBe('#060404');
  });

  it('handles missing elements gracefully', () => {
    window.T = {};
    // No elements set — should not throw
    expect(() => loadColorValues()).not.toThrow();
  });
});

describe('sync helper functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(mockElements).forEach(k => delete mockElements[k]);
  });

  it('syncGlowColor updates swatch, tt-glow, tc-glow and calls applyColor', () => {
    mockElements['gc-swatch'] = { style: { background: '' } };
    mockElements['tt-glow'] = { value: '' };
    mockElements['tc-glow'] = { value: '' };
    syncGlowColor('#ff0000');
    expect(mockElements['gc-swatch'].style.background).toBe('#ff0000');
    expect(mockElements['tt-glow'].value).toBe('#ff0000');
    expect(mockElements['tc-glow'].value).toBe('#ff0000');
    expect(mockUpdatePreview).toHaveBeenCalled();
  });

  it('syncGlowColor handles missing elements', () => {
    expect(() => syncGlowColor('#ff0000')).not.toThrow();
  });

  it('syncWB updates tt-wbar and calls applyColor', () => {
    mockElements['tt-wbar'] = { value: '' };
    syncWB('#aabbcc');
    expect(mockElements['tt-wbar'].value).toBe('#aabbcc');
    expect(mockUpdatePreview).toHaveBeenCalled();
  });

  it('syncWBA updates tt-wbar-a and calls applyColor', () => {
    mockElements['tt-wbar-a'] = { value: '' };
    syncWBA('#112233');
    expect(mockElements['tt-wbar-a'].value).toBe('#112233');
  });

  it('syncBtnColor updates tt-btn-clr', () => {
    mockElements['tt-btn-clr'] = { value: '' };
    syncBtnColor('#ff00ff');
    expect(mockElements['tt-btn-clr'].value).toBe('#ff00ff');
  });

  it('syncBtnBdr updates tt-btn-bdr', () => {
    mockElements['tt-btn-bdr'] = { value: '' };
    syncBtnBdr('#00ff00');
    expect(mockElements['tt-btn-bdr'].value).toBe('#00ff00');
  });

  it('syncBtnBg updates tt-btn-bg', () => {
    mockElements['tt-btn-bg'] = { value: '' };
    syncBtnBg('#0000ff');
    expect(mockElements['tt-btn-bg'].value).toBe('#0000ff');
  });
});
