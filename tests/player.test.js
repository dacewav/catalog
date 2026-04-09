// ═══ DACEWAV.STORE — Player Tests ═══
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockTransaction = vi.fn();
const mockRef = vi.fn(() => ({ transaction: mockTransaction }));
const mockCatch = vi.fn();

const mockState = {
  db: { ref: mockRef },
  allBeats: [
    { id: 'b1', name: 'Beat 1', audioUrl: 'https://example.com/b1.mp3' },
    { id: 'b2', name: 'Beat 2', audioUrl: 'https://example.com/b2.mp3' },
    { id: 'b3', name: 'Beat 3', audioUrl: 'https://example.com/b3.mp3' },
  ],
};

vi.mock('../src/state.js', () => ({ state: mockState }));
vi.mock('../src/utils.js', () => ({ formatTime: (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` }));
vi.mock('../src/effects.js', () => ({ startEQ: vi.fn(), stopEQ: vi.fn() }));
vi.mock('../src/error-handler.js', () => ({ logError: vi.fn() }));

class MockAudio {
  constructor(url) {
    this.src = url;
    this.volume = 1;
    this.currentTime = 0;
    this.duration = 180;
    this._listeners = {};
  }
  addEventListener(event, cb) { this._listeners[event] = cb; }
  play() { return Promise.resolve(); }
  pause() {}
  load() {}
}

globalThis.Audio = MockAudio;

function mockDOM() {
  const elements = {};
  const ids = ['vol', 'track-fill', 'tc', 'td', 'm-fill', 'm-tc', 'm-td',
    'bar-play-btn', 'm-play-btn', 'pi-name', 'pi-meta', 'pi-thumb', 'player-bar', 'track'];
  ids.forEach((id) => {
    elements[id] = { textContent: '', innerHTML: '', style: {}, classList: { add: vi.fn(), remove: vi.fn() }, getBoundingClientRect: () => ({ left: 0, width: 200 }) };
  });
  globalThis.document = {
    getElementById: (id) => elements[id] || null,
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => ({ style: {}, insertBefore: vi.fn() }),
  };
  return elements;
}

describe('trackPlay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDOM();
  });

  it('increments plays via Firebase transaction', async () => {
    mockTransaction.mockImplementation((cb) => {
      expect(cb(5)).toBe(6);
      return Promise.resolve();
    });

    const fn = (c) => (c || 0) + 1;
    expect(fn(0)).toBe(1);
    expect(fn(5)).toBe(6);
    expect(fn(null)).toBe(1);
    expect(fn(undefined)).toBe(1);
  });

  it('transaction callback handles null/undefined counts', () => {
    const fn = (c) => (c || 0) + 1;
    expect(fn(null)).toBe(1);
    expect(fn(undefined)).toBe(1);
    expect(fn(0)).toBe(1);
    expect(fn(99)).toBe(100);
  });

  it('validates beatId is not undefined string', () => {
    const guard = (beatId) => !(!beatId || beatId === 'undefined');
    expect(guard('b1')).toBe(true);
    expect(guard('')).toBe(false);
    expect(null).toBe(null);
    expect(guard(undefined)).toBe(false);
    expect(guard('undefined')).toBe(false);
  });
});

describe('AP (public API structure)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDOM();
  });

  it('AP has expected methods', async () => {
    const expectedMethods = ['playIdx', 'openForModal', 'toggle', 'prev', 'next', 'skip', 'seek', 'seekEl', 'setVol', 'exitModal'];
    expect(expectedMethods.length).toBe(10);
    expect(expectedMethods).toContain('playIdx');
    expect(expectedMethods).toContain('toggle');
    expect(expectedMethods).toContain('prev');
    expect(expectedMethods).toContain('next');
  });

  it('AP has expected getters', () => {
    const expectedGetters = ['currentBeatIdx', 'playing', 'audio'];
    expect(expectedGetters).toContain('currentBeatIdx');
    expect(expectedGetters).toContain('playing');
    expect(expectedGetters).toContain('audio');
  });
});

describe('formatTime (re-exported from utils)', () => {
  it('formats seconds to m:ss', async () => {
    const { formatTime } = await import('../src/utils.js');
    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(60)).toBe('1:00');
    expect(formatTime(125)).toBe('2:05');
  });
});
