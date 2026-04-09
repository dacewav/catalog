// ═══ DACEWAV Admin — Firebase Auth ═══
import { g, showToast } from './helpers.js';

let _loginAttempts = 0;
const MAX_LOGIN_ATTEMPTS = 3;
let _lockoutUntil = 0;

export async function doGoogleLogin() {
  const now = Date.now();
  if (now < _lockoutUntil) {
    const secs = Math.ceil((_lockoutUntil - now) / 1000);
    const el = g('login-lockout');
    if (el) el.textContent = `Demasiados intentos. Espera ${secs}s.`;
    return;
  }
  const btn = g('login-google-btn');
  if (btn) btn.disabled = true;
  const errEl = g('login-error');
  if (errEl) errEl.textContent = '';
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    await firebase.auth().signInWithPopup(provider);
  } catch (err) {
    _loginAttempts++;
    if (_loginAttempts >= MAX_LOGIN_ATTEMPTS) {
      _lockoutUntil = Date.now() + 30000;
      _loginAttempts = 0;
      if (errEl) errEl.textContent = 'Demasiados intentos. Espera 30 segundos.';
    } else {
      if (errEl) errEl.textContent = err.message || 'Error al iniciar sesión';
    }
  }
  if (btn) btn.disabled = false;
}

export async function doLogout() {
  if (!confirm('¿Cerrar sesión?')) return;
  try {
    await firebase.auth().signOut();
    location.reload();
  } catch (err) {
    showToast('Error al cerrar sesión', true);
  }
}

window.doGoogleLogin = doGoogleLogin;
window.doLogout = doLogout;
