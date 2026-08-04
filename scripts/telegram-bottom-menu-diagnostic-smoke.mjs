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
    { id: 'bottom-nav-2', text: 'Confirm inner pages hide old menu', direction: 'incoming', person: 'Yuri', deadline: '2026-07-28T18:00:00' },
    { id: 'bottom-nav-3', text: 'Keep the third dashboard task visible', direction: 'outgoing', deadline: '2026-07-29T12:00:00' },
    { id: 'bottom-nav-4', text: 'Scroll to the fourth dashboard task', direction: 'incoming', person: 'Yuri', deadline: '2026-07-30T12:00:00' },
    { id: 'bottom-nav-5', text: 'Scroll to the fifth dashboard task', direction: 'outgoing', deadline: '2026-07-31T12:00:00' },
    { id: 'bottom-nav-6', text: 'Reach the final dashboard task', direction: 'incoming', person: 'Yuri', deadline: '2026-08-01T12:00:00' }
  ];
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 725 }, isMobile: true });
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
  await page.waitForFunction(() => document.querySelectorAll('#home-task-list .home-ai-row-main').length >= 6);
  await fs.mkdir(path.dirname(screenshotPath), { recursive: true });
  await page.screenshot({ path: screenshotPath, fullPage: false });

  const homeMetrics = await page.evaluate(({ homeNav, globalNav }) => {
    const nav = document.querySelector('#home .dash-bottom-nav');
    const navRect = nav?.getBoundingClientRect();
    const taskListRect = document.querySelector('#home-task-list')?.getBoundingClientRect();
    const taskRows = Array.from(document.querySelectorAll('#home-task-list .home-ai-row-main'));
    const thirdTaskRect = taskRows[2]?.getBoundingClientRect();
    const controlMetrics = selector => {
      const rect = document.querySelector(selector)?.getBoundingClientRect();
      return rect && navRect ? {
        bottomGap: window.innerHeight - rect.bottom,
        topInset: rect.top - navRect.top,
        bottomInset: navRect.bottom - rect.bottom
      } : null;
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
      taskLane: taskListRect && thirdTaskRect && navRect ? {
        listTop: taskListRect.top,
        listBottom: taskListRect.bottom,
        thirdTaskTop: thirdTaskRect.top,
        thirdTaskBottom: thirdTaskRect.bottom,
        gapBeforeMenu: navRect.top - thirdTaskRect.bottom,
        scrollHeight: document.querySelector('#home-task-list')?.scrollHeight || 0,
        clientHeight: document.querySelector('#home-task-list')?.clientHeight || 0,
        rowBounds: taskRows.map((row) => {
          const rect = row.getBoundingClientRect();
          return { top: rect.top, bottom: rect.bottom };
        })
      } : null,
      today: controlMetrics('#home-nav-today'),
      voice: controlMetrics('#home-nav-voice'),
      calendar: controlMetrics('#home-nav-cal')
    };
  }, {
    homeNav: readVisibility('#home .dash-bottom-nav'),
    globalNav: readVisibility('#global-nav')
  });

  const scrollMetrics = await page.evaluate(() => {
    const list = document.querySelector('#home-task-list');
    const navRect = document.querySelector('#home .dash-bottom-nav')?.getBoundingClientRect();
    const lastTaskRect = Array.from(document.querySelectorAll('#home-task-list .home-ai-row-main')).at(-1)?.getBoundingClientRect();
    const listRect = list?.getBoundingClientRect();
    if (list) list.scrollTop = list.scrollHeight;
    const scrolledLastTaskRect = Array.from(document.querySelectorAll('#home-task-list .home-ai-row-main')).at(-1)?.getBoundingClientRect();
    return {
      scrollTop: list?.scrollTop || 0,
      listTop: listRect?.top ?? -1,
      listBottom: listRect?.bottom ?? -1,
      lastTaskBottom: scrolledLastTaskRect?.bottom ?? lastTaskRect?.bottom ?? -1,
      gapBeforeMenu: navRect && scrolledLastTaskRect ? navRect.top - scrolledLastTaskRect.bottom : -1
    };
  });

  const dashboardCollapse = await page.evaluate(async () => {
    const list = document.querySelector('#home-task-list');
    const hero = document.querySelector('#home .dash-hero');
    const metrics = document.querySelector('#home .dash-metrics');
    if (!list || !hero || !metrics) return null;
    list.scrollTop = 0;
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const dispatchTouch = (type, y) => list.dispatchEvent(new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      pointerId: 414,
      pointerType: 'touch',
      clientX: 180,
      clientY: y
    }));
    dispatchTouch('pointerdown', 200);
    dispatchTouch('pointermove', 380);
    dispatchTouch('pointerup', 380);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const expanded = {
      heroTop: hero.getBoundingClientRect().top,
      heroOpacity: Number(getComputedStyle(hero).opacity),
      metricsTop: metrics.getBoundingClientRect().top,
      taskListTop: list.getBoundingClientRect().top
    };
    list.scrollTop = 160;
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const collapsed = {
      heroBottom: hero.getBoundingClientRect().bottom,
      heroOpacity: Number(getComputedStyle(hero).opacity),
      metricsTop: metrics.getBoundingClientRect().top,
      taskListTop: list.getBoundingClientRect().top,
      classApplied: document.getElementById('home')?.classList.contains('dashboard-list-scrolled') || false
    };
    return { expanded, collapsed };
  });

  const swipeMetrics = await page.evaluate(() => {
    const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'showPicker');
    let pickerRequests = 0;
    Object.defineProperty(HTMLInputElement.prototype, 'showPicker', {
      configurable: true,
      value() { pickerRequests += 1; }
    });
    try {
      const card = document.querySelector('#home-task-list .home-ai-row');
      const shell = card?.closest('.task-card-shell');
      const rect = card?.getBoundingClientRect();
      if (!card || !shell || !rect) return { pickerRequests, taskId: '', moveActionOpenedPicker: false };
      const pointer = (x) => ({ pointerType: 'touch', clientX: x, clientY: rect.top + 20, preventDefault() {} });
      taskSwipeStart(pointer(rect.left + 180), card);
      taskSwipeMove(pointer(rect.left + 120), card);
      taskSwipeEnd(pointer(rect.left + 120), card);
      const input = document.getElementById('task-reschedule-picker');
      const taskId = input?.dataset.taskId || '';
      const beforeMoveAction = pickerRequests;
      const moveButton = shell.querySelector('.task-swipe-move');
      if (moveButton?.dataset.feedbackLocked === '1') delete moveButton.dataset.feedbackLocked;
      moveButton?.click();
      return { pickerRequests, taskId, moveActionOpenedPicker: pickerRequests > beforeMoveAction };
    } finally {
      if (descriptor) Object.defineProperty(HTMLInputElement.prototype, 'showPicker', descriptor);
      else delete HTMLInputElement.prototype.showPicker;
    }
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
  if (homeMetrics.navBottomGap < 32) throw new Error(`Telegram bottom nav should keep a 32px system-zone gap, got ${homeMetrics.navBottomGap}`);
  if (!homeMetrics.taskLane || homeMetrics.taskLane.thirdTaskBottom > homeMetrics.taskLane.listBottom + 1 || homeMetrics.taskLane.gapBeforeMenu < 8) {
    throw new Error(`Telegram dashboard task lane must keep the first three tasks clear of the menu: ${JSON.stringify(homeMetrics.taskLane)}`);
  }
  if (homeMetrics.taskLane.scrollHeight <= homeMetrics.taskLane.clientHeight) {
    throw new Error(`Telegram dashboard task lane should scroll when there are six tasks: ${JSON.stringify(homeMetrics.taskLane)}`);
  }
  if (scrollMetrics.scrollTop <= 0 || scrollMetrics.lastTaskBottom > scrollMetrics.listBottom + 1 || scrollMetrics.gapBeforeMenu < 8) {
    throw new Error(`Telegram dashboard task lane should reveal the final task after scrolling: ${JSON.stringify(scrollMetrics)}`);
  }
  if (!dashboardCollapse || dashboardCollapse.collapsed.heroOpacity > .05 || dashboardCollapse.collapsed.heroBottom > 1 || dashboardCollapse.collapsed.metricsTop > 20 || dashboardCollapse.collapsed.taskListTop > 80 || !dashboardCollapse.collapsed.classApplied) {
    throw new Error(`Telegram dashboard scroll should collapse the focus card and pin metrics: ${JSON.stringify(dashboardCollapse)}`);
  }
  if (dashboardCollapse.expanded.heroOpacity < .95 || dashboardCollapse.expanded.metricsTop < 200 || dashboardCollapse.expanded.taskListTop < 300) {
    throw new Error(`Telegram dashboard scroll should restore the focus card at the top of the task list: ${JSON.stringify(dashboardCollapse)}`);
  }
  if (swipeMetrics.pickerRequests < 2 || swipeMetrics.taskId !== 'bottom-nav-1' || !swipeMetrics.moveActionOpenedPicker) {
    throw new Error(`Telegram left swipe should open the date picker for its task: ${JSON.stringify(swipeMetrics)}`);
  }
  for (const [name, control] of Object.entries({ today: homeMetrics.today, voice: homeMetrics.voice, calendar: homeMetrics.calendar })) {
    if (!control) throw new Error(`Telegram ${name} control is missing`);
    if (control.bottomGap < 32) throw new Error(`Telegram ${name} control should keep a 32px system-zone gap, got ${control.bottomGap}`);
    if (control.topInset < -1 || control.bottomInset < -1) throw new Error(`Telegram ${name} control must stay inside the menu: ${JSON.stringify(control)}`);
  }

  const visibleInnerGlobal = pageMetrics.filter((item) => item.globalNavVisible || !item.globalNavHiddenClass);
  if (visibleInnerGlobal.length) throw new Error(`legacy global nav visible on inner pages: ${JSON.stringify(visibleInnerGlobal)}`);
  const visibleInnerHomeNav = pageMetrics.filter((item) => item.homeNavVisible);
  if (visibleInnerHomeNav.length) throw new Error(`dashboard nav visible on inactive inner pages: ${JSON.stringify(visibleInnerHomeNav)}`);

  console.log('telegram bottom menu diagnostic smoke: PASS', JSON.stringify({ homeMetrics, scrollMetrics, dashboardCollapse, swipeMetrics, pageMetrics, screenshotPath }));
} finally {
  await browser.close();
}
