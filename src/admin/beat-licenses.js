// ═══ DACEWAV Admin — Beat License Editor ═══
// License CRUD for beat editor

import { defLics, setEdLics, _edLics } from './state.js';
import { g, val, setVal, showToast } from './helpers.js';
import { autoSave } from './autosave.js';

export function renderLicEditor(lics) {
  const c = g('le-editor'); if (!c) return;
  c.innerHTML = lics.map((l, i) => '<div class="lic-ed-row" data-idx="' + i + '"><div class="lic-ed-grid"><input type="text" placeholder="Nombre" value="' + (l.name || '') + '" data-action="up-lic" data-idx="' + i + '" data-field="name"><input type="number" placeholder="MXN" value="' + (l.priceMXN || '') + '" data-action="up-lic" data-idx="' + i + '" data-field="mxn"><input type="number" placeholder="USD" value="' + (l.priceUSD || '') + '" data-action="up-lic" data-idx="' + i + '" data-field="usd"></div><input type="text" placeholder="Descripción" value="' + (l.description || '') + '" style="font-size:10px" data-action="up-lic" data-idx="' + i + '" data-field="desc"><button class="btn btn-del" style="margin-top:4px;font-size:9px" data-action="rm-lic" data-idx="' + i + '">✕</button></div>').join('');
}

export function upLic(idx, field, value) {
  collectLics();
  autoSave();
}

export function addLicRow() {
  collectLics();
  _edLics.push({ name: '', priceMXN: 0, priceUSD: 0, description: '' });
  renderLicEditor(_edLics);
}

export function rmLic(idx) {
  collectLics();
  _edLics.splice(idx, 1);
  renderLicEditor(_edLics);
}

function collectLics() {
  const lics = [];
  g('le-editor')?.querySelectorAll('.lic-ed-row').forEach(row => {
    const inp = row.querySelectorAll('input');
    lics.push({
      name: inp[0].value,
      priceMXN: parseFloat(inp[1].value) || 0,
      priceUSD: parseFloat(inp[2].value) || 0,
      description: inp[3].value
    });
  });
  setEdLics(lics);
}

export function loadDefaultLics() {
  renderLicEditor(JSON.parse(JSON.stringify(defLics)));
  showToast('Licencias base cargadas');
}
