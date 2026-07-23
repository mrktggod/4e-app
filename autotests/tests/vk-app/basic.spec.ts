import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.vkBridge = {
      send(method: string) {
        if (method === 'VKWebAppGetUserInfo') {
          return Promise.resolve({
            id: 500000001,
            first_name: 'Autotest',
            last_name: 'VK',
          });
        }
        if (method === 'VKWebAppGetLaunchParams') {
          return Promise.resolve({
            vk_app_id: 54636698,
            vk_user_id: 500000001,
            vk_platform: 'mobile_web',
          });
        }
        if (method === 'VKWebAppGetConfig') {
          return Promise.resolve({ scheme: 'bright_light' });
        }
        if (method === 'VKWebAppGetSafeAreaInsets') {
          return Promise.resolve({ top: 0, bottom: 0, left: 0, right: 0 });
        }
        return Promise.resolve({});
      },
      subscribe: () => {},
      unsubscribe: () => {},
    };
  });
});

test('VK Mini App opens with mocked launch params', async ({ page }, testInfo) => {
  await page.goto('/vk.html?vk_app_id=54636698&vk_user_id=500000001&vk_platform=mobile_web');
  await expect(page).toHaveTitle(/4/);
  await expect(page.locator('body')).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('vk-home.png'), fullPage: true });
});
