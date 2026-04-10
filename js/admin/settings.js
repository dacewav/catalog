// ════════════════════════════════════════════════════════════
// DACEWAV.STORE — Admin Settings (js/admin/settings.js)
// ════════════════════════════════════════════════════════════

import { db } from '../firebase.js';
import {
  ref, get, update
} from 'https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js';

const TIERS = ['mp3', 'wav', 'premium', 'ilimitada', 'exclusiva'];
const TIER_NAMES = { mp3: 'MP3', wav: 'WAV', premium: 'Premium', ilimitada: 'Ilimitada', exclusiva: 'Exclusiva' };

let configContainer, ordersContainer;

export function initSettings() {
  configContainer = document.getElementById('config-container');
  ordersContainer = document.getElementById('orders-container');

  buildConfigUI();
  loadConfig();

  // Orders lazy — built on first visit to orders section
  const ordersItem = document.querySelector('[data-section="orders"]');
  if (ordersItem) {
    ordersItem.addEventListener('click', () => {
      if (!ordersContainer.dataset.loaded) {
        ordersContainer.dataset.loaded = 'true';
        buildOrdersUI();
        loadOrders();
      }
    }, { once: true });
  }
}

// ── Config UI ──
function buildConfigUI() {
  configContainer.innerHTML = '';

  // Site config section
  const siteSection = document.createElement('div');
  siteSection.style.marginBottom = 'var(--space-2xl)';

  const siteTitle = document.createElement('h4');
  siteTitle.style.cssText = 'font-family:var(--font-display);font-size:var(--text-xl);letter-spacing:0.1em;margin-bottom:var(--space-md)';
  siteTitle.textContent = 'Sitio';
  siteSection.appendChild(siteTitle);

  const siteFields = [
    { id: 'cfg-title', label: 'Título', key: 'title' },
    { id: 'cfg-hero', label: 'Texto hero', key: 'heroText' },
    { id: 'cfg-instagram', label: 'Instagram URL', key: 'instagramUrl' },
    { id: 'cfg-beatstars', label: 'BeatStars URL', key: 'beatstarsUrl' },
    { id: 'cfg-email', label: 'Email contacto', key: 'contactEmail' },
  ];

  siteFields.forEach(f => {
    const group = document.createElement('div');
    group.className = 'form-group';

    const label = document.createElement('label');
    label.textContent = f.label;
    label.setAttribute('for', f.id);
    group.appendChild(label);

    const input = document.createElement('input');
    input.type = f.key === 'contactEmail' ? 'email' : (f.key.includes('Url') ? 'url' : 'text');
    input.id = f.id;
    input.dataset.key = f.key;
    group.appendChild(input);

    siteSection.appendChild(group);
  });

  // Save button
  const btnSaveSite = document.createElement('button');
  btnSaveSite.className = 'btn-primary';
  btnSaveSite.textContent = 'Guardar sitio';
  btnSaveSite.style.cssText = 'width:auto;padding:var(--space-sm) var(--space-xl);margin-top:var(--space-md)';
  btnSaveSite.addEventListener('click', saveSite);
  siteSection.appendChild(btnSaveSite);

  configContainer.appendChild(siteSection);

  // License prices section
  const licSection = document.createElement('div');

  const licTitle = document.createElement('h4');
  licTitle.style.cssText = 'font-family:var(--font-display);font-size:var(--text-xl);letter-spacing:0.1em;margin-bottom:var(--space-md)';
  licTitle.textContent = 'Precios de licencias';
  licSection.appendChild(licTitle);

  TIERS.forEach(tier => {
    const row = document.createElement('div');
    row.className = 'form-row';
    row.style.marginBottom = 'var(--space-md)';

    const nameLabel = document.createElement('div');
    nameLabel.style.cssText = 'grid-column:1/-1;font-size:var(--text-sm);font-weight:500;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:var(--space-xs)';
    nameLabel.textContent = TIER_NAMES[tier];
    row.appendChild(nameLabel);

    // MXN
    const mxnGroup = document.createElement('div');
    mxnGroup.className = 'form-group';
    const mxnLabel = document.createElement('label');
    mxnLabel.textContent = 'MXN';
    mxnGroup.appendChild(mxnLabel);
    const mxnInput = document.createElement('input');
    mxnInput.type = 'number';
    mxnInput.id = `lic-${tier}-mxn`;
    mxnInput.min = 0;
    mxnGroup.appendChild(mxnInput);
    row.appendChild(mxnGroup);

    // USD
    const usdGroup = document.createElement('div');
    usdGroup.className = 'form-group';
    const usdLabel = document.createElement('label');
    usdLabel.textContent = 'USD';
    usdGroup.appendChild(usdLabel);
    const usdInput = document.createElement('input');
    usdInput.type = 'number';
    usdInput.id = `lic-${tier}-usd`;
    usdInput.min = 0;
    usdGroup.appendChild(usdInput);
    row.appendChild(usdGroup);

    licSection.appendChild(row);
  });

  const btnSaveLic = document.createElement('button');
  btnSaveLic.className = 'btn-primary';
  btnSaveLic.textContent = 'Guardar precios';
  btnSaveLic.style.cssText = 'width:auto;padding:var(--space-sm) var(--space-xl);margin-top:var(--space-md)';
  btnSaveLic.addEventListener('click', saveLicenses);
  licSection.appendChild(btnSaveLic);

  configContainer.appendChild(licSection);
}

