// ═══ Tests: Admin — Beats (rendering & filtering logic) ═══
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockElements, mockG } = vi.hoisted(() => {
  const mockElements = {};
  const mockG = vi.fn(id => mockElements[id] || null);
  return { mockElements, mockG };
});

vi.mock('../src/admin/helpers.js', () => ({
  g: mockG,
  val: vi.fn(),
  setVal: vi.fn((id, v) => { if (mockElements[id]) mockElements[id].value = v; }),
  checked: vi.fn(),
  setChecked: vi.fn((id, v) => { if (mockElements[id]) mockElements[id].checked = v; }),
  showToast: vi.fn(),
  showSaving: vi.fn(),
  confirmInline: vi.fn(() => true),
  promptInline: vi.fn(() => ''),
  fmt: vi.fn(v => v),
  hexRgba: vi.fn(),
  loadFont: vi.fn(),
  sv: vi.fn(),
}));

vi.mock('../src/admin/state.js', () => ({
  db: { ref: vi.fn() },
  allBeats: [],
  setAllBeats: vi.fn(),
  editId: null,
  setEditId: vi.fn(),
  defLics: [],
  _edLics: [],
  setEdLics: vi.fn(),
  _dragBeatId: null,
  setDragBeatId: vi.fn(),
  _batchImgQueue: [],
  setBatchImgQueue: vi.fn(),
}));

vi.mock('../src/admin/nav.js', () => ({
  showSection: vi.fn(),
  showEt: vi.fn(),
}));

vi.mock('../src/admin/core.js', () => ({
  autoSave: vi.fn(),
  postToFrame: vi.fn(),
}));

vi.mock('../src/admin/r2.js', () => ({
  R2_ENABLED: false,
  uploadToR2: vi.fn(),
}));

vi.mock('../src/admin/beat-card-style.js', () => ({
  updateCardPreview: vi.fn(),
  syncSliderDisplay: vi.fn(),
  _buildCardStyleFromInputs: vi.fn(() => ({})),
  _isCardStyleDefault: vi.fn(() => true),
  _setHoloColors: vi.fn(),
  _toggleAnimSubsettings: vi.fn(),
}));

vi.mock('../src/admin/beat-presets.js', () => ({
  ALL_SLIDER_IDS: [],
  renderPresets: vi.fn(),
  renderHoverPresets: vi.fn(),
  applyPreset: vi.fn(),
  applyHoverPreset: vi.fn(),
  resetCardStyle: vi.fn(),
  resetBeatToGlobal: vi.fn(),
}));

vi.mock('../src/admin/card-style-ui.js', () => ({
  renderEffectGalleryHTML: vi.fn(() => ''),
  renderCardStyleControls: vi.fn(),
  populateFromCardStyle: vi.fn(),
  resetCardStyleInputs: vi.fn(),
}));

vi.mock('../src/admin/click-handler.js', () => ({
  registerActions: vi.fn(),
  initClickHandler: vi.fn(),
}));

import { renderBeatList, filterBeatList, openEditor } from '../src/admin/beats.js';
import * as state from '../src/admin/state.js';

describe('renderBeatList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(mockElements).forEach(k => delete mockElements[k]);
    mockElements['beat-list'] = { innerHTML: '' };
    mockElements['beat-search-count'] = { textContent: '' };
  });

  it('shows empty message when no beats', () => {
    state.allBeats.length = 0;
    renderBeatList();
    expect(mockElements['beat-list'].innerHTML).toContain('No hay beats');
  });

  it('renders beat rows for each beat', () => {
    state.allBeats.length = 0;
    state.allBeats.push(
      { id: 'b1', name: 'Midnight Trap', genre: 'Trap', bpm: 140, key: 'Am', active: true },
      { id: 'b2', name: 'Smooth R&B', genre: 'R&B', bpm: 85, key: 'Cm', active: true },
    );
    renderBeatList();
    const html = mockElements['beat-list'].innerHTML;
    expect(html).toContain('Midnight Trap');
    expect(html).toContain('Smooth R&B');
    expect(html).toContain('140 BPM');
    expect(html).toContain('85 BPM');
    expect(html).toContain('beat-row');
  });

  it('shows beat count', () => {
    state.allBeats.length = 0;
    state.allBeats.push({ id: 'b1', name: 'Test', genre: 'Trap', bpm: 120, key: 'C' });
    renderBeatList();
    expect(mockElements['beat-search-count'].textContent).toBe('1 beats');
  });

  it('shows TOP badge for featured beats', () => {
    state.allBeats.length = 0;
    state.allBeats.push({ id: 'b1', name: 'Featured Beat', genre: 'Trap', bpm: 130, key: 'Dm', featured: true });
    renderBeatList();
    expect(mockElements['beat-list'].innerHTML).toContain('TOP');
  });

  it('shows EXCL badge for exclusive beats', () => {
    state.allBeats.length = 0;
    state.allBeats.push({ id: 'b1', name: 'Exclusive Beat', genre: 'Drill', bpm: 145, key: 'Em', exclusive: true });
    renderBeatList();
    expect(mockElements['beat-list'].innerHTML).toContain('EXCL');
  });

  it('shows OFF badge for inactive beats', () => {
    state.allBeats.length = 0;
    state.allBeats.push({ id: 'b1', name: 'Inactive', genre: 'Trap', bpm: 120, key: 'F', active: false });
    renderBeatList();
    expect(mockElements['beat-list'].innerHTML).toContain('OFF');
  });

  it('renders thumbnail image when imageUrl exists', () => {
    state.allBeats.length = 0;
    state.allBeats.push({ id: 'b1', name: 'With Image', genre: 'Trap', bpm: 120, key: 'G', imageUrl: 'https://img.example/pic.jpg' });
    renderBeatList();
    expect(mockElements['beat-list'].innerHTML).toContain('<img src="https://img.example/pic.jpg">');
  });

  it('renders music note when no imageUrl', () => {
    state.allBeats.length = 0;
    state.allBeats.push({ id: 'b1', name: 'No Image', genre: 'Trap', bpm: 120, key: 'A' });
    renderBeatList();
    expect(mockElements['beat-list'].innerHTML).toContain('♪');
  });
});

