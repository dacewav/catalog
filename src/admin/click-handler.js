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

function handleClick(e) {
  var el = e.target.closest('[data-action]');
  if (!el) return;
  var action = el.dataset.action;
  var fn = _handlers[action];
  if (!fn) return;
  if (el.dataset.stopPropagation === 'true') e.stopPropagation();
  fn(el, e);
}

function handleChange(e) {
  var el = e.target.closest('[data-action]');
  if (!el) return;
  var action = el.dataset.action;
  var fn = _handlers[action];
  if (!fn) return;
  fn(el, e);
}

function handleDblClick(e) {
  var el = e.target.closest('[data-dblaction]');
  if (!el) return;
  e.stopPropagation();
  var action = el.dataset.dblaction;
  var fn = _handlers[action];
  if (!fn) return;
  fn(el, e);
}

export function initClickHandler() {
  document.addEventListener('click', handleClick);
  document.addEventListener('change', handleChange);
  document.addEventListener('dblclick', handleDblClick);
}
