import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const appUrl = 'file:///' + path.join(root, 'index.html').replace(/\\/g, '/');

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

await page.route('**/*', async route => {
  const url = route.request().url();
  if (url.startsWith('https://edge.4-ai.site/auth/request-email-verification')) {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, verified: true, user: { id: 'profile-link-user', email: 'linked@example.test', emailVerified: true } }),
    });
    return;
  }
  await route.continue();
});

await page.goto(appUrl);
await page.evaluate(() => {
  window.WORKER = 'https://edge.4-ai.site';
  window.showToast = message => { window.__lastToast = message; };
  window.loadTasks = () => {};
  window.applyUserInfo = () => {};
  localStorage.setItem('chetam_token', 'profile-link-token');
  window.authHeaders = () => ({ 'Content-Type': 'application/json', 'x-token': 'profile-link-token' });
  window.readJsonSafe = response => response.json();
  currentUser = {
    id: 'profile-link-user',
    name: 'Profile Link',
    email: 'linked@example.test',
    referralCode: 'profilelink',
  };
  window.currentUser = currentUser;
  window.startOAuthLogin = provider => {
    window.__oauthProvider = provider;
  };
  window.showScreen('profile');
  window.renderExtendedProfile();
});

const before = await page.evaluate(() => ({
  phoneClick: document.getElementById('profile-phone-status')?.getAttribute('onclick') || '',
  vkText: document.getElementById('profile-vk-status')?.textContent || '',
  yandexText: document.getElementById('profile-yandex-status')?.textContent || '',
  emailText: document.getElementById('profile-email-status')?.textContent || '',
}));

if (before.phoneClick.includes('toggleProfileVerified')) {
  throw new Error('phone profile button still uses fake toggleProfileVerified');
}
if (before.vkText !== 'Привязать') throw new Error(`expected VK action button, got ${before.vkText}`);
if (before.yandexText !== 'Привязать') throw new Error(`expected Yandex action button, got ${before.yandexText}`);

await page.click('#profile-vk-status');
const vkProvider = await page.evaluate(() => window.__oauthProvider);
if (vkProvider !== 'vk_id') throw new Error(`VK link did not start vk_id OAuth, got ${vkProvider}`);

await page.evaluate(() => { window.__oauthProvider = ''; });
await page.click('#profile-yandex-status');
const yandexProvider = await page.evaluate(() => window.__oauthProvider);
if (yandexProvider !== 'yandex') throw new Error(`Yandex link did not start yandex OAuth, got ${yandexProvider}`);

await page.click('#profile-email-status');
await page.waitForTimeout(100);
const emailText = await page.locator('#profile-email-status').textContent();
if (!emailText.includes('Подтвержд')) throw new Error(`email verification did not update badge: ${emailText}`);

await page.evaluate(() => {
  currentUser.vkId = 'vk-linked';
  currentUser.yandexId = 'ya-linked';
  window.currentUser = currentUser;
  window.renderExtendedProfile();
});
const connected = await page.evaluate(() => ({
  vkText: document.getElementById('profile-vk-status')?.textContent || '',
  vkDisabled: document.getElementById('profile-vk-status')?.disabled || false,
  yandexText: document.getElementById('profile-yandex-status')?.textContent || '',
  yandexDisabled: document.getElementById('profile-yandex-status')?.disabled || false,
}));
if (connected.vkText !== 'Привязан' || !connected.vkDisabled) throw new Error('VK connected badge is not disabled');
if (connected.yandexText !== 'Привязан' || !connected.yandexDisabled) throw new Error('Yandex connected badge is not disabled');

await browser.close();
console.log('profile account link smoke: PASS');
