// ═══ Tests: Wishlist (getWishlist, toggleWish, updateWishBadge) ═══
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../src/state.js', () => ({
  state: {
    allBeats: [
      { id: 'b1', name: 'Test Beat', bpm: 140, key: 'Am', licenses: [{ priceMXN: 350 }] },
      { id: 'b2', name: 'Another Beat', bpm: 90, key: 'Cm', licenses: [{ priceMXN: 500 }] },
    ],
    T: {},
    siteSettings: {},
    modalBeatId: null,
    wishlist: [],
    customEmojis: [],
    floatingEls: {},
  },
}));

vi.mock('../src/error-handler.js', () => ({
  logError: vi.fn(),
  fbCatch: vi.fn(() => () => {}),
}));

import { getWishlist, toggleWish, updateWishBadge } from '../src/wishlist.js';
import { state } from '../src/state.js';

beforeEach(() => {
  state.wishlist.length = 0;
  vi.clearAllMocks();
  // Mock localStorage
  const store = {};
  globalThis.localStorage = {
    getItem: vi.fn(k => store[k] || null),
    setItem: vi.fn((k, v) => { store[k] = v; }),
    removeItem: vi.fn(k => { delete store[k]; }),
  };
  // Mock document
  globalThis.document = {
    querySelector: vi.fn(() => null),
    getElementById: vi.fn(() => null),
    querySelectorAll: vi.fn(() => []),
  };
});

describe('getWishlist', () => {
  it('returns empty array initially', () => {
    expect(getWishlist()).toEqual([]);
  });

  it('returns current wishlist items', () => {
    state.wishlist.push('b1', 'b2');
    expect(getWishlist()).toEqual(['b1', 'b2']);
  });
});

describe('toggleWish', () => {
  it('adds id to wishlist when not present', () => {
    toggleWish('b1');
    expect(state.wishlist).toContain('b1');
  });

  it('removes id from wishlist when present', () => {
    state.wishlist.push('b1');
    toggleWish('b1');
    expect(state.wishlist).not.toContain('b1');
  });

  it('saves to localStorage after toggle', () => {
    toggleWish('b1');
    expect(localStorage.setItem).toHaveBeenCalledWith('dace-wishlist', JSON.stringify(['b1']));
  });

  it('does not duplicate ids', () => {
    toggleWish('b1');
    toggleWish('b1');
    toggleWish('b1');
    expect(state.wishlist).toEqual(['b1']);
  });

  it('stops event propagation when event provided', () => {
    const event = { stopPropagation: vi.fn(), preventDefault: vi.fn() };
    toggleWish('b1', event);
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalled();
  });
});

describe('updateWishBadge', () => {
  it('does not throw when DOM elements missing', () => {
    expect(() => updateWishBadge()).not.toThrow();
  });

  it('updates badge text when element exists', () => {
    const badge = { textContent: '0', style: {}, classList: { remove: vi.fn(), add: vi.fn() } };
    globalThis.document.getElementById = vi.fn(id => id === 'wish-nav-badge' ? badge : null);
    state.wishlist.push('b1', 'b2');
    updateWishBadge();
    expect(badge.textContent).toBe(2);
    expect(badge.style.display).toBe('flex');
  });

  it('hides badge when wishlist is empty', () => {
    const badge = { textContent: '2', style: {}, classList: { remove: vi.fn(), add: vi.fn() } };
    globalThis.document.getElementById = vi.fn(id => id === 'wish-nav-badge' ? badge : null);
    updateWishBadge();
    expect(badge.style.display).toBe('none');
  });
});
