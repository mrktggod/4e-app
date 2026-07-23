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
  try { await fs.access(file); return true; } catch { return false; }
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
        if (res.ok) { clearTimeout(timeout); resolve(); return; }
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
  await send(ws, 'Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
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
    const assert = (condition, message) => { if (!condition) failures.push(message); };
    const intersects = (a, b) => a && b && a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

    chatId = 'smoke-chat';
    const smokeTask = {
      id: 'task-hero-smoke',
      text: 'Очень длинный заголовок задачи который раньше пересекался с карточками срока и приоритета на экране iPhone',
      originalMsg: 'Описание тоже длинное: нужно убедиться что текст не прячется fixed-height координатами и не залезает под правые карточки.',
      tags: ['очень-длинный-тег-который-раньше-складывался-вертикально-по-буквам'],
      priority: 'urgent',
      person: 'Алексей',
      deadline: '2026-07-23T12:00'
    };
    allTasksCache = [smokeTask];
    openTask(smokeTask, 0);
    await wait(160);

    const hero = document.querySelector('#task-detail .detail-redesign-hero');
    const title = document.getElementById('detail-title');
    const desc = document.getElementById('detail-description');
    const tag = document.querySelector('#detail-tags-wrap .tag-chip');
    const infoCards = Array.from(document.querySelectorAll('#task-detail .detail-info-card'));
    const nextSection = document.querySelector('#task-detail .detail-redesign-status-grid');

    const heroRect = hero?.getBoundingClientRect();
    const titleRect = title?.getBoundingClientRect();
    const descRect = desc?.getBoundingClientRect();
    const tagRect = tag?.getBoundingClientRect();
    const nextRect = nextSection?.getBoundingClientRect();
    const tagStyle = tag ? getComputedStyle(tag) : null;
    const titleStyle = title ? getComputedStyle(title) : null;

    assert(document.documentElement.scrollWidth <= window.innerWidth, 'document should not have horizontal overflow');
    assert(Boolean(hero && title && desc && tag), 'hero fixture elements should render');
    assert(heroRect.height >= 320 && heroRect.height < 430, 'hero height should grow but stay bounded');
    assert(tagRect.height <= 32, 'long tag should stay one compact line');
    assert(tagStyle?.whiteSpace === 'nowrap', 'long tag should use nowrap ellipsis');
    assert(titleStyle?.position === 'static', 'title should be in normal flow');
    for (const card of infoCards) {
      const cardRect = card.getBoundingClientRect();
      assert(!intersects(titleRect, cardRect), 'title should not overlap info cards');
      assert(!intersects(descRect, cardRect), 'description should not overlap info cards');
    }
    assert(nextRect.top >= heroRect.bottom - 1, 'content below hero should not be covered');

    return {
      ok: failures.length === 0,
      failures,
      viewport: { width: window.innerWidth, height: window.innerHeight },
      hero: { height: Math.round(heroRect.height), bottom: Math.round(heroRect.bottom) },
      tag: { width: Math.round(tagRect.width), height: Math.round(tagRect.height), whiteSpace: tagStyle?.whiteSpace },
      title: { position: titleStyle?.position, height: Math.round(titleRect.height) }
    };
  }})()`;
  const result = await send(ws, 'Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  const value = result.result?.value;
  if (!value?.ok) throw new Error(`BACK-069 hero smoke failed: ${(value?.failures || []).join('; ')}`);
  return value;
}

const chromePort = await getFreePort();
const chromePath = await findChrome();
const userDataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'back-069-chrome-'));
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
  const result = await runSmoke(ws, pathToFileURL(path.join(root, 'index.html')).href);
  ws.close();
  console.log(JSON.stringify({ smoke: 'back069-hero-overflow', ...result }, null, 2));
} finally {
  chrome.kill();
  await new Promise(resolve => setTimeout(resolve, 250));
  try {
    await fs.rm(userDataDir, { recursive: true, force: true });
  } catch (error) {
    if (error?.code !== 'EBUSY') throw error;
  }
}