// ── Load config ──
async function loadConfig() {
  try {
    const snap = await get(ref(db, 'config/site'));
    if (snap.exists()) {
      const site = snap.val();
      document.querySelectorAll('[data-key]').forEach(input => {
        if (site[input.dataset.key] !== undefined) {
          input.value = site[input.dataset.key];
        }
      });
    }
  } catch (err) {
    console.warn('[DACEWAV] Site config load failed:', err);
  }

  try {
    const snap = await get(ref(db, 'config/licenses'));
    if (snap.exists()) {
      const lics = snap.val();
      TIERS.forEach(tier => {
        if (lics[tier]) {
          const mxn = document.getElementById(`lic-${tier}-mxn`);
          const usd = document.getElementById(`lic-${tier}-usd`);
          if (mxn) mxn.value = lics[tier].mxn || 0;
          if (usd) usd.value = lics[tier].usd || 0;
        }
      });
    } else {
      // Defaults
      const defaults = {
        mp3: { mxn: 299, usd: 15 }, wav: { mxn: 499, usd: 25 },
        premium: { mxn: 999, usd: 50 }, ilimitada: { mxn: 1999, usd: 100 },
        exclusiva: { mxn: 4999, usd: 250 },
      };
      TIERS.forEach(tier => {
        const mxn = document.getElementById(`lic-${tier}-mxn`);
        const usd = document.getElementById(`lic-${tier}-usd`);
        if (mxn) mxn.value = defaults[tier].mxn;
        if (usd) usd.value = defaults[tier].usd;
      });
    }
  } catch (err) {
    console.warn('[DACEWAV] Licenses config load failed:', err);
  }
}

// ── Save site ──
async function saveSite() {
  const data = {};
  document.querySelectorAll('[data-key]').forEach(input => {
    data[input.dataset.key] = input.value.trim();
  });

  try {
    await update(ref(db, 'config/site'), data);
    window.__toast('✓ Configuración guardada');
  } catch (err) {
    window.__toast('Error al guardar', 'error');
  }
}

// ── Save licenses ──
async function saveLicenses() {
  const data = {};
  TIERS.forEach(tier => {
    const mxn = document.getElementById(`lic-${tier}-mxn`);
    const usd = document.getElementById(`lic-${tier}-usd`);
    data[tier] = {
      mxn: parseInt(mxn?.value, 10) || 0,
      usd: parseInt(usd?.value, 10) || 0,
    };
  });

  try {
    await update(ref(db, 'config/licenses'), data);
    window.__toast('✓ Precios guardados');
  } catch (err) {
    window.__toast('Error al guardar precios', 'error');
  }
}

// ════════════════════════════════════════════════════════════
// ORDERS
// ════════════════════════════════════════════════════════════

