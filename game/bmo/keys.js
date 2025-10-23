// Keyboard handling helper
const keys = new Set();
const handlers = new Map();

export function initKeys() {
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
}

export function disposeKeys() {
  window.removeEventListener('keydown', onKeyDown);
  window.removeEventListener('keyup', onKeyUp);
  keys.clear();
}

function onKeyDown(e) {
  const k = e.code.toLowerCase();
  if (keys.has(k)) return;
  keys.add(k);
  const h = handlers.get('down');
  if (h) h(k, true);
}

function onKeyUp(e) {
  const k = e.code.toLowerCase();
  keys.delete(k);
  const h = handlers.get('up');
  if (h) h(k, false);
}

export function onKeyEvent(callbackDown, callbackUp) {
  handlers.set('down', callbackDown);
  handlers.set('up', callbackUp);
}

export function isPressed(code) { return keys.has(code); }

export default { initKeys, disposeKeys, onKeyEvent, isPressed };
