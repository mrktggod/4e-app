import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

const APP_URL = process.env.STAGING_APP_URL || 'https://4-ai-staging.pages.dev/';
const WORKER_URL = process.env.STAGING_WORKER_URL || 'https://restless-lab-d737-staging.shelckograff.workers.dev';

const chromeCandidates = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
].filter(Boolean);

function log(message) {
  process.stdout.write(String(message) + '\n');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function request(pathname, options = {}) {
  const res = await fetch(WORKER_URL.replace(/\/$/, '') + pathname, options);
  const text = await res.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { status: res.status, ok: res.ok, body, text };
}

async function registerUser(label) {
  const stamp = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  const email = `auth-avatar-${label}-${stamp}@example.org`;
  const password = 'SmokePass123!';
  const name = `Auth Avatar ${label}`;
  const reg = await request('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
  assert(reg.status === 200 || reg.status === 201, `register ${label} failed: ${reg.status} ${reg.text}`);
  return { email, password, name, token: reg.body?.token, user: reg.body?.user };
}

async function findChrome() {
  const candidate = chromeCandidates.find((item) => existsSync(item));
  if (!candidate) throw new Error('Chrome/Edge executable was not found');
  return candidate;
}

async function waitForCdp(port) {
  const deadline = Date.now() + 8000;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      const data = await res.json();
      if (data.webSocketDebuggerUrl) return data.webSocketDebuggerUrl;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new Error('Chrome did not expose CDP in time');
}

async function openPageTarget(port) {
  const res = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' });
  if (!res.ok) throw new Error(`Cannot open Chrome target: HTTP ${res.status}`);
  return res.json();
}

function createCdp(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let id = 0;
  const pending = new Map();
  ws.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject, timer } = pending.get(msg.id);
      clearTimeout(timer);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message || 'CDP error'));
      else resolve(msg.result || {});
    }
  });
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('CDP WebSocket open timeout')), 5000);
    ws.addEventListener('open', () => {
      clearTimeout(timer);
      resolve({
        send(method, params = {}) {
          const callId = ++id;
          ws.send(JSON.stringify({ id: callId, method, params }));
          return new Promise((callResolve, callReject) => {
            const callTimer = setTimeout(() => {
              pending.delete(callId);
              callReject(new Error(`CDP timeout: ${method}`));
            }, 7000);
            pending.set(callId, { resolve: callResolve, reject: callReject, timer: callTimer });
          });
        },
        close() {
          ws.close();
        },
      });
    });
    ws.addEventListener('error', () => {
      clearTimeout(timer);
      reject(new Error('CDP WebSocket error'));
    });
  });
}

