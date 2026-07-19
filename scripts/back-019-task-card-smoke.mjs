import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

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

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function writeHarness() {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'back-019-smoke-'));
  const htmlPath = path.join(tempDir, 'index.html');
  const stylesHref = pathToFileURL(path.join(root, 'styles.css')).href;
  const rendererSrc = pathToFileURL(path.join(root, 'scripts', 'task-ui-renderers.js')).href;
  const html = `<!doctype html>
<html data-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>BACK-019 task card smoke</title>
  <link rel="stylesheet" href="${stylesHref}">
  <style>
    body { width: 390px; min-height: 844px; overflow: auto; }
    #app { width: 390px; min-height: 844px; height: auto; overflow: visible; }
    .screen { display: flex; height: auto; min-height: 844px; overflow: visible; }
    .scroll-body { height: 844px; overflow-y: auto; padding: 16px 14px var(--app-bottom-nav-reserve); }
    .bottom-nav { display: flex; }
  </style>
</head>
<body>
  <div id="app">
    <main id="tasks" class="screen active">
      <section class="scroll-body">
        <div class="tasks-wrap" id="task-list"></div>
      </section>
    </main>
    <nav id="global-nav" class="bottom-nav"><div class="nav-item active"></div></nav>
  </div>
  <script>
    const WORKER = 'http://127.0.0.1/smoke';
    let chatId = 'smoke';
    let allTasksCache = [];
    let taskSwipeState = null;
    window.Telegram = { WebApp: { HapticFeedback: { impactOccurred() {} } } };
    function startOfLocalDay(date) { return new Date(date.getFullYear(), date.getMonth(), date.getDate()); }
    function pluralTaskDays(n) { n = Math.abs(n); if (n % 10 === 1 && n % 100 !== 11) return 'day'; if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return 'days'; return 'days'; }
    function parseTaskDate(value) {
      if (!value) return null;
      if (value instanceof Date && !Number.isNaN(value.getTime())) return startOfLocalDay(value);
      const parsed = new Date(String(value));
      return Number.isNaN(parsed.getTime()) ? null : startOfLocalDay(parsed);
    }
    function formatTaskShortDate(date) { return date.getDate() + ' ' + ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][date.getMonth()]; }
    function getTaskDeadlineValue(t) { return (t && (t.deadline || t.date)) || ''; }
    function formatTaskCardDeadline(t) {
      const value = getTaskDeadlineValue(t);
      if (!value) return { text: 'no date', cls: 'deadline-muted', overdue: false };
      const date = parseTaskDate(value);
      if (!date) return { text: String(value), cls: 'deadline-muted', overdue: false };
      const today = startOfLocalDay(new Date());
      const diff = Math.round((date - today) / 86400000);
      if (diff === 0) return { text: 'today', cls: 'deadline-today', overdue: false };
      if (diff === 1) return { text: 'tomorrow', cls: 'deadline-soon', overdue: false };
      if (diff < 0) return { text: 'overdue ' + Math.abs(diff) + 'd', cls: 'deadline-overdue', overdue: true };
      return { text: formatTaskShortDate(date), cls: 'deadline-date', overdue: false };
    }
    function e2(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/'/g, '&#39;').replace(/"/g, '&quot;'); }
    function authHeaders() { return {}; }
    function showToast(message) { window.__lastToast = message; }
    function loadTasks() {}
    function openTaskById(taskId) { window.__openedTaskId = String(taskId); }
    function openTaskMove(taskId) { window.__movedTaskId = String(taskId); }
    async function quickDoneTask(taskId, btn) { window.__doneTaskId = String(taskId); if (btn) btn.disabled = true; }
  </script>
  <script src="${rendererSrc}"></script>
  <script>
    const today = new Date();
    const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    allTasksCache = [
      {
        id: 'long-title',
        priority: 'p1',
        tags: ['very-long-category-label-for-clamp'],
        person: 'Alexandria Very Long Contact Name That Should Not Push Deadline Away',
        text: 'Prepare the unusually long beta acceptance checklist item with multiple clauses and enough extra words to exceed eighty characters cleanly',
        deadline: tomorrow.toISOString()
      },
      { id: 'overdue', priority: 'p2', direction: 'incoming', text: 'Past due card stays readable', deadline: yesterday.toISOString() },
      { id: 'plain', priority: 'p3', direction: 'outgoing', text: 'Regular card for vertical rhythm', deadline: today.toISOString() },
      { id: 'bottom', priority: 'p2', tags: ['qa'], text: 'Bottom card remains above navigation reserve', deadline: tomorrow.toISOString() }
    ];
    document.getElementById('task-list').innerHTML = allTasksCache.map((task, index) => renderTaskCard(task, index)).join('');
    window.__harnessReady = true;
  </script>
</body>
</html>`;
  await fs.writeFile(htmlPath, html, 'utf8');
  return { htmlPath, tempDir };
}

function send(ws, method, params = {}) {
  const id = ++send.id;
  ws.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`CDP timeout: ${method}`)), 5000);
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

async function openPage(port, url) {
  const res = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' });
  if (!res.ok) throw new Error(`Cannot open Chrome target: HTTP ${res.status}`);
  return res.json();
}

