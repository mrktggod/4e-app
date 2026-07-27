import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const evidenceDir = path.join(root, 'docs', 'tasks', 'assets');
const screenshotPaths = {
  light: path.join(evidenceDir, 'BACK-019-task-card-glass-2026-07-27-light.png'),
  dark: path.join(evidenceDir, 'BACK-019-task-card-glass-2026-07-27-dark.png')
};
const chromeCandidates = [
  process.env.CHROME_PATH,
  process.env.BROWSER_PATH,
  process.env.ProgramFiles && path.join(process.env.ProgramFiles, 'Google', 'Chrome', 'Application', 'chrome.exe'),
  process.env['ProgramFiles(x86)'] && path.join(process.env['ProgramFiles(x86)'], 'Google', 'Chrome', 'Application', 'chrome.exe'),
  process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'Application', 'chrome.exe'),
  process.env.ProgramFiles && path.join(process.env.ProgramFiles, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
  process.env['ProgramFiles(x86)'] && path.join(process.env['ProgramFiles(x86)'], 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
  process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
  'chrome',
  'google-chrome',
  'chromium',
  'chromium-browser',
  'msedge'
].filter(Boolean);

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

async function resolveFromPath(command) {
  const paths = String(process.env.PATH || '').split(path.delimiter).filter(Boolean);
  const extensions = process.platform === 'win32'
    ? String(process.env.PATHEXT || '.EXE;.CMD;.BAT;.COM').split(';')
    : [''];
  for (const dir of paths) {
    for (const ext of extensions) {
      const candidate = path.join(dir, command + ext.toLowerCase());
      if (await exists(candidate)) return candidate;
      const upperCandidate = path.join(dir, command + ext.toUpperCase());
      if (await exists(upperCandidate)) return upperCandidate;
    }
  }
  return null;
}

async function findChrome() {
  for (const candidate of chromeCandidates) {
    const isPathLike = candidate.includes('/') || candidate.includes('\\');
    if (isPathLike && await exists(candidate)) return candidate;
    if (!isPathLike) {
      const resolved = await resolveFromPath(candidate);
      if (resolved) return resolved;
    }
  }
  throw new Error('Chrome or Edge executable was not found in PATH');
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

function extractFunction(source, name) {
  const starts = [`async function ${name}`, `function ${name}`];
  const start = starts.map((needle) => source.indexOf(needle)).find((index) => index >= 0);
  if (start === undefined) throw new Error(`${name} function was not found`);
  const braceStart = source.indexOf('{', start);
  if (braceStart <= start) throw new Error(`${name} function body was not found`);
  let depth = 0;
  for (let i = braceStart; i < source.length; i += 1) {
    if (source[i] === '{') depth += 1;
    if (source[i] === '}') depth -= 1;
    if (depth === 0) return source.slice(start, i + 1);
  }
  throw new Error(`${name} function body was not closed`);
}

async function writeHarness() {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'back-019-smoke-'));
  const htmlPath = path.join(tempDir, 'index.html');
  const stylesHref = pathToFileURL(path.join(root, 'styles.css')).href;
  const rendererSrc = pathToFileURL(path.join(root, 'scripts', 'task-ui-renderers.js')).href;
  const appHtml = await fs.readFile(path.join(root, 'index.html'), 'utf8');
  const quickDoneSource = extractFunction(appHtml, 'quickDoneTask');
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
    <main id="task-detail" class="screen">
      <button type="button" class="detail-redesign-bell" onclick="window.__reminderPopoverOpened = true"></button>
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
    function openTaskById(taskId) {
      window.__openedTaskId = String(taskId);
      document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
      document.getElementById('task-detail')?.classList.add('active');
    }
    function openTaskMove(taskId) { window.__movedTaskId = String(taskId); }
    async function readJsonSafe(response) { try { return await response.json(); } catch { return {}; } }
    function createWorkerActionError(response, data, fallback) {
      const error = new Error(data?.error || fallback);
      error.status = response?.status || 0;
      error.data = data || {};
      return error;
    }
    function handlePremiumRequiredTaskActionError() { return false; }
    window.__doneMode = 'success';
    window.__doneFetches = [];
    window.__markDoneMode = 'success';
    window.__markDoneCalls = [];
    window.fetch = async function(url, options = {}) {
      window.__doneFetches.push({ url: String(url), taskId: JSON.parse(options.body || '{}').taskId || '' });
      await new Promise(resolve => setTimeout(resolve, 80));
      if (window.__doneMode === 'failure') {
        return new Response(JSON.stringify({ ok: false, error: 'Не удалось завершить задачу' }), { status: 500, headers: { 'content-type': 'application/json' } });
      }
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } });
    };
    async function postTaskChatMutation(actionName, payload) {
      window.__markDoneCalls.push({ actionName, taskId: payload?.taskId || '' });
      await new Promise(resolve => setTimeout(resolve, 80));
      if (window.__markDoneMode === 'failure') throw new Error('Не удалось завершить задачу');
      return { ok: true };
    }
    ${quickDoneSource}
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

