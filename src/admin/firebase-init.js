// ═══ DACEWAV Admin — Firebase Init & Data Loading ═══
import { FC } from './config.js';
import { g, showToast, confirmInline } from './helpers.js';
import {
  db, setDb, T, setT, siteSettings, allBeats, setAllBeats,
  customEmojis, setCustomEmojis, floatingEls, setFloatingEls,
  defLics, setDefLics, customLinks, setCustomLinks,
  setLdTheme, setLdSettings, setLdBeats,
} from './state.js';
import { loadThemeUI, loadSettingsUI } from './core.js';
import { loadR2Config } from './r2.js';
import { renderBeatList } from './beats.js';
import { renderLinksEditor, renderTestiEditor, renderDefLicsEditor } from './features.js';

let _auth = null;
const _BOOTSTRAP_ADMINS = ['daceidk@gmail.com', 'xiligamesz@gmail.com', 'prodxce@gmail.com'];
const _BOOTSTRAP_UIDS = { 'daceidk@gmail.com': 'Uks9YGSd6rS40zqlRujoe6pE6N22' };

// Local state — populated from Firebase
let _approvedUIDs = {};   // { uid: email }
let _pendingEmails = [];  // [ "email1", "email2" ]

// Firebase keys can't contain ".", "#", "$", "/", "[", "]"
function _encodeEmailKey(email) { return email.replace(/\./g, ','); }
function _decodeEmailKey(key) { return key.replace(/,/g, '.'); }

function _isApproved(email) {
  return Object.values(_approvedUIDs).includes(email);
}
function _isPending(email) {
  return _pendingEmails.includes(email);
}
function _isWhitelisted(email) {
  return _isApproved(email) || _isPending(email);
}

// ═══ AUTH ═══
async function doGoogleLogin() {
  const errEl = g('login-error'), btn = g('login-google-btn');
  btn.disabled = true; btn.textContent = 'Abriendo Google...'; errEl.textContent = '';
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    const result = await _auth.signInWithPopup(provider);
    // onAuthStateChanged handles the rest (approve/pending check)
  } catch (e) {
    if (e.code === 'auth/popup-closed-by-user') errEl.textContent = 'Se cerró la ventana. Intenta de nuevo.';
    else if (e.code === 'auth/popup-blocked') errEl.textContent = 'El navegador bloqueó la ventana. Permite pop-ups.';
    else errEl.textContent = 'Error: ' + (e.message || 'desconocido');
  }
  btn.disabled = false;
  btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/></svg> Iniciar sesión con Google';
}

async function doLogout() {
  if (!await confirmInline('¿Cerrar sesión?')) return;
  await _auth.signOut();
  location.reload();
}

// ═══ INIT ═══
let _uiBuilt = false;

function _checkReady() {
  const s = window.__adminState;
  if (!s || !s.theme || !s.settings || !s.beats) return;
  if (!_uiBuilt) return; // Wait for UI to be built first
  loadThemeUI();
  g('sdot').className = 'sdot ok';
}

function _markUIBuilt() {
  _uiBuilt = true;
  _checkReady();
}

