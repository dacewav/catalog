// ═══ DACEWAV Admin — Preview Live Sync ═══
// Syncs individual CSS var changes to iframe for instant slider/color preview
// Works alongside preview-sync.js (which handles structured broadcast)

// Map of input IDs → CSS variable names for live sync
const _idToVar = {
  't-blur': '--blur', 't-card-op': '--card-op', 't-grain': '--grain-op', 't-radius': '--rad',
  't-nav-op': '--nav-op', 't-beat-img-op': '--beat-img-op', 't-text-op': '--text-op',
  't-hero-bg-op': '--hero-bg-op', 't-section-op': '--section-op', 't-font-size': '--font-size',
  't-line-h': '--line-h', 't-pad': '--pad', 't-gap': '--gap',
  't-bg-op': '--bg-op', 't-btn-op': '--btn-op', 't-btn-hop': '--btn-hop',
  't-shadow-int': '--shadow-int', 't-wbar-op': '--wbar-op', 't-wbar-aop': '--wbar-aop',
  't-wbar-h': '--wbar-h', 't-wbar-r': '--wbar-r'
};

function syncToPreview(varName, value) {
  document.documentElement.style.setProperty(varName, value);
  const frame = document.getElementById('preview-frame');
  if (frame?.contentWindow) {
    frame.contentWindow.postMessage({ type: 'DACE_THEME', updates: { [varName]: value } }, '*');
  }
}

function pushAllThemeToFrame() {
  const frame = document.getElementById('preview-frame');
  if (!frame?.contentWindow) return;
  const style = document.documentElement.style;
  const vars = [
    '--acc', '--bg', '--fg', '--blur', '--rad', '--grain-op', '--card-op', '--nav-op',
    '--tx-op', '--hero-bg-op', '--section-op', '--beat-img-op', '--text-op', '--font-size',
    '--line-h', '--pad', '--gap', '--btn-lic-clr', '--btn-lic-bdr', '--btn-lic-bg',
    '--wbar-clr', '--wbar-active', '--glow-clr', '--shadow-clr'
  ];
  const updates = {};
  vars.forEach(v => { const val = style.getPropertyValue(v); if (val) updates[v] = val.trim(); });
  if (Object.keys(updates).length > 0) {
    frame.contentWindow.postMessage({ type: 'DACE_THEME', updates }, '*');
  }
}

// Listen for range input changes → sync to iframe
document.addEventListener('input', (e) => {
  if (e.target.type !== 'range') return;
  const v = _idToVar[e.target.id]; if (!v) return;
  const s = e.target.nextElementSibling;
  syncToPreview(v, (s?.classList.contains('slider-val')) ? s.textContent : e.target.value);
});

// Wrap autoSave to also push theme to iframe
const _origAutoSave = window.autoSave;
let _pushDebounce = null;
window.autoSave = function () {
  if (_origAutoSave) _origAutoSave();
  clearTimeout(_pushDebounce);
  _pushDebounce = setTimeout(pushAllThemeToFrame, 150);
};

// Wrap individual color sync functions for instant preview
const colorSyncs = ['syncWB', 'syncWBA', 'syncBtnColor', 'syncBtnBdr', 'syncBtnBg', 'syncGlowColor', 'syncHeroTextColor'];
colorSyncs.forEach(fn => {
  if (typeof window[fn] === 'function') {
    const _orig = window[fn];
    window[fn] = function () {
      _orig.apply(this, arguments);
      clearTimeout(_pushDebounce);
      _pushDebounce = setTimeout(pushAllThemeToFrame, 50);
    };
  }
});

// Push initial theme when preview frame loads
const _pf = document.getElementById('preview-frame');
if (_pf) _pf.addEventListener('load', () => setTimeout(pushAllThemeToFrame, 100));

window.pushAllThemeToFrame = pushAllThemeToFrame;
