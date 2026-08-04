import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const indexUrl = pathToFileURL(path.join(root, 'index.html')).href;
const screenshotPath = path.join(root, 'docs', 'tasks', 'assets', 'BRIEF-2026-07-27-96-telegram-bottom-menu-dark.png');

function taskFixture() {
  return [
    { id: 'bottom-nav-1', text: 'Check Telegram bottom nav', direction: 'outgoing', deadline: '2026-07-28T12:00:00' },
    { id: 'bottom-nav-2', text: 'Confirm inner pages hide old menu', direction: 'incoming', person: 'Yuri', deadline: '2026-07-28T18:00:00' }
  ];
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
await page.addInitScript(({ tasks }) => {
  localStorage.setItem('chetam_onboarded', '1');
  localStorage.setItem('chetam_token', 'telegram-bottom-menu-smoke-token');
  localStorage.setItem('chetam_theme', 'dark');
  sessionStorage.setItem('__telegram__initParams', JSON.stringify({
    tgWebAppData: 'query_id=bottom-menu-diagnostic&user=%7B%22id%22%3A9696%2C%22first_name%22%3A%22Telegram%22%7D'
  }));
  window.fetch = async (url) => {
    const href = String(url || '');
    if (href.includes('/tasks')) {
      return new Response(JSON.stringify(tasks), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      });
    }
    if (href.includes('/auth/me')) {
      return new Response(JSON.stringify({
        ok: true,
        user: {
          id: 'bottom-menu-user',
          email: 'bottom-menu@example.test',
          name: 'Bottom Menu',
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
}, { tasks: taskFixture() });

function readVisibility(selector) {
  return {
    selector,
    expression: `(function(){
    const el = document.querySelector(${JSON.stringify(selector)});
    if (!el) return false;
    const style = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
  })()`
  };
}

try {
  await page.goto(indexUrl);
  await page.waitForFunction(() => typeof showScreen === 'function' && typeof loadTasks === 'function');
  await page.evaluate(async () => {
    document.documentElement.setAttribute('data-theme', 'dark');
    showScreen('home');
    await loadTasks();
  });
  await page.waitForFunction(() => document.querySelector('#home.active .dash-bottom-nav'));
  await fs.mkdir(path.dirname(screenshotPath), { recursive: true });
  await page.screenshot({ path: screenshotPath, fullPage: false });

  const homeMetrics = await page.evaluate(({ homeNav, globalNav }) => {
    const nav = document.querySelector('#home .dash-bottom-nav');
    const navRect = nav?.getBoundingClientRect();
    const bottomGap = selector => {
      const rect = document.querySelector(selector)?.getBoundingClientRect();
      return rect ? window.innerHeight - rect.bottom : -1;
    };
    return {
      theme: document.documentElement.getAttribute('data-theme') || '',
      surface: document.documentElement.getAttribute('data-app-surface') || '',
      homeNavVisible: eval(homeNav.expression),
      globalNavVisible: eval(globalNav.expression),
      dashNavButtons: document.querySelectorAll('#home .dash-bottom-nav button').length,
      globalNavCount: document.querySelectorAll('#global-nav').length,
      dashBottomNavCount: document.querySelectorAll('#home .dash-bottom-nav').length,
      navBottomGap: navRect ? window.innerHeight - navRect.bottom : -1,
      todayBottomGap: bottomGap('#home-nav-today'),
      voiceBottomGap: bottomGap('#home-nav-voice'),
      calendarBottomGap: bottomGap('#home-nav-cal')
    };
  }, {
    homeNav: readVisibility('#home .dash-bottom-nav'),
    globalNav: readVisibility('#global-nav')
  });

  const innerPages = ['profile', 'task-detail', 'subscription', 'statistics'];
  const pageMetrics = [];
  for (const screen of innerPages) {
    await page.evaluate((id) => showScreen(id), screen);
    await page.waitForFunction((id) => document.getElementById(id)?.classList.contains('active'), screen);
    pageMetrics.push(await page.evaluate(({ id, globalNav, homeNav }) => ({
      screen: id,
      globalNavHiddenClass: document.getElementById('global-nav')?.classList.contains('hidden') || false,
      globalNavVisible: eval(globalNav.expression),
      homeNavVisible: eval(homeNav.expression)
    }), {
      id: screen,
      globalNav: readVisibility('#global-nav'),
      homeNav: readVisibility('#home .dash-bottom-nav')
    }));
  }

  if (homeMetrics.theme !== 'dark') throw new Error(`expected dark theme, got ${homeMetrics.theme}`);
  if (homeMetrics.surface !== 'telegram') throw new Error(`expected Telegram surface, got ${homeMetrics.surface}`);
  if (!homeMetrics.homeNavVisible) throw new Error('dashboard dark bottom nav is not visible');
  if (homeMetrics.globalNavVisible) throw new Error('legacy global nav is visible on dashboard');
  if (homeMetrics.dashNavButtons !== 3) throw new Error(`dashboard bottom nav should have 3 buttons, got ${homeMetrics.dashNavButtons}`);
  if (homeMetrics.globalNavCount !== 1) throw new Error(`expected one legacy global nav source node, got ${homeMetrics.globalNavCount}`);
  if (homeMetrics.dashBottomNavCount !== 1) throw new Error(`expected one dashboard bottom nav source node, got ${homeMetrics.dashBottomNavCount}`);
  if (homeMetrics.navBottomGap < 24) throw new Error(`Telegram bottom nav should keep a 24px system-zone gap, got ${homeMetrics.navBottomGap}`);
  if (homeMetrics.todayBottomGap < 24) throw new Error(`Telegram today button should keep a 24px system-zone gap, got ${homeMetrics.todayBottomGap}`);
  if (homeMetrics.voiceBottomGap < 24) throw new Error(`Telegram voice button should keep a 24px system-zone gap, got ${homeMetrics.voiceBottomGap}`);
  if (homeMetrics.calendarBottomGap < 24) throw new Error(`Telegram calendar button should keep a 24px system-zone gap, got ${homeMetrics.calendarBottomGap}`);

  const visibleInnerGlobal = pageMetrics.filter((item) => item.globalNavVisible || !item.globalNavHiddenClass);
  if (visibleInnerGlobal.length) throw new Error(`legacy global nav visible on inner pages: ${JSON.stringify(visibleInnerGlobal)}`);
  const visibleInnerHomeNav = pageMetrics.filter((item) => item.homeNavVisible);
  if (visibleInnerHomeNav.length) throw new Error(`dashboard nav visible on inactive inner pages: ${JSON.stringify(visibleInnerHomeNav)}`);

  console.log('telegram bottom menu diagnostic smoke: PASS', JSON.stringify({ homeMetrics, pageMetrics, screenshotPath }));
} finally {
  await browser.close();
}
