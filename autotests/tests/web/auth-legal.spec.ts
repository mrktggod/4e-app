import { expect, test } from '@playwright/test';

type PrivacyWindow = Window & { __privacyOpenUrls?: string[] };

async function installPrivacyOpenProbe(page) {
  await page.addInitScript(() => {
    const win = window as PrivacyWindow;
    win.__privacyOpenUrls = [];
    window.open = (url?: string | URL) => {
      win.__privacyOpenUrls?.push(String(url || ''));
      return { closed: false } as Window;
    };
  });
}

async function openedPrivacyUrls(page) {
  return page.evaluate(() => ((window as PrivacyWindow).__privacyOpenUrls || []).slice());
}

async function openLoginFromFreshShell(page) {
  await expect(page.locator('#onboarding')).toBeVisible();
  await expect(page.locator('.legal-note--onboarding [data-privacy-policy-link]')).toHaveAttribute('href', 'privacy.html');
  await page.getByText('Пропустить').click();
  await expect(page.locator('#login')).toBeVisible();
}

async function expectMinTouchTarget(page, selector: string) {
  const box = await page.locator(selector).boundingBox();
  expect(box, `${selector} should be visible`).not.toBeNull();
  expect(box!.width, `${selector} width`).toBeGreaterThanOrEqual(44);
  expect(box!.height, `${selector} height`).toBeGreaterThanOrEqual(44);
}

test.describe('auth legal surface', () => {
  test('login and register privacy links open privacy.html', async ({ page }) => {
    await installPrivacyOpenProbe(page);
    await page.goto('/index.html');
    await openLoginFromFreshShell(page);

    const legalLink = page.locator('.legal-note--login [data-privacy-policy-link]');
    await expect(legalLink).toHaveAttribute('href', 'privacy.html');
    await expect(legalLink).toHaveAttribute('target', '_blank');
    await expect(legalLink).toHaveAttribute('rel', /noopener/);

    await legalLink.click();
    await expect.poll(() => openedPrivacyUrls(page)).toContainEqual(expect.stringContaining('/privacy.html'));

    await page.locator('#tab-register').click();
    await expect(page.locator('#form-register')).toBeVisible();
    await legalLink.click();

    const urls = await openedPrivacyUrls(page);
    expect(urls.filter(url => url.includes('/privacy.html'))).toHaveLength(2);
  });

  test('auth controls keep mobile touch targets', async ({ page }) => {
    await page.goto('/index.html');
    await openLoginFromFreshShell(page);

    await expectMinTouchTarget(page, '#tab-login');
    await expectMinTouchTarget(page, '#tab-register');
    await expectMinTouchTarget(page, '[data-toggle-pass="login-pass"]');
    await expectMinTouchTarget(page, '#show-forgot-btn');
    await expectMinTouchTarget(page, '.legal-note--login [data-privacy-policy-link]');

    const legalFontSize = await page.locator('.legal-note--login').evaluate(node => {
      return Number.parseFloat(window.getComputedStyle(node).fontSize);
    });
    expect(legalFontSize).toBeGreaterThanOrEqual(13);

    await page.locator('#tab-register').click();
    await expect(page.locator('#form-register')).toBeVisible();
    await expectMinTouchTarget(page, '[data-toggle-pass="reg-pass"]');
  });
});
