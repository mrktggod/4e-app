import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workerPath = path.resolve(root, '..', 'worker', 'worker.js');

if (!fs.existsSync(workerPath)) {
  throw new Error(`worker source not found at sibling path: ${workerPath}`);
}

const source = fs.readFileSync(workerPath, 'utf8');

function extractFunction(name, prefix = 'function') {
  const signature = `${prefix} ${name}`;
  const start = source.indexOf(signature);
  assert.notEqual(start, -1, `${name} source not found`);
  const bodyStart = source.indexOf('{', start);
  assert.notEqual(bodyStart, -1, `${name} body not found`);

  let depth = 0;
  for (let i = bodyStart; i < source.length; i += 1) {
    const char = source[i];
    if (char === '{') depth += 1;
    if (char === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(start, i + 1);
    }
  }
  throw new Error(`${name} source is unterminated`);
}

const requiredMarkers = [
  'DEFAULT_NOTIFICATION_SETTINGS',
  'function normalizeNotificationSettings',
  'async function getNotificationSettings',
  'async function handleDeadlinesCheck',
  'async function collectBriefingsForNow',
  'function buildBriefingMessage',
  'async function sendTelegramBotMessage',
  'url.pathname === "/notifications/settings"',
  'url.pathname === "/briefings/check"',
  'https://api.telegram.org/bot${BOT_TOKEN}/sendMessage'
];

for (const marker of requiredMarkers) {
  assert.ok(source.includes(marker), `worker notification marker missing: ${marker}`);
}

const harnessSource = [
  extractFunction('escapeMarkdownV2'),
  extractFunction('formatBriefingLine'),
  extractFunction('buildBriefingMessage'),
  extractFunction('sendTelegramBotMessage', 'async function'),
  'return { buildBriefingMessage, sendTelegramBotMessage };'
].join('\n');

const calls = [];
const fakeFetch = async (url, options = {}) => {
  calls.push({
    url: String(url).replace(/bot[^/]+\/sendMessage/, 'bot<redacted>/sendMessage'),
    rawUrl: String(url),
    method: options.method || 'GET',
    headers: options.headers || {},
    body: JSON.parse(options.body || '{}')
  });
  return {
    async json() {
      return { ok: true, result: { message_id: 10101 } };
    }
  };
};

const { buildBriefingMessage, sendTelegramBotMessage } = new Function(
  'fetch',
  'BOT_TOKEN',
  harnessSource
)(fakeFetch, 'local-test-token');

const now = new Date('2026-07-28T06:15:00.000Z');
const briefing = {
  userId: 'local-user-101',
  telegramId: 'tg-local-101',
  sentKey: 'briefing_sent:local-user-101:2026-07-28',
  overdue: [
    { person: 'Yuri', text: 'Review beta notification delivery' }
  ],
  today: [
    { person: 'Alex', text: 'Prepare morning briefing evidence' }
  ],
  tasks: []
};

const message = buildBriefingMessage(briefing, now);
assert.match(message, /\u0423\u0442\u0440\u0435\u043D\u043D\u0438\u0439 \u0431\u0440\u0438\u0444\u0438\u043D\u0433/u, 'briefing title missing');
assert.match(message, /\u041F\u0440\u043E\u0441\u0440\u043E\u0447\u0435\u043D\u043E/u, 'overdue section missing');
assert.match(message, /\u041D\u0430 \u0441\u0435\u0433\u043E\u0434\u043D\u044F/u, 'today section missing');
assert.match(message, /Yuri/u, 'overdue assignee missing');
assert.match(message, /Alex/u, 'today assignee missing');

const sent = await sendTelegramBotMessage(
  briefing.telegramId,
  message,
  'https://app.4-ai.site',
  '\u041E\u0442\u043A\u0440\u044B\u0442\u044C 4'
);

assert.deepEqual(sent, { ok: true }, 'mock Telegram send should return ok');
assert.equal(calls.length, 1, 'send boundary should be called once');

const [call] = calls;
assert.equal(call.method, 'POST', 'Telegram boundary should use POST');
assert.equal(call.url, 'https://api.telegram.org/bot<redacted>/sendMessage');
assert.equal(call.body.chat_id, 'tg-local-101');
assert.equal(call.body.text, message);
assert.equal(call.body.parse_mode, 'MarkdownV2');
assert.equal(call.body.reply_markup.inline_keyboard[0][0].url, 'https://app.4-ai.site');
assert.equal(call.body.reply_markup.inline_keyboard[0][0].text, '\u041E\u0442\u043A\u0440\u044B\u0442\u044C 4');

console.log('telegram notification delivery contract smoke: PASS');
console.log(JSON.stringify({
  workerPath,
  markersChecked: requiredMarkers.length,
  recipient: call.body.chat_id,
  sendBoundary: call.url,
  parseMode: call.body.parse_mode,
  buttonUrl: call.body.reply_markup.inline_keyboard[0][0].url,
  textPreview: message.split('\n').slice(0, 5),
  liveTelegramCalled: false
}, null, 2));