describe('filterBeatList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(mockElements).forEach(k => delete mockElements[k]);
    mockElements['beat-list'] = { innerHTML: '' };
    mockElements['beat-search-count'] = { textContent: '' };
    state.allBeats.length = 0;
    state.allBeats.push(
      { id: 'b1', name: 'Midnight Trap', genre: 'Trap', bpm: 140, key: 'Am', tags: ['dark'] },
      { id: 'b2', name: 'Smooth R&B', genre: 'R&B', bpm: 85, key: 'Cm', tags: ['chill'] },
      { id: 'b3', name: 'Dark Drill', genre: 'Drill', bpm: 145, key: 'Em', tags: ['dark', 'hard'] },
    );
  });

  it('shows all beats with empty query', () => {
    filterBeatList('');
    expect(mockElements['beat-list'].innerHTML).toContain('Midnight Trap');
    expect(mockElements['beat-list'].innerHTML).toContain('Smooth R&B');
    expect(mockElements['beat-list'].innerHTML).toContain('Dark Drill');
  });

  it('filters by name', () => {
    filterBeatList('midnight');
    expect(mockElements['beat-list'].innerHTML).toContain('Midnight Trap');
    expect(mockElements['beat-list'].innerHTML).not.toContain('Smooth R&B');
  });

  it('filters by genre', () => {
    filterBeatList('drill');
    expect(mockElements['beat-list'].innerHTML).toContain('Dark Drill');
    expect(mockElements['beat-list'].innerHTML).not.toContain('Smooth R&B');
  });

  it('filters by key', () => {
    filterBeatList('cm');
    expect(mockElements['beat-list'].innerHTML).toContain('Smooth R&B');
    expect(mockElements['beat-list'].innerHTML).not.toContain('Midnight Trap');
  });

  it('shows count with filter active', () => {
    filterBeatList('trap');
    expect(mockElements['beat-search-count'].textContent).toBe('1 de 3');
  });

  it('shows no results message', () => {
    filterBeatList('zzzzz');
    expect(mockElements['beat-list'].innerHTML).toContain('Sin resultados');
    expect(mockElements['beat-search-count'].textContent).toBe('0 de 3');
  });
});

describe('openEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(mockElements).forEach(k => delete mockElements[k]);
    ['f-id','f-name','f-genre','f-genre-c','f-bpm','f-key','f-desc','f-tags',
     'f-img','f-audio','f-prev','f-spotify','f-youtube','f-soundcloud',
     'f-date','f-order','f-plays','f-feat','f-excl','f-active','f-avail',
     'editor-title','btn-del','le-editor','img-prev'].forEach(id => {
      mockElements[id] = { value: '', textContent: '', innerHTML: '', readOnly: false, style: {}, checked: false };
    });
    state.allBeats.length = 0;
    state.allBeats.push({ id: 'b1', name: 'Test Beat', genre: 'Trap', bpm: 140, key: 'Am', description: 'A test', active: true, featured: false, exclusive: false, available: true, licenses: [] });
  });

  it('opens editor in new mode when no id', () => {
    openEditor(null);
    expect(mockElements['editor-title'].innerHTML).toContain('Nuevo');
    expect(mockElements['btn-del'].style.display).toBe('none');
  });

  it('opens editor in edit mode with beat data', () => {
    openEditor('b1');
    expect(mockElements['editor-title'].innerHTML).toContain('Editar');
    expect(mockElements['btn-del'].style.display).toBe('inline-flex');
    expect(mockElements['f-id'].value).toBe('b1');
    expect(mockElements['f-name'].value).toBe('Test Beat');
    expect(mockElements['f-bpm'].value).toBe(140);
    expect(mockElements['f-id'].readOnly).toBe(true);
  });

  it('sets genre select value', () => {
    openEditor('b1');
    expect(mockElements['f-genre'].value).toBe('Trap');
  });
});
