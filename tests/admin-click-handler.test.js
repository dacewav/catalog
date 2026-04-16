// ═══ Tests: Admin — Click Handler (event delegation) ═══
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { registerAction, registerActions } from '../src/admin/click-handler.js';

describe('click-handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('registerAction does not throw', () => {
    const fn = vi.fn();
    expect(() => registerAction('test-action-ch', fn)).not.toThrow();
  });

  it('registerActions does not throw for map of actions', () => {
    expect(() => registerActions({ a1: vi.fn(), a2: vi.fn() })).not.toThrow();
  });

  it('registerActions with empty map does not throw', () => {
    expect(() => registerActions({})).not.toThrow();
  });
});
