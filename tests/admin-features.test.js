// ═══ Tests: Admin — Features (licenses, links, testimonials CRUD) ═══
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockElements, mockG, mockShowToast, mockDb } = vi.hoisted(() => {
  const mockElements = {};
  const mockG = vi.fn(id => mockElements[id] || null);
  const mockShowToast = vi.fn();
  const mockDb = { ref: vi.fn() };
  return { mockElements, mockG, mockShowToast, mockDb };
});

vi.mock('../src/admin/helpers.js', () => ({
  g: mockG,
  val: vi.fn(),
  setVal: vi.fn(),
  checked: vi.fn(),
  setChecked: vi.fn(),
  hexRgba: vi.fn(),
  hexFromRgba: vi.fn(),
  rgbaFromHex: vi.fn(),
  loadFont: vi.fn(),
  showToast: mockShowToast,
  showSaving: vi.fn(),
  fmt: vi.fn(),
  sv: vi.fn(),
  resetSlider: vi.fn(),
  toggleCard: vi.fn(),
  setAutoSaveRef: vi.fn(),
}));

vi.mock('../src/admin/state.js', () => {
  const _defLics = [];
  const _customLinks = {};
  const _siteSettings = {};
  return {
    db: null,
    defLics: _defLics,
    setDefLics: vi.fn(),
    customLinks: _customLinks,
    setCustomLinks: vi.fn(),
    siteSettings: _siteSettings,
    setSiteSettings: vi.fn(),
    floatingEls: [],
  };
});

import {
  renderDefLicsEditor, addDefLicRow, rmDefLic, upDefLic, saveDefLics,
  renderLinksEditor, addLinkRow, rmLink, saveLinks,
  renderTestiEditor, addTestiRow, rmTesti, saveTestis,
  showEt, copyCmd,
} from '../src/admin/features.js';
import * as state from '../src/admin/state.js';

// ═══ DEFAULT LICENSES ═══
describe('renderDefLicsEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(mockElements).forEach(k => delete mockElements[k]);
    mockElements['def-lics-editor'] = { innerHTML: '' };
    state.defLics.length = 0;
  });

  it('shows empty message when no licenses', () => {
    renderDefLicsEditor();
    expect(mockElements['def-lics-editor'].innerHTML).toContain('Sin licencias base');
  });

  it('renders license rows for each license', () => {
    state.defLics.push(
      { name: 'Basic', priceMXN: 500, priceUSD: 25, description: 'Basic license' },
      { name: 'Premium', priceMXN: 2000, priceUSD: 100, description: 'Premium license' },
    );
    renderDefLicsEditor();
    const html = mockElements['def-lics-editor'].innerHTML;
    expect(html).toContain('Basic');
    expect(html).toContain('Premium');
    expect(html).toContain('500');
    expect(html).toContain('2000');
    expect(html).toContain('lic-ed-row');
  });

  it('renders input fields with onchange handlers', () => {
    state.defLics.push({ name: 'Test', priceMXN: 100, priceUSD: 5, description: 'Desc' });
    renderDefLicsEditor();
    const html = mockElements['def-lics-editor'].innerHTML;
    expect(html).toContain('upDefLic(0,\'name\'');
    expect(html).toContain('upDefLic(0,\'mxn\'');
    expect(html).toContain('upDefLic(0,\'usd\'');
    expect(html).toContain('upDefLic(0,\'desc\'');
    expect(html).toContain('rmDefLic(0)');
  });

  it('returns early if element not found', () => {
    delete mockElements['def-lics-editor'];
    expect(() => renderDefLicsEditor()).not.toThrow();
  });
});

describe('addDefLicRow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(mockElements).forEach(k => delete mockElements[k]);
    mockElements['def-lics-editor'] = { innerHTML: '' };
    state.defLics.length = 0;
  });

  it('adds a new empty license', () => {
    addDefLicRow();
    expect(state.defLics).toHaveLength(1);
    expect(state.defLics[0]).toEqual({ name: '', priceMXN: 0, priceUSD: 0, description: '' });
  });

  it('triggers re-render', () => {
    addDefLicRow();
    expect(mockElements['def-lics-editor'].innerHTML).toContain('lic-ed-row');
  });
});

describe('rmDefLic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(mockElements).forEach(k => delete mockElements[k]);
    mockElements['def-lics-editor'] = { innerHTML: '' };
    state.defLics.length = 0;
  });

  it('removes license at given index', () => {
    state.defLics.push({ name: 'A' }, { name: 'B' }, { name: 'C' });
    rmDefLic(1);
    expect(state.defLics).toHaveLength(2);
    expect(state.defLics[0].name).toBe('A');
    expect(state.defLics[1].name).toBe('C');
  });

  it('triggers re-render after removal', () => {
    state.defLics.push({ name: 'X' });
    rmDefLic(0);
    expect(mockElements['def-lics-editor'].innerHTML).toContain('Sin licencias base');
  });
});

