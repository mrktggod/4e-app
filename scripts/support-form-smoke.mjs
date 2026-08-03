import { chromium } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const executablePath = process.env.CHROME_PATH || process.env.BROWSER_PATH;

const browser = await chromium.launch({
  headless: true,
  ...(executablePath ? { executablePath } : {})
});

try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
  await page.addInitScript(() => {
    localStorage.setItem('chetam_onboarded', '1');
    localStorage.setItem('chetam_token', 'support-smoke-token');
    window.__supportRequests = [];
    window.fetch = async (url, options = {}) => {
      const body = options.body ? JSON.parse(options.body) : null;
      window.__supportRequests.push({ url: String(url), method: options.method || 'GET', body });
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      });
    };
  });

  await page.goto(pathToFileURL(path.join(root, 'index.html')).href);
  await page.waitForSelector('#write-support', { state: 'attached' });

  const result = await page.evaluate(async () => {
    currentUser = {
      id: 'support-user-1',
      name: 'Support Smoke',
      email: 'support-smoke@example.test',
      telegramId: '424242',
      telegramUsername: 'support_smoke'
    };
    showSubScreen('write-support');
    document.getElementById('support-topic').selectedIndex = 1;
    document.getElementById('support-msg').value = 'Не открывается список задач после входа';
    await sendSupportMsg();
    await new Promise(resolve => setTimeout(resolve, 150));
    const request = window.__supportRequests.find(item => item.url.endsWith('/support')) || null;
    return {
      ok: Boolean(request)
        && request.method === 'POST'
        && request.url.endsWith('/support')
        && request.body?.topic
        && request.body?.message === 'Не открывается список задач после входа'
        && request.body?.user?.id === 'support-user-1'
        && request.body?.source === 'app_support_form'
        && document.getElementById('support-msg').value === ''
        && document.getElementById('support-char').textContent === '0/1000',
      request,
      supportMsgValue: document.getElementById('support-msg').value,
      supportChar: document.getElementById('support-char').textContent
    };
  });

  if (!result.ok) {
    throw new Error(`support form smoke failed: ${JSON.stringify(result)}`);
  }

  console.log(JSON.stringify({ smoke: 'support-form', viewport: '390x844', ...result }, null, 2));
} finally {
  await browser.close();
}
