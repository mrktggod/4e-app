import { chromium } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const indexUrl = pathToFileURL(path.join(root, 'index.html')).href;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
await page.addInitScript(() => {
  localStorage.setItem('chetam_onboarded', '1');
  localStorage.setItem('chetam_token', 'task-advice-smoke-token');
  window.__anthropicCalls = 0;
  window.fetch = async (url) => {
    const href = String(url || '');
    if (href.includes('/anthropic')) {
      window.__anthropicCalls += 1;
      await new Promise(resolve => setTimeout(resolve, 180));
      return new Response(JSON.stringify({ content: [{ text: 'Сначала уточни срок и следующий конкретный шаг.' }] }), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      });
    }
    return new Response(JSON.stringify({ ok: true, messages: [] }), {
      status: 200,
      headers: { 'content-type': 'application/json' }
    });
  };
});

try {
  await page.goto(indexUrl);
  await page.waitForFunction(() => typeof openTask === 'function' && typeof loadTaskAdvice === 'function');
  await page.evaluate(() => {
    currentUser = { id: 'task-advice-smoke', email: 'task-advice-smoke@example.test' };
    chatId = 'task-advice-smoke-chat';
    const task = {
      id: 'task-advice-smoke-task',
      text: 'Prepare task advice manual generation smoke',
      originalMsg: 'Need a useful advice only after explicit click.',
      person: 'Codex',
      deadline: '2026-07-29T12:00:00'
    };
    allTasksCache = [task];
    openTask(task, 0);
  });

  await page.locator('#task-detail.active #detail-ai-advice').waitFor();
  await page.waitForTimeout(700);
  const beforeClick = await page.evaluate(() => ({
    anthropicCalls: window.__anthropicCalls,
    adviceText: document.getElementById('detail-ai-advice')?.textContent || '',
    hasLoader: Boolean(document.querySelector('#detail-ai-advice .dots'))
  }));
  if (beforeClick.anthropicCalls !== 0) throw new Error(`advice auto-called /anthropic ${beforeClick.anthropicCalls} times`);
  if (beforeClick.hasLoader) throw new Error('advice loader appeared before explicit click');
  if (!beforeClick.adviceText.includes('Совет 4')) throw new Error('manual advice placeholder missing before click');

  await page.locator('#detail-load-advice-btn').scrollIntoViewIfNeeded();
  await page.locator('#detail-load-advice-btn').click();
  await page.locator('#detail-ai-advice .dots').waitFor();
  await page.waitForFunction(() => window.__anthropicCalls === 1);
  await page.waitForFunction(() => document.getElementById('detail-ai-advice')?.textContent.includes('следующий конкретный шаг'));

  const afterClick = await page.evaluate(() => ({
    anthropicCalls: window.__anthropicCalls,
    adviceText: document.getElementById('detail-ai-advice')?.textContent || ''
  }));
  if (afterClick.anthropicCalls !== 1) throw new Error(`manual click expected one advice call, got ${afterClick.anthropicCalls}`);

  console.log('task advice manual smoke: PASS', JSON.stringify({ beforeClick, afterClick }));
} finally {
  await browser.close();
}
