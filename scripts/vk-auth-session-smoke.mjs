import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync('vk.html', 'utf8');

function extractFunction(signature) {
  const start = source.indexOf(signature);
  assert.ok(start > 0, `${signature} not found`);
  let parenDepth = 0;
  let bodyStart = -1;
  for (let index = source.indexOf('(', start); index < source.length; index += 1) {
    const char = source[index];
    if (char === '(') parenDepth += 1;
    if (char === ')') parenDepth -= 1;
    if (char === '{' && parenDepth === 0) {
      bodyStart = index;
      break;
    }
  }
  assert.ok(bodyStart > start, `${signature} body not found`);
  let depth = 0;
  for (let index = bodyStart; index < source.length; index += 1) {
    const char = source[index];
    if (char === '{') depth += 1;
    if (char === '}') depth -= 1;
    if (depth === 0) return source.slice(start, index + 1);
  }
  throw new Error(`${signature} body is incomplete`);
}

const authSlice = [
  extractFunction('function withTimeout'),
  extractFunction('async function readJsonSafe'),
  extractFunction('function isInvalidSavedTokenResponse'),
  extractFunction('async function bootstrapAuth'),
].join('\n\n');

function makeStorage(initialToken = 'saved-token') {
  const store = new Map([[TOKEN_K, initialToken]]);
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
  };
}

const TOKEN_K = 'vk4_token';

async function runScenario({ response, reject }) {
  const toasts = [];
  const calls = [];
  const localStorage = makeStorage();
  const sandbox = {
    Error,
    Promise,
    RegExp,
    String,
    console,
    setTimeout,
    WORKER: 'https://worker.test',
    TOKEN_K,
    AUTH_BUILD: 'vk-auth-session-smoke',
    AUTH_DIAG_TIMEOUT_MS: 15000,
    state: {},
    localStorage,
    document: { getElementById: () => null },
    fetch: async (url, options = {}) => {
      calls.push({ url, options });
      if (reject) throw reject;
      return response;
    },
    initVKBridge() {
      return Promise.resolve();
    },
    showAuth() {
      calls.push({ action: 'showAuth' });
    },
    warmAuthConnection() {
      return Promise.resolve(false);
    },
    startVKAutoLogin() {
      calls.push({ action: 'startVKAutoLogin' });
    },
    enterApp() {
      calls.push({ action: 'enterApp' });
    },
    showToast(message) {
      toasts.push(message);
    },
  };

  vm.createContext(sandbox);
  vm.runInContext(authSlice, sandbox, { filename: 'vk-auth-session-slice.js' });
  await vm.runInContext('bootstrapAuth()', sandbox);
  return {
    calls,
    toasts,
    token: localStorage.getItem(TOKEN_K),
    state: sandbox.state,
  };
}

const success = await runScenario({
  response: { status: 200, ok: true, json: async () => ({ ok: true, user: { id: 'u1' } }) },
});
assert.equal(success.token, 'saved-token');
assert.equal(success.state.token, 'saved-token');
assert.deepEqual(success.calls.filter((call) => call.action).map((call) => call.action), ['showAuth', 'enterApp']);

for (const status of [401, 403]) {
  const invalid = await runScenario({
    response: { status, ok: false, json: async () => ({ ok: false, error: 'auth failed' }) },
  });
  assert.equal(invalid.token, null, `${status} must remove saved token`);
  assert.equal(invalid.toasts.length, 0, `${status} should not show recoverable toast`);
  assert.ok(invalid.calls.some((call) => call.action === 'startVKAutoLogin'));
}

const explicitInvalid = await runScenario({
  response: { status: 200, ok: true, json: async () => ({ ok: false, error: 'invalid_token' }) },
});
assert.equal(explicitInvalid.token, null, 'explicit invalid token response must remove saved token');

for (const scenario of [
  { name: '500', response: { status: 500, ok: false, json: async () => ({ ok: false, error: 'server error' }) } },
  { name: '429', response: { status: 429, ok: false, json: async () => ({ ok: false, error: 'rate limited' }) } },
  { name: 'invalid-json', response: { status: 200, ok: true, json: async () => { throw new Error('bad json'); } } },
  { name: 'network', reject: new Error('network') },
  { name: 'timeout', reject: new Error('timeout') },
]) {
  const result = await runScenario(scenario);
  assert.equal(result.token, 'saved-token', `${scenario.name} must preserve saved token`);
  assert.ok(result.toasts.length > 0, `${scenario.name} should show recoverable state`);
  assert.ok(result.calls.some((call) => call.action === 'startVKAutoLogin'), `${scenario.name} should continue recovery path`);
}

console.log('VK auth session smoke: PASS');
