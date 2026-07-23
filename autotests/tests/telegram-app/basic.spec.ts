import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const tgUser = {
      id: 400000001,
      first_name: 'Autotest',
      username: 'autotest_user',
      language_code: 'ru',
    };
    window.Telegram = {
      WebApp: {
        initData: 'query_id=autotest&user=%7B%22id%22%3A400000001%7D&auth_date=1780000000&hash=autotest',
        initDataUnsafe: { user: tgUser, start_param: 'autotest' },
        colorScheme: 'light',
        ready: () => {},
        expand: () => {},
        close: () => {},
        openLink: (url: string) => window.open(url, '_blank'),
        HapticFeedback: {
          impactOccurred: () => {},
          notificationOccurred: () => {},
          selectionChanged: () => {},
        },
      },
    };
  });
});

test('Telegram Mini App opens with mocked host data', async ({ page }, testInfo) => {
  await page.goto('/index.html?tgWebAppData=autotest&tgWebAppStartParam=autotest');
  await expect(page).toHaveTitle(/4/);
  await expect(page.locator('body')).toBeVisible();
  await expect(page.locator('#home')).toBeAttached();
  await page.screenshot({ path: testInfo.outputPath('telegram-home.png'), fullPage: true });
});
