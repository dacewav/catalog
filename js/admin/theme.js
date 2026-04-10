// ════════════════════════════════════════════════════════════
// DACEWAV.STORE — Admin Theme Editor (js/admin/theme.js)
// ════════════════════════════════════════════════════════════

import { db } from '../firebase.js';
import {
  ref, get, set, update, push
} from 'https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js';

const DEFAULTS = {
  colorPrimary:    '#6B1A2A',
  colorAccent:     '#C44569',
  colorBg:         '#080808',
  colorSurface:    '#111111',
  colorText:       '#F0EAE2',
  colorMuted:      '#8A8078',
  glowIntensity:   60,
  grainOpacity:    0.035,
  fontDisplay:     'Bebas Neue',
  fontBody:        'DM Sans',
};

const DISPLAY_FONTS = ['Bebas Neue', 'Anton', 'Oswald', 'Playfair Display', 'Syne'];
const BODY_FONTS   = ['DM Sans', 'Inter', 'Karla', 'Nunito', 'Plus Jakarta Sans'];

const COLOR_MAP = {
  colorPrimary: '--color-primary',
  colorAccent:  '--color-accent',
  colorBg:      '--color-bg',
  colorSurface: '--color-surface',
  colorText:    '--color-text',
  colorMuted:   '--color-text-muted',
};

let container;
let currentTheme = { ...DEFAULTS };

export function initTheme() {
  container = document.getElementById('theme-container');
  if (!container) return;

  buildUI();
  loadTheme();
}

function buildUI() {
  container.innerHTML = '';

  // ── Colors ──
  const colorsSection = createSection('Colores');
  Object.entries(COLOR_MAP).forEach(([key, label]) => {
    const row = document.createElement('div');
    row.className = 'form-group';

    const lbl = document.createElement('label');
    lbl.textContent = cssVarLabel(key);
    row.appendChild(lbl);

    const inputWrap = document.createElement('div');
    inputWrap.className = 'color-input';

    const colorPicker = document.createElement('input');
    colorPicker.type = 'color';
    colorPicker.value = DEFAULTS[key];
    colorPicker.id = `theme-${key}`;

    const textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.value = DEFAULTS[key];
    textInput.id = `theme-${key}-text`;
    textInput.className = 'color-text';

    colorPicker.addEventListener('input', () => {
      textInput.value = colorPicker.value;
      applyLive(key, colorPicker.value);
    });

    textInput.addEventListener('input', () => {
      if (/^#[0-9a-fA-F]{6}$/.test(textInput.value)) {
        colorPicker.value = textInput.value;
        applyLive(key, textInput.value);
      }
    });

    inputWrap.appendChild(colorPicker);
    inputWrap.appendChild(textInput);
    row.appendChild(inputWrap);
    colorsSection.appendChild(row);
  });
  container.appendChild(colorsSection);

  // ── Effects ──
  const fxSection = createSection('Efectos');

  // Glow
  fxSection.appendChild(createRange('Intensidad glow', 'theme-glow', 0, 100, DEFAULTS.glowIntensity, (v) => {
    currentTheme.glowIntensity = v;
    const opacity = v / 100;
    document.documentElement.style.setProperty('--glow-primary', `0 0 40px rgba(107, 26, 42, ${opacity})`);
  }));

  // Grain
  fxSection.appendChild(createRange('Opacidad grain', 'theme-grain', 0, 100, DEFAULTS.grainOpacity * 1000, (v) => {
    const grain = v / 1000;
    currentTheme.grainOpacity = grain;
    document.documentElement.style.setProperty('--grain-opacity', grain);
  }, true));

  container.appendChild(fxSection);

  // ── Typography ──
  const typoSection = createSection('Tipografía');

  typoSection.appendChild(createFontSelect('Font display', 'theme-font-display', DISPLAY_FONTS, DEFAULTS.fontDisplay, (v) => {
    currentTheme.fontDisplay = v;
    document.documentElement.style.setProperty('--font-display', `'${v}', sans-serif`);
  }));

  typoSection.appendChild(createFontSelect('Font body', 'theme-font-body', BODY_FONTS, DEFAULTS.fontBody, (v) => {
    currentTheme.fontBody = v;
    document.documentElement.style.setProperty('--font-body', `'${v}', sans-serif`);
  }));

  container.appendChild(typoSection);

  // ── Actions ──
  const actions = document.createElement('div');
  actions.style.cssText = 'display:flex;gap:var(--space-md);margin-top:var(--space-xl);flex-wrap:wrap';

  const btnSave = document.createElement('button');
  btnSave.className = 'btn-primary';
  btnSave.textContent = 'Guardar tema';
  btnSave.addEventListener('click', saveTheme);
  actions.appendChild(btnSave);

  const btnReset = document.createElement('button');
  btnReset.className = 'btn-secondary';
  btnReset.textContent = 'Resetear';
  btnReset.addEventListener('click', resetToDefaults);
  actions.appendChild(btnReset);

  container.appendChild(actions);

  // ── Presets ──
  const presetsSection = createSection('Presets');
  presetsSection.id = 'theme-presets';

  const presetRow = document.createElement('div');
  presetRow.style.cssText = 'display:flex;gap:var(--space-sm);margin-bottom:var(--space-md)';

  const presetNameInput = document.createElement('input');
  presetNameInput.type = 'text';
  presetNameInput.placeholder = 'Nombre del preset';
  presetNameInput.id = 'preset-name';
  presetNameInput.style.flex = '1';

  const btnSavePreset = document.createElement('button');
  btnSavePreset.className = 'btn-action btn-action--new';
  btnSavePreset.textContent = 'Guardar preset';
  btnSavePreset.addEventListener('click', savePreset);

  presetRow.appendChild(presetNameInput);
  presetRow.appendChild(btnSavePreset);
  presetsSection.appendChild(presetRow);

  const presetList = document.createElement('div');
  presetList.id = 'preset-list';
  presetsSection.appendChild(presetList);

  container.appendChild(presetsSection);

  // Load presets
  loadPresets();
}

