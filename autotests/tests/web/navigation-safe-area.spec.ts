import { expect, test } from '@playwright/test';

type AppWindow = Window & {
  showScreen?: (id: string) => void;
  setNavActive?: (id: string) => void;
};

async function prepareAuthedShell(page) {
  await page.addInitScript(() => {
    localStorage.setItem('chetam_onboarded', '1');
    localStorage.setItem('chetam_onboarding_done', '1');
    localStorage.setItem('chetam_token', 'playwright-layout-token');
    localStorage.setItem('chetam_theme', 'dark');
  });
  await page.route('**/*', route => {
    const url = route.request().url();
    const pathname = new URL(url).pathname;
    if (pathname === '/auth/me') {
      return route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          user: { id: 'playwright-layout', name: 'Playwright', email: 'layout@example.com', premium: true },
        }),
      });
    }
    if (pathname === '/tasks') {
      return route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, tasks: [] }),
      });
    }
    if (pathname === '/tariff-config') {
      return route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, config: null }),
      });
    }
    if (pathname === '/notifications' || pathname.startsWith('/analytics/')) {
      return route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, items: [] }),
      });
    }
    return route.continue();
  });
}

async function openScreen(page, screenId: string) {
  await prepareAuthedShell(page);
  await page.goto('/index.html');
  await page.waitForFunction(() => typeof (window as AppWindow).showScreen === 'function');
  await page.evaluate(id => {
    const win = window as AppWindow;
    win.showScreen?.(id);
    if (id === 'home') win.setNavActive?.('tasks');
    if (id === 'calendar') win.setNavActive?.('cal');
  }, screenId);
  await expect(page.locator(`#${screenId}`)).toBeVisible();
}

async function expectNoViewportOverflow(page) {
  const metrics = await page.evaluate(() => {
    const doc = document.documentElement;
    return {
      innerWidth: window.innerWidth,
      theme: doc.getAttribute('data-theme') || '',
      htmlScrollWidth: doc.scrollWidth,
      bodyScrollWidth: document.body.scrollWidth,
    };
  });

  expect(metrics.theme, 'web smoke should exercise dark theme').toBe('dark');
  expect(metrics.htmlScrollWidth, 'html horizontal overflow').toBeLessThanOrEqual(metrics.innerWidth + 1);
  expect(metrics.bodyScrollWidth, 'body horizontal overflow').toBeLessThanOrEqual(metrics.innerWidth + 1);
}

async function expectNavInsideViewport(page, selector: string) {
  const box = await page.locator(selector).boundingBox();
  expect(box, `${selector} should be visible`).not.toBeNull();

  const viewport = page.viewportSize();
  expect(viewport, 'viewport should exist').not.toBeNull();
  expect(box!.x, `${selector} left edge`).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width, `${selector} right edge`).toBeLessThanOrEqual(viewport!.width + 1);
  expect(box!.y, `${selector} top edge`).toBeGreaterThanOrEqual(0);
  expect(box!.y + box!.height, `${selector} bottom edge`).toBeLessThanOrEqual(viewport!.height + 1);
}

async function expectNavHidden(page, selector: string) {
  const box = await page.locator(selector).boundingBox();
  expect(box, `${selector} should stay hidden on redesigned inner screens`).toBeNull();
}

test.describe('navigation safe area geometry', () => {
  test('home bottom navigation stays inside viewport without horizontal overflow', async ({ page }) => {
    await openScreen(page, 'home');
    await expectNoViewportOverflow(page);
    await expectNavInsideViewport(page, '#home .dash-bottom-nav');
  });

  test('legacy global navigation stays hidden on calendar without horizontal overflow', async ({ page }) => {
    await openScreen(page, 'calendar');
    await expectNoViewportOverflow(page);
    await expectNavHidden(page, '#global-nav');
  });
});
