// ═══ DACEWAV.STORE — Error Handler ═══
// Centralized error handling with user-facing toasts and logging

const _errorLog = [];
const MAX_LOG_SIZE = 100;

/**
 * Log an error with context. Silent by default, shows toast for user-facing errors.
 * @param {string} context - Where the error happened (e.g. 'Firebase/BeatsLoad')
 * @param {Error|string} error - The error object or message
 * @param {object} [extra] - Additional metadata
 * @param {boolean} [showToast=false] - Whether to show a toast to the user
 */
export function logError(context, error, extra = {}, showToast = false) {
  const entry = {
    ts: Date.now(),
    context,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : null,
    ...extra,
  };

  _errorLog.push(entry);
  if (_errorLog.length > MAX_LOG_SIZE) _errorLog.shift();

  console.error(`[DACE:${context}]`, entry.message, extra);

  if (showToast && typeof window.showToast === 'function') {
    window.showToast(`Error: ${entry.message}`);
  }
}

/**
 * Wrap an async function with error handling.
 * Returns a function that catches errors and logs them.
 */
export function withErrorHandling(context, fn, showToast = false) {
  return function (...args) {
    try {
      const result = fn.apply(this, args);
      if (result && typeof result.catch === 'function') {
        return result.catch((err) => {
          logError(context, err, {}, showToast);
        });
      }
      return result;
    } catch (err) {
      logError(context, err, {}, showToast);
    }
  };
}

/**
 * Create a Firebase .catch() handler that logs the error.
 */
export function fbCatch(context, showToast = false) {
  return (err) => logError(context, err, { db: 'firebase' }, showToast);
}

/**
 * Get the error log (for debugging).
 */
export function getErrorLog() {
  return [..._errorLog];
}

/**
 * Clear the error log.
 */
export function clearErrorLog() {
  _errorLog.length = 0;
}
