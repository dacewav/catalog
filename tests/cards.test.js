// ═══ DACEWAV.STORE — Cards Tests ═══
import { describe, it, expect, vi } from 'vitest';

const { mockState } = vi.hoisted(() => {
  const mockState = {
    T: { wbarHeight: 12 },
    wishlist: [],
    allBeats: [],
    activeGenre: 'Todos',
    activeTags: [],
    modalBeatId: null,
    siteSettings: {},
  };
  return { mockState };
});

vi.mock('../src/state.js', () => ({ state: mockState }));
vi.mock('../src/player.js', () => ({
  AP: { currentBeatIdx: -1, playing: false, toggle: vi.fn(), playIdx: vi.fn(), openForModal: vi.fn() },
}));
vi.mock('../src/utils.js', () => ({
  hexRgba: (hex, a) => `rgba(0,0,0,${a})`,
  applyAnim: (el) => el,
}));
vi.mock('../src/config.js', () => ({ ANIMS: {} }));
vi.mock('../src/wishlist.js', () => ({ toggleWish: vi.fn() }));
vi.mock('../src/waveform.js', () => ({ applyWaveformToCard: vi.fn() }));
vi.mock('../src/effects.js', () => ({
  setupCardTilt: vi.fn(),
  observeStagger: vi.fn(),
  animateCounter: vi.fn(),
}));

import { beatCard } from '../src/cards.js';

function makeBeat(overrides = {}) {
  return {
    id: '1',
    name: 'Test Beat',
    genre: 'Trap',
    bpm: 140,
    key: 'Am',
    tags: ['dark', 'aggressive'],
    accentColor: '#ff0000',
    imageUrl: 'https://example.com/img.jpg',
    audioUrl: 'https://example.com/audio.mp3',
    licenses: [{ name: 'Basic', priceMXN: 350, priceUSD: 18 }],
    available: true,
    exclusive: false,
    featured: false,
    plays: 42,
    ...overrides,
  };
}

describe('beatCard', () => {
  it('returns an HTML string with beat name', () => {
    const html = beatCard(makeBeat(), 0);
    expect(html).toContain('Test Beat');
    expect(html).toContain('beat-card');
  });

  it('shows BPM, key, and genre', () => {
    const html = beatCard(makeBeat(), 0);
    expect(html).toContain('140 BPM');
    expect(html).toContain('Am');
    expect(html).toContain('Trap');
  });

  it('shows play count when > 0', () => {
    const html = beatCard(makeBeat({ plays: 100 }), 0);
    expect(html).toContain('▶ 100');
  });

  it('hides play count when 0 or undefined', () => {
    const html = beatCard(makeBeat({ plays: 0 }), 0);
    expect(html).not.toContain('▶ 0');
  });

  it('renders tags', () => {
    const html = beatCard(makeBeat(), 0);
    expect(html).toContain('dark');
    expect(html).toContain('aggressive');
  });

  it('shows price from licenses', () => {
    const html = beatCard(makeBeat(), 0);
    expect(html).toContain('$350');
    expect(html).toContain('MXN');
    expect(html).toContain('$18 USD');
  });

  it('shows EXCL badge for exclusive beats', () => {
    const html = beatCard(makeBeat({ exclusive: true }), 0);
    expect(html).toContain('EXCL');
  });

  it('does not show EXCL for non-exclusive', () => {
    const html = beatCard(makeBeat({ exclusive: false }), 0);
    expect(html).not.toContain('EXCL');
  });

  it('shows featured class for featured beats', () => {
    const html = beatCard(makeBeat({ featured: true }), 0);
    expect(html).toContain(' featured');
  });

  it('shows "No disponible" when not available', () => {
    const html = beatCard(makeBeat({ available: false }), 0);
    expect(html).toContain('No disponible');
  });

  it('renders image when imageUrl exists', () => {
    const html = beatCard(makeBeat(), 0);
    expect(html).toContain('<img src="https://example.com/img.jpg"');
  });

  it('renders placeholder when no imageUrl', () => {
    const html = beatCard(makeBeat({ imageUrl: null }), 0);
    expect(html).toContain('beat-img-ph');
    expect(html).toContain('♦');
  });

  it('uses accent color in card style', () => {
    const html = beatCard(makeBeat({ accentColor: '#00ff00' }), 0);
    expect(html).toContain('#00ff00');
  });

  it('uses default gradient when no accentColor', () => {
    const html = beatCard(makeBeat({ accentColor: null }), 0);
    expect(html).toContain('rgba(185,28,28');
  });

  it('renders empty tags gracefully', () => {
    const html = beatCard(makeBeat({ tags: [] }), 0);
    expect(html).toContain('beat-tags-row');
  });

  it('generates 20 waveform bars', () => {
    const html = beatCard(makeBeat(), 0);
    const barCount = (html.match(/class="wbar/g) || []).length;
    expect(barCount).toBe(20);
  });

  it('card id uses beat id', () => {
    const html = beatCard(makeBeat({ id: 'beat-42' }), 5);
    expect(html).toContain('id="card-beat-42"');
  });

  it('wishlist heart shows active state', () => {
    mockState.wishlist = ['1'];
    const html = beatCard(makeBeat({ id: '1' }), 0);
    expect(html).toContain('wish-btn active');
    expect(html).toContain('♥');
    mockState.wishlist = [];
  });

  it('wishlist heart shows inactive state', () => {
    const html = beatCard(makeBeat({ id: '99' }), 0);
    expect(html).toContain('♡');
    expect(html).not.toContain('wish-btn active');
  });
});
