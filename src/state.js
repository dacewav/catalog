// ═══ DACEWAV.STORE — Global State ═══
// Single source of truth for shared state across modules

import { safeJSON } from './utils.js';

export const state = {
  db: null,
  allBeats: [],
  siteSettings: {},
  T: {},                          // Theme object
  customEmojis: [],
  floatingEls: [],

  // Filters
  activeGenre: 'Todos',
  activeTags: [],
  modalBeatId: null,
  inspectorMode: false,

  // Loading flags
  ldTheme: false,
  ldSettings: false,
  ldBeats: false,

  // Theme
  isLightMode: safeJSON(localStorage.getItem('dace-light-mode'), false) === true ||
               localStorage.getItem('dace-light-mode') === '1',

  // Wishlist
  wishlist: safeJSON(localStorage.getItem('dace-wishlist'), []),

  // Waveform cache
  waveformCache: safeJSON(localStorage.getItem('dace-waveforms'), {}),
};