function buildOrdersUI() {
  ordersContainer.innerHTML = '';

  // Header with export
  const header = document.createElement('div');
  header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-lg)';

  const totalEl = document.createElement('div');
  totalEl.id = 'orders-total';
  totalEl.style.cssText = 'font-family:var(--font-display);font-size:var(--text-2xl);letter-spacing:0.05em;color:var(--color-accent)';
  totalEl.textContent = 'Ingresos: $0';
  header.appendChild(totalEl);

  const btnExport = document.createElement('button');
  btnExport.className = 'btn-secondary';
  btnExport.textContent = 'Exportar CSV';
  btnExport.style.cssText = 'width:auto;padding:var(--space-sm) var(--space-lg)';
  btnExport.addEventListener('click', exportCSV);
  header.appendChild(btnExport);

  ordersContainer.appendChild(header);

  // Table
  const table = document.createElement('table');
  table.className = 'admin-table';
  table.innerHTML = `
    <thead>
      <tr>
        <th>Fecha</th>
        <th>Beat</th>
        <th>Licencia</th>
        <th>Precio</th>
        <th>Moneda</th>
        <th>Email</th>
      </tr>
    </thead>
    <tbody id="orders-tbody"></tbody>
  `;
  ordersContainer.appendChild(table);
}

let ordersData = [];

async function loadOrders() {
  const tbody = document.getElementById('orders-tbody');
  const totalEl = document.getElementById('orders-total');
  if (!tbody) return;

  try {
    const snap = await get(ref(db, 'orders'));
    tbody.innerHTML = '';

    if (!snap.exists()) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--color-text-dim);padding:var(--space-xl)">Sin órdenes</td></tr>';
      return;
    }

    ordersData = Object.entries(snap.val())
      .map(([id, order]) => ({ id, ...order }))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    let totalMxn = 0;

    ordersData.forEach(order => {
      const tr = document.createElement('tr');

      // Date
      const tdDate = document.createElement('td');
      tdDate.textContent = order.createdAt ? new Date(order.createdAt).toLocaleDateString('es-MX') : '—';
      tr.appendChild(tdDate);

      // Beat
      const tdBeat = document.createElement('td');
      tdBeat.textContent = order.beatTitle || order.beatId || '—';
      tr.appendChild(tdBeat);

      // License
      const tdLic = document.createElement('td');
      tdLic.textContent = order.licenseType || '—';
      tdLic.style.textTransform = 'capitalize';
      tr.appendChild(tdLic);

      // Price
      const tdPrice = document.createElement('td');
      tdPrice.textContent = order.price || 0;
      tr.appendChild(tdPrice);

      // Currency
      const tdCurrency = document.createElement('td');
      tdCurrency.textContent = order.currency || 'MXN';
      tr.appendChild(tdCurrency);

      // Email
      const tdEmail = document.createElement('td');
      tdEmail.textContent = order.buyerEmail || '—';
      tdEmail.style.cssText = 'font-size:var(--text-xs)';
      tr.appendChild(tdEmail);

      tbody.appendChild(tr);

      // Sum totals (treat USD * 17 as rough MXN equivalent)
      if (order.currency === 'USD') {
        totalMxn += (order.price || 0) * 17;
      } else {
        totalMxn += order.price || 0;
      }
    });

    if (totalEl) {
      totalEl.textContent = `Ingresos: $${totalMxn.toLocaleString('es-MX')} MXN`;
    }
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--color-error);padding:var(--space-xl)">Error al cargar órdenes</td></tr>';
  }
}

function exportCSV() {
  if (ordersData.length === 0) {
    window.__toast('No hay órdenes para exportar', 'error');
    return;
  }

  const headers = ['Fecha', 'Beat ID', 'Beat Título', 'Licencia', 'Precio', 'Moneda', 'Email'];
  const rows = ordersData.map(o => [
    o.createdAt ? new Date(o.createdAt).toISOString() : '',
    o.beatId || '',
    o.beatTitle || '',
    o.licenseType || '',
    o.price || 0,
    o.currency || 'MXN',
    o.buyerEmail || '',
  ]);

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dacewav-orders-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);

  window.__toast('CSV descargado');
}