describe('upDefLic', () => {
  beforeEach(() => {
    state.defLics.length = 0;
    state.defLics.push({ name: '', priceMXN: 0, priceUSD: 0, description: '' });
  });

  it('updates name field', () => {
    upDefLic(0, 'name', 'New Name');
    expect(state.defLics[0].name).toBe('New Name');
  });

  it('updates mxn price as float', () => {
    upDefLic(0, 'mxn', '1500');
    expect(state.defLics[0].priceMXN).toBe(1500);
  });

  it('updates usd price as float', () => {
    upDefLic(0, 'usd', '75.5');
    expect(state.defLics[0].priceUSD).toBe(75.5);
  });

  it('updates description', () => {
    upDefLic(0, 'desc', 'A great license');
    expect(state.defLics[0].description).toBe('A great license');
  });

  it('handles invalid index gracefully', () => {
    expect(() => upDefLic(99, 'name', 'test')).not.toThrow();
  });

  it('parses non-numeric mxn as 0', () => {
    upDefLic(0, 'mxn', 'abc');
    expect(state.defLics[0].priceMXN).toBe(0);
  });
});

describe('saveDefLics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.defLics.length = 0;
  });

  it('shows error toast when db is null', () => {
    state.db = null;
    saveDefLics();
    expect(mockShowToast).toHaveBeenCalledWith('Firebase no conectado', true);
  });

  it('saves to firebase when db exists', async () => {
    const mockSet = vi.fn().mockResolvedValue();
    const mockRef = vi.fn().mockReturnValue({ set: mockSet });
    state.db = { ref: mockRef };
    state.defLics.push({ name: 'Test', priceMXN: 100, priceUSD: 5, description: '' });
    saveDefLics();
    // Let promises resolve
    await vi.waitFor(() => {
      expect(mockRef).toHaveBeenCalledWith('defaultLicenses');
      expect(mockSet).toHaveBeenCalledWith(state.defLics);
    });
    state.db = null;
  });
});

// ═══ LINKS ═══
describe('renderLinksEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(mockElements).forEach(k => delete mockElements[k]);
    mockElements['links-editor'] = { innerHTML: '' };
    Object.keys(state.customLinks).forEach(k => delete state.customLinks[k]);
  });

  it('shows empty message when no links', () => {
    renderLinksEditor();
    expect(mockElements['links-editor'].innerHTML).toContain('Sin links');
  });

  it('renders link rows', () => {
    state.customLinks['l1'] = { label: 'My Site', url: 'https://example.com', location: 'header' };
    state.customLinks['l2'] = { label: 'Store', url: 'https://store.com', location: 'footer' };
    renderLinksEditor();
    const html = mockElements['links-editor'].innerHTML;
    expect(html).toContain('My Site');
    expect(html).toContain('https://example.com');
    expect(html).toContain('Store');
    expect(html).toContain('link-ed-row');
  });

  it('includes location select options', () => {
    state.customLinks['l1'] = { label: 'Test', url: '#', location: 'hero' };
    renderLinksEditor();
    const html = mockElements['links-editor'].innerHTML;
    expect(html).toContain('<option value="header"');
    expect(html).toContain('<option value="hero"');
    expect(html).toContain('<option value="footer"');
    expect(html).toContain('selected');
  });

  it('returns early if element not found', () => {
    delete mockElements['links-editor'];
    expect(() => renderLinksEditor()).not.toThrow();
  });
});

describe('addLinkRow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(mockElements).forEach(k => delete mockElements[k]);
    mockElements['links-editor'] = { innerHTML: '' };
    Object.keys(state.customLinks).forEach(k => delete state.customLinks[k]);
  });

  it('adds a new link with default values', () => {
    addLinkRow();
    const keys = Object.keys(state.customLinks);
    expect(keys).toHaveLength(1);
    expect(state.customLinks[keys[0]]).toEqual({ label: '', url: '', location: 'header' });
  });

  it('key starts with l_ prefix', () => {
    addLinkRow();
    const keys = Object.keys(state.customLinks);
    expect(keys[0]).toMatch(/^l_\d+$/);
  });
});

describe('rmLink', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(mockElements).forEach(k => delete mockElements[k]);
    mockElements['links-editor'] = { innerHTML: '' };
    Object.keys(state.customLinks).forEach(k => delete state.customLinks[k]);
  });

  it('removes link by key', () => {
    state.customLinks['l1'] = { label: 'A', url: '#' };
    state.customLinks['l2'] = { label: 'B', url: '#' };
    rmLink('l1');
    expect(state.customLinks).not.toHaveProperty('l1');
    expect(state.customLinks).toHaveProperty('l2');
  });

  it('triggers re-render', () => {
    state.customLinks['l1'] = { label: 'Only', url: '#' };
    rmLink('l1');
    expect(mockElements['links-editor'].innerHTML).toContain('Sin links');
  });
});

