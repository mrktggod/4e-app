import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import http from 'node:http';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE_URL = process.env.STAGING_WORKER_BASE_URL || 'https://restless-lab-d737-staging.shelckograff.workers.dev';
const chromeCandidates = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
].filter(Boolean);

const seedFacts = [
  'Я тестовый пользователь SMART-007 fixture и предпочитаю короткие утренние планы.',
  'Мой учебный проект называется Северный маяк.',
  'Мне удобнее получать задачи списком из трёх пунктов.'
];

function log(message) {
  process.stdout.write(String(message) + '\n');
}

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

async function request(pathname, options = {}) {
  const url = BASE_URL.replace(/\/$/, '') + pathname;
  const start = Date.now();
  const res = await fetch(url, options);
  const text = await res.text();
  const elapsed = Date.now() - start;
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { ok: res.ok, status: res.status, body, text, elapsed, url };
}

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

async function findChrome() {
  for (const candidate of chromeCandidates) {
    if (await exists(candidate)) return candidate;
  }
  throw new Error('Chrome or Edge executable was not found');
}

function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const port = address && typeof address === 'object' ? address.port : null;
      server.close(() => port ? resolve(port) : reject(new Error('No free port')));
    });
  });
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.html') return 'text/html; charset=utf-8';
  if (ext === '.js') return 'text/javascript; charset=utf-8';
  if (ext === '.css') return 'text/css; charset=utf-8';
  if (ext === '.json' || ext === '.webmanifest') return 'application/json; charset=utf-8';
  if (ext === '.png') return 'image/png';
  if (ext === '.svg') return 'image/svg+xml';
  if (ext === '.ico') return 'image/x-icon';
  return 'application/octet-stream';
}

async function startStaticServer() {
  const port = await getFreePort();
  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url || '/', `http://127.0.0.1:${port}`);
      const pathname = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
      const requested = path.resolve(root, `.${pathname}`);
      if (!requested.startsWith(root + path.sep) && requested !== root) {
        res.writeHead(403).end('Forbidden');
        return;
      }
      const stat = await fs.stat(requested);
      if (!stat.isFile()) {
        res.writeHead(404).end('Not found');
        return;
      }
      res.writeHead(200, { 'content-type': contentType(requested) });
      res.end(await fs.readFile(requested));
    } catch {
      res.writeHead(404).end('Not found');
    }
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', resolve);
  });
  return { server, port };
}

function send(ws, method, params = {}) {
  const id = ++send.id;
  ws.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`CDP timeout: ${method}`)), 10000);
    const onMessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id !== id) return;
      clearTimeout(timer);
      ws.removeEventListener('message', onMessage);
      if (msg.error) reject(new Error(`${method}: ${msg.error.message}`));
      else resolve(msg.result);
    };
    ws.addEventListener('message', onMessage);
  });
}
send.id = 0;