async function saveScreenshot(ws, filePath) {
  const shot = await send(ws, 'Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: false
  });
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, Buffer.from(shot.data, 'base64'));
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
  await send(ws, 'Runtime.evaluate', {
    expression: `(${async function waitForHarness() {
      const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
      for (let i = 0; i < 50 && !window.__harnessReady; i += 1) await wait(100);
      return Boolean(window.__harnessReady);
    }})()`,
    awaitPromise: true,
    returnByValue: true
  });
  await saveScreenshot(ws, screenshotPaths.light);
  await send(ws, 'Runtime.evaluate', {
    expression: `document.documentElement.setAttribute('data-theme','dark'); document.body.classList.remove('soft-light'); true;`,
    returnByValue: true
  });
  await new Promise(resolve => setTimeout(resolve, 80));
  await saveScreenshot(ws, screenshotPaths.dark);
  await send(ws, 'Runtime.evaluate', {
    expression: `document.documentElement.setAttribute('data-theme','light'); true;`,
    returnByValue: true
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
    const firstShellStyle = first ? getComputedStyle(first) : null;
    metrics.firstCardBackground = firstShellStyle?.backgroundColor || '';
    metrics.firstCardBorderRadius = firstShellStyle?.borderRadius || '';
    metrics.firstCardBoxShadow = firstShellStyle?.boxShadow || '';
    metrics.firstCardBackdropFilter = firstShellStyle?.backdropFilter || firstShellStyle?.webkitBackdropFilter || '';
    if (!firstShellStyle?.boxShadow || firstShellStyle.boxShadow === 'none') failures.push('task card does not expose glass shadow');
    if (!firstShellStyle?.borderRadius || parseFloat(firstShellStyle.borderRadius) < 24) failures.push('task card does not use shared glass radius');
    const title = first?.querySelector('.task-card-title');
    const titleStyle = title ? getComputedStyle(title) : null;
    const lineHeight = titleStyle ? parseFloat(titleStyle.lineHeight) : 0;
    metrics.longTitleHeight = title ? Math.round(title.getBoundingClientRect().height * 100) / 100 : 0;
    metrics.longTitleMaxTwoLines = lineHeight ? Math.round(lineHeight * 2 * 100) / 100 : 0;
    metrics.longTitleLineClamp = titleStyle?.webkitLineClamp || '';
    if (!title || metrics.longTitleHeight > (lineHeight * 2 + 2)) failures.push('long title is not clamped to two lines');
    const reminderButton = first?.querySelector('.task-card-reminder-btn');
    const reminderRect = reminderButton?.getBoundingClientRect();
    metrics.reminderButton = reminderRect ? {
      width: Math.round(reminderRect.width * 100) / 100,
      height: Math.round(reminderRect.height * 100) / 100
    } : null;
    if (!reminderButton) failures.push('task card reminder button is missing');
    if (reminderRect && (reminderRect.width < 34 || reminderRect.height < 34)) failures.push('task card reminder button is not tappable');
    reminderButton?.click();
    await wait(180);
    if (window.__openedTaskId !== 'long-title') failures.push('task card reminder button did not open the expected task');
    if (window.__reminderPopoverOpened !== true) failures.push('task card reminder button did not open reminder settings');
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    document.getElementById('tasks')?.classList.add('active');

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
    const doneButton = second.querySelector('.task-swipe-done');
    doneButton?.click();
    doneButton?.click();
    await wait(140);
    metrics.doneFetchCount = window.__doneFetches.length;
    metrics.doneButtonText = doneButton?.textContent || '';
    metrics.doneButtonBusy = doneButton?.getAttribute('aria-busy') || '';
    if (window.__doneFetches.length !== 1) failures.push('done action should ignore duplicate fast taps');
    if (window.__doneFetches[0]?.taskId !== 'overdue') failures.push('done action did not use the swiped task id');
    if (doneButton?.textContent !== 'Готово') failures.push('done action should leave visible success text in the control');
    if (!doneButton?.disabled) failures.push('done action should keep successful control disabled until reload');
    if (doneButton?.getAttribute('aria-busy')) failures.push('done action should clear busy state after success');

    const failureShell = document.createElement('div');
    failureShell.className = 'task-card-shell';
    failureShell.innerHTML = '<div class="task-row"><button type="button" class="task-swipe-btn task-swipe-done">Завершить</button></div>';
    document.body.appendChild(failureShell);
    const failureButton = failureShell.querySelector('button');
    window.__doneMode = 'failure';
    const failureStartCount = window.__doneFetches.length;
    quickDoneTask('failure-task', failureButton);
    quickDoneTask('failure-task', failureButton);
    await wait(140);
    metrics.doneFailureFetchCount = window.__doneFetches.length - failureStartCount;
    metrics.doneFailureText = failureButton?.textContent || '';
    metrics.doneFailureToast = window.__lastToast || '';
    if (metrics.doneFailureFetchCount !== 1) failures.push('failure path should ignore duplicate fast taps');
    if (failureButton?.disabled) failures.push('failure path should re-enable done control');
    if (failureButton?.textContent !== 'Завершить') failures.push('failure path should restore done control label');
    if (failureShell.style.pointerEvents === 'none' || failureShell.style.opacity) failures.push('failure path should restore card interactivity');
    if (!String(window.__lastToast || '').includes('Не удалось завершить')) failures.push('failure path should show clear completion error toast');
    window.__doneMode = 'success';

    const markRow = document.createElement('div');
    markRow.className = 'task-row';
    markRow.innerHTML = '<button type="button" id="mark-done-btn">Готово</button>';
    document.body.appendChild(markRow);
    const markButton = markRow.querySelector('button');
    markDoneKV(markButton, 'mark-success');
    markDoneKV(markButton, 'mark-success');
    await wait(140);
    metrics.markDoneCallCount = window.__markDoneCalls.length;
    if (window.__markDoneCalls.length !== 1) failures.push('markDoneKV should ignore duplicate fast taps');
    if (window.__markDoneCalls[0]?.taskId !== 'mark-success') failures.push('markDoneKV did not use the expected task id');
    if (markButton?.textContent !== 'Готово') failures.push('markDoneKV success should be visible inside the control');
    if (!markButton?.disabled) failures.push('markDoneKV success should keep control disabled until reload');

    const markFailRow = document.createElement('div');
    markFailRow.className = 'task-row';
    markFailRow.innerHTML = '<button type="button" id="mark-fail-btn">Готово</button>';
    document.body.appendChild(markFailRow);
    const markFailButton = markFailRow.querySelector('button');
    window.__markDoneMode = 'failure';
    const markFailureStartCount = window.__markDoneCalls.length;
    markDoneKV(markFailButton, 'mark-failure');
    markDoneKV(markFailButton, 'mark-failure');
    await wait(140);
    metrics.markDoneFailureCallCount = window.__markDoneCalls.length - markFailureStartCount;
    if (metrics.markDoneFailureCallCount !== 1) failures.push('markDoneKV failure should ignore duplicate fast taps');
    if (markFailButton?.disabled) failures.push('markDoneKV failure should re-enable control');
    if (!String(window.__lastToast || '').includes('Не удалось завершить')) failures.push('markDoneKV failure should show clear error toast');

    const thirdCard = cards[2].querySelector('.task-card');
    thirdCard.click();
    await wait(30);
    if (window.__openedTaskId !== 'plain') failures.push('tap did not open the expected task');

    metrics.swipeLeftTransform = firstCard.style.transform;
    metrics.swipeRightTransform = secondCard.style.transform;
    metrics.screenshots = {
      light: 'docs/tasks/assets/BACK-019-task-card-glass-2026-07-27-light.png',
      dark: 'docs/tasks/assets/BACK-019-task-card-glass-2026-07-27-dark.png'
    };
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
