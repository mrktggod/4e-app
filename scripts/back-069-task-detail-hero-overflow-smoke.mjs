import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const evidenceDir = path.join(root, 'docs', 'tasks', 'assets');
const evidenceFiles = {
  light: path.join(evidenceDir, 'BACK-069-task-detail-glass-2026-07-24-light.png'),
  dark: path.join(evidenceDir, 'BACK-069-task-detail-glass-2026-07-24-dark.png')
};
const chromeCandidates = [
  process.env.CHROME_PATH,
  process.env.BROWSER_PATH,
  'chrome',
  'google-chrome',
  'chromium',
  'chromium-browser',
  'msedge'
].filter(Boolean);

async function exists(file) {
  try { await fs.access(file); return true; } catch { return false; }
}

async function findChrome() {
  for (const candidate of chromeCandidates) {
    const isPathLike = candidate.includes('/') || candidate.includes('\\');
    if (!isPathLike || await exists(candidate)) return candidate;
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
    const statusGrid = document.querySelector('#task-detail .detail-redesign-status-grid');
    const nextSection = document.querySelector('#task-detail .detail-chat-card');

    const heroRect = hero?.getBoundingClientRect();
    const titleRect = title?.getBoundingClientRect();
    const descRect = desc?.getBoundingClientRect();
    const tagRect = tag?.getBoundingClientRect();
    const statusRect = statusGrid?.getBoundingClientRect();
    const nextRect = nextSection?.getBoundingClientRect();
    const tagStyle = tag ? getComputedStyle(tag) : null;
    const titleStyle = title ? getComputedStyle(title) : null;

    assert(document.documentElement.scrollWidth <= window.innerWidth, 'document should not have horizontal overflow');
    assert(Boolean(hero && title && desc && tag), 'hero fixture elements should render');
    assert(heroRect.height >= 250 && heroRect.height < 520, 'hero height should grow but stay bounded');
    assert(statusRect.top < heroRect.top, 'status/participants grid should render above hero');
    assert(tagRect.height <= 32, 'long tag should stay one compact line');
    assert(tagStyle?.whiteSpace === 'nowrap', 'long tag should use nowrap ellipsis');
    assert(titleStyle?.position === 'static', 'title should be in normal flow');
    for (const card of infoCards) {
      const cardRect = card.getBoundingClientRect();
      assert(!intersects(titleRect, cardRect), 'title should not overlap info cards');
      assert(!intersects(descRect, cardRect), 'description should not overlap info cards');
    }
    assert(nextRect.top >= heroRect.bottom - 1, 'chat card below hero should not be covered');

    return {
      ok: failures.length === 0,
      failures,
      viewport: { width: window.innerWidth, height: window.innerHeight },
      hero: { height: Math.round(heroRect.height), bottom: Math.round(heroRect.bottom) },
      statusGrid: { top: Math.round(statusRect.top), bottom: Math.round(statusRect.bottom) },
      infoCards: infoCards.map(card => {
        const rect = card.getBoundingClientRect();
        return { left: Math.round(rect.left), right: Math.round(rect.right), top: Math.round(rect.top), bottom: Math.round(rect.bottom) };
      }),
      tag: { width: Math.round(tagRect.width), height: Math.round(tagRect.height), whiteSpace: tagStyle?.whiteSpace },
      title: { position: titleStyle?.position, width: Math.round(titleRect.width), right: Math.round(titleRect.right), height: Math.round(titleRect.height), computedWidth: titleStyle?.width }
    };
  }})()`;
  const result = await send(ws, 'Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  const value = result.result?.value;
  if (!value?.ok) throw new Error(`BACK-069 hero smoke failed: ${(value?.failures || []).join('; ')}`);
  return value;
}

async function captureThemeScreenshot(ws, theme, file) {
  await send(ws, 'Runtime.evaluate', {
    expression: `document.documentElement.setAttribute('data-theme', ${JSON.stringify(theme)}); if (typeof currentDetailTask !== 'undefined' && currentDetailTask) openTask(currentDetailTask, 0);`,
    awaitPromise: false
  });
  await send(ws, 'Runtime.evaluate', {
    expression: 'new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))',
    awaitPromise: true
  });
  const shot = await send(ws, 'Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: false
  });
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, Buffer.from(shot.data, 'base64'));
  return path.relative(root, file).split(path.sep).join('/');
}

async function captureEvidenceScreenshots(ws) {
  await send(ws, 'Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  return {
    light: await captureThemeScreenshot(ws, 'light', evidenceFiles.light),
    dark: await captureThemeScreenshot(ws, 'dark', evidenceFiles.dark)
  };
}

async function runDesktopOverflowCheck(ws) {
  await send(ws, 'Emulation.setDeviceMetricsOverride', { width: 1024, height: 768, deviceScaleFactor: 1, mobile: false });
  await send(ws, 'Runtime.evaluate', {
    expression: "document.documentElement.setAttribute('data-theme', 'light'); if (typeof currentDetailTask !== 'undefined' && currentDetailTask) openTask(currentDetailTask, 0);",
    awaitPromise: false
  });
  await send(ws, 'Runtime.evaluate', {
    expression: 'new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))',
    awaitPromise: true
  });
  const result = await send(ws, 'Runtime.evaluate', {
    expression: `({
      viewportWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      titleWidth: Math.round(document.getElementById('detail-title')?.getBoundingClientRect().width || 0),
      titleHeight: Math.round(document.getElementById('detail-title')?.getBoundingClientRect().height || 0),
      heroWidth: Math.round(document.querySelector('#task-detail .detail-redesign-hero')?.getBoundingClientRect().width || 0),
      statusTop: Math.round(document.querySelector('#task-detail .detail-redesign-status-grid')?.getBoundingClientRect().top || 0),
      heroTop: Math.round(document.querySelector('#task-detail .detail-redesign-hero')?.getBoundingClientRect().top || 0),
      ok: document.documentElement.scrollWidth <= window.innerWidth
    })`,
    returnByValue: true
  });
  const value = result.result?.value;
  if (!value?.ok) throw new Error(`desktop overflow check failed: scrollWidth ${value?.scrollWidth}, viewport ${value?.viewportWidth}`);
  if (value.titleWidth < 300) throw new Error(`desktop title width too narrow: ${value.titleWidth}px`);
  if (value.titleHeight > 120) throw new Error(`desktop title appears vertically wrapped: ${value.titleHeight}px`);
  if (value.statusTop > value.heroTop) throw new Error(`status/participants grid should render above hero: statusTop ${value.statusTop}, heroTop ${value.heroTop}`);
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
  result.screenshots = await captureEvidenceScreenshots(ws);
  result.desktop = await runDesktopOverflowCheck(ws);
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
