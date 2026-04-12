// ═══ DACEWAV Admin — Features Catch-all ═══
// Links, Testimonials, Default Licenses, Worker API, showEt, copyCmd, misc

import { db, siteSettings, defLics, customLinks, floatingEls } from './state.js';
import { g, val, setVal, showToast, showSaving } from './helpers.js';

// ═══ DEFAULT LICENSES ═══
export function renderDefLicsEditor() {
  const el = g('def-lics-editor'); if (!el) return;
  el.innerHTML = (defLics || []).map((l, i) =>
    '<div class="lic-ed-row" data-idx="' + i + '"><div class="lic-ed-grid"><input type="text" placeholder="Nombre" value="' + (l.name || '') + '" onchange="upDefLic(' + i + ',\'name\',this.value)"><input type="number" placeholder="MXN" value="' + (l.priceMXN || '') + '" onchange="upDefLic(' + i + ',\'mxn\',this.value)"><input type="number" placeholder="USD" value="' + (l.priceUSD || '') + '" onchange="upDefLic(' + i + ',\'usd\',this.value)"></div><input type="text" placeholder="Descripción" value="' + (l.description || '') + '" style="font-size:10px" onchange="upDefLic(' + i + ',\'desc\',this.value)"><button class="btn btn-del" style="margin-top:4px;font-size:9px" onclick="rmDefLic(' + i + ')">✕</button></div>'
  ).join('') || '<div style="color:var(--hi);font-size:10px">Sin licencias base</div>';
}
export function addDefLicRow() {
  defLics.push({ name: '', priceMXN: 0, priceUSD: 0, description: '' });
  renderDefLicsEditor();
}
export function rmDefLic(i) {
  defLics.splice(i, 1);
  renderDefLicsEditor();
}
export function upDefLic(i, field, v) {
  if (!defLics[i]) return;
  if (field === 'name') defLics[i].name = v;
  else if (field === 'mxn') defLics[i].priceMXN = parseFloat(v) || 0;
  else if (field === 'usd') defLics[i].priceUSD = parseFloat(v) || 0;
  else if (field === 'desc') defLics[i].description = v;
}
export function saveDefLics() {
  if (db) db.ref('defaultLicenses').set(defLics).then(() => showToast('Licencias base guardadas ✓')).catch(() => showToast('Error', true));
  else showToast('Firebase no conectado', true);
}

// ═══ LINKS ═══
export function renderLinksEditor() {
  const el = g('links-editor'); if (!el) return;
  const links = Object.entries(customLinks || {});
  el.innerHTML = links.length ? links.map(([k, l]) =>
    '<div class="link-ed-row" data-key="' + k + '"><input type="text" placeholder="Etiqueta" value="' + (l.label || '') + '" data-f="label"><input type="url" placeholder="URL" value="' + (l.url || '') + '" data-f="url"><select data-f="loc"><option value="header"' + (l.location === 'header' ? ' selected' : '') + '>Header</option><option value="hero"' + (l.location === 'hero' ? ' selected' : '') + '>Hero</option><option value="footer"' + (l.location === 'footer' ? ' selected' : '') + '>Footer</option></select><button class="btn btn-del" style="font-size:9px" onclick="rmLink(\'' + k + '\')">✕</button></div>'
  ).join('') : '<div style="color:var(--hi);font-size:10px">Sin links</div>';
}
export function addLinkRow() {
  customLinks['l_' + Date.now()] = { label: '', url: '', location: 'header' };
  renderLinksEditor();
}
export function rmLink(k) {
  delete customLinks[k];
  if (db) db.ref('customLinks/' + k).remove().catch(() => {});
  renderLinksEditor();
}
export function saveLinks() {
  const rows = g('links-editor')?.querySelectorAll('.link-ed-row') || [];
  const out = {};
  rows.forEach(row => {
    const key = row.dataset.key;
    const label = row.querySelector('[data-f="label"]')?.value || '';
    const url = row.querySelector('[data-f="url"]')?.value || '';
    const loc = row.querySelector('[data-f="loc"]')?.value || 'header';
    if (label || url) out[key] = { label, url, location: loc };
  });
  Object.assign(customLinks, out);
  if (db) db.ref('customLinks').set(out).then(() => showToast('Links guardados ✓')).catch(() => showToast('Error', true));
}

// ═══ TESTIMONIALS ═══
export function renderTestiEditor() {
  const el = g('testi-editor'); if (!el) return;
  const t = siteSettings.testimonials || [];
  el.innerHTML = t.length ? t.map((x, i) =>
    '<div class="testi-ed" data-i="' + i + '"><div class="fg2"><div class="field"><label>Nombre</label><input type="text" value="' + (x.name || '') + '" data-f="name"></div><div class="field"><label>Rol</label><input type="text" value="' + (x.role || '') + '" data-f="role"></div></div><div class="field"><label>Texto</label><textarea data-f="text">' + (x.text || '') + '</textarea></div><button class="btn btn-del" onclick="rmTesti(' + i + ')" style="font-size:9px">✕</button></div>'
  ).join('') : '<div style="color:var(--hi);font-size:10px">Sin testimonios</div>';
}
export function addTestiRow() {
  if (!siteSettings.testimonials) siteSettings.testimonials = [];
  siteSettings.testimonials.push({ name: '', role: '', text: '' });
  renderTestiEditor();
}
export function rmTesti(i) {
  siteSettings.testimonials.splice(i, 1);
  renderTestiEditor();
}
export function saveTestis() {
  const rows = g('testi-editor')?.querySelectorAll('.testi-ed') || [];
  const out = [];
  rows.forEach(row => {
    const name = row.querySelector('[data-f="name"]')?.value || '';
    const role = row.querySelector('[data-f="role"]')?.value || '';
    const text = row.querySelector('[data-f="text"]')?.value || '';
    if (name || text) out.push({ name, role, text });
  });
  siteSettings.testimonials = out;
  if (db) db.ref('settings/testimonials').set(out).then(() => showToast('Testimonios guardados ✓')).catch(() => showToast('Error', true));
}

// ═══ SHOW ET (editor tabs) ═══
// Defined in nav.js only — do NOT re-export or assign to window here

// ═══ COPY CMD ═══
export function copyCmd(inputId) {
  const el = g(inputId); if (!el) return;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(el.value).then(() => showToast('Comando copiado ✓')).catch(() => { el.select(); document.execCommand('copy'); showToast('Comando copiado ✓'); });
  } else {
    el.select();
    document.execCommand('copy');
    showToast('Comando copiado ✓');
  }
}

// ═══ R2 CONFIG ═══
export { initR2Status, saveR2Config, testR2Connection, purgeCache } from './r2.js';

// ═══ WINDOW ASSIGNMENTS ═══
Object.assign(window, {
  renderDefLicsEditor, addDefLicRow, rmDefLic, upDefLic, saveDefLics,
  renderLinksEditor, addLinkRow, rmLink, saveLinks,
  renderTestiEditor, addTestiRow, rmTesti, saveTestis,
  copyCmd,
});
