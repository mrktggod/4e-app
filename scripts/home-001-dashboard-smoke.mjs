import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import http from 'node:http';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const artifactDir = path.join(root, 'docs', 'tasks', 'assets');
const chromeCandidates = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
].filter(Boolean);

const smokeTasks = [
  {
    id: 'home-smoke-hot',
    text: 'Prepare beta dashboard acceptance pass',
    direction: 'outgoing',
    directionLabel: 'Work',
    person: 'Alex',
    priority: 'p1',
    deadline: new Date(Date.now() + 86400000).toISOString(),
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'home-smoke-overdue',
    text: 'Confirm staging visual review notes',
    direction: 'outgoing',
    directionLabel: 'Work',
    person: 'Yuri',
    priority: 'p0',
    deadline: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'home-smoke-incoming',
    text: 'Waiting for manual beta go/no-go',
    direction: 'incoming',
    directionLabel: 'Personal',
    person: 'Tester',
    priority: 'p2',
    deadline: new Date(Date.now() + 2 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 10800000).toISOString()
  },
  {
    id: 'home-smoke-done',
    text: 'Completed previous dashboard smoke',
    direction: 'outgoing',
    directionLabel: 'Work',
    person: 'Codex',
    priority: 'p3',
    done: true,
    completedAt: new Date().toISOString(),
    deadline: new Date().toISOString(),
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString()
  }
];

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

async function openPage(port) {
  const res = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' });
  if (!res.ok) throw new Error(`Cannot open Chrome target: HTTP ${res.status}`);
  return res.json();
}

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

