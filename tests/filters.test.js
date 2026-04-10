// ═══ DACEWAV.STORE — Filters Tests ═══
// Testing sort logic and filter logic in isolation
import { describe, it, expect } from 'vitest';

// Extract sort functions for testing (same logic as filters.js)
const sorters = {
  newest: (a, b) => (b.createdAt || 0) - (a.createdAt || 0),
  oldest: (a, b) => (a.createdAt || 0) - (b.createdAt || 0),
  'name-az': (a, b) => a.name.localeCompare(b.name),
  'name-za': (a, b) => b.name.localeCompare(a.name),
  'bpm-asc': (a, b) => (a.bpm || 0) - (b.bpm || 0),
  'bpm-desc': (a, b) => (b.bpm || 0) - (a.bpm || 0),
  'price-asc': (a, b) => ((a.licenses?.[0]?.priceMXN) || 0) - ((b.licenses?.[0]?.priceMXN) || 0),
  'price-desc': (a, b) => ((b.licenses?.[0]?.priceMXN) || 0) - ((a.licenses?.[0]?.priceMXN) || 0),
};

// Same filter logic as applyFilters
function filterBeat(beat, { query, genre, keyF, moodF, activeTags }) {
  if (genre && genre !== 'Todos' && beat.genre !== genre) return false;
  if (query) {
    const q = query.toLowerCase();
    const nameMatch = beat.name?.toLowerCase().includes(q);
    const tagMatch = (beat.tags || []).some((t) => t.toLowerCase().includes(q));
    const genreMatch = beat.genre?.toLowerCase().includes(q);
    const descMatch = beat.description?.toLowerCase().includes(q);
    const keyMatch = beat.key?.toLowerCase().includes(q);
    if (!nameMatch && !tagMatch && !genreMatch && !descMatch && !keyMatch) return false;
  }
  if (keyF && beat.key !== keyF) return false;
  if (moodF) {
    const hasMood = (beat.tags || []).some((t) => t.toLowerCase() === moodF);
    if (!hasMood) return false;
  }
  if (activeTags && activeTags.length > 0) {
    const beatTagsLower = (beat.tags || []).map((t) => t.toLowerCase());
    if (!activeTags.every((at) => beatTagsLower.includes(at))) return false;
  }
  return true;
}

const sampleBeats = [
  { id: '1', name: 'Dark Night', genre: 'Trap', bpm: 140, key: 'Am', tags: ['dark', 'aggressive'], createdAt: 100, licenses: [{ priceMXN: 500 }] },
  { id: '2', name: 'Summer Vibes', genre: 'Reggaeton', bpm: 95, key: 'C', tags: ['chill', 'happy'], createdAt: 200, licenses: [{ priceMXN: 350 }] },
  { id: '3', name: 'Moonlit', genre: 'Trap', bpm: 120, key: 'Dm', tags: ['dark', 'chill'], createdAt: 150, licenses: [{ priceMXN: 800 }] },
  { id: '4', name: 'Blaze', genre: 'Drill', bpm: 150, key: 'Am', tags: ['aggressive', 'hard'], createdAt: 50, licenses: [{ priceMXN: 600 }] },
];