function initAdmin() {
  if (window._adminInitialized) return;
  window._adminInitialized = true;

  // ── Phase 1: Build UI BEFORE loading data ──
  // These must complete before loadThemeUI() so inputs/selects exist
  import('./colors.js').then(m => { m.buildColorEditor?.(); }).catch(e => console.error('[colors]', e));
  import('./fonts.js').then(m => { m.populateFontSelects?.(); }).catch(e => console.error('[fonts]', e));
  import('./cmd-palette.js').then(m => { m.buildCmdIndex?.(); }).catch(e => console.error('[cmd]', e));
  import('./core.js').then(m => {
    m.setupHeroSync?.();
    m.buildAnimControls?.();
    m.renderEmojiGrid?.();
    m.renderCustomEmojis?.();
    m.renderPresets?.();
    m.renderCustomThemes?.();
    m.updateGlowDesc?.();
    m.updateGlowAnimDesc?.();
    m.addTooltips?.();
    m.renderFloatingEditor?.();
    m.renderFloatingPreview?.();
    m.renderSnapshots?.();
    m.renderGradEditor?.();
    m.setupHeroDrag?.();
    m.renderChangeLog?.();
    // Mark UI as built → triggers _checkReady() if data is already loaded
    _markUIBuilt();
  }).catch(e => { console.error('[core]', e); _markUIBuilt(); });

  renderLinksEditor();
  renderTestiEditor();

  window.__adminState = { theme: false, settings: false, beats: false };
  const loaderTimeout = setTimeout(() => {
    window.__adminState = { theme: true, settings: true, beats: true };
    _checkReady();
  }, 6000);

  try {
    const database = firebase.database();
    setDb(database);
    window._db = database; // accessible from IIFEs that captured db=null at load time
    console.log('[DACE Admin] Firebase DB ready, window._db set');

    // Init image gallery
    import('./gallery.js').then(m => m.initGallery(database)).catch(e => console.warn('[gallery]', e));

    // Load from localStorage first
    const lt = localStorage.getItem('dace-theme');
    if (lt) setT(JSON.parse(lt));
    const ce = localStorage.getItem('dace-custom-emojis');
    if (ce) setCustomEmojis(JSON.parse(ce));
    window.__adminState.theme = true;
    _checkReady();

    // Firebase listeners
    database.ref('theme').on('value', snap => {
      setT(snap.val() || {});
      localStorage.setItem('dace-theme', JSON.stringify(T));
      window.__adminState.theme = true;
      _checkReady();
      clearTimeout(loaderTimeout);
    });

    database.ref('settings').on('value', snap => {
      const s = snap.val() || {};
      Object.keys(siteSettings).forEach(k => delete siteSettings[k]);
      Object.assign(siteSettings, s);
      loadSettingsUI();
      loadR2Config(siteSettings);
      window.__adminState.settings = true;
      _checkReady();
      clearTimeout(loaderTimeout);
    });

    database.ref('beats').on('value', snap => {
      const raw = snap.val() || {};
      const beats = Object.keys(raw).map(k => { raw[k].id = raw[k].id || k; return raw[k]; })
        .filter(b => b.active !== false && b.id && b.id !== 'undefined')
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      setAllBeats(beats);
      renderBeatList();
      window.__adminState.beats = true;
      _checkReady();
      clearTimeout(loaderTimeout);
    });

    database.ref('defaultLicenses').on('value', snap => { setDefLics(snap.val() || []); renderDefLicsEditor(); });
    database.ref('customLinks').on('value', snap => { setCustomLinks(snap.val() || {}); renderLinksEditor(); });
    database.ref('floatingElements').on('value', snap => { setFloatingEls(snap.val() || {}); });
    database.ref('settings/testimonials').on('value', snap => { siteSettings.testimonials = snap.val() || []; renderTestiEditor(); });
    database.ref('.info/connected').on('value', snap => { const d = g('sdot'); d.className = snap.val() ? 'sdot ok' : 'sdot err'; });
  } catch (e) {
    console.error('Firebase error:', e);
    clearTimeout(loaderTimeout);
    const lt = localStorage.getItem('dace-theme');
    if (lt) setT(JSON.parse(lt));
    const ls = localStorage.getItem('dace-settings');
    if (ls) Object.assign(siteSettings, JSON.parse(ls));
    window.__adminState = { theme: true, settings: true, beats: true };
    _checkReady();
    g('sdot').className = 'sdot err';
    showToast('Firebase error — offline', true);
  }

  // Admin theme
  const adminTheme = localStorage.getItem('dace-admin-theme');
  if (adminTheme === 'light') { document.body.classList.add('light'); g('theme-toggle').innerHTML = '<i class="fas fa-sun"></i>'; }

  // Whitelist editor
  renderWhitelistEditor();
  import('./r2.js').then(m => m.initR2Status?.());
}

