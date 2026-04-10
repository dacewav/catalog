// ═══ DACEWAV Admin — Core Module (Orchestrator) ═══
// Re-exports from sub-modules and wires window assignments

// ═══ Imports from sub-modules ═══
import {
  pushUndo, undo, redo, autoSave, saveAll, _collectSiteSettings,
  collectTheme, renderPresets, applyPreset,
  renderSaveSlots, slotAction,
  saveCustomTheme, renderCustomThemes, loadCustomTheme, deleteCustomTheme, resetTheme,
  renderGradEditor, buildGradCSS, addGradStop, updateGradStop, rmGradStop, startDragStop, applyGradToHero,
  setBroadcastThemeRef, setLoadThemeUIRef
} from './core-persistence.js';

import {
  broadcastTheme, broadcastHighlight, clearHighlight,
  refreshIframe, loadPreviewURL, setViewport, setShowSectionNav,
  updateHeroPv, updateBannerPv, updatePreview,
  setupHeroSync, setupHeroDrag, toggleFullscreenPreview
} from './core-preview.js';

import {
  updateGlowDesc, updateGlowAnimDesc, computeGlowCSS, applyGlowTo,
  buildAnimControls, collectAnim, loadAnimValues,
  togglePFields, initParticlesPreview, animPP
} from './core-effects.js';

import {
  exportAll, importAll, exportCSS,
  logChange, renderChangeLog, logFieldChange,
  populateDiffSelects, updateDiff,
  promptImportURL, importThemeFromURL
} from './core-export.js';

import {
  toggleInspector, toggleAdminTheme,
  loadThemeUI, loadSettingsUI, addTooltips,
  renderFloatingEditor, renderFloatingPreview, addFE, saveFE, rmFE,
  renderEmojiGrid, insertEmoji, renderCustomEmojis, addCustomEmoji, removeCE,
  takeSnapshot, renderSnapshots, loadSnapshot, rmSnapshot
} from './core-ui.js';

// ═══ Wire lazy references to avoid circular dependencies ═══
setBroadcastThemeRef(broadcastTheme);
setLoadThemeUIRef(loadThemeUI);

// Wire preview iframe click → admin section navigation
import { showSection } from './nav.js';
setShowSectionNav(showSection);

// Wire colors.js refs (breaks colors → core-preview/core-persistence cycle)
import { setColorRefs } from './colors.js';
setColorRefs(updatePreview, autoSave);

// ═══ Re-export for test compatibility ═══
export {
  computeGlowCSS, collectTheme,
  pushUndo, undo, redo, autoSave, saveAll,
  broadcastTheme, broadcastHighlight, clearHighlight,
  refreshIframe, loadPreviewURL, setViewport,
  toggleInspector, toggleAdminTheme,
  updateHeroPv, updateBannerPv,
  updateGlowDesc, updateGlowAnimDesc, applyGlowTo,
  updatePreview, loadThemeUI, setupHeroSync, loadSettingsUI,
  buildAnimControls, collectAnim, loadAnimValues,
  renderPresets, applyPreset,
  renderSaveSlots, slotAction,
  saveCustomTheme, renderCustomThemes, loadCustomTheme, deleteCustomTheme, resetTheme,
  togglePFields, initParticlesPreview, animPP,
  renderEmojiGrid, insertEmoji, renderCustomEmojis, addCustomEmoji, removeCE,
  exportAll, importAll, exportCSS,
  logChange, renderChangeLog, logFieldChange,
  addTooltips,
  renderFloatingEditor, renderFloatingPreview, addFE, saveFE, rmFE,
  renderGradEditor, buildGradCSS, addGradStop, updateGradStop, rmGradStop, startDragStop, applyGradToHero,
  setupHeroDrag, toggleFullscreenPreview,
  takeSnapshot, renderSnapshots, loadSnapshot, rmSnapshot,
  populateDiffSelects, updateDiff,
  promptImportURL, importThemeFromURL,
  setShowSectionNav
};

// ═══ Re-export config ═══
export { EMOJIS } from './config.js';

// ═══ WINDOW ASSIGNMENTS ═══
Object.assign(window, {
  pushUndo, undo, redo, autoSave, saveAll,
  broadcastTheme, broadcastHighlight, clearHighlight,
  refreshIframe, loadPreviewURL, setViewport,
  toggleInspector, toggleAdminTheme,
  updateHeroPv, updateBannerPv,
  updateGlowDesc, updateGlowAnimDesc, computeGlowCSS, applyGlowTo,
  updatePreview, collectTheme, loadThemeUI, setupHeroSync, loadSettingsUI,
  buildAnimControls, collectAnim, loadAnimValues,
  renderPresets, applyPreset,
  renderSaveSlots, slotAction,
  saveCustomTheme, renderCustomThemes, loadCustomTheme, deleteCustomTheme, resetTheme,
  togglePFields, initParticlesPreview, animPP,
  renderEmojiGrid, insertEmoji, renderCustomEmojis, addCustomEmoji, removeCE,
  exportAll, importAll, exportCSS,
  logChange, renderChangeLog, logFieldChange,
  addTooltips,
  renderFloatingEditor, renderFloatingPreview, addFE, saveFE, rmFE,
  renderGradEditor, buildGradCSS, addGradStop, updateGradStop, rmGradStop, startDragStop, applyGradToHero,
  setupHeroDrag, toggleFullscreenPreview,
  takeSnapshot, renderSnapshots, loadSnapshot, rmSnapshot,
  populateDiffSelects, updateDiff,
  promptImportURL, importThemeFromURL,
  setShowSectionNav
});
