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
const _DEFAULT_ALLOWED_EMAILS = { 'daceidk@gmail.com': true, 'xiligamesz@gmail.com': true, 'prodxce@gmail.com': true };
const _BOOTSTRAP_ADMINS = ['daceidk@gmail.com', 'xiligamesz@gmail.com', 'prodxce@gmail.com'];
let _allowedEmails = [...Object.keys(_DEFAULT_ALLOWED_EMAILS)];

// Firebase keys can't contain ".", "#", "$", "/", "[", "]" — encode/decode emails
function _encodeEmailKey(email) { return email.replace(/\./g, ','); }
function _decodeEmailKey(key) { return key.replace(/,/g, '.'); }
function _emailsToFBObj(emails) { const obj = {}; emails.forEach(e => { obj[_encodeEmailKey(e)] = true; }); return obj; }
function _fbObjToEmails(obj) { return Object.keys(obj || {}).map(_decodeEmailKey).filter(e => e.includes('@')); }

// ═══ AUTH ═══
async function doGoogleLogin() {
  const errEl = g('login-error'), btn = g('login-google-btn');
  btn.disabled = true; btn.textContent = 'Abriendo Google...'; errEl.textContent = '';
  const provider = new firebase.auth.GoogleAuthProvider();
  if (_allowedEmails.length === 1) provider.setCustomParameters({ login_hint: _allowedEmails[0] });
  try {
    const result = await _auth.signInWithPopup(provider);
    if (!_allowedEmails.includes(result.user.email)) {
      errEl.textContent = 'Esta cuenta (' + result.user.email + ') no tiene acceso al admin.';
      await _auth.signOut();
    }
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

// ═══ WHITELIST ═══
function renderWhitelistEditor() {
  const el = g('whitelist-list'); if (!el) return;
  if (!_allowedEmails || _allowedEmails.length === 0) {
    el.innerHTML = '<div style="color:var(--hi);font-size:10px">Sin emails configurados</div>'; return;
  }
  el.innerHTML = _allowedEmails.map((email, i) => {
    const isYou = email === _auth?.currentUser?.email;
    return '<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--b)">' +
      '<i class="fas fa-user-circle" style="color:var(--mu);font-size:14px"></i>' +
      '<span style="flex:1;font-size:11px;font-family:var(--fm)">' + email + '</span>' +
      (isYou ? '<span style="font-size:8px;color:var(--gn)">Tú</span>' : '') +
      (!isYou ? '<button class="tb" onclick="removeWhitelistEmail(' + i + ')" style="font-size:9px;padding:3px 8px;color:#e05555"><i class="fas fa-trash"></i></button>' : '') +
      '</div>';
  }).join('');
}

function addWhitelistEmail() {
  const input = g('wl-new-email'); if (!input) return;
  const email = input.value.trim().toLowerCase();
  if (!email || !email.includes('@')) { showToast('Email inválido', true); return; }
  if (_allowedEmails.includes(email)) { showToast('Ya está en la lista', true); return; }
  _allowedEmails.push(email);
  firebase.database().ref('adminWhitelist').set(_emailsToFBObj(_allowedEmails))
    .catch(e => { showToast('Error: solo admins base pueden editar la whitelist', true); _allowedEmails.pop(); });
  input.value = '';
  renderWhitelistEditor();
  showToast('Email agregado: ' + email);
}

async function removeWhitelistEmail(idx) {
  const email = _allowedEmails[idx];
  if (!await confirmInline('¿Eliminar ' + email + '?')) return;
  _allowedEmails.splice(idx, 1);
  firebase.database().ref('adminWhitelist').set(_emailsToFBObj(_allowedEmails))
    .catch(e => { showToast('Error: solo admins base pueden editar la whitelist', true); _allowedEmails.splice(idx, 0, email); renderWhitelistEditor(); });
  renderWhitelistEditor();
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

  // Load whitelist
  firebase.database().ref('adminWhitelist').once('value', snap => {
    const fbObj = snap.val();
    if (fbObj && typeof fbObj === 'object') {
      _allowedEmails = _fbObjToEmails(fbObj);
    } else {
      // Only bootstrap admins can seed the whitelist (rules enforce this)
      const user = _auth.currentUser;
      if (user && _BOOTSTRAP_ADMINS.includes(user.email)) {
        firebase.database().ref('adminWhitelist').set(_emailsToFBObj(_BOOTSTRAP_ADMINS));
      }
    }
  });

  // Auth state listener
  _auth.onAuthStateChanged(user => {
    if (user) {
      console.log('[DACE Admin] Auth:', user.email);
      if (!_allowedEmails.includes(user.email)) {
        g('login-error').textContent = 'Esta cuenta (' + user.email + ') no tiene acceso al admin.';
        _auth.signOut();
        return;
      }
      g('login-overlay').classList.add('hidden');
      try {
        initAdmin();
      } catch (e) {
        console.error('[DACE Admin] initAdmin error:', e);
        showToast('Error al cargar admin: ' + e.message, true);
      }
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