async function screenshot(ws, filename) {
  const shot = await send(ws, 'Page.captureScreenshot', { format: 'png', fromSurface: true });
  await fs.mkdir(artifactDir, { recursive: true });
  const outPath = path.join(artifactDir, filename);
  await fs.writeFile(outPath, Buffer.from(shot.data, 'base64'));
  return outPath;
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
        const tasks = ${JSON.stringify(smokeTasks)};
        localStorage.setItem('chetam_token', 'home-smoke-token');
        localStorage.setItem('chetam_onboarded', '1');
        localStorage.setItem('theme', 'dark');
        window.__homeSmokeFetches = [];
        const jsonResponse = (body, status = 200) => new Response(JSON.stringify(body), {
          status,
          headers: { 'content-type': 'application/json' }
        });
        window.fetch = async (url, options = {}) => {
          const href = String(url);
          window.__homeSmokeFetches.push({
            url: href,
            method: options.method || 'GET',
            action: options.headers && (options.headers['x-action'] || options.headers.get?.('x-action')) || ''
          });
          if (href.includes('/auth/me')) {
            return jsonResponse({ ok: true, user: {
              id: 'home-smoke-user',
              email: 'home-smoke@example.test',
              name: 'Home Smoke',
              plan: 'trial',
              trialLeft: 14,
              trialActive: true,
              trialEndsAt: Date.now() + 14 * 86400000,
              entitlement: {
                status: 'active',
                accessUntil: Date.now() + 14 * 86400000,
                plan: 'trial',
                source: 'home-smoke'
              },
              referralCode: 'homesmoke'
            }});
          }
          if (href.includes('/tasks')) return jsonResponse(tasks);
          if (href.includes('/tariff-config')) return jsonResponse({ ok: true, config: null });
          if (href.includes('/analytics/')) return jsonResponse({ ok: true });
          if (href.includes('/ai/messages')) return jsonResponse({ ok: true, messages: [] });
          if (href.includes('/notifications')) return jsonResponse({ ok: true, items: [] });
          return jsonResponse({ ok: true });
        };
      })();
    `
  });
  await send(ws, 'Page.navigate', { url: appUrl });
  await waitForLoad(ws);

  const expression = `(${async function smoke() {
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    for (let i = 0; i < 80; i += 1) {
      if (document.getElementById('home')?.classList.contains('active')
        && document.querySelectorAll('#home-task-list .home-ai-row').length >= 3) break;
      await wait(100);
    }

    const failures = [];
    const metrics = {};
    const byId = (id) => document.getElementById(id);
    const activeScreen = () => document.querySelector('.screen.active')?.id || '';
    const rectInfo = (el) => {
      const rect = el?.getBoundingClientRect();
      return rect ? {
        left: Math.round(rect.left * 100) / 100,
        top: Math.round(rect.top * 100) / 100,
        right: Math.round(rect.right * 100) / 100,
        bottom: Math.round(rect.bottom * 100) / 100,
        width: Math.round(rect.width * 100) / 100,
        height: Math.round(rect.height * 100) / 100
      } : null;
    };
    const assert = (condition, message) => {
      if (!condition) failures.push(message);
    };
    const waitFor = async (predicate, message) => {
      for (let i = 0; i < 30; i += 1) {
        if (predicate()) return true;
        await wait(50);
      }
      failures.push(message);
      return false;
    };
    const click = async (selector, label) => {
      const el = document.querySelector(selector);
      assert(Boolean(el), `${label} target is missing`);
      if (!el) return false;
      el.click();
      await wait(80);
      return true;
    };
    const goHomeNow = async () => {
      window.showScreen?.('home');
      window.setNavActive?.('tasks');
      await wait(60);
    };

    await waitFor(() => activeScreen() === 'home', 'home screen did not become active');
    metrics.initialScreen = activeScreen();
    metrics.viewportWidth = window.innerWidth;
    metrics.documentScrollWidth = document.documentElement.scrollWidth;
    metrics.homeRows = document.querySelectorAll('#home-task-list .home-ai-row').length;
    metrics.metricCards = document.querySelectorAll('#home .dash-metric').length;
    metrics.bottomNavButtons = document.querySelectorAll('#home .dash-bottom-nav button').length;
    metrics.focusCount = byId('focus-day-count')?.textContent || '';
    metrics.focusText = byId('focus-day-text')?.textContent || '';
    metrics.heroImageReady = Boolean(document.querySelector('.dash-hero-orb')?.complete && document.querySelector('.dash-hero-orb')?.naturalWidth > 0);
    metrics.artboard = rectInfo(document.querySelector('#home .dash-artboard'));

    assert(metrics.initialScreen === 'home', 'home is not the active screen after auth smoke');
    assert(metrics.homeRows === 3, 'home should render exactly top-3 priority rows');
    assert(metrics.metricCards === 4, 'home should render four metric cards');
    assert(metrics.bottomNavButtons === 3, 'home bottom nav should render three buttons');
    assert(Number(metrics.focusCount) >= 2, 'focus count should reflect seeded attention tasks');
    assert(Boolean(metrics.focusText), 'focus text should not be empty');
    assert(metrics.heroImageReady, 'dashboard hero image did not load');
    assert(metrics.documentScrollWidth <= metrics.viewportWidth + 1, 'home has horizontal document overflow');

    const overflowSelectors = [
      '#home .dash-header',
      '#home .dash-hero',
      '#home .dash-metrics',
      '#home .dash-bottom-nav',
      '#home-task-list'
    ];
    metrics.overflowChecks = overflowSelectors.map(selector => {
      const el = document.querySelector(selector);
      const info = rectInfo(el);
      const ok = Boolean(info && info.width > 0 && info.height > 0);
      if (!ok) failures.push(`${selector} is outside the mobile viewport`);
      return { selector, ok, info };
    });

    await click('[data-home-action="open-profile"]', 'profile action');
    await waitFor(() => activeScreen() === 'profile', 'profile action did not open profile');
    await goHomeNow();

    await click('[data-home-action="open-notifications"]', 'notifications action');
    await waitFor(() => activeScreen() === 'notifications', 'notifications action did not open notifications');
    await goHomeNow();

    await click('[data-home-action="open-focus-list"]', 'focus action');
    await waitFor(() => getComputedStyle(byId('focus-panel-overlay')).display !== 'none', 'focus action did not open focus overlay');
    metrics.focusPanelRows = document.querySelectorAll('#focus-panel-list .home-ai-row').length;
    assert(metrics.focusPanelRows >= 1, 'focus overlay should list priority rows');
    window.closeFocusPanel?.();
    await wait(50);

    await click('[data-home-action="open-done-list"]', 'done metric action');
    await waitFor(() => activeScreen() === 'statistics', 'done metric did not open statistics');
    await goHomeNow();

    await click('[data-home-action="open-active-list"]', 'active metric action');
    await waitFor(() => activeScreen() === 'statistics', 'active metric did not open statistics');
    await goHomeNow();

    await click('[data-home-action="open-promise-list"]', 'promise metric action');
    await waitFor(() => activeScreen() === 'statistics', 'promise metric did not open statistics');
    await goHomeNow();

    await click('[data-home-action="open-statistics"]', 'progress metric action');
    await waitFor(() => activeScreen() === 'statistics', 'progress metric did not open statistics');
    await goHomeNow();

    await click('[data-home-nav-action="brain"]', 'center nav action');
    await waitFor(() => activeScreen() === 'ask', 'center nav did not open ask screen');
    await goHomeNow();

    await click('[data-home-nav-action="calendar"]', 'calendar nav action');
    await waitFor(() => activeScreen() === 'calendar', 'calendar nav did not open calendar');
    await goHomeNow();

    const collectTheme = async (theme) => {
      window.applyTheme?.(theme);
      await wait(120);
      const artboard = document.querySelector('#home .dash-artboard');
      const hero = document.querySelector('#home .dash-hero');
      const rows = Array.from(document.querySelectorAll('#home-task-list .home-ai-row'));
      return {
        theme: document.documentElement.getAttribute('data-theme'),
        artboard: rectInfo(artboard),
        hero: rectInfo(hero),
        rowCount: rows.length,
        firstRow: rectInfo(rows[0]),
        scrollWidth: document.documentElement.scrollWidth
      };
    };

    metrics.dark = await collectTheme('dark');
    assert(metrics.dark.theme === 'dark', 'dark theme did not apply');
    assert(metrics.dark.rowCount === 3, 'dark theme lost priority rows');
    assert(metrics.dark.scrollWidth <= window.innerWidth + 1, 'dark theme has horizontal overflow');

    return { ok: failures.length === 0, failures, metrics, fetches: window.__homeSmokeFetches || [] };
  }})()`;
  const result = await send(ws, 'Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true
  });
  const smokeResult = result.result.value;
  const darkShot = await screenshot(ws, 'HOME-001-dashboard-smoke-2026-07-20-dark.png');

  const lightResult = await send(ws, 'Runtime.evaluate', {
    expression: `(${async function collectLight() {
      const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
      window.showScreen?.('home');
      window.applyTheme?.('light');
      await wait(150);
      const failures = [];
      const rows = document.querySelectorAll('#home-task-list .home-ai-row').length;
      const theme = document.documentElement.getAttribute('data-theme');
      const scrollWidth = document.documentElement.scrollWidth;
      if (theme !== 'light') failures.push('light theme did not apply');
      if (rows !== 3) failures.push('light theme lost priority rows');
      if (scrollWidth > window.innerWidth + 1) failures.push('light theme has horizontal overflow');
      return { ok: failures.length === 0, failures, metrics: { theme, rows, scrollWidth, viewportWidth: window.innerWidth } };
    }})()`,
    awaitPromise: true,
    returnByValue: true
  });
  const lightSmoke = lightResult.result.value;
  const lightShot = await screenshot(ws, 'HOME-001-dashboard-smoke-2026-07-20-light.png');

  smokeResult.screenshots = { dark: darkShot, light: lightShot };
  smokeResult.light = lightSmoke;
  smokeResult.ok = Boolean(smokeResult.ok && lightSmoke.ok);
  smokeResult.failures = [...(smokeResult.failures || []), ...(lightSmoke.failures || [])];
  return smokeResult;
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
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'home-001-smoke-'));
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