// ── Load current theme from Firebase ──
async function loadTheme() {
  try {
    const snap = await get(ref(db, 'config/theme'));
    if (!snap.exists()) return;

    const theme = snap.val();
    currentTheme = { ...DEFAULTS, ...theme };

    // Populate inputs
    Object.keys(COLOR_MAP).forEach(key => {
      if (theme[key]) {
        const picker = document.getElementById(`theme-${key}`);
        const text = document.getElementById(`theme-${key}-text`);
        if (picker) picker.value = theme[key];
        if (text) text.value = theme[key];
      }
    });

    if (theme.glowIntensity !== undefined) {
      const slider = document.getElementById('theme-glow');
      if (slider) slider.value = theme.glowIntensity;
    }

    if (theme.grainOpacity !== undefined) {
      const slider = document.getElementById('theme-grain');
      if (slider) slider.value = theme.grainOpacity * 1000;
    }

    if (theme.fontDisplay) {
      const sel = document.getElementById('theme-font-display');
      if (sel) sel.value = theme.fontDisplay;
    }

    if (theme.fontBody) {
      const sel = document.getElementById('theme-font-body');
      if (sel) sel.value = theme.fontBody;
    }
  } catch (err) {
    console.warn('[DACEWAV] Theme load failed:', err);
  }
}

// ── Apply live preview ──
function applyLive(key, value) {
  currentTheme[key] = value;
  const cssVar = COLOR_MAP[key];
  if (cssVar) {
    document.documentElement.style.setProperty(cssVar, value);
  }
}

// ── Save to Firebase ──
async function saveTheme() {
  try {
    await set(ref(db, 'config/theme'), { ...currentTheme });
    window.__toast('✓ Tema guardado');
  } catch (err) {
    window.__toast('Error al guardar tema', 'error');
  }
}

