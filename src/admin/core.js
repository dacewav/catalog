// ═══ DACEWAV Admin — Core Module ═══
// Wiring hub: imports all extracted modules, wires dependency injection, re-exports, window assignments.

import { ANIMS } from './config.js';
import {
  db, T, setT, siteSettings, customEmojis, floatingEls,
  _undoStack,
  _iframeReady, setIframeReady, _ldTheme, _ldSettings, _ldBeats,
  setLdTheme, setLdSettings, setLdBeats
} from './state.js';
import { pushUndo, pushUndoInitial, undo, redo, setUndoDeps } from './undo.js';
import {
  renderGradEditor, buildGradCSS, addGradStop, updateGradStop,
  rmGradStop, startDragStop, applyGradToHero
} from './gradient.js';
import {
  logChange, renderChangeLog, logFieldChange, addTooltips
} from './changelog.js';
import {
  renderFloatingEditor, renderFloatingPreview, addFE, saveFE, rmFE
} from './floating.js';
import {
  takeSnapshot, renderSnapshots, loadSnapshot, rmSnapshot,
  populateDiffSelects, updateDiff, promptImportURL, importThemeFromURL,
  setSnapshotDeps
} from './snapshots.js';
import {
  renderEmojiGrid, insertEmoji, renderCustomEmojis, addCustomEmoji,
  uploadEmojiFile, removeCE, setEmojiDeps
} from './emojis.js';
import {
  initTextColorizers, renderTextColorizer, tczGetSegments, segmentsToHTML, tczSetColor,
  tczMarkPreset, tczWordClick, tczClearColors, tczSplitAtCursor
} from './text-colorizer.js';
import {
  updateGlowDesc, updateGlowAnimDesc, computeGlowCSS, applyGlowTo,
  applyGlowPreset, updatePreview, setGlowDeps
} from './glow.js';
import { togglePFields, initParticlesPreview, animPP } from './particles.js';
import { setupHeroDrag, toggleFullscreenPreview } from './fullscreen.js';
import { exportAll, importAll, exportCSS, setExportDeps } from './export.js';
import {
  buildAnimControls, collectAnim, loadAnimValues,
  renderPresets, applyPreset, renderSaveSlots, slotAction,
  saveCustomTheme, renderCustomThemes, loadCustomTheme, deleteCustomTheme, resetTheme,
  setPresetDeps
} from './theme-presets.js';
import {
  setShowSectionNav, toggleInspector, toggleAdminTheme,
  setupHeroSync, loadSettingsUI, setToggleDeps
} from './toggles.js';
import {
  g, val, setVal, checked, setChecked, hexRgba, hexFromRgba, rgbaFromHex,
  loadFont, showToast, showSaving, fmt, sv, resetSlider, toggleCard, setAutoSaveRef,
  confirmInline, promptInline, escapeHtml
} from './helpers.js';
import { loadColorValues } from './colors.js';

// ═══ EXTRACTED MODULES ═══
import { collectTheme, loadThemeUI, setThemeIODeps } from './theme-io.js';
import {
  postToFrame, broadcastTheme, broadcastThemeNow,
  broadcastHighlight, clearHighlight,
  refreshIframe, loadPreviewURL, setViewport,
  setPreviewSyncDeps
} from './preview-sync.js';
import {
  autoSave, saveAll, _collectSiteSettings,
  setAutoSaveDeps
} from './autosave.js';

// ═══ RE-EXPORTS (modules that import from core.js) ═══
export { collectTheme, loadThemeUI } from './theme-io.js';
export { autoSave, saveAll } from './autosave.js';
export { broadcastTheme, broadcastThemeNow, postToFrame } from './preview-sync.js';
export { updatePreview } from './glow.js';
export { updateHeroPv, updateBannerPv, updateDividerPv } from './hero-preview.js';
export { initParticlesPreview } from './particles.js';
export { loadSettingsUI } from './toggles.js';

// ═══ DEPENDENCY WIRING ═══
// Wire up helpers autoSave reference
setAutoSaveRef(autoSave);

// Wire up undo/redo dependencies (breaks circular import with undo.js)
setUndoDeps({ collectTheme, loadThemeUI, broadcastThemeNow });

// Wire up snapshot dependencies
setSnapshotDeps({ collectTheme, loadThemeUI, autoSave });

// Wire up emoji dependencies
setEmojiDeps({ updateBannerPv, autoSave });

// Wire up glow dependencies
setGlowDeps({ autoSave, updateHeroPv });

// Wire up export dependencies
setExportDeps({ collectTheme });

// Wire up preset/slot dependencies
setPresetDeps({ collectTheme, loadThemeUI, autoSave, broadcastThemeNow });

// Wire up toggle/setup dependencies
setToggleDeps({ postToFrame, PM_ORIGIN: (() => { try { return window.location.origin || '*'; } catch { return '*'; } })() });

// Wire up theme-io dependencies
setThemeIODeps({ autoSave });

// Wire up preview-sync dependencies
setPreviewSyncDeps({ collectTheme });

// Wire up autosave dependencies
setAutoSaveDeps({ collectTheme, broadcastTheme });

// ═══ WINDOW ASSIGNMENTS (for onclick handlers in HTML) ═══
Object.assign(window, {
  pushUndo, pushUndoInitial, undo, redo, autoSave, saveAll,
  broadcastTheme, broadcastThemeNow, broadcastHighlight, clearHighlight,
  refreshIframe, loadPreviewURL, setViewport,
  updateGlowDesc, updateGlowAnimDesc, computeGlowCSS, applyGlowTo, applyGlowPreset,
  updatePreview, collectTheme, loadThemeUI,
  renderEmojiGrid, insertEmoji, renderCustomEmojis, addCustomEmoji, uploadEmojiFile, removeCE,
  logChange, renderChangeLog, logFieldChange,
  addTooltips,
  renderFloatingEditor, renderFloatingPreview, addFE, saveFE, rmFE,
  renderGradEditor, buildGradCSS, addGradStop, updateGradStop, rmGradStop, startDragStop, applyGradToHero,
  takeSnapshot, renderSnapshots, loadSnapshot, rmSnapshot,
  populateDiffSelects, updateDiff,
  promptImportURL, importThemeFromURL
});
