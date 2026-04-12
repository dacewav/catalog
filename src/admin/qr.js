// ═══ DACEWAV Admin — QR Code ═══
import { g } from './helpers.js';
import { showToast } from './helpers.js';

export function openQRPanel() {
  g('qr-overlay').classList.add('open');
  var url = g('preview-url')?.value?.trim() || 'https://dacewav.store/';
  g('qr-url').textContent = url;
  _drawQR(url);
}
export function closeQRPanel() { g('qr-overlay').classList.remove('open'); }
export function copyQRUrl() {
  var url = g('qr-url').textContent;
  navigator.clipboard.writeText(url).then(() => showToast('Link copiado')).catch(() => showToast('Error al copiar'));
}
function _drawQR(text) {
  var canvas = g('qr-canvas'); if (!canvas) return;
  var ctx = canvas.getContext('2d'); var size = 200; canvas.width = size; canvas.height = size;
  var qr = _qrEncode(text);
  if (!qr) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, size, size); ctx.fillStyle = '#999'; ctx.font = '12px monospace'; ctx.textAlign = 'center'; ctx.fillText('QR no disponible', size / 2, size / 2); return; }
  var n = qr.length; var cell = Math.floor(size / n); var offset = Math.floor((size - cell * n) / 2);
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, size, size); ctx.fillStyle = '#000';
  for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) if (qr[y][x]) ctx.fillRect(offset + x * cell, offset + y * cell, cell, cell);
}
function _qrEncode(text) {
  try {
    var data = []; for (var i = 0; i < text.length; i++) data.push(text.charCodeAt(i));
    var version = text.length <= 17 ? 1 : text.length <= 32 ? 2 : 3;
    var size = 17 + version * 4;
    var grid = []; for (var y = 0; y < size; y++) { grid[y] = []; for (var x = 0; x < size; x++) grid[y][x] = 0; }
    _drawFinder(grid, 0, 0); _drawFinder(grid, size - 7, 0); _drawFinder(grid, 0, size - 7);
    for (var i = 8; i < size - 8; i++) { grid[6][i] = i % 2 === 0 ? 1 : 0; grid[i][6] = i % 2 === 0 ? 1 : 0; }
    grid[size - 8][8] = 1;
    var bitIdx = 0; var bits = [];
    for (var i = 0; i < data.length; i++) for (var b = 7; b >= 0; b--) bits.push((data[i] >> b) & 1);
    for (var x = size - 1; x > 0; x -= 2) { if (x === 6) x = 5; for (var y = 0; y < size; y++) for (var c = 0; c < 2; c++) { var xx = x - c; if (_isFree(grid, xx, y, size) && bitIdx < bits.length) { grid[y][xx] = bits[bitIdx++]; grid[y][xx] ^= ((xx + y) % 2 === 0 ? 1 : 0); } } }
    return grid;
  } catch (e) { return null; }
}
function _drawFinder(g, x, y) { for (var dy = 0; dy < 7; dy++) for (var dx = 0; dx < 7; dx++) { var outer = dx === 0 || dx === 6 || dy === 0 || dy === 6; var inner = dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4; g[y + dy][x + dx] = (outer || inner) ? 1 : 0; } }
function _isFree(g, x, y, s) { if (x < 0 || y < 0 || x >= s || y >= s) return false; if (g[y][x] !== 0) return false; if (x < 9 && y < 9) return false; if (x < 9 && y >= s - 8) return false; if (x >= s - 8 && y < 9) return false; return true; }

Object.assign(window, { openQRPanel, closeQRPanel, copyQRUrl });
