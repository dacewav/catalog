// ═══ DACEWAV Admin — Undo/Redo Module ═══
// Extracted from core.js for maintainability.
// Uses dependency injection to avoid circular imports with core.js.

import {
  _undoStack, _redoStack, _lastSavedTheme, _undoDebounce,
  setLastSavedTheme, setUndoDebounce, setT
} from './state.js';
import { showToast } from './helpers.js';

// Dependencies injected by core.js at init time
let _collectTheme = null;
let _loadThemeUI = null;
let _broadcastThemeNow = null;

/**
 * Inject dependencies from core.js.
 * Call this once during admin init, AFTER core.js functions are defined.
 */
export function setUndoDeps({ collectTheme, loadThemeUI, broadcastThemeNow }) {
  _collectTheme = collectTheme;
  _loadThemeUI = loadThemeUI;
  _broadcastThemeNow = broadcastThemeNow;
}

export function pushUndo() {
  clearTimeout(_undoDebounce);
  setUndoDebounce(setTimeout(() => {
    if (!_collectTheme) return;
    const snap = JSON.stringify(_collectTheme());
    if (_lastSavedTheme === snap) return;
    _undoStack.push(snap);
    setLastSavedTheme(snap);
    if (_undoStack.length > 50) _undoStack.shift();
    _redoStack.length = 0;
  }, 300));
}

export function pushUndoInitial() {
  if (!_collectTheme) return;
  const snap = JSON.stringify(_collectTheme());
  _undoStack.length = 0;
  _undoStack.push(snap);
  setLastSavedTheme(snap);
  _redoStack.length = 0;
}

export function undo() {
  if (_undoStack.length < 2) return;
  _redoStack.push(_undoStack.pop());
  const prev = _undoStack[_undoStack.length - 1];
  if (prev) {
    setT(JSON.parse(prev));
    if (_loadThemeUI) _loadThemeUI();
    if (_broadcastThemeNow) _broadcastThemeNow();
    showToast('Deshacer ↩');
  }
}

export function redo() {
  if (!_redoStack.length) return;
  const next = _redoStack.pop();
  _undoStack.push(next);
  setT(JSON.parse(next));
  if (_loadThemeUI) _loadThemeUI();
  if (_broadcastThemeNow) _broadcastThemeNow();
  showToast('Rehacer ↪');
}
