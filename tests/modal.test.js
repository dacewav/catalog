// ═══ Tests: Modal (selLic, closeModal, OG tags) ═══
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock DOM
function mockDOM() {
  const els = {};
  const mockEl = (id) => {
    if (!els[id]) els[id] = { textContent: '', innerHTML: '', style: {}, classList: { add: vi.fn(), remove: vi.fn(), toggle: vi.fn() }, querySelector: vi.fn(), querySelectorAll: vi.fn(() => []), setAttribute: vi.fn(), getAttribute: vi.fn(), insertBefore: vi.fn(), children: [], appendChild: vi.fn(), remove: vi.fn(), addEventListener: vi.fn() };
    return els[id];
  };
  globalThis.document = {
    getElementById: mockEl,
    querySelector: vi.fn(() => mockEl('meta')),
    querySelectorAll: vi.fn(() => []),
    createElement: vi.fn(() => mockEl('new')),
    body: { style: {} },
    title: 'DACE · Beats',
    addEventListener: vi.fn(),
  };
  return els;
}

vi.mock('../src/state.js', () => ({
  state: {
    allBeats: [
      { id: 'b1', name: 'Test Beat', genre: 'Trap', bpm: 140, key: 'Am', licenses: [{ name: 'Basic', priceMXN: 350, priceUSD: 18 }], imageUrl: 'https://img.example/pic.jpg', spotify: '', youtube: '', soundcloud: '', tags: ['dark'] },
    ],
    T: {},
    siteSettings: { whatsapp: '521234567890', instagram: 'dacewav' },
    modalBeatId: null,
    wishlist: [],
    customEmojis: [],
    floatingEls: {},
  },
}));

vi.mock('../src/player.js', () => ({
  AP: {
    currentBeatIdx: -1,
    playing: false,
    toggle: vi.fn(),
    playIdx: vi.fn(),
    exitModal: vi.fn(),
    playModalBeat: vi.fn(),
  },
}));

import { selLic } from '../src/modal.js';

describe('selLic', () => {
  it('removes sel class from all lic-rows and adds to clicked', () => {
    mockDOM();
    const rows = [{ classList: { remove: vi.fn(), add: vi.fn() } }, { classList: { remove: vi.fn(), add: vi.fn() } }];
    globalThis.document.querySelectorAll = vi.fn(() => rows);

    selLic(rows[1]);

    expect(rows[0].classList.remove).toHaveBeenCalledWith('sel');
    expect(rows[1].classList.remove).toHaveBeenCalledWith('sel');
    expect(rows[1].classList.add).toHaveBeenCalledWith('sel');
  });
});
