import assert from 'node:assert/strict';

const module = await import('../worker-static.js');
const worker = module.default;

const sent = [];
const originalFetch = globalThis.fetch;
globalThis.fetch = async (url, options = {}) => {
  sent.push({ url: String(url), body: JSON.parse(options.body || '{}') });
  return new Response(JSON.stringify({ ok: true, result: { message_id: 1 } }), {
    status: 200,
    headers: { 'content-type': 'application/json' }
  });
};

try {
  const request = new Request('https://app.4-ai.site/support', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: 'https://app.4-ai.site'
    },
    body: JSON.stringify({
      topic: 'Техническая проблема',
      message: 'Проверяем отправку заявки в Telegram чат Юрия',
      platform: 'telegram',
      page: 'https://app.4-ai.site/index.html#support',
      createdAt: '2026-07-29T18:45:00.000Z',
      user: {
        id: 'support-user-1',
        name: 'Support Smoke',
        email: 'support-smoke@example.test',
        telegramUsername: 'support_smoke'
      },
      app: {
        host: 'app.4-ai.site'
      }
    })
  });
  const response = await worker.fetch(request, {
    SUPPORT_BOT_TOKEN: 'test-token',
    SUPPORT_CHAT_ID: 'test-chat'
  });
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(sent.length, 1);
  assert.ok(sent[0].url.includes('https://api.telegram.org/bottest-token/sendMessage'));
  assert.equal(sent[0].body.chat_id, 'test-chat');
  assert.ok(sent[0].body.text.includes('Новая заявка в поддержку 4'));
  assert.ok(sent[0].body.text.includes('Техническая проблема'));
  assert.ok(sent[0].body.text.includes('support_smoke'));

  const missingConfigResponse = await worker.fetch(new Request('https://app.4-ai.site/support', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ topic: 'Bug', message: 'Сообщение достаточно длинное' })
  }), {});
  const missingConfigBody = await missingConfigResponse.json();
  assert.equal(missingConfigResponse.status, 503);
  assert.equal(missingConfigBody.error, 'support_telegram_not_configured');

  console.log(JSON.stringify({
    smoke: 'worker-static-support',
    ok: true,
    telegramCalls: sent.length,
    missingConfigStatus: missingConfigResponse.status
  }, null, 2));
} finally {
  globalThis.fetch = originalFetch;
}
