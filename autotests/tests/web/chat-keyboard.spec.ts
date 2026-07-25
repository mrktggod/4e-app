import { expect, test } from '@playwright/test';

type AppWindow = Window & {
  showScreen?: (id: string) => void;
  setNavActive?: (id: string) => void;
};

async function prepareAuthedShell(page) {
  await page.addInitScript(() => {
    localStorage.setItem('chetam_onboarding_done', '1');
    localStorage.setItem('chetam_token', 'playwright-keyboard-token');
  });
  await page.route('**/*', route => {
    const url = route.request().url();
    if (url.includes('/auth/me')) {
      return route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          user: {
            id: 'playwright-keyboard',
            name: 'Playwright',
            email: 'keyboard@example.com',
            premium: true,
            trialActive: true,
            trialEndsAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
            entitlement: {
              status: 'active',
              accessUntil: Date.now() + 7 * 24 * 60 * 60 * 1000,
              plan: 'trial',
            },
          },
        }),
      });
    }
    if (url.includes('/tasks') || url.includes('/ai/messages')) {
      return route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, tasks: [], messages: [] }),
      });
    }
    return route.continue();
  });
}

async function openAsk(page) {
  await prepareAuthedShell(page);
  await page.goto('/index.html');
  await page.waitForFunction(() => typeof (window as AppWindow).showScreen === 'function');
  await page.evaluate(() => {
    const win = window as AppWindow;
    win.showScreen?.('ask');
    win.setNavActive?.('brain');
  });
  await expect(page.locator('#ask')).toBeVisible();
}

test.describe('chat keyboard geometry', () => {
  test('ask composer exposes visible voice entrypoint wired to voice flow', async ({ page }) => {
    await openAsk(page);

    const voiceButton = page.locator('.ask-voice');
    await expect(voiceButton).toBeVisible();
    const box = await voiceButton.boundingBox();
    expect(box, 'voice button box should exist').not.toBeNull();
    expect(box!.width, 'voice button width').toBeGreaterThanOrEqual(44);
    expect(box!.height, 'voice button height').toBeGreaterThanOrEqual(44);

    await voiceButton.click();
    const consentScreen = page.locator('#biometric-consent');
    await expect(consentScreen).toHaveAttribute('aria-hidden', 'false');
    if ((page.viewportSize()?.width ?? 0) <= 500) {
      await expect(consentScreen).toBeVisible();
    }
  });

  test('ask input reserves keyboard space without horizontal overflow', async ({ page }) => {
    await openAsk(page);
    await page.evaluate(() => {
      document.documentElement.style.setProperty('--app-keyboard-offset', '260px');
    });

    await page.locator('#ask-field').focus();
    await expect(page.locator('.ask-bar')).toHaveClass(/ask-bar--keyboard-open/);

    const openMetrics = await page.evaluate(() => {
      const doc = document.documentElement;
      const field = document.getElementById('ask-field')?.getBoundingClientRect();
      const bar = document.querySelector('.ask-bar');
      const barStyle = bar ? window.getComputedStyle(bar) : null;
      return {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        htmlScrollWidth: doc.scrollWidth,
        bodyScrollWidth: document.body.scrollWidth,
        fieldBottom: field?.bottom || 0,
        paddingBottom: Number.parseFloat(barStyle?.paddingBottom || '0'),
        keyboardOffset: window.getComputedStyle(doc).getPropertyValue('--app-keyboard-offset').trim(),
      };
    });

    expect(openMetrics.keyboardOffset).toBe('260px');
    expect(openMetrics.paddingBottom).toBeGreaterThanOrEqual(260);
    expect(openMetrics.innerHeight - openMetrics.fieldBottom, 'reserved space below ask field').toBeGreaterThanOrEqual(200);
    expect(openMetrics.htmlScrollWidth, 'html horizontal overflow').toBeLessThanOrEqual(openMetrics.innerWidth + 1);
    expect(openMetrics.bodyScrollWidth, 'body horizontal overflow').toBeLessThanOrEqual(openMetrics.innerWidth + 1);

    await page.locator('#ask-field').blur();
    await expect(page.locator('.ask-bar')).not.toHaveClass(/ask-bar--keyboard-open/, { timeout: 1000 });
  });
});
