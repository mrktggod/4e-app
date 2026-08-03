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

const helperSlice = [
  extractFunction('async function readJsonSafe'),
  extractFunction('function responseRequestId'),
  extractFunction('function createVkAiError'),
  extractFunction('function classifyVkAiStatus'),
  extractFunction('function recordVkAiDiagnostic'),
  extractFunction('function vkAiUserMessage'),
  extractFunction('async function readVkAiResponse'),
  extractFunction('async function requestVkAi'),
].join('\n\n');

function response(status, body, requestId = 'req-1') {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (name) => (name === 'x-request-id' ? requestId : '') },
    async json() {
      if (body instanceof Error) throw body;
      return body;
    },
  };
}

async function runScenario(sequence, retries = 1) {
  const calls = [];
  const warnings = [];
  const sandbox = {
    Error,
    Promise,
    JSON,
    String,
    WORKER: 'https://worker.test',
    state: { token: 'vk-token' },
    console: { warn: (...args) => warnings.push(args) },
    fetch: async (url, options = {}) => {
      calls.push({ url, options });
      const next = sequence.shift();
      if (next instanceof Error) throw next;
      return next;
    },
  };

  vm.createContext(sandbox);
  vm.runInContext(helperSlice, sandbox, { filename: 'vk-ai-chat-helper-slice.js' });
  let result = null;
  let error = null;
  try {
    result = await vm.runInContext(`requestVkAi({ model: 'test', messages: [{ role: 'user', content: 'redacted prompt' }] }, ${retries})`, sandbox);
  } catch (caught) {
    error = caught;
  }
  return {
    calls,
    warnings,
    state: sandbox.state,
    result,
    error,
    userMessage: error ? sandbox.vkAiUserMessage(error, '') : '',
  };
}

const success = await runScenario([response(200, { content: [{ text: 'ok reply' }] })]);
assert.equal(success.result, 'ok reply');
assert.equal(success.calls[0].options.headers['x-token'], 'vk-token');

for (const [status, type, text] of [
  [401, 'auth', 'снова войти'],
  [402, 'entitlement', 'ограничен'],
  [403, 'entitlement', 'ограничен'],
  [429, 'rate_limit', 'много запросов'],
]) {
  const result = await runScenario([response(status, { ok: false, error: 'safe-error' }, `req-${status}`)]);
  assert.equal(result.calls.length, 1, `${status} must not retry`);
  assert.equal(result.error.type, type);
  assert.equal(result.error.status, status);
  assert.match(result.error.message, new RegExp(text));
  assert.deepEqual(JSON.parse(JSON.stringify(result.state.aiLastDiagnostic)), { status, requestId: `req-${status}`, type });
}

const serverRetry = await runScenario([
  response(500, { ok: false, error: 'server down' }, 'req-500-a'),
  response(200, { content: [{ text: 'after retry' }] }, 'req-500-b'),
]);
assert.equal(serverRetry.calls.length, 2, '500 should retry once');
assert.equal(serverRetry.result, 'after retry');

const networkRetry = await runScenario([
  new Error('network down'),
  response(200, { content: [{ text: 'after network retry' }] }),
]);
assert.equal(networkRetry.calls.length, 2, 'network should retry once');
assert.equal(networkRetry.result, 'after network retry');

const malformed = await runScenario([response(200, { content: [] }, 'req-bad')]);
assert.equal(malformed.error.type, 'malformed');
assert.match(malformed.userMessage, /некорректный формат/i);
assert.deepEqual(JSON.parse(JSON.stringify(malformed.state.aiLastDiagnostic)), { status: 200, requestId: 'req-bad', type: 'malformed' });

const warningText = JSON.stringify(malformed.warnings);
assert.doesNotMatch(warningText, /vk-token|redacted prompt/);
assert.match(warningText, /req-bad/);

console.log('VK AI chat errors smoke: PASS');
