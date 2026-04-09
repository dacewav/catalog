// Global test setup — mock localStorage and window for node environment
const store = {};
globalThis.localStorage = {
  getItem: (k) => store[k] || null,
  setItem: (k, v) => { store[k] = v; },
  removeItem: (k) => { delete store[k]; },
};

// Mock window for admin modules that use window.addEventListener at top level
if (typeof globalThis.window === 'undefined') {
  globalThis.window = globalThis;
}
if (typeof globalThis.document === 'undefined') {
  globalThis.document = { body: { classList: { add: () => {}, remove: () => {}, contains: () => false } }, querySelectorAll: () => [], querySelector: () => null };
}
if (typeof globalThis.addEventListener === 'undefined') {
  globalThis.addEventListener = () => {};
}
