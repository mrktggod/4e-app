import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import http from 'node:http';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const chromeCandidates = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
].filter(Boolean);

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
    const timer = setTimeout(() => reject(new Error(`CDP timeout: ${method}`)), 7000);
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
    const timeout = setTimeout(() => reject(new Error('Page load timeout')), 10000);
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

async function runSmoke(ws, appUrl) {
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
      (() => {
        localStorage.setItem('chetam_onboarded', '1');
        localStorage.setItem('chetam_token', 'smoke-token');
        window.fetch = async () => new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'content-type': 'application/json' }
        });
      })();
    `
  });
  await send(ws, 'Page.navigate', { url: appUrl });
  await waitForLoad(ws);

  const expression = `(${async function smoke() {
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    for (let i = 0; i < 80; i += 1) {
      if (document.getElementById('task-detail')) break;
      await wait(50);
    }

    const failures = [];
    const assert = (condition, message) => {
      if (!condition) failures.push(message);
    };

    chatId = 'smoke-chat';
    const smokeTask = {
      id: 'task-reminder-smoke',
      text: 'Проверить выбор времени уведомления',
      reminder: 'none',
      person: 'Алексей',
      deadline: '2026-07-23T12:00'
    };
    allTasksCache = [smokeTask];
    openTask(smokeTask, 0);
    await wait(120);

    const bell = document.querySelector('#task-detail .detail-redesign-bell');
    const select = document.getElementById('detail-reminder');
    const popover = document.getElementById('detail-reminder-popover');
    assert(Boolean(bell), 'reminder trigger is missing');
    assert(Boolean(select), 'reminder select is missing');
    assert(Boolean(popover), 'reminder popover is missing');
    assert(!bell?.querySelector('select'), 'reminder select must not be nested inside button');
    assert(select?.parentElement !== bell, 'reminder select parent must be a sibling, not the button');

    const themeResults = [];
    for (const theme of ['dark', 'light']) {
      document.documentElement.dataset.theme = theme;
      setDetailReminder('none');
      document.querySelector('#task-detail .detail-redesign-hero')
        ?.classList.remove('detail-reminder-popover-open');
      await wait(40);

      const triggerRect = bell?.getBoundingClientRect();
      const triggerHit = triggerRect
        ? document.elementFromPoint(
            triggerRect.left + triggerRect.width / 2,
            triggerRect.top + triggerRect.height / 2
          )
        : null;
      assert(
        triggerRect?.width >= 44 && triggerRect?.height >= 44,
        `${theme}: reminder trigger should be at least 44x44`
      );
      assert(
        triggerHit === bell || bell?.contains(triggerHit),
        `${theme}: reminder trigger center should receive the tap`
      );
      assert(
        bell?.dataset.reminderActive === 'false' && !bell?.dataset.reminderLabel,
        `${theme}: empty reminder should not show an active label`
      );

      bell?.click();
      await wait(80);
      assert(
        getComputedStyle(popover).display !== 'none',
        `${theme}: reminder popover should open after trigger click`
      );

      const buttonResults = Array.from(popover?.querySelectorAll('button') || []).map(button => {
        const rect = button.getBoundingClientRect();
        const hit = document.elementFromPoint(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2
        );
        const style = getComputedStyle(button);
        assert(rect.width >= 120, `${theme}: reminder option should not collapse to ${rect.width}px`);
        assert(rect.height >= 44, `${theme}: reminder option should be at least 44px tall`);
        assert(
          hit === button || button.contains(hit),
          `${theme}: reminder option "${button.textContent.trim()}" should receive the tap`
        );
        assert(style.whiteSpace === 'nowrap', `${theme}: reminder option text should stay horizontal`);
        return {
          text: button.textContent.trim(),
          width: rect.width,
          height: rect.height,
          hit: hit === button || button.contains(hit)
        };
      });

      const expectedValue = theme === 'dark' ? '1hour' : '15min';
      const expectedCompactLabel = theme === 'dark' ? '1 час' : '15 мин';
      popover?.querySelector(`[data-reminder="${expectedValue}"]`)?.click();
      await wait(120);
      const indicatorStyle = getComputedStyle(bell, '::after');
      assert(select?.value === expectedValue, `${theme}: select value should update`);
      assert(currentDetailReminder === expectedValue, `${theme}: current reminder should update`);
      assert(
        getComputedStyle(popover).display === 'none',
        `${theme}: reminder popover should close after choosing value`
      );
      assert(bell?.dataset.reminderActive === 'true', `${theme}: reminder indicator should be active`);
      assert(
        bell?.dataset.reminderLabel === expectedCompactLabel,
        `${theme}: compact reminder label should be visible`
      );
      assert(
        Number.parseFloat(indicatorStyle.opacity) > 0,
        `${theme}: reminder indicator pseudo-element should be visible`
      );
      assert(
        getComputedStyle(bell?.closest('.detail-redesign-tags')).overflow === 'visible',
        `${theme}: reminder indicator should not be clipped by the tags row`
      );
      assert(
        bell?.getAttribute('aria-label')?.includes(getDetailReminderLabel(expectedValue, false)),
        `${theme}: reminder trigger should expose the selected value`
      );
      themeResults.push({
        theme,
        trigger: triggerRect ? { width: triggerRect.width, height: triggerRect.height } : null,
        buttons: buttonResults,
        selected: select?.value,
        indicator: {
          label: bell?.dataset.reminderLabel || null,
          opacity: indicatorStyle.opacity,
          ariaLabel: bell?.getAttribute('aria-label') || null
        }
      });
    }

    return {
      ok: failures.length === 0,
      failures,
      viewport: { width: window.innerWidth, height: window.innerHeight },
      themes: themeResults
    };
  }})()`;
  const result = await send(ws, 'Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true
  });
  const value = result.result?.value;
  if (!value?.ok) {
    throw new Error(`BACK-067 reminder smoke failed: ${(value?.failures || []).join('; ')}`);
  }
  return value;
}

const staticServer = await startStaticServer();
const chromePort = await getFreePort();
const chromePath = await findChrome();
const userDataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'back-067-chrome-'));
const chrome = spawn(chromePath, [
  '--headless=new',
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  `--user-data-dir=${userDataDir}`,
  `--remote-debugging-port=${chromePort}`,
  'about:blank'
], { stdio: 'ignore' });

try {
  await waitForChrome(chromePort);
  const target = await openPage(chromePort);
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });
  const result = await runSmoke(ws, `http://127.0.0.1:${staticServer.port}/index.html`);
  ws.close();
  console.log(JSON.stringify({ smoke: 'back067-reminder', ...result }, null, 2));
} finally {
  chrome.kill();
  staticServer.server.close();
  await new Promise(resolve => setTimeout(resolve, 250));
  try {
    await fs.rm(userDataDir, { recursive: true, force: true });
  } catch (error) {
    if (error?.code !== 'EBUSY') throw error;
  }
}
