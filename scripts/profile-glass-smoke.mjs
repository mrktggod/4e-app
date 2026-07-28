import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const indexUrl = pathToFileURL(path.join(root, 'index.html')).href;
const artifactDir = path.join(root, 'docs', 'tasks', 'assets');
const screenshots = {
  light: path.join(artifactDir, 'PROFILE-glass-package2-2026-07-28-light.png'),
  dark: path.join(artifactDir, 'PROFILE-glass-package2-2026-07-28-dark.png'),
};

async function prepare(page, theme) {
  await page.addInitScript(selectedTheme => {
    localStorage.setItem('chetam_onboarding_done', '1');
    localStorage.setItem('chetam_token', 'profile-glass-token');
    localStorage.setItem('theme', selectedTheme);
  }, theme);

  await page.route('**/*', route => {
    const url = route.request().url();
    if (url.includes('/auth/me')) {
      return route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          user: {
            id: 'profile-glass-user',
            name: 'Profile Glass',
            email: 'profile-glass@example.com',
            premium: true,
            trialLeft: 365,
            referralCode: 'profileglass',
          },
        }),
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
}

function parseRadius(value) {
  return Number.parseFloat(String(value || '0').split(' ')[0]) || 0;
}

async function inspect(page, theme) {
  await page.goto(indexUrl);
  await page.waitForFunction(() => typeof window.showScreen === 'function');
  await page.evaluate(selectedTheme => {
    document.documentElement.setAttribute('data-theme', selectedTheme);
    window.currentUser = {
      id: 'profile-glass-user',
      name: 'Profile Glass',
      email: 'profile-glass@example.com',
      premium: true,
      trialLeft: 365,
      referralCode: 'profileglass',
    };
    window.chatId = 'user_profile_glass';
    window.showScreen('profile');
  }, theme);

  await page.locator('#profile.active .profile-handoff-hero').waitFor({ state: 'visible' });
  await page.screenshot({ path: screenshots[theme], fullPage: true });

  return page.evaluate(() => {
    const hero = document.querySelector('.profile-handoff-hero');
    const card = document.querySelector('.profile-card--settings');
    const row = document.querySelector('.profile-card--settings .profile-menu-row');
    const refInput = document.querySelector('.profile-ref-field input');
    const scroll = document.querySelector('.profile-handoff-scroll');
    const heroStyle = getComputedStyle(hero);
    const cardStyle = getComputedStyle(card);
    const rowStyle = getComputedStyle(row);
    const inputStyle = getComputedStyle(refInput);
    const doc = document.documentElement;

    return {
      viewportWidth: window.innerWidth,
      documentScrollWidth: doc.scrollWidth,
      profileVisible: !!document.querySelector('#profile.active'),
      heroBorderRadius: heroStyle.borderRadius,
      heroBackdropFilter: heroStyle.backdropFilter || heroStyle.webkitBackdropFilter || '',
      heroBoxShadow: heroStyle.boxShadow,
      cardBackground: cardStyle.backgroundColor,
      rowMinHeight: rowStyle.minHeight,
      rowBorderBottom: rowStyle.borderBottomColor,
      refInputBorderRadius: inputStyle.borderRadius,
      scrollBottomPadding: scroll ? getComputedStyle(scroll).paddingBottom : '',
    };
  });
}

await fs.mkdir(artifactDir, { recursive: true });

const browser = await chromium.launch();
try {
  const results = {};
  for (const theme of ['light', 'dark']) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
    await prepare(page, theme);
    results[theme] = await inspect(page, theme);
    await page.close();
  }

  for (const [theme, metrics] of Object.entries(results)) {
    if (!metrics.profileVisible) throw new Error(`${theme}: profile screen is not visible`);
    if (metrics.documentScrollWidth > metrics.viewportWidth + 1) throw new Error(`${theme}: profile has horizontal overflow`);
    if (parseRadius(metrics.heroBorderRadius) < 24) throw new Error(`${theme}: hero does not use glass card radius`);
    if (!String(metrics.heroBackdropFilter).includes('blur')) throw new Error(`${theme}: hero backdrop blur is missing`);
    if (String(metrics.heroBoxShadow) === 'none') throw new Error(`${theme}: hero glass shadow is missing`);
    if (parseRadius(metrics.refInputBorderRadius) < 20) throw new Error(`${theme}: referral input does not use glass control radius`);
    if (Number.parseFloat(metrics.rowMinHeight) < 44) throw new Error(`${theme}: menu rows are below 44px touch target`);
  }

  console.log('profile glass smoke: PASS');
  console.log(JSON.stringify({ results, screenshots }, null, 2));
} finally {
  await browser.close();
}
