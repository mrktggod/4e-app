import { expect, test } from '@playwright/test';

const fixtureTasks = [
  {
    id: 'vk-e2e-task-1',
    text: 'Prepare VK beta checklist',
    title: 'Prepare VK beta checklist',
    type: 'task',
    status: 'active',
    priority: 'high',
    deadline: '2026-07-25',
    done: false,
    createdAt: Date.now(),
    originalMsg: 'Prepare VK beta checklist tomorrow',
  },
  {
    id: 'vk-e2e-task-2',
    text: 'Archive completed VK smoke',
    title: 'Archive completed VK smoke',
    type: 'task',
    status: 'done',
    priority: 'normal',
    deadline: '2026-07-24',
    done: true,
    createdAt: Date.now(),
  },
];

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('vk4_token', 'playwright-vk-token');
    window.vkBridge = {
      send(method: string) {
        if (method === 'VKWebAppInit') {
          return Promise.resolve({ result: true });
        }
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

  await page.route('https://edge.4-ai.site/**', route => {
    const url = route.request().url();
    if (url.endsWith('/auth/me')) {
      return route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          user: {
            id: 'vk-e2e-user',
            name: 'VK Playwright',
            email: 'vk-playwright@example.com',
            vkId: '500000001',
            trialEndsAt: Date.now() + 30 * 86400000,
          },
        }),
      });
    }
    if (url.endsWith('/tasks')) {
      return route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, tasks: fixtureTasks }),
      });
    }
    if (url.endsWith('/v2/auth/legacy-session')) {
      return route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          token: 'playwright-d1-token',
          identities: [
            { provider: 'web', displayName: 'vk-playwright@example.com' },
            { provider: 'vk', providerUserId: '500000001', displayName: 'Autotest VK' },
          ],
        }),
      });
    }
    if (url.endsWith('/v2/auth/identities')) {
      return route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          identities: [
            { provider: 'web', displayName: 'vk-playwright@example.com' },
            { provider: 'vk', providerUserId: '500000001', displayName: 'Autotest VK' },
          ],
        }),
      });
    }
    if (url.endsWith('/')) {
      return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ ok: true }) });
    }
    return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ ok: true }) });
  });
});

test('VK Mini App opens with mocked launch params', async ({ page }, testInfo) => {
  await page.goto('/vk.html?vk_app_id=54636698&vk_user_id=500000001&vk_platform=mobile_web');
  await expect(page).toHaveTitle(/4/);
  await expect(page.locator('body')).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('vk-home.png'), fullPage: true });
});

test('VK Mini App mocked navigation covers home, detail, ask, calendar, stats and profile', async ({ page }) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', error => pageErrors.push(error.message));

  await page.goto('/vk.html?vk_app_id=54636698&vk_user_id=500000001&vk_platform=mobile_web');
  await expect(page.locator('#mainApp')).toBeVisible();
  await expect(page.locator('#screen-home')).toHaveClass(/active/);
  await expect(page.locator('#taskList .task-card')).toHaveCount(1);
  await expect(page.locator('#homePriorityRow')).toBeVisible();

  await page.locator('#taskList .task-card').first().click();
  await expect(page.locator('#screen-task-detail')).toHaveClass(/active/);
  await expect(page.locator('#detailTaskTitle')).toContainText('Prepare VK beta checklist');
  await expect(page.locator('#detailEditTitle')).toHaveValue('Prepare VK beta checklist');

  await page.locator('.detail-back').click();
  await expect(page.locator('#screen-home')).toHaveClass(/active/);

  await page.locator('.nav-center').click();
  await expect(page.locator('#screen-ask')).toHaveClass(/active/);
  await expect(page.locator('#chatInput')).toBeVisible();

  await page.locator('#nav-calendar').click();
  await expect(page.locator('#screen-calendar')).toHaveClass(/active/);
  await expect(page.locator('#calGrid .cal-day')).not.toHaveCount(0);

  await page.locator('#nav-stats').click();
  await expect(page.locator('#screen-stats')).toHaveClass(/active/);
  await expect(page.locator('#statActive')).toHaveText('1');
  await expect(page.locator('#statDone')).toHaveText('1');

  await page.locator('#nav-profile').click();
  await expect(page.locator('#screen-profile')).toHaveClass(/active/);
  await expect(page.locator('#profileName')).toHaveText('VK Playwright');
  await expect(page.locator('#identityList .identity-row')).toHaveCount(3);

  expect(pageErrors, 'page errors').toEqual([]);
  expect(consoleErrors, 'fatal console errors').toEqual([]);
});
