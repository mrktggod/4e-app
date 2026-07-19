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

async function writeHarness() {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'back-055-smoke-'));
  const htmlPath = path.join(tempDir, 'index.html');
  const stylesHref = pathToFileURL(path.join(root, 'styles.css')).href;
  const rendererSrc = pathToFileURL(path.join(root, 'scripts', 'task-ui-renderers.js')).href;
  const html = `<!doctype html>
<html data-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>BACK-055 notifications smoke</title>
  <link rel="stylesheet" href="${stylesHref}">
  <style>
    body { width: 390px; min-height: 844px; overflow: auto; }
    #app { width: 390px; min-height: 844px; height: auto; overflow: visible; }
    .screen { display: none; height: auto; min-height: 844px; overflow: visible; }
    .screen.active { display: flex; flex-direction: column; }
    .notif-scroll { height: 760px; overflow-y: auto; padding: 12px 14px 96px; }
    .notif-filters { display: flex; gap: 6px; padding: 12px 14px 0; }
  </style>
</head>
<body>
  <div id="app">
    <main id="notifications" class="screen active">
      <div class="notif-filters">
        <button class="notif-filter active" data-filter="all">All</button>
        <button class="notif-filter" data-filter="deadline">Deadline</button>
      </div>
      <div id="notif-unread-count"></div>
      <div id="bell-dot"></div>
      <section class="notif-scroll">
        <div id="notif-list"></div>
      </section>
    </main>
  </div>
  <script>
    const WORKER = 'http://127.0.0.1/smoke';
    const ONBOARD_K = 'onboarded';
    let chatId = 'smoke-chat';
    let allTasksCache = [];
    let notifReadSet = new Set();
    window.__fetches = [];
    window.__toasts = [];
    window.__doneTaskIds = [];
    window.__openedWrites = [];
    function e2(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/'/g, '&#39;').replace(/"/g, '&quot;'); }
    function getToken() { return 'smoke-token'; }
    function authHeaders() { return { authorization: 'Bearer smoke-token' }; }
    function showToast(message) { window.__toasts.push(String(message)); }
    function updateBellDot() {}
    function recordAdaptiveActivity() {}
    function setNavActive() {}
    function loadNotifications() {}
    function loadTasks() {}
    function showScreen(id) { window.__lastScreen = id; }
    function startOfLocalDay(date) { return new Date(date.getFullYear(), date.getMonth(), date.getDate()); }
    function parseTaskDate(value) { const d = new Date(value); return Number.isNaN(d.getTime()) ? null : startOfLocalDay(d); }
    function formatTaskCardDeadline(task) {
      const d = parseTaskDate(task?.deadline || task?.date);
      if (!d) return { text: 'no date', cls: 'deadline-muted', overdue: false };
      const diff = Math.round((d - startOfLocalDay(new Date())) / 86400000);
      return { text: diff < 0 ? 'overdue' : (diff === 0 ? 'today' : 'future'), cls: diff < 0 ? 'deadline-overdue' : 'deadline-date', overdue: diff < 0 };
    }
    function formatTaskDateMeta(task) { return task?.deadline ? 'deadline ' + task.deadline : ''; }
    function getTaskContactMeta(source) {
      return {
        person: source?.person || source?.assigneeName || source?.assignee || '',
        username: source?.assigneeUsername || source?.username || '',
        tgId: source?.assigneeTgId || source?.telegramId || source?.tgId || '',
        url: source?.assigneeUsername || source?.username ? 'https://t.me/' + (source.assigneeUsername || source.username) : ''
      };
    }
    async function markDoneKV(el, taskId) { window.__doneTaskIds.push(String(taskId)); showToast('done'); }
    function openTaskById(taskId, index) { window.__openedTaskId = String(taskId); window.__openedTaskIndex = index; }
    function openWrite(person, initials, intent, draft) { window.__openedWrites.push({ person, initials, intent, draft }); }
    window.fetch = async function(url, options) {
      window.__fetches.push({ url: String(url), action: options?.headers?.['x-action'] || '', body: options?.body || '' });
      return { ok: true, json: async () => ({ ok: true }) };
    };
  </script>
  <script src="${rendererSrc}"></script>
  <script>
    markDoneKV = async function(el, taskId) { window.__doneTaskIds.push(String(taskId)); showToast('done'); };
    const now = Date.now();
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    const tomorrow = new Date(Date.now() + 86400000).toISOString();
    allTasksCache = [
      { id: 'deadline-task', text: 'Send beta status report', deadline: yesterday, person: 'Alex' },
      { id: 'reminder-task', text: 'Call tester', deadline: tomorrow, person: 'Maria' },
      { id: 'waiting-task', text: 'Review copy', deadline: tomorrow, person: 'Yuri', assigneeUsername: 'yuri_test' }
    ];
    notifCache = [
      { id: 'n-deadline', type: 'deadline', taskId: 'deadline-task', unread: true, ts: now, title: 'Deadline risk', detail: 'Send beta status report' },
      { id: 'n-reminder', type: 'reminder', task_id: 'reminder-task', unread: true, ts: now - 60000, title: 'Reminder fired', detail: 'Call tester' },
      { id: 'n-waiting', type: 'waiting', relatedTaskId: 'waiting-task', unread: true, ts: now - 120000, title: 'Waiting for answer', detail: 'Yuri needs a nudge', assigneeUsername: 'yuri_test' },
      { id: 'n-system', type: 'system', unread: false, ts: now - 180000, title: 'System note', detail: 'Everything is stable' }
    ];
    renderNotifs(notifCache);
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
    const cards = Array.from(document.querySelectorAll('.notif-card'));
    metrics.cardCount = cards.length;
    metrics.documentScrollWidth = document.documentElement.scrollWidth;
    metrics.viewportWidth = window.innerWidth;
    if (cards.length !== 4) failures.push('expected four notification cards');
    if (document.documentElement.scrollWidth > window.innerWidth) failures.push('notifications screen has horizontal overflow');

    const unreadBadge = document.getElementById('notif-unread-count');
    metrics.initialUnreadBadge = unreadBadge?.textContent || '';
    if (!/3/.test(metrics.initialUnreadBadge)) failures.push('unread badge did not count three unread notifications');

    toggleNotif('n-deadline');
    await wait(30);
    const deadlineDetail = document.getElementById('ndet-n-deadline');
    if (!deadlineDetail?.classList.contains('open')) failures.push('deadline notification did not expand');
    const deadlineActions = Array.from(deadlineDetail.querySelectorAll('.notif-actions > button')).map(btn => btn.textContent.trim());
    metrics.deadlineActions = deadlineActions;
    if (deadlineActions.length !== 3) failures.push('deadline notification should expose exactly three top-level actions');
    if (!deadlineDetail.querySelector('.notif-act-task[data-task-id="deadline-task"]')) failures.push('deadline notification is missing task action with task id');
    if (!deadlineDetail.querySelector('.notif-act-del')) failures.push('deadline notification is missing snooze action');
    if (!deadlineDetail.querySelector('.notif-act-read[data-task-id="deadline-task"]')) failures.push('deadline notification is missing done action');

    deadlineDetail.querySelector('.notif-act-del')?.click();
    await wait(30);
    const snoozeMenu = document.getElementById('nsnooze-n-deadline');
    metrics.snoozeDisplay = snoozeMenu?.style.display || '';
    metrics.snoozeOptionCount = snoozeMenu?.querySelectorAll('button').length || 0;
    if (metrics.snoozeDisplay !== 'grid') failures.push('snooze menu did not open as grid');
    if (metrics.snoozeOptionCount !== 4) failures.push('snooze menu should show four options');
    snoozeMenu?.querySelector('[data-snooze-kind="1h"]')?.click();
    await wait(50);
    const snoozeFetch = window.__fetches.find(item => item.action === 'update-task');
    if (!snoozeFetch || !String(snoozeFetch.body).includes('deadline-task')) failures.push('snooze did not update the linked task');

    renderNotifs(notifCache);
    toggleNotif('n-deadline');
    await wait(30);
    document.querySelector('#ndet-n-deadline .notif-act-task')?.click();
    await wait(30);
    if (window.__openedTaskId !== 'deadline-task' || window.__openedTaskIndex !== 0) failures.push('go-to-task did not open the linked task');

    toggleNotif('n-reminder');
    await wait(30);
    document.querySelector('#ndet-n-reminder .notif-act-read[data-task-id="reminder-task"]')?.click();
    await wait(30);
    if (!window.__doneTaskIds.includes('reminder-task')) failures.push('reminder done action did not call markDoneKV with task id');

    toggleNotif('n-waiting');
    await wait(30);
    const waitingActions = Array.from(document.querySelectorAll('#ndet-n-waiting button')).map(btn => btn.textContent.trim());
    metrics.waitingActions = waitingActions;
    document.querySelector('#ndet-n-waiting .notif-act-task')?.click();
    await wait(30);
    if (!window.__openedWrites.length) failures.push('waiting notification did not open write flow');

    filterNotifs('deadline');
    await wait(30);
    metrics.deadlineFilteredCount = document.querySelectorAll('.notif-card').length;
    if (metrics.deadlineFilteredCount !== 1) failures.push('deadline filter should show one notification');
    filterNotifs('system');
    await wait(30);
    metrics.systemFilteredCount = document.querySelectorAll('.notif-card').length;
    if (metrics.systemFilteredCount !== 1) failures.push('system filter should show one notification');
    filterNotifs('task');
    await wait(30);
    metrics.taskEmptyText = document.getElementById('notif-list')?.textContent || '';
    if (!metrics.taskEmptyText.trim()) failures.push('empty notification state did not render text');

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
  if (!result.result || !('value' in result.result)) {
    throw new Error(`Smoke returned no value: ${JSON.stringify(result)}`);
  }
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
