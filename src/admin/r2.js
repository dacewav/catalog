// ═══ DACEWAV Admin — R2 Worker ═══
import { g, showToast } from './helpers.js';

export let R2_WORKER_URL = '';
export let R2_UPLOAD_TOKEN = '';
export let R2_ENABLED = false;

export function loadR2Config(settings) {
  try {
    const r2 = (settings && settings.r2Config) || {};
    R2_WORKER_URL = r2.workerUrl || '';
    R2_UPLOAD_TOKEN = r2.uploadToken || '';
    R2_ENABLED = !!(R2_WORKER_URL && R2_UPLOAD_TOKEN);
    const urlInput = document.getElementById('r2-worker-url');
    const tokenInput = document.getElementById('r2-upload-token');
    if (urlInput && !urlInput.value) urlInput.value = R2_WORKER_URL;
    if (tokenInput && !tokenInput.value) tokenInput.value = R2_UPLOAD_TOKEN;
    initR2Status();
  } catch (e) { R2_ENABLED = false; }
}

export async function uploadToR2(file, objectKey) {
  if (!R2_ENABLED) throw new Error('R2 Worker no configurado');
  const key = objectKey || ('beats/' + Date.now() + '-' + file.name.replace(/[^a-zA-Z0-9._-]/g, '_'));
  let res;
  try {
    res = await fetch(`${R2_WORKER_URL}/${encodeURIComponent(key)}`, {
      method: 'PUT',
      headers: { 'Content-Type': file.type || 'application/octet-stream', 'X-Upload-Token': R2_UPLOAD_TOKEN },
      body: file,
    });
  } catch (e) {
    throw new Error('R2 Worker no responde. Verifica la URL en Ajustes → R2 Storage.');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Upload failed: ${res.status}`);
  }
  return await res.json();
}

export function initR2Status() {
  const dot = document.getElementById('r2-status-dot');
  const txt = document.getElementById('r2-status-text');
  if (!dot || !txt) return;
  if (R2_ENABLED) { dot.classList.add('ok'); txt.textContent = 'R2 Worker configurado ✓'; }
  else { dot.classList.remove('ok'); txt.textContent = 'No configurado'; }
}

export async function saveR2Config() {
  const { db } = await import('./state.js');
  const url = (g('r2-worker-url') || {}).value || '';
  const token = (g('r2-upload-token') || {}).value || '';
  if (!url && !token) {
    const { db: database } = await import('./state.js');
    if (database) await database.ref('settings/r2Config').remove();
    loadR2Config({});
    showToast('Configuración R2 eliminada');
    return;
  }
  const { db: database } = await import('./state.js');
  if (database) await database.ref('settings/r2Config').set({ workerUrl: url, uploadToken: token });
  loadR2Config({ r2Config: { workerUrl: url, uploadToken: token } });
  initR2Status();
  showToast('R2 configurado ✓');
}

export async function testR2Connection() {
  const url = (g('r2-worker-url') || {}).value || R2_WORKER_URL;
  const token = (g('r2-upload-token') || {}).value || R2_UPLOAD_TOKEN;
  if (!url || !token) { showToast('Configura Worker URL y Token primero', true); return; }
  try {
    const res = await fetch(url + '/', { headers: { 'X-Upload-Token': token } });
    const data = await res.json();
    if (data.status === 'ok') showToast('✅ Worker conectado: ' + data.service);
    else showToast('Respuesta inesperada', true);
  } catch (err) { showToast('Error: ' + err.message, true); }
}

export async function purgeCache() {
  const url = (g('r2-worker-url') || {}).value || R2_WORKER_URL;
  const token = (g('r2-upload-token') || {}).value || R2_UPLOAD_TOKEN;
  if (!url || !token) { showToast('Configura Worker URL y Token primero', true); return; }
  try {
    const res = await fetch(url + '/purge-cache', { method: 'POST', headers: { 'X-Upload-Token': token } });
    const data = await res.json();
    if (data.success) showToast('✅ Cache purged');
    else showToast('Error: ' + (data.error || 'Unknown'), true);
  } catch (err) { showToast('Error: ' + err.message, true); }
}

// Expose R2 status check for other modules
window._r2IsEnabled = function() { return R2_ENABLED; };

Object.assign(window, { loadR2Config, uploadToR2, initR2Status, saveR2Config, testR2Connection, purgeCache });
