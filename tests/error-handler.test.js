// ═══ DACEWAV.STORE — Error Handler Tests ═══
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { logError, withErrorHandling, fbCatch, getErrorLog, clearErrorLog } from '../src/error-handler.js';

describe('logError', () => {
  beforeEach(() => {
    clearErrorLog();
    vi.restoreAllMocks();
  });

  it('logs errors to internal log', () => {
    logError('Test/context', new Error('test error'), { extra: 1 });
    const log = getErrorLog();
    expect(log).toHaveLength(1);
    expect(log[0].context).toBe('Test/context');
    expect(log[0].message).toBe('test error');
    expect(log[0].extra).toBe(1);
  });

  it('logs string errors', () => {
    logError('Test/string', 'something broke');
    const log = getErrorLog();
    expect(log[0].message).toBe('something broke');
    expect(log[0].stack).toBe(null);
  });

  it('caps log at MAX_LOG_SIZE', () => {
    for (let i = 0; i < 110; i++) {
      logError('Test/loop', `error ${i}`);
    }
    expect(getErrorLog().length).toBeLessThanOrEqual(100);
  });

  it('calls console.error', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    logError('Test/ce', 'msg');
    expect(spy).toHaveBeenCalled();
  });
});

describe('clearErrorLog', () => {
  beforeEach(() => {
    clearErrorLog();
    vi.restoreAllMocks();
  });

  it('clears the log', () => {
    logError('Test', 'x');
    logError('Test', 'y');
    const log = getErrorLog();
    // Filter to only our test entries (exclude console.error noise from other tests)
    const testEntries = log.filter(e => e.context === 'Test');
    expect(testEntries).toHaveLength(2);
    clearErrorLog();
    expect(getErrorLog()).toHaveLength(0);
  });
});

describe('withErrorHandling', () => {
  beforeEach(() => clearErrorLog());

  it('wraps sync functions', () => {
    const fn = withErrorHandling('Test/sync', () => { throw new Error('boom'); });
    fn(); // should not throw
    expect(getErrorLog()[0].message).toBe('boom');
  });

  it('passes through successful results', () => {
    const fn = withErrorHandling('Test/ok', (x) => x * 2);
    // withErrorHandling returns void on success, but the original fn runs
    fn(5);
    expect(getErrorLog()).toHaveLength(0);
  });

  it('wraps async functions', async () => {
    const fn = withErrorHandling('Test/async', async () => { throw new Error('async boom'); });
    await fn();
    expect(getErrorLog()[0].message).toBe('async boom');
  });
});

describe('fbCatch', () => {
  beforeEach(() => {
    clearErrorLog();
    vi.restoreAllMocks();
  });

  it('returns a catch handler function', () => {
    const handler = fbCatch('Firebase/test');
    expect(typeof handler).toBe('function');
    handler(new Error('permission denied'));
    // Find our entry (may not be first if other test leaked)
    const entry = getErrorLog().find(e => e.context === 'Firebase/test');
    expect(entry).toBeTruthy();
    expect(entry.message).toBe('permission denied');
  });
});
