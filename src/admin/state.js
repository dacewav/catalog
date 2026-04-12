// ═══ DACEWAV Admin — Global State ═══
export let db = null;
export function setDb(v) { db = v; }

export let allBeats = [];
export function setAllBeats(v) { allBeats = v; }

export let siteSettings = {};
export function setSiteSettings(v) { siteSettings = v; }

export let T = {};
export function setT(v) { T = v; }

export let customEmojis = [];
export function setCustomEmojis(v) { customEmojis = v; }

export let floatingEls = [];
export function setFloatingEls(v) { floatingEls = v; }

export let defLics = [];
export function setDefLics(v) { defLics = v; }

export let customLinks = {};
export function setCustomLinks(v) { customLinks = v; }

export let editId = null;
export function setEditId(v) { editId = v; }

export let mpAudio = null;
export function setMpAudio(v) { mpAudio = v; }

export let R2_WORKER_URL = '';
export let R2_UPLOAD_TOKEN = '';
export let R2_ENABLED = false;

export function setR2(url, token) {
  R2_WORKER_URL = url || '';
  R2_UPLOAD_TOKEN = token || '';
  R2_ENABLED = !!(R2_WORKER_URL && R2_UPLOAD_TOKEN);
}

export let _undoStack = [];
export let _redoStack = [];
export let _lastSavedTheme = null;
export let _undoDebounce = null;
export function setLastSavedTheme(v) { _lastSavedTheme = v; }
export function setUndoDebounce(v) { _undoDebounce = v; }
export let _autoSaveTimer = null;

export let _ldTheme = false;
export let _ldSettings = false;
export let _ldBeats = false;
export function setLdTheme(v) { _ldTheme = v; }
export function setLdSettings(v) { _ldSettings = v; }
export function setLdBeats(v) { _ldBeats = v; }

export let _inspectorMode = false;
export function setInspectorMode(v) { _inspectorMode = v; }

export let _iframeReady = false;
export function setIframeReady(v) { _iframeReady = v; }

export let _beatSearchQuery = '';

// Font picker state
export let _fpState = {
  display: { cat: 'all', query: '', gfonts: [], gfontsLoaded: false },
  body: { cat: 'all', query: '', gfonts: [], gfontsLoaded: false }
};

// Gradient editor
export let _gradStops = [
  {pos:0, color:'#dc2626', opacity:0.14},
  {pos:50, color:'#dc2626', opacity:0.08},
  {pos:100, color:'#dc2626', opacity:0}
];
export function setGradStops(v) { _gradStops = v; }

// Batch image queue
export let _batchImgQueue = [];
export function setBatchImgQueue(v) { _batchImgQueue = v; }

// Change log
export let _changeLog = [];
export let _lastChangeValues = {};

// Drag state
export let _dragBeatId = null;
export function setDragBeatId(v) { _dragBeatId = v; }

export let _heroDragEl = null;
export let _heroDragStart = {};
export function setHeroDragEl(v) { _heroDragEl = v; }
export function setHeroDragStart(v) { _heroDragStart = v; }

// Layout canvas
export let _layoutCanvas = null;
export let _layoutCtx = null;
export let _layoutDragging = null;
export let _layoutEls = [];
export function setLayoutCanvas(v) { _layoutCanvas = v; }
export function setLayoutCtx(v) { _layoutCtx = v; }
export function setLayoutDragging(v) { _layoutDragging = v; }

// Particles animation
export let ppCtx = null;
export let ppParts = [];
export let ppAnim = null;
export function setPpCtx(v) { ppCtx = v; }
export function setPpParts(v) { ppParts = v; }
export function setPpAnim(v) { ppAnim = v; }

// License editor state
export let _edLics = [];
export function setEdLics(v) { _edLics = v; }

// Whitelist
export let _allowedEmails = [];
export function setAllowedEmails(v) { _allowedEmails = v; }

// Re-render timer
export let _gradRerenderTimer = 0;
export function setGradRerenderTimer(v) { _gradRerenderTimer = v; }