// ── Reset to defaults ──
function resetToDefaults() {
  currentTheme = { ...DEFAULTS };

  Object.keys(COLOR_MAP).forEach(key => {
    const picker = document.getElementById(`theme-${key}`);
    const text = document.getElementById(`theme-${key}-text`);
    if (picker) picker.value = DEFAULTS[key];
    if (text) text.value = DEFAULTS[key];
    document.documentElement.style.setProperty(COLOR_MAP[key], DEFAULTS[key]);
  });

  const glowSlider = document.getElementById('theme-glow');
  if (glowSlider) glowSlider.value = DEFAULTS.glowIntensity;
  document.documentElement.style.setProperty('--glow-primary',
    `0 0 40px rgba(107, 26, 42, ${DEFAULTS.glowIntensity / 100})`);

  const grainSlider = document.getElementById('theme-grain');
  if (grainSlider) grainSlider.value = DEFAULTS.grainOpacity * 1000;
  document.documentElement.style.setProperty('--grain-opacity', DEFAULTS.grainOpacity);

  const fontD = document.getElementById('theme-font-display');
  if (fontD) fontD.value = DEFAULTS.fontDisplay;
  document.documentElement.style.setProperty('--font-display', `'${DEFAULTS.fontDisplay}', sans-serif`);

  const fontB = document.getElementById('theme-font-body');
  if (fontB) fontB.value = DEFAULTS.fontBody;
  document.documentElement.style.setProperty('--font-body', `'${DEFAULTS.fontBody}', sans-serif`);

  window.__toast('Tema reseteado');
}

// ── Presets ──
async function savePreset() {
  const nameInput = document.getElementById('preset-name');
  const name = nameInput.value.trim();
  if (!name) {
    window.__toast('Nombre de preset requerido', 'error');
    return;
  }

  try {
    await push(ref(db, 'config/theme_presets'), {
      name,
      theme: { ...currentTheme },
      createdAt: Date.now(),
    });
    nameInput.value = '';
    window.__toast(`Preset "${name}" guardado`);
    loadPresets();
  } catch (err) {
    window.__toast('Error al guardar preset', 'error');
  }
}

async function loadPresets() {
  const listEl = document.getElementById('preset-list');
  if (!listEl) return;

  try {
    const snap = await get(ref(db, 'config/theme_presets'));
    listEl.innerHTML = '';

    if (!snap.exists()) {
      listEl.innerHTML = '<p style="color:var(--color-text-dim);font-size:var(--text-sm)">Sin presets guardados</p>';
      return;
    }

    const presets = Object.entries(snap.val()).map(([id, p]) => ({ id, ...p }));

    presets.forEach(preset => {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:var(--space-sm) 0;border-bottom:1px solid var(--color-border)';

      const name = document.createElement('span');
      name.style.fontSize = 'var(--text-sm)';
      name.textContent = preset.name;
      row.appendChild(name);

      const btns = document.createElement('div');
      btns.style.cssText = 'display:flex;gap:var(--space-xs)';

      const btnLoad = document.createElement('button');
      btnLoad.className = 'btn-action btn-action--edit';
      btnLoad.textContent = 'Cargar';
      btnLoad.addEventListener('click', () => applyPreset(preset.theme));
      btns.appendChild(btnLoad);

      const btnDel = document.createElement('button');
      btnDel.className = 'btn-action btn-action--delete';
      btnDel.textContent = '✕';
      btnDel.addEventListener('click', async () => {
        try {
          await set(ref(db, `config/theme_presets/${preset.id}`), null);
          window.__toast('Preset eliminado');
          loadPresets();
        } catch (err) {
          window.__toast('Error', 'error');
        }
      });
      btns.appendChild(btnDel);

      row.appendChild(btns);
      listEl.appendChild(row);
    });
  } catch (err) {
    listEl.innerHTML = '<p style="color:var(--color-error);font-size:var(--text-sm)">Error al cargar presets</p>';
  }
}

