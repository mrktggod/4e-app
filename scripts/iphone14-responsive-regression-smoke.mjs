import { chromium } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const indexUrl = pathToFileURL(path.join(root, 'index.html')).href;
const viewport = { width: 390, height: 844 };

const browser = await chromium.launch();
const page = await browser.newPage({ viewport, isMobile: true });
await page.addInitScript(() => {
  localStorage.setItem('chetam_onboarded', '1');
  localStorage.setItem('chetam_token', 'iphone14-smoke-token');
});

const smokeTasks = [
  {
    id: 'iphone14-long-title',
    text: 'Very long iPhone 14 responsive regression title that should wrap inside the task card and never escape the right edge',
    originalMsg: 'Long source description for task detail. It should stay readable while date, priority, status and reminder controls remain inside the card.',
    person: 'Misha',
    direction: 'outgoing',
    directionLabel: 'Work',
    priority: 'p1',
    deadline: new Date(Date.now() + 86400000).toISOString(),
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    tags: ['iphone14-responsive-long-tag']
  },
  {
    id: 'iphone14-overdue',
    text: 'Overdue mobile row check',
    person: 'Alexey',
    direction: 'outgoing',
    directionLabel: 'Personal',
    priority: 'p0',
    deadline: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'iphone14-done',
    text: 'Completed row for statistics',
    person: 'Codex',
    direction: 'outgoing',
    done: true,
    completedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString()
  }
];

function assertBounds(result, name, rect, width = viewport.width) {
  if (!rect) result.failures.push(`${name} missing`);
  else if (rect.left < -1 || rect.right > width + 1) {
    result.failures.push(`${name} escapes viewport: left=${rect.left}, right=${rect.right}`);
  }
}

try {
  await page.goto(indexUrl);
  await page.waitForFunction(() => typeof openTask === 'function' && typeof updateHomeDashboardList === 'function');
  await page.evaluate(tasks => {
    currentUser = { id: 'iphone14-smoke', email: 'iphone14-smoke@example.test' };
    chatId = 'iphone14-smoke-chat';
    allTasksCache = tasks;
    showScreen('home');
    updateHomeDashboardList({
      outgoing: tasks.filter(task => !task.done && task.direction !== 'incoming'),
      incoming: tasks.filter(task => !task.done && task.direction === 'incoming')
    });
    loadStats(
      tasks.filter(task => !task.done && task.direction !== 'incoming'),
      tasks.filter(task => task.done),
      tasks
    );
  }, smokeTasks);

  const metrics = { failures: [] };
  const homeMetrics = await page.evaluate(() => {
    const rect = selector => {
      const el = document.querySelector(selector);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height };
    };
    return {
      documentWidth: document.documentElement.scrollWidth,
      homeTaskRows: document.querySelectorAll('#home-task-list .home-ai-row-main').length,
      home: rect('#home'),
      hero: rect('#home .dash-hero'),
      metrics: rect('#home .dash-metrics'),
      firstRow: rect('#home-task-list .home-ai-row-main'),
      bottomNav: rect('#home .dash-bottom-nav'),
      centerButton: rect('#home-nav-voice')
    };
  });
  if (homeMetrics.documentWidth > viewport.width) metrics.failures.push(`home document overflow: ${homeMetrics.documentWidth}`);
  if (homeMetrics.homeTaskRows < 2) metrics.failures.push('home task rows did not render');
  for (const [name, rect] of Object.entries(homeMetrics)) {
    if (name !== 'documentWidth' && name !== 'homeTaskRows') assertBounds(metrics, `home ${name}`, rect);
  }

  await page.evaluate(task => openTask(task, 0), smokeTasks[0]);
  await page.locator('#task-detail.active .detail-redesign-hero').waitFor();
  const detailMetrics = await page.evaluate(() => {
    const rect = selector => {
      const el = document.querySelector(selector);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height };
    };
    const title = document.getElementById('detail-title');
    return {
      documentWidth: document.documentElement.scrollWidth,
      detail: rect('#task-detail'),
      scroll: rect('#task-detail .detail-redesign-scroll'),
      hero: rect('#task-detail .detail-redesign-hero'),
      title: rect('#detail-title'),
      desc: rect('#detail-description'),
      statusGrid: rect('#task-detail .detail-redesign-status-grid'),
      chatCard: rect('#task-detail .detail-chat-card'),
      titleScrollWidth: title?.scrollWidth || 0,
      titleClientWidth: title?.clientWidth || 0
    };
  });
  if (detailMetrics.documentWidth > viewport.width) metrics.failures.push(`task-detail document overflow: ${detailMetrics.documentWidth}`);
  for (const [name, rect] of Object.entries(detailMetrics)) {
    if (!['documentWidth', 'titleScrollWidth', 'titleClientWidth'].includes(name)) assertBounds(metrics, `detail ${name}`, rect);
  }
  if (detailMetrics.titleScrollWidth > detailMetrics.titleClientWidth + 1) metrics.failures.push('detail long title has horizontal text overflow');
  if (detailMetrics.statusGrid?.bottom > detailMetrics.hero?.top) metrics.failures.push('detail status grid should remain above hero');
  if (detailMetrics.chatCard?.top < detailMetrics.hero?.bottom - 1) metrics.failures.push('detail chat card overlaps hero');

  await page.locator('#task-detail .detail-info-card--date').click();
  await page.locator('#task-detail .detail-date-popover').waitFor({ state: 'visible' });
  const dateMetrics = await page.evaluate(() => {
    const pop = document.querySelector('#task-detail .detail-date-popover')?.getBoundingClientRect();
    const input = document.getElementById('detail-time-input')?.getBoundingClientRect();
    return {
      popover: pop && { left: pop.left, right: pop.right, top: pop.top, bottom: pop.bottom, width: pop.width, height: pop.height },
      input: input && { left: input.left, right: input.right, top: input.top, bottom: input.bottom, width: input.width, height: input.height }
    };
  });
  assertBounds(metrics, 'date popover', dateMetrics.popover);
  assertBounds(metrics, 'date input', dateMetrics.input);

  await page.evaluate(tasks => {
    showScreen('statistics');
    loadStats(
      tasks.filter(task => !task.done && task.direction !== 'incoming'),
      tasks.filter(task => task.done),
      tasks
    );
  }, smokeTasks);
  const statsMetrics = await page.evaluate(() => {
    const rect = selector => {
      const el = document.querySelector(selector);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height };
    };
    return {
      documentWidth: document.documentElement.scrollWidth,
      stats: rect('#statistics'),
      scroll: rect('#statistics .stats-scroll'),
      activeList: rect('#stat-tasks-list'),
      globalNav: rect('#global-nav')
    };
  });
  if (statsMetrics.documentWidth > viewport.width) metrics.failures.push(`statistics document overflow: ${statsMetrics.documentWidth}`);
  for (const [name, rect] of Object.entries(statsMetrics)) {
    if (name !== 'documentWidth') assertBounds(metrics, `statistics ${name}`, rect);
  }

  if (metrics.failures.length) {
    throw new Error(metrics.failures.join('\n'));
  }
  console.log('iphone14 responsive regression smoke: PASS', JSON.stringify({ homeMetrics, detailMetrics, dateMetrics, statsMetrics }));
} finally {
  await browser.close();
}