// ═══ TESTIMONIALS ═══
describe('renderTestiEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(mockElements).forEach(k => delete mockElements[k]);
    mockElements['testi-editor'] = { innerHTML: '' };
    state.siteSettings.testimonials = [];
  });

  it('shows empty message when no testimonials', () => {
    renderTestiEditor();
    expect(mockElements['testi-editor'].innerHTML).toContain('Sin testimonios');
  });

  it('renders testimonial rows', () => {
    state.siteSettings.testimonials = [
      { name: 'DJ Smoke', role: 'Producer', text: 'Great beats!' },
      { name: 'MC Flow', role: 'Artist', text: 'Love the quality' },
    ];
    renderTestiEditor();
    const html = mockElements['testi-editor'].innerHTML;
    expect(html).toContain('DJ Smoke');
    expect(html).toContain('Producer');
    expect(html).toContain('Great beats!');
    expect(html).toContain('MC Flow');
    expect(html).toContain('testi-ed');
  });

  it('includes data-f attributes for field binding', () => {
    state.siteSettings.testimonials = [{ name: 'Test', role: 'Role', text: 'Text' }];
    renderTestiEditor();
    const html = mockElements['testi-editor'].innerHTML;
    expect(html).toContain('data-f="name"');
    expect(html).toContain('data-f="role"');
    expect(html).toContain('data-f="text"');
  });

  it('returns early if element not found', () => {
    delete mockElements['testi-editor'];
    expect(() => renderTestiEditor()).not.toThrow();
  });
});

describe('addTestiRow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(mockElements).forEach(k => delete mockElements[k]);
    mockElements['testi-editor'] = { innerHTML: '' };
    state.siteSettings.testimonials = [];
  });

  it('adds empty testimonial', () => {
    addTestiRow();
    expect(state.siteSettings.testimonials).toHaveLength(1);
    expect(state.siteSettings.testimonials[0]).toEqual({ name: '', role: '', text: '' });
  });

  it('initializes testimonials array if missing', () => {
    delete state.siteSettings.testimonials;
    addTestiRow();
    expect(state.siteSettings.testimonials).toHaveLength(1);
  });
});

describe('rmTesti', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(mockElements).forEach(k => delete mockElements[k]);
    mockElements['testi-editor'] = { innerHTML: '' };
    state.siteSettings.testimonials = [
      { name: 'A', role: '', text: '' },
      { name: 'B', role: '', text: '' },
    ];
  });

  it('removes testimonial at index', () => {
    rmTesti(0);
    expect(state.siteSettings.testimonials).toHaveLength(1);
    expect(state.siteSettings.testimonials[0].name).toBe('B');
  });
});

// ═══ showEt ═══
describe('showEt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('toggles on class on matching tab and panel', () => {
    const tabs = [
      { dataset: { et: 'links' }, classList: { toggle: vi.fn() } },
      { dataset: { et: 'testi' }, classList: { toggle: vi.fn() } },
    ];
    const panels = [
      { dataset: { etp: 'links' }, classList: { toggle: vi.fn() } },
      { dataset: { etp: 'testi' }, classList: { toggle: vi.fn() } },
    ];
    globalThis.document.querySelectorAll = vi.fn(sel => {
      if (sel === '#sec-add .et') return tabs;
      if (sel === '#sec-add .etp') return panels;
      return [];
    });
    showEt('links');
    expect(tabs[0].classList.toggle).toHaveBeenCalledWith('on', true);
    expect(tabs[1].classList.toggle).toHaveBeenCalledWith('on', false);
    expect(panels[0].classList.toggle).toHaveBeenCalledWith('on', true);
    expect(panels[1].classList.toggle).toHaveBeenCalledWith('on', false);
    globalThis.document.querySelectorAll = () => [];
  });
});

// ═══ copyCmd ═══
describe('copyCmd', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(mockElements).forEach(k => delete mockElements[k]);
  });

  it('copies value from input element', () => {
    const mockSelect = vi.fn();
    mockElements['cmd-input'] = { value: 'my-command', select: mockSelect };
    // Mock execCommand
    globalThis.document.execCommand = vi.fn(() => true);
    // No clipboard API
    const origClipboard = navigator.clipboard;
    Object.defineProperty(navigator, 'clipboard', { value: undefined, writable: true, configurable: true });
    copyCmd('cmd-input');
    expect(mockSelect).toHaveBeenCalled();
    expect(globalThis.document.execCommand).toHaveBeenCalledWith('copy');
    expect(mockShowToast).toHaveBeenCalledWith('Comando copiado ✓');
    Object.defineProperty(navigator, 'clipboard', { value: origClipboard, writable: true, configurable: true });
  });

  it('returns early if element not found', () => {
    expect(() => copyCmd('nonexistent')).not.toThrow();
  });
});