async function createBrowserSession(name) {
  const chromePath = await findChrome();
  const port = 9400 + Math.floor(Math.random() * 400);
  const dir = mkdtempSync(path.join(tmpdir(), `4e-${name}-`));
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-networking',
    '--window-size=390,844',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${path.join(dir, 'profile')}`,
    'about:blank',
  ], { stdio: 'ignore' });
  await waitForCdp(port);
  const target = await openPageTarget(port);
  const cdp = await createCdp(target.webSocketDebuggerUrl);
  await cdp.send('Runtime.enable');
  await cdp.send('Page.enable');
  return {
    cdp,
    async close() {
      cdp.close();
      if (!chrome.killed) chrome.kill();
      await new Promise((resolve) => chrome.once('exit', resolve));
      rmSync(dir, { recursive: true, force: true });
    },
  };
}

async function evalJs(cdp, expression) {
  const result = await cdp.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || 'Runtime.evaluate exception');
  }
  return result.result?.value;
}

async function loadApp(cdp) {
  await cdp.send('Page.navigate', { url: `${APP_URL}?diag=${Date.now()}` });
  await new Promise((resolve) => setTimeout(resolve, 5000));
}

async function loginViaUi(cdp, user) {
  return evalJs(cdp, `(async()=>{
    localStorage.setItem('chetam_onboarded','1');
    localStorage.removeItem('chetam_token');
    if (typeof showScreen === 'function') showScreen('login');
    if (typeof switchAuthTab === 'function') switchAuthTab('login');
    document.getElementById('login-email').value=${JSON.stringify(user.email)};
    document.getElementById('login-pass').value=${JSON.stringify(user.password)};
    await doLogin();
    await new Promise(r=>setTimeout(r,1500));
    const active=[...document.querySelectorAll('.screen')].find(el=>el.classList.contains('active'))?.id || '';
    return {
      active,
      token: localStorage.getItem('chetam_token') || '',
      profileName: document.getElementById('profile-name')?.textContent || '',
      homeAvatarText: document.getElementById('user-avatar-small')?.textContent || '',
      homeAvatarBg: document.getElementById('user-avatar-small')?.style.backgroundImage || '',
      draft: localStorage.getItem('extendedProfileDraft') || ''
    };
  })()`);
}

async function wrongPasswordViaUi(cdp, email) {
  return evalJs(cdp, `(async()=>{
    localStorage.setItem('chetam_onboarded','1');
    localStorage.removeItem('chetam_token');
    if (typeof showScreen === 'function') showScreen('login');
    if (typeof switchAuthTab === 'function') switchAuthTab('login');
    document.getElementById('login-email').value=${JSON.stringify(email)};
    document.getElementById('login-pass').value='WrongSmoke123!';
    await doLogin();
    await new Promise(r=>setTimeout(r,1000));
    return {
      active:[...document.querySelectorAll('.screen')].find(el=>el.classList.contains('active'))?.id || '',
      token: localStorage.getItem('chetam_token') || '',
      passError: document.getElementById('login-pass-error')?.textContent || '',
      toast: document.getElementById('toast')?.textContent || ''
    };
  })()`);
}

async function writeAvatarDraft(cdp) {
  return evalJs(cdp, `(()=>{
    const dataUrl='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=';
    const draft=JSON.parse(localStorage.getItem('extendedProfileDraft')||'{}');
    draft.photoDataUrl=dataUrl;
    localStorage.setItem('extendedProfileDraft',JSON.stringify(draft));
    if (typeof applyUserInfo === 'function') applyUserInfo();
    return {
      draft: localStorage.getItem('extendedProfileDraft') || '',
      homeAvatarBg: document.getElementById('user-avatar-small')?.style.backgroundImage || '',
      profileAvatarBg: document.getElementById('profile-avatar')?.style.backgroundImage || ''
    };
  })()`);
}

async function run() {
  log(`app=${APP_URL}`);
  log(`worker=${WORKER_URL}`);
  const userA = await registerUser('a');
  const userB = await registerUser('b');
  log(`freshAccountA=${userA.email}`);
  log(`freshAccountB=${userB.email}`);

  const wrongApi = await request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: userA.email, password: 'WrongSmoke123!' }),
  });
  log(`wrongPasswordApi.status=${wrongApi.status}`);
  log(`wrongPasswordApi.body=${wrongApi.text || '<empty>'}`);

  const browser1 = await createBrowserSession('auth-avatar-main');
  try {
    await loadApp(browser1.cdp);
    const wrongUi = await wrongPasswordViaUi(browser1.cdp, userA.email);
    log(`wrongPasswordUi=${JSON.stringify(wrongUi)}`);

    const loginA = await loginViaUi(browser1.cdp, userA);
    log(`loginA=${JSON.stringify(loginA)}`);
    const avatarA = await writeAvatarDraft(browser1.cdp);
    log(`avatarA.localDraft=${JSON.stringify(avatarA)}`);
    const logout = await evalJs(browser1.cdp, `(()=>{doLogout();return {token:localStorage.getItem('chetam_token')||'',draft:localStorage.getItem('extendedProfileDraft')||''};})()`);
    log(`logoutA=${JSON.stringify(logout)}`);
    const loginB = await loginViaUi(browser1.cdp, userB);
    log(`loginB.sameBrowser=${JSON.stringify(loginB)}`);
  } finally {
    await browser1.close();
  }

  const browser2 = await createBrowserSession('auth-avatar-fresh');
  try {
    await loadApp(browser2.cdp);
    const loginAFresh = await loginViaUi(browser2.cdp, userA);
    log(`loginA.freshBrowser=${JSON.stringify(loginAFresh)}`);
  } finally {
    await browser2.close();
  }
}

run().catch((error) => {
  console.error(`auth-avatar-login-diagnose failed: ${error.message}`);
  process.exit(1);
});