function applyPreset(theme) {
  currentTheme = { ...DEFAULTS, ...theme };

  Object.keys(COLOR_MAP).forEach(key => {
    if (theme[key]) {
      const picker = document.getElementById(`theme-${key}`);
      const text = document.getElementById(`theme-${key}-text`);
      if (picker) picker.value = theme[key];
      if (text) text.value = theme[key];
      document.documentElement.style.setProperty(COLOR_MAP[key], theme[key]);
    }
  });

  if (theme.glowIntensity !== undefined) {
    const s = document.getElementById('theme-glow');
    if (s) s.value = theme.glowIntensity;
    document.documentElement.style.setProperty('--glow-primary',
      `0 0 40px rgba(107, 26, 42, ${theme.glowIntensity / 100})`);
  }

  if (theme.grainOpacity !== undefined) {
    const s = document.getElementById('theme-grain');
    if (s) s.value = theme.grainOpacity * 1000;
    document.documentElement.style.setProperty('--grain-opacity', theme.grainOpacity);
  }

  if (theme.fontDisplay) {
    const sel = document.getElementById('theme-font-display');
    if (sel) sel.value = theme.fontDisplay;
    document.documentElement.style.setProperty('--font-display', `'${theme.fontDisplay}', sans-serif`);
  }

  if (theme.fontBody) {
    const sel = document.getElementById('theme-font-body');
    if (sel) sel.value = theme.fontBody;
    document.documentElement.style.setProperty('--font-body', `'${theme.fontBody}', sans-serif`);
  }

  window.__toast('Preset cargado');
}

// ── UI Builders ──
function createSection(title) {
  const section = document.createElement('div');
  section.style.marginBottom = 'var(--space-xl)';

  const h = document.createElement('h4');
  h.style.cssText = 'font-family:var(--font-display);font-size:var(--text-xl);letter-spacing:0.1em;margin-bottom:var(--space-md)';
  h.textContent = title;
  section.appendChild(h);

  return section;
}

function createRange(label, id, min, max, value, onChange, smallStep = false) {
  const group = document.createElement('div');
  group.className = 'form-group';

  const lbl = document.createElement('label');
  lbl.textContent = label;
  group.appendChild(lbl);

  const wrap = document.createElement('div');
  wrap.className = 'range-input';

  const input = document.createElement('input');
  input.type = 'range';
  input.id = id;
  input.min = min;
  input.max = max;
  input.step = smallStep ? 1 : (max <= 1 ? 0.01 : 1);
  input.value = value;

  const valDisplay = document.createElement('span');
  valDisplay.className = 'range-input__value';
  valDisplay.textContent = smallStep ? (value / 1000).toFixed(3) : value;

  input.addEventListener('input', () => {
    const v = parseFloat(input.value);
    valDisplay.textContent = smallStep ? (v / 1000).toFixed(3) : v;
    onChange(v);
  });

  wrap.appendChild(input);
  wrap.appendChild(valDisplay);
  group.appendChild(wrap);

  return group;
}

function createFontSelect(label, id, options, value, onChange) {
  const group = document.createElement('div');
  group.className = 'form-group';

  const lbl = document.createElement('label');
  lbl.textContent = label;
  group.appendChild(lbl);

  const sel = document.createElement('select');
  sel.id = id;
  options.forEach(f => {
    const opt = document.createElement('option');
    opt.value = f;
    opt.textContent = f;
    if (f === value) opt.selected = true;
    sel.appendChild(opt);
  });

  sel.addEventListener('change', () => onChange(sel.value));
  group.appendChild(sel);

  return group;
}

function cssVarLabel(key) {
  const map = {
    colorPrimary: 'Color primario',
    colorAccent:  'Color accent',
    colorBg:      'Background',
    colorSurface: 'Surface',
    colorText:    'Texto',
    colorMuted:   'Texto muted',
  };
  return map[key] || key;
}