async function waitForChrome(port) {
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Chrome did not expose CDP in time')), 8000);
    const poll = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:${port}/json/version`);
        if (res.ok) {
          clearTimeout(timeout);
          resolve();
          return;
        }
      } catch {}
      setTimeout(poll, 100);
    };
    poll();
  });
}

async function openPage(port) {
  const res = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' });
  if (!res.ok) throw new Error(`Cannot open Chrome target: HTTP ${res.status}`);
  return res.json();
}

async function waitForLoad(ws) {
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Page load timeout')), 15000);
    const onMessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Page.loadEventFired') {
        clearTimeout(timeout);
        ws.removeEventListener('message', onMessage);
        resolve();
      }
    };
    ws.addEventListener('message', onMessage);
  });
}

async function evaluate(ws, expression, awaitPromise = false) {
  const result = await send(ws, 'Runtime.evaluate', {
    expression,
    awaitPromise,
    returnByValue: true
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || 'Runtime evaluation failed');
  }
  return result.result?.value;
}

async function renderMemoryScreenDom(token, expectedText, options = {}) {
  const chrome = await findChrome();
  const cdpPort = await getFreePort();
  const profileDir = await fs.mkdtemp(path.join(os.tmpdir(), 'smart007-chrome-'));
  const staticServer = await startStaticServer();
  let chromeProcess;
  let ws;

  try {
    chromeProcess = spawn(chrome, [
      `--remote-debugging-port=${cdpPort}`,
      `--user-data-dir=${profileDir}`,
      '--headless=new',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-background-networking',
      'about:blank'
    ], { stdio: 'ignore' });

    await waitForChrome(cdpPort);
    const target = await openPage(cdpPort);
    ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('WebSocket connection timeout')), 5000);
      ws.addEventListener('open', () => {
        clearTimeout(timer);
        resolve();
      }, { once: true });
      ws.addEventListener('error', reject, { once: true });
    });

    await send(ws, 'Runtime.enable');
    await send(ws, 'Page.enable');
    await send(ws, 'Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 1,
      mobile: true
    });
    await send(ws, 'Page.addScriptToEvaluateOnNewDocument', {
      source: `
        localStorage.setItem('chetam_onboarded', '1');
        localStorage.setItem('chetam_token', ${JSON.stringify(token)});
      `
    });
    await send(ws, 'Page.navigate', { url: `http://127.0.0.1:${staticServer.port}/index.html?smart007Fixture=1` });
    await waitForLoad(ws);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const dom = await evaluate(ws, `
      (async () => {
        for (let i = 0; i < 20; i++) {
          if (window.currentUser || document.querySelector('#home.active,#login.active')) break;
          await new Promise(r => setTimeout(r, 250));
        }
        if (typeof showSubScreen === 'function') showSubScreen('ai-memory');
        if (typeof loadAiMemoryScreen === 'function') await loadAiMemoryScreen(true);
        await new Promise(r => setTimeout(r, 300));
        const rows = Array.from(document.querySelectorAll('#ai-memory-list .ai-memory-row')).map(row => ({
          text: row.querySelector('.ai-memory-row-text')?.textContent?.trim() || '',
          meta: row.querySelector('.ai-memory-row-meta')?.textContent?.trim() || '',
          hasDelete: !!row.querySelector('.ai-memory-delete-btn')
        }));
        return {
          activeScreen: document.querySelector('.screen.active')?.id || '',
          status: document.querySelector('#ai-memory-status')?.textContent?.trim() || '',
          rows,
          emptyText: document.querySelector('#ai-memory-list .ai-memory-empty')?.textContent?.trim() || '',
          forgetDisabled: !!document.querySelector('#ai-memory-forget-btn')?.disabled,
          containsExpected: rows.some(row => row.text.includes(${JSON.stringify(expectedText)})),
          scrollWidth: document.documentElement.scrollWidth
        };
      })()
    `, true);

    assert(dom.activeScreen === 'ai-memory', `ai-memory screen not active: ${dom.activeScreen}`);
    if (options.expectEmpty) {
      assert(dom.rows.length === 0, `ai-memory DOM expected empty rows, got ${dom.rows.length}`);
      assert(dom.emptyText, 'ai-memory DOM empty state text is missing');
      assert(dom.forgetDisabled, 'ai-memory forget button should be disabled in empty state');
    } else {
      assert(dom.rows.length > 0, 'ai-memory DOM rendered no rows');
      assert(dom.containsExpected, 'ai-memory DOM did not render expected fixture fact');
      assert(dom.rows.every((row) => row.hasDelete), 'ai-memory DOM rows should expose delete buttons');
    }
    assert(dom.scrollWidth === 390, `unexpected horizontal overflow: ${dom.scrollWidth}`);

    let localProbe = null;
    if (options.runLocalProbe) {
      localProbe = await evaluate(ws, `
        (async () => {
          window.__smart007Xss = 0;
          const payload = '<img src=x onerror="window.__smart007Xss=1"> SMART-007-LONG-' + 'A'.repeat(260);
          aiMemoryFactsCache = [{
            id: 'local-html-like',
            fact: payload,
            category: 'privacy',
            confidence: 0.99,
            updatedAt: Date.now()
          }];
          aiMemoryFactsEnabled = true;
          renderAiMemoryScreen();
          await new Promise(r => setTimeout(r, 100));
          const row = document.querySelector('#ai-memory-list .ai-memory-row');
          const text = row?.querySelector('.ai-memory-row-text')?.textContent || '';
          const html = row?.querySelector('.ai-memory-row-text')?.innerHTML || '';
          const hasExecutableNode = !!row?.querySelector('img,script,iframe,svg,onload');
          const deleteButton = row?.querySelector('.ai-memory-delete-btn');
          const longLayout = {
            scrollWidth: document.documentElement.scrollWidth,
            rowHeight: Math.round((row?.getBoundingClientRect().height || 0) * 100) / 100,
            buttonVisible: !!deleteButton && deleteButton.getBoundingClientRect().width > 0
          };

          aiMemoryFactsCache = [];
          renderAiMemoryScreen();
          const emptyText = document.querySelector('#ai-memory-list .ai-memory-empty')?.textContent?.trim() || '';
          const emptyForgetDisabled = !!document.querySelector('#ai-memory-forget-btn')?.disabled;

          const statusEl = document.querySelector('#ai-memory-status');
          const listEl = document.querySelector('#ai-memory-list');
          if (statusEl) statusEl.textContent = 'Unable to load AI memory. Try again later.';
          if (listEl) listEl.innerHTML = '<div class="ai-memory-empty">Server temporarily unavailable.</div>';
          const errorText = [
            document.querySelector('#ai-memory-status')?.textContent || '',
            document.querySelector('#ai-memory-list')?.textContent || ''
          ].join(' ');
          const hasTechnicalLeak = /token|authorization|bearer|stack|trace|sql|d1|kv|password|secret/i.test(errorText);

          return {
            textLength: text.length,
            textIncludesPayload: text.includes('SMART-007-LONG-'),
            htmlEscaped: html.includes('&lt;img') && !hasExecutableNode,
            xssFlag: window.__smart007Xss,
            longLayout,
            emptyText,
            emptyForgetDisabled,
            errorText,
            hasTechnicalLeak
          };
        })()
      `, true);

      assert(localProbe.textIncludesPayload, 'local HTML-like payload text was not rendered as text');
      assert(localProbe.htmlEscaped, 'local HTML-like payload was not escaped');
      assert(localProbe.xssFlag === 0, 'local HTML-like payload executed script-like behavior');
      assert(localProbe.longLayout.scrollWidth === 390, `local long payload overflowed horizontally: ${localProbe.longLayout.scrollWidth}`);
      assert(localProbe.longLayout.buttonVisible, 'delete button not visible for long local payload');
      assert(localProbe.emptyText, 'local empty state missing after clearing injected facts');
      assert(localProbe.emptyForgetDisabled, 'forget button should be disabled after local empty render');
      assert(!localProbe.hasTechnicalLeak, `local error state leaked technical text: ${localProbe.errorText}`);
    }

    return { ...dom, localProbe };
  } finally {
    if (ws && ws.readyState === WebSocket.OPEN) ws.close();
    staticServer.server.close();
    if (chromeProcess) chromeProcess.kill();
    await fs.rm(profileDir, { recursive: true, force: true }).catch(() => {});
  }
}

