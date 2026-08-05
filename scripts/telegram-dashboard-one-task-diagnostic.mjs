import { chromium } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const indexUrl = pathToFileURL(path.join(root, 'index.html')).href;

const tasks = [
  { id: 'diag-1', text: 'Prepare investor update', direction: 'outgoing', deadline: '2026-07-28T12:00:00', priority: 'high' },
  { id: 'diag-2', text: 'Reply to partner', direction: 'incoming', deadline: '2026-07-28T18:00:00', person: 'Yuri' },
  { id: 'diag-3', text: 'Review beta checklist', direction: 'outgoing', deadline: '2026-07-29T10:00:00' },
  { id: 'diag-4', text: 'Draft launch notes', direction: 'outgoing', deadline: '2026-07-31T10:00:00' }
];

async function runSurface(browser, surface) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
  await context.addInitScript(({ fixture, surfaceName }) => {
    localStorage.setItem('chetam_onboarded', '1');
    localStorage.setItem('chetam_token', `${surfaceName}-dashboard-token`);
    window.__dashboardSurface = surfaceName;
    window.__dashboardTaskApiCount = 0;
    window.__dashboardTaskApiHits = 0;
    if (surfaceName === 'telegram') {
      window.Telegram = {
        WebApp: {
          initData: 'query_id=dashboard-diagnostic',
          initDataUnsafe: { user: { id: 4242, first_name: 'Telegram' } },
          ready() {},
          expand() {},
          disableVerticalSwipes() {},
          HapticFeedback: { impactOccurred() {} }
        }
      };
    }
    window.fetch = async (url) => {
      const href = String(url || '');
      if (href.includes('/tasks')) {
        window.__dashboardTaskApiHits += 1;
        window.__dashboardTaskApiCount = fixture.length;
        return new Response(JSON.stringify(fixture), {
          status: 200,
          headers: { 'content-type': 'application/json' }
        });
      }
      if (href.includes('/auth/me')) {
        return new Response(JSON.stringify({
          ok: true,
          user: {
            id: `${surfaceName}-dashboard-user`,
            email: `${surfaceName}@dashboard.test`,
            name: surfaceName,
            plan: 'trial',
            trialActive: true,
            trialLeft: 14,
            entitlement: { status: 'active', plan: 'trial', accessUntil: Date.now() + 86400000 }
          }
        }), { status: 200, headers: { 'content-type': 'application/json' } });
      }
      return new Response(JSON.stringify({ ok: true, messages: [], items: [] }), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      });
    };
  }, { fixture: tasks, surfaceName: surface });

  const page = await context.newPage();
  try {
    await page.goto(indexUrl);
    await page.waitForFunction(() => typeof loadTasks === 'function' && typeof showScreen === 'function');
    await page.evaluate(async () => {
      showScreen('home');
      await loadTasks();
    });
    await page.waitForFunction(() => document.querySelectorAll('#home-task-list .task-card-shell').length >= 3);

    return await page.evaluate(() => {
      const rowTitles = Array.from(document.querySelectorAll('#home-task-list .home-ai-row-title')).map((el) => el.textContent.trim());
      return {
        surface: window.__dashboardSurface,
        apiHits: window.__dashboardTaskApiHits,
        apiCount: window.__dashboardTaskApiCount,
        localCount: Array.isArray(allTasksCache) ? allTasksCache.length : -1,
        activeCount: Array.isArray(allTasksCache) ? allTasksCache.filter((task) => !task.done).length : -1,
        dashboardRows: document.querySelectorAll('#home-task-list .task-card-shell').length,
        rowTitles,
        showAllRemoved: !document.getElementById('home-show-all-btn'),
        focusCount: document.getElementById('focus-day-count')?.textContent || ''
      };
    });
  } finally {
    await context.close();
  }
}

const browser = await chromium.launch();
try {
  const results = [];
  for (const surface of ['web', 'telegram']) {
    results.push(await runSurface(browser, surface));
  }

  for (const result of results) {
    if (result.apiCount !== 4) throw new Error(`${result.surface}: expected API count 4, got ${result.apiCount}`);
    if (result.localCount !== 4) throw new Error(`${result.surface}: expected local cache count 4, got ${result.localCount}`);
    if (result.activeCount !== 4) throw new Error(`${result.surface}: expected active count 4, got ${result.activeCount}`);
    if (result.dashboardRows !== 4) throw new Error(`${result.surface}: expected every active dashboard row, got ${result.dashboardRows}`);
    if (result.rowTitles.length !== 4) throw new Error(`${result.surface}: expected four rendered row titles`);
    if (!result.showAllRemoved) throw new Error(`${result.surface}: retired show-all action is still present`);
  }

  console.log('telegram dashboard one-task diagnostic: PASS', JSON.stringify(results));
} finally {
  await browser.close();
}