describe('sort functions', () => {
  it('sorts by newest', () => {
    const sorted = [...sampleBeats].sort(sorters.newest);
    expect(sorted.map((b) => b.id)).toEqual(['2', '3', '1', '4']);
  });

  it('sorts by oldest', () => {
    const sorted = [...sampleBeats].sort(sorters.oldest);
    expect(sorted.map((b) => b.id)).toEqual(['4', '1', '3', '2']);
  });

  it('sorts by name A-Z', () => {
    const sorted = [...sampleBeats].sort(sorters['name-az']);
    expect(sorted.map((b) => b.name)).toEqual(['Blaze', 'Dark Night', 'Moonlit', 'Summer Vibes']);
  });

  it('sorts by name Z-A', () => {
    const sorted = [...sampleBeats].sort(sorters['name-za']);
    expect(sorted.map((b) => b.name)).toEqual(['Summer Vibes', 'Moonlit', 'Dark Night', 'Blaze']);
  });

  it('sorts by BPM ascending', () => {
    const sorted = [...sampleBeats].sort(sorters['bpm-asc']);
    expect(sorted.map((b) => b.bpm)).toEqual([95, 120, 140, 150]);
  });

  it('sorts by BPM descending', () => {
    const sorted = [...sampleBeats].sort(sorters['bpm-desc']);
    expect(sorted.map((b) => b.bpm)).toEqual([150, 140, 120, 95]);
  });

  it('sorts by price ascending', () => {
    const sorted = [...sampleBeats].sort(sorters['price-asc']);
    expect(sorted.map((b) => b.licenses[0].priceMXN)).toEqual([350, 500, 600, 800]);
  });

  it('sorts by price descending', () => {
    const sorted = [...sampleBeats].sort(sorters['price-desc']);
    expect(sorted.map((b) => b.licenses[0].priceMXN)).toEqual([800, 600, 500, 350]);
  });
});

describe('filter logic', () => {
  it('filters by genre', () => {
    const result = sampleBeats.filter((b) => filterBeat(b, { genre: 'Trap' }));
    expect(result).toHaveLength(2);
    expect(result.every((b) => b.genre === 'Trap')).toBe(true);
  });

  it('shows all with "Todos"', () => {
    const result = sampleBeats.filter((b) => filterBeat(b, { genre: 'Todos' }));
    expect(result).toHaveLength(4);
  });

  it('filters by search query in name', () => {
    const result = sampleBeats.filter((b) => filterBeat(b, { query: 'moon' }));
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Moonlit');
  });

  it('filters by search query in tags', () => {
    const result = sampleBeats.filter((b) => filterBeat(b, { query: 'chill' }));
    expect(result).toHaveLength(2);
  });

  it('filters by search query in genre', () => {
    const result = sampleBeats.filter((b) => filterBeat(b, { query: 'drill' }));
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Blaze');
  });

  it('filters by key', () => {
    const result = sampleBeats.filter((b) => filterBeat(b, { keyF: 'Am' }));
    expect(result).toHaveLength(2);
    expect(result.every((b) => b.key === 'Am')).toBe(true);
  });

  it('filters by mood (exact tag match)', () => {
    const result = sampleBeats.filter((b) => filterBeat(b, { moodF: 'aggressive' }));
    expect(result).toHaveLength(2);
  });

  it('filters by activeTags (all must match)', () => {
    const result = sampleBeats.filter((b) => filterBeat(b, { activeTags: ['dark', 'chill'] }));
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Moonlit');
  });

  it('combines genre and query', () => {
    const result = sampleBeats.filter((b) => filterBeat(b, { genre: 'Trap', query: 'dark' }));
    expect(result).toHaveLength(2);
  });

  it('combines genre and key', () => {
    const result = sampleBeats.filter((b) => filterBeat(b, { genre: 'Trap', keyF: 'Am' }));
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Dark Night');
  });

  it('returns empty for no matches', () => {
    const result = sampleBeats.filter((b) => filterBeat(b, { query: 'nonexistent' }));
    expect(result).toHaveLength(0);
  });

  it('handles beats without tags', () => {
    const beats = [{ id: '1', name: 'No Tags', genre: 'Trap', bpm: 120, key: 'C', tags: null, createdAt: 1 }];
    const result = beats.filter((b) => filterBeat(b, { moodF: 'chill' }));
    expect(result).toHaveLength(0);
  });

  it('handles beats without licenses (price sort)', () => {
    const beats = [
      { id: '1', name: 'A', genre: 'X', bpm: 100, key: 'C', createdAt: 1, licenses: [] },
      { id: '2', name: 'B', genre: 'X', bpm: 100, key: 'C', createdAt: 2, licenses: [{ priceMXN: 500 }] },
    ];
    const sorted = beats.sort(sorters['price-asc']);
    expect(sorted[0].id).toBe('1'); // 0 price first
    expect(sorted[1].id).toBe('2');
  });
});