// ═══ WHITELIST (UID-based with pending queue) ═══
function renderWhitelistEditor() {
  const el = g('whitelist-list'); if (!el) return;

  const approvedEntries = Object.entries(_approvedUIDs); // [ [uid, email], ... ]
  const hasPending = _pendingEmails.length > 0;

  if (approvedEntries.length === 0 && !hasPending) {
    el.innerHTML = '<div style="color:var(--hi);font-size:10px">Sin miembros configurados</div>';
    return;
  }

  let html = '';

  // Approved members
  if (approvedEntries.length > 0) {
    html += '<div style="font-size:9px;color:var(--mu);text-transform:uppercase;letter-spacing:.1em;margin-bottom:6px;font-weight:700">Aprobados</div>';
    approvedEntries.forEach(([uid, email]) => {
      const isYou = email === _auth?.currentUser?.email;
      html += '<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--b)">' +
        '<i class="fas fa-user-check" style="color:var(--ok);font-size:14px"></i>' +
        '<div style="flex:1">' +
        '<div style="font-size:11px;font-family:var(--fm)">' + email + '</div>' +
        '<div style="font-size:8px;color:var(--mu);font-family:var(--fx)">' + uid.substring(0, 12) + '...</div>' +
        '</div>' +
        (isYou ? '<span style="font-size:8px;color:var(--ok)">Tú</span>' : '') +
        (!isYou ? '<button class="tb" onclick="removeWhitelistEmail(\'approved\',\'' + uid + '\')" style="font-size:9px;padding:3px 8px;color:#e05555"><i class="fas fa-trash"></i></button>' : '') +
        '</div>';
    });
  }

  // Pending members
  if (hasPending) {
    html += '<div style="font-size:9px;color:var(--wr);text-transform:uppercase;letter-spacing:.1em;margin:10px 0 6px;font-weight:700">⏳ Pendientes (esperando login)</div>';
    _pendingEmails.forEach(email => {
      html += '<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--b)">' +
        '<i class="fas fa-user-clock" style="color:var(--wr);font-size:14px"></i>' +
        '<div style="flex:1">' +
        '<div style="font-size:11px;font-family:var(--fm)">' + email + '</div>' +
        '<div style="font-size:8px;color:var(--wr)">Esperando que inicie sesión</div>' +
        '</div>' +
        '<button class="tb" onclick="removeWhitelistEmail(\'pending\',\'' + email + '\')" style="font-size:9px;padding:3px 8px;color:#e05555"><i class="fas fa-trash"></i></button>' +
        '</div>';
    });
  }

  el.innerHTML = html;
}

function addWhitelistEmail() {
  const input = g('wl-new-email'); if (!input) return;
  const email = input.value.trim().toLowerCase();
  if (!email || !email.includes('@')) { showToast('Email inválido', true); return; }
  if (_isWhitelisted(email)) { showToast('Ya está en la lista', true); return; }

  _pendingEmails.push(email);
  const key = _encodeEmailKey(email);
  firebase.database().ref('adminWhitelist/pending/' + key).set(true)
    .then(() => { showToast('Email agregado: ' + email + ' (pendiente)'); renderWhitelistEditor(); })
    .catch(e => { showToast('Error: ' + e.message, true); _pendingEmails.pop(); });
  input.value = '';
}

async function removeWhitelistEmail(type, id) {
  if (type === 'approved') {
    const email = _approvedUIDs[id];
    if (!await confirmInline('¿Eliminar acceso de ' + email + '?')) return;
    delete _approvedUIDs[id];
    firebase.database().ref('adminWhitelist/approved/' + id).remove()
      .then(() => { showToast('Eliminado ✓'); renderWhitelistEditor(); })
      .catch(e => { showToast('Error: ' + e.message, true); });
  } else {
    const email = id; // for pending, id is the email
    if (!await confirmInline('¿Eliminar pendiente ' + email + '?')) return;
    const idx = _pendingEmails.indexOf(email);
    if (idx > -1) _pendingEmails.splice(idx, 1);
    const key = _encodeEmailKey(email);
    firebase.database().ref('adminWhitelist/pending/' + key).remove()
      .then(() => { showToast('Eliminado ✓'); renderWhitelistEditor(); })
      .catch(e => { showToast('Error: ' + e.message, true); });
  }
}

// Auto-resolve: if user's email is in pending, move to approved with their UID
async function _resolvePendingUser(user) {
  const email = user.email;
  if (!_isPending(email)) return false;

  const uid = user.uid;
  _approvedUIDs[uid] = email;
  const pendingKey = _encodeEmailKey(email);

  try {
    await firebase.database().ref('adminWhitelist/approved/' + uid).set(email);
    await firebase.database().ref('adminWhitelist/pending/' + pendingKey).remove();
    const idx = _pendingEmails.indexOf(email);
    if (idx > -1) _pendingEmails.splice(idx, 1);
    showToast('¡Bienvenido! Tu acceso ha sido aprobado ✓');
    return true;
  } catch (e) {
    console.error('[DACE Admin] Pending resolve error:', e);
    return false;
  }
}

