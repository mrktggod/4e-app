import { chromium } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const indexUrl = pathToFileURL(path.join(root, 'index.html')).href;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function inspect(user) {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
    await page.addInitScript(() => {
      localStorage.setItem('chetam_onboarding_done', '1');
      localStorage.setItem('chetam_token', 'profile-referral-token');
    });
    await page.route('**/*', route => {
      const url = route.request().url();
      if (url.includes('/auth/me')) {
        return route.fulfill({
          contentType: 'application/json',
          body: JSON.stringify({ ok: true, user }),
        });
      }
      if (url.includes('/tasks')) {
        return route.fulfill({
          contentType: 'application/json',
          body: JSON.stringify({ ok: true, tasks: [] }),
        });
      }
      if (url.includes('/identities')) {
        return route.fulfill({
          contentType: 'application/json',
          body: JSON.stringify({ ok: true, identities: [] }),
        });
      }
      return route.continue();
    });

    await page.goto(indexUrl);
    await page.waitForFunction(() => typeof window.showScreen === 'function');
    const result = await page.evaluate(currentUser => {
      window.currentUser = currentUser;
      window.showScreen('profile');
      const input = document.getElementById('profile-ref-link');
      return {
        value: input?.value || '',
        copyAvailable: typeof window.copyReferralLink === 'function',
      };
    }, user);
    return result;
  } finally {
    await browser.close();
  }
}

const withCode = await inspect({
  id: 'ref-user-with-code',
  name: 'Referral User',
  email: 'referral@example.test',
  referralCode: 'refcode123',
  referralCount: 2,
});

assert(withCode.copyAvailable, 'copyReferralLink is not exposed');
assert(withCode.value.includes('?ref=refcode123'), `expected referral link with code, got "${withCode.value}"`);

const withoutCode = await inspect({
  id: 'ref-user-without-code',
  name: 'No Referral Code',
  email: 'no-referral@example.test',
  referralCount: 0,
});

assert(
  withoutCode.value === 'Ссылка появится после синхронизации профиля',
  `expected visible fallback text, got "${withoutCode.value}"`,
);

console.log('profile referral link smoke: PASS');
console.log(JSON.stringify({ withCode, withoutCode }, null, 2));
