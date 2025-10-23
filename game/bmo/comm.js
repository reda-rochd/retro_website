// Minimal postMessage request/response bridge for the iframe game
const pending = new Map();

export function sendMessageToParent(type, payload = {}) {
  const requestId = 'r_' + Math.random().toString(36).slice(2);
  const message = { type, requestId, payload };
  try {
    window.parent.postMessage(message, '*');
  } catch (err) {
    return Promise.reject(new Error('postMessage failed'));
  }
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      pending.delete(requestId);
      reject(new Error('request timeout'));
    }, 10000);
    pending.set(requestId, { resolve, reject, timeout });
  });
}

window.addEventListener('message', (e) => {
  const data = e.data || {};
  if (data.type === 'RESPONSE' && data.responseTo) {
    const entry = pending.get(data.responseTo);
    if (!entry) return;
    clearTimeout(entry.timeout);
    pending.delete(data.responseTo);
    if (data.success) entry.resolve(data.payload); else entry.reject(new Error(data.error || 'response error'));
  }
});

export async function requestStartToken() {
  try {
    const payload = await sendMessageToParent('REQUEST_START');
    return payload || null;
  } catch (err) {
    return null;
  }
}

export async function requestSubmit(token, victory) {
  try {
    const payload = await sendMessageToParent('REQUEST_SUBMIT', { token, victory });
    return payload || null;
  } catch (err) {
    return null;
  }
}

export async function requestBest() {
  try {
    const payload = await sendMessageToParent('REQUEST_BEST');
    return payload?.best || null;
  } catch (err) {
    return null;
  }
}
