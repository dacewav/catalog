// Global test setup — mock localStorage for node environment
const store = {};
globalThis.localStorage = {
  getItem: (k) => store[k] || null,
  setItem: (k, v) => { store[k] = v; },
  removeItem: (k) => { delete store[k]; },
};
