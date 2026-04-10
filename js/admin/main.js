// ════════════════════════════════════════════════════════════
// DACEWAV.STORE — Admin Main (js/admin/main.js)
// ════════════════════════════════════════════════════════════

import { auth } from '../firebase.js';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from 'https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js';
import { initBeats } from './beats.js';
import { initTheme } from './theme.js';
import { initSettings } from './settings.js';

// ── State ──
const sectionInits = {
  beats:    initBeats,
  theme:    initTheme,
  config:   initSettings,
  orders:   null,
  stats:    null,
};
const initialized = new Set();
let currentSection = null;

// ── DOM ──
const loginScreen = document.getElementById('login-screen');
const adminScreen = document.getElementById('admin-screen');
const loginForm = document.getElementById('login-form');
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebarItems = document.querySelectorAll('.sidebar__item');

// ── Auth ──
onAuthStateChanged(auth, (user) => {
  if (user) {
    showAdmin();
  } else {
    showLogin();
  }
});

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.textContent = '';

  const email = loginEmail.value.trim();
  const password = loginPassword.value;

  if (!email || !password) {
    loginError.textContent = 'Email y contraseña requeridos';
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    const msg = mapAuthError(err.code);
    loginError.textContent = msg;
  }
});

logoutBtn.addEventListener('click', async () => {
  try {
    await signOut(auth);
  } catch (err) {
    console.error('[DACEWAV] Logout error:', err);
  }
});

function showLogin() {
  loginScreen.classList.remove('hidden');
  adminScreen.classList.remove('visible');
}

function showAdmin() {
  loginScreen.classList.add('hidden');
  adminScreen.classList.add('visible');
  showSection('beats');
}

// ── Navigation ──
sidebarItems.forEach(item => {
  item.addEventListener('click', () => {
    const section = item.dataset.section;
    if (section) showSection(section);
  });
});

// Mobile sidebar toggle
if (sidebarToggle) {
  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });
}

// Close sidebar on section click (mobile)
sidebarItems.forEach(item => {
  item.addEventListener('click', () => {
    sidebar.classList.remove('open');
  });
});

function showSection(name) {
  currentSection = name;

  // Update sidebar active state
  sidebarItems.forEach(item => {
    item.classList.toggle('active', item.dataset.section === name);
  });

  // Show/hide sections
  document.querySelectorAll('.admin-section').forEach(section => {
    section.classList.toggle('visible', section.id === `section-${name}`);
  });

  // Lazy init
  if (!initialized.has(name) && sectionInits[name]) {
    initialized.add(name);
    try {
      sectionInits[name]();
    } catch (err) {
      console.error(`[DACEWAV] Section init error (${name}):`, err);
    }
  }
}

// ── Auth Error Mapping ──
function mapAuthError(code) {
  const map = {
    'auth/invalid-email':       'Email inválido',
    'auth/user-not-found':      'Usuario no encontrado',
    'auth/wrong-password':      'Contraseña incorrecta',
    'auth/invalid-credential':  'Credenciales inválidas',
    'auth/too-many-requests':   'Demasiados intentos. Espera un momento',
    'auth/network-error':       'Error de conexión',
  };
  return map[code] || 'Error al iniciar sesión';
}

// ── Toast helper (exposed globally for admin modules) ──
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast visible toast--${type}`;
  setTimeout(() => { toast.classList.remove('visible'); }, 2500);
}

// Make toast available to admin modules
window.__toast = showToast;
