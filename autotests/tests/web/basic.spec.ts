import { expect, test } from '@playwright/test';

test('web app shell opens', async ({ page }, testInfo) => {
  await page.goto('/index.html');
  await expect(page).toHaveTitle(/4/);
  await expect(page.locator('body')).toBeVisible();
  await expect(page.locator('#home')).toBeAttached();
  await page.screenshot({ path: testInfo.outputPath('web-home.png'), fullPage: true });
});

test('privacy page opens from static route', async ({ page }) => {
  await page.goto('/privacy.html');
  await expect(page.locator('body')).toContainText(/Политика|конфиденциаль/i);
});