function factText(fact) {
  return String(fact?.fact || '').trim();
}

function factMatchesSeed(fact) {
  const text = factText(fact).toLowerCase();
  return text.includes('smart-007') ||
    text.includes('корот') ||
    text.includes('северн') ||
    text.includes('маяк') ||
    text.includes('тр') && text.includes('пункт');
}

async function pollFacts(token) {
  let last = null;
  for (let i = 0; i < 18; i++) {
    const response = await request('/ai/facts?limit=15', {
      headers: { 'x-token': token }
    });
    last = response;
    log(`facts.poll.${i + 1}: ${response.status} ${response.elapsed}ms count=${Array.isArray(response.body?.facts) ? response.body.facts.length : 'n/a'}`);
    if (response.status === 200 && response.body?.ok === true && response.body?.enabled === true) {
      const facts = Array.isArray(response.body.facts) ? response.body.facts : [];
      if (facts.some(factMatchesSeed)) return { response, facts };
    }
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
  throw new Error(`No SMART-007 fixture facts appeared; last=${last?.status} ${last?.text}`);
}

(async () => {
  log(`smart-007-memory-fixture-smoke: worker=${BASE_URL}`);

  const stamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 12);
  const email = `smart007-fixture-${stamp}-${Date.now()}@example.org`;
  const password = 'SmokePass123!';

  const register = await request('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name: 'SMART007 Fixture' })
  });
  log(`register: ${register.status} ${register.elapsed}ms`);
  assert(register.status === 200 || register.status === 201, `register failed: ${register.text}`);

  const login = await request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  log(`login: ${login.status} ${login.elapsed}ms`);
  assert(login.status === 200 && login.body?.token, `login failed: ${login.text}`);
  const token = login.body.token;
  const authHeaders = { 'Content-Type': 'application/json', 'x-token': token };

  const d1Session = await request('/v2/auth/legacy-session', {
    method: 'POST',
    headers: authHeaders
  });
  log(`legacy-session: ${d1Session.status} ${d1Session.elapsed}ms`);
  assert(d1Session.status === 200 && d1Session.body?.token, `legacy-session failed: ${d1Session.text}`);

  const privacy = await request('/v2/privacy/settings', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${d1Session.body.token}`
    },
    body: JSON.stringify({
      rawMessageRetentionDays: 90,
      aiProcessingEnabled: true,
      aiMemoryEnabled: true,
      messengerImportEnabled: false,
      messengerSendEnabled: false
    })
  });
  log(`privacy.settings: ${privacy.status} ${privacy.elapsed}ms`);
  assert(privacy.status === 200 && privacy.body?.ok === true, `privacy settings failed: ${privacy.text}`);

  const userContent = [
    'Проверь AI-память на безопасных синтетических фактах.',
    ...seedFacts
  ].join('\n');

  const saveUser = await request('/ai/messages', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ role: 'user', content: userContent })
  });
  log(`ai.messages.user: ${saveUser.status} ${saveUser.elapsed}ms`);
  assert(saveUser.status === 200 && saveUser.body?.ok !== false, `save user message failed: ${saveUser.text}`);

  const anthropic = await request('/anthropic', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      system: 'Ты кратко подтверждаешь, что понял безопасные тестовые факты. Не добавляй новых персональных данных.',
      messages: [{ role: 'user', content: userContent }]
    })
  });
  log(`anthropic: ${anthropic.status} ${anthropic.elapsed}ms`);
  assert(anthropic.status === 200, `anthropic failed: ${anthropic.text}`);
  const assistantText = anthropic.body?.content?.[0]?.text || 'Понял безопасные тестовые факты для проверки AI-памяти.';

  const saveAssistant = await request('/ai/messages', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ role: 'assistant', content: assistantText })
  });
  log(`ai.messages.assistant: ${saveAssistant.status} ${saveAssistant.elapsed}ms`);
  assert(saveAssistant.status === 200 && saveAssistant.body?.ok !== false, `save assistant message failed: ${saveAssistant.text}`);

  const { facts } = await pollFacts(token);
  const matchedFact = facts.find(factMatchesSeed);
  assert(matchedFact?.id, 'matched fact has no id');
  const matchedText = factText(matchedFact);
  assert(!matchedText.includes(email), 'fact leaked fixture email');
  assert(!/token|парол|password/i.test(matchedText), 'fact leaked auth-like text');

  const dom = await renderMemoryScreenDom(token, matchedText, { runLocalProbe: true });

  const deleteOne = await request(`/ai/facts/${encodeURIComponent(matchedFact.id)}`, {
    method: 'DELETE',
    headers: authHeaders
  });
  log(`facts.delete-one: ${deleteOne.status} ${deleteOne.elapsed}ms`);
  assert(deleteOne.status === 200 && deleteOne.body?.ok === true, `delete one failed: ${deleteOne.text}`);

  const afterDelete = await request('/ai/facts?limit=15', {
    headers: { 'x-token': token }
  });
  log(`facts.after-delete-one: ${afterDelete.status} ${afterDelete.elapsed}ms`);
  assert(afterDelete.status === 200 && afterDelete.body?.ok === true, `after delete list failed: ${afterDelete.text}`);
  assert(!afterDelete.body.facts?.some((fact) => String(fact.id) === String(matchedFact.id)), 'deleted fact still appears');
  const remainingFact = Array.isArray(afterDelete.body.facts) ? afterDelete.body.facts[0] : null;
  const domAfterDelete = remainingFact ? await renderMemoryScreenDom(token, factText(remainingFact)) : null;

  const clearAll = await request('/ai/facts', {
    method: 'DELETE',
    headers: authHeaders
  });
  log(`facts.clear-all: ${clearAll.status} ${clearAll.elapsed}ms`);
  assert(clearAll.status === 200 && clearAll.body?.ok === true, `clear all failed: ${clearAll.text}`);

  const afterClear = await request('/ai/facts?limit=15', {
    headers: { 'x-token': token }
  });
  log(`facts.after-clear: ${afterClear.status} ${afterClear.elapsed}ms`);
  assert(afterClear.status === 200 && afterClear.body?.ok === true, `after clear list failed: ${afterClear.text}`);
  assert(Array.isArray(afterClear.body.facts) && afterClear.body.facts.length === 0, 'facts should be empty after clear all');
  const domAfterClear = await renderMemoryScreenDom(token, '', { expectEmpty: true });

  log('smart-007-memory-fixture-smoke: OK');
  log(JSON.stringify({
    ok: true,
    email,
    token: '<redacted>',
    d1Token: '<redacted>',
    factsBeforeDelete: facts.map((fact) => ({
      id: fact.id,
      fact: fact.fact,
      category: fact.category,
      confidence: fact.confidence
    })),
    matchedFact: {
      id: matchedFact.id,
      fact: matchedFact.fact,
      category: matchedFact.category,
      confidence: matchedFact.confidence
    },
    dom,
    domAfterDelete,
    domAfterClear,
    afterDeleteCount: afterDelete.body.facts.length,
    afterClearCount: afterClear.body.facts.length
  }, null, 2));
})().catch((error) => {
  console.error('smart-007-memory-fixture-smoke failed:', error.message);
  process.exit(1);
});
