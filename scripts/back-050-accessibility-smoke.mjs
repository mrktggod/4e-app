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
        localStorage.removeItem('chetam_token');
        window.fetch = async (url) => {
          const href = String(url);
          const body = href.includes('/tariff-config') ? { ok: true, config: null } : { ok: true };
          return new Response(JSON.stringify(body), {
            status: 200,
            headers: { 'content-type': 'application/json' }
          });
        };
      })();
    `
  });
  await send(ws, 'Page.navigate', { url: appUrl });
  await waitForLoad(ws);

  const expression = `(${async function smoke() {
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    for (let i = 0; i < 80; i += 1) {
      if (document.getElementById('login')) break;
      await wait(50);
    }

    const failures = [];
    const metrics = {};
    const byId = (id) => document.getElementById(id);
    const activeId = () => document.activeElement?.id || document.activeElement?.className || document.activeElement?.tagName || '';
    const assert = (condition, message) => {
      if (!condition) failures.push(message);
    };

    const requiredFields = [
      'login-email',
      'login-pass',
      'reg-name',
      'reg-email',
      'reg-pass',
      'forgot-email',
      'reset-pass',
      'reset-pass2'
    ];
    metrics.authFields = requiredFields.map((id) => {
      const field = byId(id);
      const label = document.querySelector('label[for="' + id + '"]');
      const describedBy = field?.getAttribute('aria-describedby') || '';
      const describedIds = describedBy.split(/\s+/).filter(Boolean);
      const error = describedIds.map(item => byId(item)).find(item => item?.classList.contains('form-error'));
      const ok = Boolean(field && label && describedBy && error && field.getAttribute('aria-invalid') === 'false');
      if (!ok) failures.push(id + ' is missing label/describedby/error/aria-invalid baseline');
      return { id, ok, describedBy };
    });

    const toast = byId('toast');
    assert(toast?.getAttribute('role') === 'status', 'toast should default to role=status');
    assert(toast?.getAttribute('aria-live') === 'polite', 'toast should default to aria-live=polite');
    assert(toast?.getAttribute('aria-atomic') === 'true', 'toast should be aria-atomic');
    showToast('Нет соединения');
    await wait(60);
    assert(toast?.getAttribute('role') === 'alert', 'critical toast should switch to alert');
    assert(toast?.getAttribute('aria-live') === 'assertive', 'critical toast should be assertive');
    metrics.criticalToastText = toast?.textContent || '';
    showToast('Сохранено', 'success');
    await wait(60);
    assert(toast?.getAttribute('role') === 'status', 'success toast should switch back to status');
    assert(toast?.getAttribute('aria-live') === 'polite', 'success toast should switch back to polite');

    const dialogSpecs = [
      ['quick-add-overlay', 'quick-add-title'],
      ['contact-panel-overlay', 'contact-panel-name'],
      ['focus-panel-overlay', 'focus-panel-title']
    ];
    metrics.dialogs = dialogSpecs.map(([id, labelId]) => {
      const dialog = byId(id);
      const ok = Boolean(dialog
        && dialog.getAttribute('role') === 'dialog'
        && dialog.getAttribute('aria-modal') === 'true'
        && dialog.getAttribute('aria-labelledby') === labelId
        && dialog.getAttribute('aria-hidden') === 'true');
      if (!ok) failures.push(id + ' is missing dialog ARIA baseline');
      return { id, ok };
    });

    const opener = byId('login-submit-btn');
    opener?.focus();
    openQuickAdd();
    await wait(80);
    assert(byId('quick-add-overlay')?.getAttribute('aria-hidden') === 'false', 'quick-add should set aria-hidden=false when open');
    assert(activeId() === 'quick-add-text', 'quick-add should focus task textarea');
    byId('quick-add-cancel')?.click();
    await wait(80);
    assert(byId('quick-add-overlay')?.getAttribute('aria-hidden') === 'true', 'quick-add should set aria-hidden=true when closed');
    assert(activeId() === 'login-submit-btn', 'quick-add should restore focus to opener');

    opener?.focus();
    openContactPanel('Yuri', 'Review accessibility smoke', { assigneeUsername: 'yuri_test' });
    await wait(80);
    assert(byId('contact-panel-overlay')?.getAttribute('aria-hidden') === 'false', 'contact panel should set aria-hidden=false when open');
    assert(activeId() === 'contact-panel-telegram-btn', 'contact panel should focus first action');
    byId('contact-panel-overlay')?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await wait(80);
    assert(byId('contact-panel-overlay')?.getAttribute('aria-hidden') === 'true', 'contact panel Escape should close dialog');
    assert(activeId() === 'login-submit-btn', 'contact panel should restore focus to opener');

    byId('login-submit-btn')?.focus();
    const focusList = byId('focus-panel-list');
    if (focusList) {
      focusList.innerHTML = '<button class="home-ai-row" type="button">Focus row</button>';
    }
    const focusOverlay = byId('focus-panel-overlay');
    if (focusOverlay) focusOverlay.style.display = 'flex';
    openAccessibleDialog('focus-panel-overlay', '#focus-panel-list .home-ai-row');
    await wait(80);
    assert(byId('focus-panel-overlay')?.getAttribute('aria-hidden') === 'false', 'focus panel should set aria-hidden=false when open');
    assert(document.activeElement?.classList.contains('home-ai-row'), 'focus panel should focus first row when available');
    closeFocusPanel();
    await wait(80);
    assert(byId('focus-panel-overlay')?.getAttribute('aria-hidden') === 'true', 'focus panel should set aria-hidden=true when closed');
    assert(activeId() === 'login-submit-btn', 'focus panel should restore focus to opener');

    metrics.documentScrollWidth = document.documentElement.scrollWidth;
    metrics.viewportWidth = window.innerWidth;
    assert(metrics.documentScrollWidth <= metrics.viewportWidth + 1, 'accessibility smoke page should not create horizontal overflow');

    return { ok: failures.length === 0, failures, metrics };
  }})()`;
  const result = await send(ws, 'Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true
  });
  if (result.exceptionDetails) {
    throw new Error(`Smoke page exception: ${result.exceptionDetails.text || JSON.stringify(result.exceptionDetails)}`);
  }
  return result.result.value;
}

let chrome;
let tempDir;
let staticServer;
try {
  if (!globalThis.WebSocket) throw new Error('Node.js WebSocket client is not available');
  const chromePath = await findChrome();
  const cdpPort = await getFreePort();
  const served = await startStaticServer();
  staticServer = served.server;
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'back-050-smoke-'));
  chrome = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--disable-extensions',
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=390,844',
    `--remote-debugging-port=${cdpPort}`,
    `--user-data-dir=${path.join(tempDir, 'profile')}`,
    'about:blank'
  ], { stdio: ['ignore', 'pipe', 'pipe'] });

  await waitForChrome(cdpPort);
  const target = await openPage(cdpPort);
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('CDP WebSocket open timeout')), 5000);
    ws.addEventListener('open', () => {
      clearTimeout(timeout);
      resolve();
    }, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });

  const result = await runSmoke(ws, `http://127.0.0.1:${served.port}/index.html`);
  ws.close();
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
} finally {
  if (staticServer) {
    await new Promise(resolve => staticServer.close(resolve));
  }
  if (chrome && !chrome.killed) {
    chrome.kill();
    await new Promise(resolve => chrome.once('exit', resolve));
  }
  if (tempDir) {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
        break;
      } catch (error) {
        if (attempt === 4) throw error;
        await new Promise(resolve => setTimeout(resolve, 150));
      }
    }
  }
}
