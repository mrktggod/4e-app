import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const chromeCandidates = [
  process.env.CHROME_PATH,
  process.env.BROWSER_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
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
        window.__taskMutationPayloads = [];
        window.fetch = async (url, options = {}) => {
          const headers = options.headers || {};
          const action = headers['x-action'] || headers.get?.('x-action') || '';
          if (action === 'update-task') {
            try {
              window.__taskMutationPayloads.push(JSON.parse(options.body || '{}'));
            } catch {
              window.__taskMutationPayloads.push({ parseError: true });
            }
          }
          return new Response(JSON.stringify({ ok: true }), {
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
      if (document.getElementById('task-detail')) break;
      await wait(50);
    }

    const failures = [];
    const assert = (condition, message) => {
      if (!condition) failures.push(message);
    };

    chatId = 'smoke-chat';
    const smokeTask = {
      id: 'task-tag-smoke',
      text: 'Проверить редактор тегов',
      tags: [],
      person: 'Алексей',
      deadline: '2026-07-23T12:00'
    };
    allTasksCache = [
      smokeTask,
      { id: 'source-tags', text: 'Источник тегов', tags: ['Дом', 'Работа', 'Длинный-тег-для-проверки'] }
    ];
    openTask(smokeTask, 0);
    await wait(120);

    const toggle = document.getElementById('detail-tag-toggle-btn');
    const wrap = document.getElementById('detail-tag-input-wrap');
    const input = document.getElementById('detail-tag-input');
    const addButton = document.getElementById('detail-tag-add-btn');
    const cancelButton = document.getElementById('detail-tag-cancel-btn');
    const options = document.getElementById('detail-tag-options');

    assert(Boolean(toggle), 'tag toggle is missing');
    assert(Boolean(wrap), 'tag editor wrap is missing');
    assert(Boolean(input), 'tag input is missing');
    assert(Boolean(addButton), 'tag add button is missing');
    assert(Boolean(cancelButton), 'tag cancel button is missing');
    assert(options?.tagName === 'DIV', 'tag options should be an app-owned DIV');
    assert(!input?.hasAttribute('list'), 'tag input must not use native datalist');
    assert(!document.querySelector('#detail-tag-input-wrap datalist'), 'tag editor must not contain native datalist');

    toggle?.click();
    await wait(120);
    assert(getComputedStyle(wrap).display !== 'none', 'tag editor should open');
    const openRect = wrap.getBoundingClientRect();
    const addRect = addButton.getBoundingClientRect();
    const cancelRect = cancelButton.getBoundingClientRect();
    assert(openRect.left >= 0 && openRect.right <= window.innerWidth, 'tag editor should fit viewport width');
    assert(addRect.width > 0 && addRect.right <= window.innerWidth, 'add button should be visible');
    assert(cancelRect.width > 0 && cancelRect.right <= window.innerWidth, 'cancel button should be visible');
    assert(openRect.height <= 230, 'tag editor should stay compact');

    input.value = 'До';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await wait(80);
    const suggestion = options.querySelector('[data-tag="Дом"]');
    assert(Boolean(suggestion), 'filtered tag suggestion should render');
    suggestion?.click();
    await wait(140);
    assert(currentDetailTags.includes('Дом'), 'clicking suggestion should add tag');
    assert(getComputedStyle(wrap).display === 'none', 'tag editor should close after suggestion add');

    toggle?.click();
    await wait(80);
    document.getElementById('detail-title')?.click();
    await wait(80);
    assert(getComputedStyle(wrap).display === 'none', 'outside click should close tag editor');

    toggle?.click();
    await wait(80);
    input?.focus();
    input?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    await wait(80);
    assert(getComputedStyle(wrap).display === 'none', 'Escape should close tag editor');
    assert(document.activeElement === toggle, 'Escape should restore focus to tag toggle');

    const dateCard = document.querySelector('.detail-info-card--date');
    const datePopover = document.getElementById('detail-date-popover');
    const deadlineInput = document.getElementById('detail-time-input');
    const confirmDeadline = document.querySelector('[data-detail-deadline-action="confirm"]');
    const cancelDeadline = document.querySelector('[data-detail-deadline-action="cancel"]');

    assert(Boolean(dateCard), 'date card trigger is missing');
    assert(Boolean(datePopover), 'date popover is missing');
    assert(Boolean(deadlineInput), 'datetime input is missing');
    assert(Boolean(confirmDeadline), 'date confirm button is missing');
    assert(Boolean(cancelDeadline), 'date cancel button is missing');

    window.__taskMutationPayloads = [];
    dateCard?.click();
    await wait(80);
    assert(document.querySelector('#task-detail .detail-info-stack')?.classList.contains('detail-date-popover-open'), 'date popover should open');
    const dateOpenRect = datePopover.getBoundingClientRect();
    const dateInputRect = deadlineInput.getBoundingClientRect();
    const dateConfirmRect = confirmDeadline.getBoundingClientRect();
    const dateCancelRect = cancelDeadline.getBoundingClientRect();
    assert(document.documentElement.scrollWidth <= window.innerWidth, 'document should not overflow horizontally with date popover open');
    assert(dateOpenRect.left >= 0, 'date popover should not clip past left viewport edge');
    assert(dateOpenRect.right <= window.innerWidth, 'date popover should not overflow past right viewport edge');
    assert(dateInputRect.width >= 120 && dateInputRect.height >= 38, 'datetime input should remain tappable');
    assert(dateConfirmRect.width >= 44 && dateConfirmRect.height >= 32, 'date confirm button should remain tappable');
    assert(dateCancelRect.width >= 44 && dateCancelRect.height >= 32, 'date cancel button should remain tappable');
    const originalDeadline = currentDetailTime;
    const draftDeadline = '2026-07-24T15:45';
    deadlineInput.value = draftDeadline;
    deadlineInput.dispatchEvent(new Event('input', { bubbles: true }));
    deadlineInput.dispatchEvent(new Event('change', { bubbles: true }));
    await wait(120);
    assert(document.querySelector('#task-detail .detail-info-stack')?.classList.contains('detail-date-popover-open'), 'date popover should stay open while changing time');
    assert(currentDetailTime === originalDeadline, 'datetime change should not apply before confirm');
    assert(window.__taskMutationPayloads.length === 0, 'datetime change should not save before confirm');

    cancelDeadline?.click();
    await wait(120);
    assert(!document.querySelector('#task-detail .detail-info-stack')?.classList.contains('detail-date-popover-open'), 'date cancel should close popover');
    assert(currentDetailTime === originalDeadline, 'date cancel should preserve original deadline');
    assert(deadlineInput.value === originalDeadline, 'date cancel should restore input value');
    assert(window.__taskMutationPayloads.length === 0, 'date cancel should not save');

    dateCard?.click();
    await wait(80);
    deadlineInput.value = '2026-07-25T09:30';
    deadlineInput.dispatchEvent(new Event('change', { bubbles: true }));
    document.getElementById('detail-title')?.click();
    await wait(120);
    assert(!document.querySelector('#task-detail .detail-info-stack')?.classList.contains('detail-date-popover-open'), 'outside click should close date popover');
    assert(currentDetailTime === originalDeadline, 'outside close should not apply draft deadline');
    assert(deadlineInput.value === originalDeadline, 'outside close should restore input value');
    assert(window.__taskMutationPayloads.length === 0, 'outside close should not save draft deadline');

    dateCard?.click();
    await wait(80);
    const confirmedDeadline = '2026-07-26T18:15';
    deadlineInput.value = confirmedDeadline;
    deadlineInput.dispatchEvent(new Event('change', { bubbles: true }));
    await wait(60);
    confirmDeadline?.click();
    await wait(220);
    const lastMutation = window.__taskMutationPayloads[window.__taskMutationPayloads.length - 1];
    assert(currentDetailTime === confirmedDeadline, 'date confirm should apply selected deadline');
    assert(!document.querySelector('#task-detail .detail-info-stack')?.classList.contains('detail-date-popover-open'), 'date confirm should close popover');
    assert(window.__taskMutationPayloads.length === 1, 'date confirm should save exactly once');
    assert(lastMutation?.updates?.deadline === confirmedDeadline, 'date confirm should save selected deadline');

    return {
      ok: failures.length === 0,
      failures,
      viewport: { width: window.innerWidth, height: window.innerHeight },
      openRect: { left: openRect.left, right: openRect.right, height: openRect.height },
      dateRect: { left: dateOpenRect.left, right: dateOpenRect.right, width: dateOpenRect.width },
      tags: [...currentDetailTags],
      deadline: currentDetailTime,
      mutationCount: window.__taskMutationPayloads.length
    };
  }})()`;
  const result = await send(ws, 'Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true
  });
  const value = result.result?.value;
  if (!value?.ok) {
    throw new Error(`BACK-068 tag popup smoke failed: ${(value?.failures || []).join('; ')}`);
  }
  return value;
}

const chromePort = await getFreePort();
const chromePath = await findChrome();
const userDataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'back-068-chrome-'));
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
  const appUrl = pathToFileURL(path.join(root, 'index.html')).href;
  const result = await runSmoke(ws, appUrl);
  ws.close();
  console.log(JSON.stringify({ smoke: 'back068-tag-popup', ...result }, null, 2));
} finally {
  chrome.kill();
  await new Promise(resolve => setTimeout(resolve, 250));
  try {
    await fs.rm(userDataDir, { recursive: true, force: true });
  } catch (error) {
    if (error?.code !== 'EBUSY') throw error;
  }
}