// ═══ BOOT ═══
window.addEventListener('error', (e) => {
  console.error('[DACE Admin] Uncaught:', e.error || e.message);
});
window.addEventListener('unhandledrejection', (e) => {
  console.error('[DACE Admin] Unhandled rejection:', e.reason);
});

window.addEventListener('load', () => {
  try {
    firebase.initializeApp(FC);
  } catch (e) {
    console.error('[DACE Admin] Firebase init error:', e);
    const errEl = g('login-error');
    if (errEl) errEl.textContent = 'Error al inicializar Firebase: ' + (e.message || 'desconocido');
    return;
  }
  _auth = firebase.auth();

  // Load whitelist from new structure: approved/ and pending/
  firebase.database().ref('adminWhitelist').once('value', snap => {
    const data = snap.val() || {};

    // New structure: { approved: { uid: email }, pending: { emailKey: true } }
    if (data.approved) {
      _approvedUIDs = data.approved;
    } else if (data && typeof data === 'object' && !data.pending) {
      // Legacy structure detected — migrate on first admin login
      console.log('[DACE Admin] Legacy whitelist detected, will migrate on login');
    }

    if (data.pending) {
      _pendingEmails = Object.keys(data.pending).map(_decodeEmailKey);
    }
  });

  // Auth state listener
  _auth.onAuthStateChanged(async user => {
    if (user) {
      console.log('[DACE Admin] Auth:', user.email, 'UID:', user.uid);

      // Check approved by UID
      if (_approvedUIDs[user.uid]) {
        g('login-overlay').classList.add('hidden');
        try { initAdmin(); } catch (e) {
          console.error('[DACE Admin] initAdmin error:', e);
          showToast('Error al cargar admin: ' + e.message, true);
        }
        return;
      }

      // Check pending by email — auto-resolve
      if (await _resolvePendingUser(user)) {
        g('login-overlay').classList.add('hidden');
        try { initAdmin(); } catch (e) {
          console.error('[DACE Admin] initAdmin error:', e);
          showToast('Error al cargar admin: ' + e.message, true);
        }
        return;
      }

      // Check if bootstrap admin (first-time setup)
      if (_BOOTSTRAP_ADMINS.includes(user.email)) {
        const uid = user.uid;
        _approvedUIDs[uid] = user.email;
        try {
          await firebase.database().ref('adminWhitelist/approved/' + uid).set(user.email);
          showToast('Admin bootstrap: UID registrado ✓');
          g('login-overlay').classList.add('hidden');
          try { initAdmin(); } catch (e) {
            console.error('[DACE Admin] initAdmin error:', e);
            showToast('Error al cargar admin: ' + e.message, true);
          }
          return;
        } catch (e) {
          console.error('[DACE Admin] Bootstrap error:', e);
        }
      }

      // Not whitelisted
      g('login-error').textContent = 'Esta cuenta (' + user.email + ') no tiene acceso al admin. Contacta al administrador.';
      await _auth.signOut();
    } else {
      console.log('[DACE Admin] No auth — showing login');
      g('login-overlay').classList.remove('hidden');
    }
  });
});

// Window bindings
window.doGoogleLogin = doGoogleLogin;
window.doLogout = doLogout;
window.addWhitelistEmail = addWhitelistEmail;
window.removeWhitelistEmail = removeWhitelistEmail;
window.renderWhitelistEditor = renderWhitelistEditor;

// Stubs for functions referenced in HTML but not yet implemented
window.initLayoutCanvas = () => showToast('Layout canvas próximamente');
window.loadStats = () => showToast('Stats próximamente');
window.runStats = () => showToast('Stats via Worker próximamente');
window.runBackup = () => { const e = { beats: window.allBeats || [] }; showToast('Usa Exportar datos ↑'); };
window.runSitemap = () => showToast('Sitemap próximamente');
