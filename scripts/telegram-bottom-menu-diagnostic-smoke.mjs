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
    const taskList = document.querySelector('#home-task-list');
    const taskListRect = taskList?.getBoundingClientRect();
    const taskListStyle = taskList ? getComputedStyle(taskList) : null;
    const taskRows = Array.from(document.querySelectorAll('#home-task-list .home-ai-row-main'));
    const thirdTaskRect = taskRows[2]?.getBoundingClientRect();
    const controlMetrics = selector => {
      const control = document.querySelector(selector);
      const rect = control?.getBoundingClientRect();
      return rect && navRect ? {
        bottomGap: window.innerHeight - rect.bottom,
        topInset: rect.top - navRect.top,
        bottomInset: navRect.bottom - rect.bottom,
        width: rect.width,
        height: rect.height,
        backgroundImage: getComputedStyle(control).backgroundImage
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
        navTop: navRect.top,
        thirdTaskTop: thirdTaskRect.top,
        thirdTaskBottom: thirdTaskRect.bottom,
        gapBeforeMenu: navRect.top - thirdTaskRect.bottom,
        scrollHeight: taskList?.scrollHeight || 0,
        clientHeight: taskList?.clientHeight || 0,
        topMask: document.querySelector('#home .dashboard-scroll-mask--top')?.getBoundingClientRect().height || 0,
        bottomMaskTop: document.querySelector('#home .dashboard-scroll-mask--bottom')?.getBoundingClientRect().top || -1,
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

  const pressFeedbackMetrics = await page.evaluate(() => {
    const nav = document.querySelector('#home .dash-bottom-nav');
    const center = document.querySelector('#home-nav-voice');
    const today = document.querySelector('#home-nav-today');
    if (!nav || !center || !today) return null;
    const press = (node) => {
      node.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch' }));
      return node.classList.contains('qa-press-glow');
    };
    return {
      centerGlowAfterPress: press(center),
      todayGlowAfterPress: press(today),
      centerFilter: getComputedStyle(center).filter,
      navFilter: getComputedStyle(nav).filter
    };
  });

  const scrollMetrics = await page.evaluate(async () => {
    const home = document.getElementById('home');
    const navRect = document.querySelector('#home .dash-bottom-nav')?.getBoundingClientRect();
    if (home) home.scrollTop = home.scrollHeight;
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const scrolledLastTaskRect = Array.from(document.querySelectorAll('#home-task-list .home-ai-row-main')).at(-1)?.getBoundingClientRect();
    return {
      scrollTop: home?.scrollTop || 0,
      scrollHeight: home?.scrollHeight || 0,
      clientHeight: home?.clientHeight || 0,
      lastTaskBottom: scrolledLastTaskRect?.bottom ?? -1,
      gapBeforeMenu: navRect && scrolledLastTaskRect ? navRect.top - scrolledLastTaskRect.bottom : -1
    };
  });

  const dashboardCollapse = await page.evaluate(async () => {
    const home = document.getElementById('home');
    const list = document.querySelector('#home-task-list');
    const header = document.querySelector('#home .dash-header');
    const hero = document.querySelector('#home .dash-hero');
    const metrics = document.querySelector('#home .dash-metrics');
    if (!home || !list || !header || !hero || !metrics) return null;
    home.scrollTop = 0;
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const expandedListRect = list.getBoundingClientRect();
    const expanded = {
      headerTop: header.getBoundingClientRect().top,
      heroTop: hero.getBoundingClientRect().top,
      heroOpacity: Number(getComputedStyle(hero).opacity),
      metricsTop: metrics.getBoundingClientRect().top,
      taskListTop: expandedListRect.top,
      taskListBottom: expandedListRect.bottom
    };
    home.scrollTop = 280;
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const collapsedListRect = list.getBoundingClientRect();
    const collapsed = {
      headerTop: header.getBoundingClientRect().top,
      headerBottom: header.getBoundingClientRect().bottom,
      heroBottom: hero.getBoundingClientRect().bottom,
      heroOpacity: Number(getComputedStyle(hero).opacity),
      metricsTop: metrics.getBoundingClientRect().top,
      taskListTop: collapsedListRect.top,
      taskListBottom: collapsedListRect.bottom,
      rootScrollTop: home.scrollTop,
      topMaskHeight: document.querySelector('#home .dashboard-scroll-mask--top')?.getBoundingClientRect().height || 0,
      bottomMaskTop: document.querySelector('#home .dashboard-scroll-mask--bottom')?.getBoundingClientRect().top || -1
    };
    home.scrollTop = 0;
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

  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    showScreen('home');
  });
  await page.waitForFunction(() => document.querySelector('#home.active .dash-bottom-nav'));
  const uploadedAvatarUrl = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 10 10%22%3E%3Crect width=%2210%22 height=%2210%22 fill=%22%236f9d3f%22/%3E%3C/svg%3E';
  await page.evaluate((avatarUrl) => {
    if (typeof currentUser !== 'undefined' && currentUser) currentUser.photoDataUrl = avatarUrl;
    applyUserInfo();
  }, uploadedAvatarUrl);
  const lightTelegramMetrics = await page.evaluate(() => {
    const rect = (selector) => document.querySelector(selector)?.getBoundingClientRect();
    const nav = rect('#home .dash-bottom-nav');
    const metrics = rect('#home .dash-metrics');
    const centerNode = document.querySelector('#home .dash-center-button');
    const center = centerNode?.getBoundingClientRect();
    const today = rect('#home-nav-today');
    const calendar = rect('#home-nav-cal');
    const task = rect('#home-task-list .home-ai-row-main');
    const avatar = document.querySelector('#user-avatar-small');
    const profileAvatar = document.querySelector('#profile .profile-avatar');
    return {
      theme: document.documentElement.getAttribute('data-theme') || '',
      navHeight: nav?.height ?? -1,
      navBottomGap: nav ? window.innerHeight-nav.bottom : -1,
      metricsHeight: metrics?.height ?? -1,
      centerWidth: center?.width ?? -1,
      centerHeight: center?.height ?? -1,
      centerTopInset: nav && center ? center.top - nav.top : -1,
      centerBottomInset: nav && center ? nav.bottom - center.bottom : -1,
      centerBackgroundImage: centerNode ? getComputedStyle(centerNode).backgroundImage : '',
      avatarBackgroundImage: avatar ? getComputedStyle(avatar).backgroundImage : '',
      avatarUserPhoto: avatar?.dataset.userAvatar === 'true',
      avatarFallbackImageVisible: avatar?.querySelector('img') ? getComputedStyle(avatar.querySelector('img')).display !== 'none' : false,
      profileAvatarBackgroundImage: profileAvatar ? getComputedStyle(profileAvatar).backgroundImage : '',
      profileAvatarUserPhoto: profileAvatar?.dataset.userAvatar === 'true',
      todayTopInset: nav && today ? today.top - nav.top : -1,
      calendarTopInset: nav && calendar ? calendar.top - nav.top : -1,
      taskHeight: task?.height ?? -1
    };
  });

  if (homeMetrics.theme !== 'dark') throw new Error(`expected dark theme, got ${homeMetrics.theme}`);
  if (homeMetrics.surface !== 'telegram') throw new Error(`expected Telegram surface, got ${homeMetrics.surface}`);
  if (!homeMetrics.homeNavVisible) throw new Error('dashboard dark bottom nav is not visible');
  if (homeMetrics.globalNavVisible) throw new Error('legacy global nav is visible on dashboard');
  if (homeMetrics.dashNavButtons !== 3) throw new Error(`dashboard bottom nav should have 3 buttons, got ${homeMetrics.dashNavButtons}`);
  if (homeMetrics.globalNavCount !== 1) throw new Error(`expected one legacy global nav source node, got ${homeMetrics.globalNavCount}`);
  if (homeMetrics.dashBottomNavCount !== 1) throw new Error(`expected one dashboard bottom nav source node, got ${homeMetrics.dashBottomNavCount}`);
  if (homeMetrics.navBottomGap < 32) throw new Error(`Telegram bottom nav should keep a 32px system-zone gap, got ${homeMetrics.navBottomGap}`);
  if (!homeMetrics.voice?.backgroundImage.includes('dark-chat-button-orb.png')) {
    throw new Error(`Telegram dark dashboard should use the supplied glass centre control: ${JSON.stringify(homeMetrics.voice)}`);
  }
  if (homeMetrics.voice.width !== 62 || homeMetrics.voice.height !== 62) {
    throw new Error(`Telegram dark dashboard centre control should be visibly sized inside the rail: ${JSON.stringify(homeMetrics.voice)}`);
  }
  if (!pressFeedbackMetrics || pressFeedbackMetrics.centerGlowAfterPress || pressFeedbackMetrics.todayGlowAfterPress || pressFeedbackMetrics.centerFilter !== 'none' || pressFeedbackMetrics.navFilter !== 'none') {
    throw new Error(`Telegram dashboard controls must never paint a rectangular press glow: ${JSON.stringify(pressFeedbackMetrics)}`);
  }
  if (!homeMetrics.taskLane || homeMetrics.taskLane.thirdTaskBottom > homeMetrics.taskLane.listBottom + 1 || homeMetrics.taskLane.gapBeforeMenu < 8) {
    throw new Error(`Telegram dashboard task lane must keep the first three tasks clear of the menu: ${JSON.stringify(homeMetrics.taskLane)}`);
  }
  if (homeMetrics.taskLane.scrollHeight !== homeMetrics.taskLane.clientHeight) {
    throw new Error(`Telegram dashboard task lane must not keep its own scroll surface: ${JSON.stringify(homeMetrics.taskLane)}`);
  }
  if (homeMetrics.taskLane.bottomMaskTop < 0 || Math.abs(homeMetrics.taskLane.bottomMaskTop - homeMetrics.taskLane.navTop) > 2) {
    throw new Error(`Telegram dashboard should keep a fixed mask at the lower menu: ${JSON.stringify(homeMetrics.taskLane)}`);
  }
  if (scrollMetrics.scrollTop <= 0 || scrollMetrics.scrollHeight <= scrollMetrics.clientHeight || scrollMetrics.gapBeforeMenu < 8 || scrollMetrics.gapBeforeMenu > 112) {
    throw new Error(`Telegram dashboard root should reveal the final task after scrolling: ${JSON.stringify(scrollMetrics)}`);
  }
  if (!dashboardCollapse || dashboardCollapse.collapsed.heroOpacity < .95 || dashboardCollapse.collapsed.heroBottom > 1 || dashboardCollapse.collapsed.headerTop > 20 || dashboardCollapse.collapsed.headerBottom > dashboardCollapse.collapsed.metricsTop + 1 || dashboardCollapse.collapsed.metricsTop < 55 || dashboardCollapse.collapsed.metricsTop > 75 || dashboardCollapse.collapsed.taskListTop > 130 || dashboardCollapse.collapsed.rootScrollTop <= 0 || dashboardCollapse.collapsed.topMaskHeight < 100 || dashboardCollapse.collapsed.bottomMaskTop < 0) {
    throw new Error(`Telegram dashboard root scroll should keep the header above pinned metrics: ${JSON.stringify(dashboardCollapse)}`);
  }
  if (dashboardCollapse.expanded.headerTop < 0 || dashboardCollapse.expanded.heroOpacity < .95 || dashboardCollapse.expanded.metricsTop < 200 || dashboardCollapse.expanded.taskListTop < 300) {
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
  if (lightTelegramMetrics.theme !== 'light' || lightTelegramMetrics.metricsHeight !== 48 || lightTelegramMetrics.navHeight !== 66 || lightTelegramMetrics.navBottomGap < 32 || lightTelegramMetrics.centerWidth !== 62 || lightTelegramMetrics.centerHeight !== 62 || lightTelegramMetrics.centerTopInset < 1 || lightTelegramMetrics.centerBottomInset < 1 || Math.abs(lightTelegramMetrics.todayTopInset - lightTelegramMetrics.calendarTopInset) > 1 || !lightTelegramMetrics.centerBackgroundImage.includes('dashboard-light-center-20260806.png') || !lightTelegramMetrics.avatarUserPhoto || !lightTelegramMetrics.avatarBackgroundImage.includes('data:image/svg+xml') || lightTelegramMetrics.avatarBackgroundImage.includes('dashboard-light-avatar.png') || lightTelegramMetrics.avatarFallbackImageVisible || !lightTelegramMetrics.profileAvatarUserPhoto || !lightTelegramMetrics.profileAvatarBackgroundImage.includes('data:image/svg+xml') || lightTelegramMetrics.taskHeight !== 72) {
    throw new Error(`Telegram light dashboard should match compact dark-mode geometry: ${JSON.stringify(lightTelegramMetrics)}`);
  }

  console.log('telegram bottom menu diagnostic smoke: PASS', JSON.stringify({ homeMetrics, pressFeedbackMetrics, scrollMetrics, dashboardCollapse, swipeMetrics, pageMetrics, lightTelegramMetrics, screenshotPath }));
} finally {
  await browser.close();
}
