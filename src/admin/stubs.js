// ═══ DACEWAV Admin — Stubs ═══
// Placeholder functions for HTML onclick handlers not yet implemented.
// Each shows a toast notification instead of silently failing.

import { showToast } from './helpers.js';

function initLayoutCanvas() {
  showToast('Layout Canvas: próximamente');
}

function runBackup() {
  showToast('Backup: próximamente');
}

function runSitemap() {
  showToast('Sitemap: próximamente');
}

function runStats() {
  showToast('Stats vía Worker: próximamente');
}

function loadStats() {
  showToast('Stats: próximamente');
}

Object.assign(window, {
  initLayoutCanvas, runBackup, runSitemap, runStats, loadStats
});
