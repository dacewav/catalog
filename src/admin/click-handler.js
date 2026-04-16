// ═══ DACEWAV Admin — Click Handler (Event Delegation) ═══
// Single delegated click listener replaces inline onclick attributes.
// Elements use data-action="actionName" + data-* attributes for params.

const _handlers = {};

export function registerAction(name, fn) {
  _handlers[name] = fn;
}

export function registerActions(map) {
  Object.assign(_handlers, map);
}

function _resolve(action) {
  return _handlers[action] || (typeof window !== 'undefined' && typeof window[action] === 'function' ? window[action] : null);
}

// Extract action-specific data attributes as first argument for window fallbacks
// data-section="beats" → fn('beats')
// data-tab="info" → fn('info')
// data-preset="soft" → fn('soft')
// data-typo="industrial" → fn('industrial')
// data-target="display" → fn('display')
// data-vp="mobile" → fn('mobile')
// data-type="image" → fn('image')
// data-cmd="cmd-restore" → fn('cmd-restore')
var _DATA_KEYS = ['section', 'tab', 'preset', 'typo', 'target', 'vp', 'type', 'cmd'];
function _getArg(el) {
  for (var i = 0; i < _DATA_KEYS.length; i++) {
    var k = _DATA_KEYS[i];
    if (el.dataset[k] !== undefined) return el.dataset[k];
  }
  return null;
}

function _call(action, el, e) {
  var fn = _handlers[action];
  if (fn) { fn(el, e); return; }
  // Fallback to window[action] — pass data-* arg if present (for functions like showSection('beats'))
  if (typeof window === 'undefined' || typeof window[action] !== 'function') return;
  var arg = _getArg(el);
  if (arg !== null) window[action](arg);
  else window[action]();
}

function handleClick(e) {
  var el = e.target.closest('[data-action]');
  if (!el) return;
  var action = el.dataset.action;
  if (el.dataset.stopPropagation === 'true') e.stopPropagation();
  _call(action, el, e);
}

function handleChange(e) {
  var el = e.target.closest('[data-action]');
  if (!el) return;
  _call(el.dataset.action, el, e);
}

function handleDblClick(e) {
  var el = e.target.closest('[data-dblaction]');
  if (!el) return;
  e.stopPropagation();
  _call(el.dataset.dblaction, el, e);
}

export function initClickHandler() {
  document.addEventListener('click', handleClick);
  document.addEventListener('change', handleChange);
  document.addEventListener('dblclick', handleDblClick);
}
