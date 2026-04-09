// ═══ Tests: Admin — Stubs (placeholder functions) ═══
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockShowToast } = vi.hoisted(() => {
  const mockShowToast = vi.fn();
  return { mockShowToast };
});

vi.mock('../src/admin/helpers.js', () => ({
  g: vi.fn(() => null),
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

// Import stubs — they assign to window on import
import '../src/admin/stubs.js';

describe('stubs module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('assigns all stub functions to window', () => {
    expect(typeof window.initLayoutCanvas).toBe('function');
    expect(typeof window.runBackup).toBe('function');
    expect(typeof window.runSitemap).toBe('function');
    expect(typeof window.runStats).toBe('function');
    expect(typeof window.loadStats).toBe('function');
  });

  it('initLayoutCanvas shows toast', () => {
    window.initLayoutCanvas();
    expect(mockShowToast).toHaveBeenCalledWith('Layout Canvas: próximamente');
  });

  it('runBackup shows toast', () => {
    window.runBackup();
    expect(mockShowToast).toHaveBeenCalledWith('Backup: próximamente');
  });

  it('runSitemap shows toast', () => {
    window.runSitemap();
    expect(mockShowToast).toHaveBeenCalledWith('Sitemap: próximamente');
  });

  it('runStats shows toast', () => {
    window.runStats();
    expect(mockShowToast).toHaveBeenCalledWith('Stats vía Worker: próximamente');
  });

  it('loadStats shows toast', () => {
    window.loadStats();
    expect(mockShowToast).toHaveBeenCalledWith('Stats: próximamente');
  });

  it('each stub calls showToast exactly once', () => {
    window.initLayoutCanvas();
    window.runBackup();
    window.runSitemap();
    window.runStats();
    window.loadStats();
    expect(mockShowToast).toHaveBeenCalledTimes(5);
  });
});