async function runSmoke(ws) {
  await send(ws, 'Runtime.enable');
  await send(ws, 'Page.enable');
  await send(ws, 'Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true
  });
  const expression = `(${async function smoke() {
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    for (let i = 0; i < 50 && !window.__harnessReady; i += 1) await wait(100);
    const failures = [];
    const metrics = {};
    const cards = Array.from(document.querySelectorAll('.task-card-shell'));
    if (cards.length !== 4) failures.push('expected four rendered task cards');
    metrics.viewportWidth = window.innerWidth;
    metrics.documentScrollWidth = document.documentElement.scrollWidth;
    if (document.documentElement.scrollWidth > window.innerWidth) failures.push('document has horizontal overflow');

    const first = cards[0];
    const title = first?.querySelector('.task-card-title');
    const titleStyle = title ? getComputedStyle(title) : null;
    const lineHeight = titleStyle ? parseFloat(titleStyle.lineHeight) : 0;
    metrics.longTitleHeight = title ? Math.round(title.getBoundingClientRect().height * 100) / 100 : 0;
    metrics.longTitleMaxTwoLines = lineHeight ? Math.round(lineHeight * 2 * 100) / 100 : 0;
    metrics.longTitleLineClamp = titleStyle?.webkitLineClamp || '';
    if (!title || metrics.longTitleHeight > (lineHeight * 2 + 2)) failures.push('long title is not clamped to two lines');

    for (const [index, shell] of cards.entries()) {
      const rect = shell.getBoundingClientRect();
      if (rect.left < -0.5 || rect.right > window.innerWidth + 0.5) failures.push(`card ${index + 1} exceeds viewport`);
    }

    const scroller = document.querySelector('.scroll-body');
    if (scroller) scroller.scrollTop = scroller.scrollHeight;
    await wait(30);
    const lastRect = cards[cards.length - 1]?.getBoundingClientRect();
    const navRect = document.getElementById('global-nav')?.getBoundingClientRect();
    metrics.lastCardBottom = lastRect ? Math.round(lastRect.bottom * 100) / 100 : null;
    metrics.navTop = navRect ? Math.round(navRect.top * 100) / 100 : null;
    if (lastRect && navRect && lastRect.bottom > navRect.top) failures.push('bottom nav overlaps last card at initial viewport');

    function pointer(target, type, x, y) {
      target.dispatchEvent(new PointerEvent(type, {
        bubbles: true,
        cancelable: true,
        pointerId: 1,
        pointerType: 'touch',
        clientX: x,
        clientY: y
      }));
    }

    const firstCard = first.querySelector('.task-card');
    const rect = firstCard.getBoundingClientRect();
    pointer(firstCard, 'pointerdown', rect.left + 210, rect.top + 20);
    pointer(firstCard, 'pointermove', rect.left + 80, rect.top + 22);
    pointer(firstCard, 'pointerup', rect.left + 80, rect.top + 22);
    await wait(30);
    if (!first.classList.contains('swipe-left')) failures.push('left swipe did not reveal cancel/move actions');
    first.querySelector('.task-swipe-move')?.click();
    await wait(30);
    if (window.__movedTaskId !== 'long-title') failures.push('move action did not use the swiped task id');

    const second = cards[1];
    const secondCard = second.querySelector('.task-card');
    const secondRect = secondCard.getBoundingClientRect();
    pointer(secondCard, 'pointerdown', secondRect.left + 80, secondRect.top + 20);
    pointer(secondCard, 'pointermove', secondRect.left + 180, secondRect.top + 22);
    pointer(secondCard, 'pointerup', secondRect.left + 180, secondRect.top + 22);
    await wait(30);
    if (!second.classList.contains('swipe-right')) failures.push('right swipe did not reveal done action');
    second.querySelector('.task-swipe-done')?.click();
    await wait(30);
    if (window.__doneTaskId !== 'overdue') failures.push('done action did not use the swiped task id');

    const thirdCard = cards[2].querySelector('.task-card');
    thirdCard.click();
    await wait(30);
    if (window.__openedTaskId !== 'plain') failures.push('tap did not open the expected task');

    metrics.swipeLeftTransform = firstCard.style.transform;
    metrics.swipeRightTransform = secondCard.style.transform;
    return { ok: failures.length === 0, failures, metrics };
  }})()`;
  const result = await send(ws, 'Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true
  });
  return result.result.value;
}

let chrome;
let tempDir;
try {
  if (!globalThis.WebSocket) throw new Error('Node.js WebSocket client is not available');
  const chromePath = await findChrome();
  const port = await getFreePort();
  const harness = await writeHarness();
  tempDir = harness.tempDir;
    chrome = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--disable-extensions',
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=390,844',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${path.join(tempDir, 'profile')}`,
    'about:blank'
  ], { stdio: ['ignore', 'pipe', 'pipe'] });

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Chrome did not expose CDP in time')), 7000);
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

  const target = await openPage(port, pathToFileURL(harness.htmlPath).href);
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('CDP WebSocket open timeout')), 5000);
    ws.addEventListener('open', () => {
      clearTimeout(timeout);
      resolve();
    }, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });

  const result = await runSmoke(ws);
  ws.close();
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
} finally {
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
