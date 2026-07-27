import { chromium } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const vkUrl = pathToFileURL(path.join(root, 'vk.html')).href;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
await page.addInitScript(() => {
  window.__vkDoneCalls = [];
  window.fetch = async (url, options = {}) => {
    const action = options.headers?.['x-action'];
    if (options.method === 'POST' && action === 'done-task') {
      window.__vkDoneCalls.push(JSON.parse(options.body || '{}'));
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      });
    }
    if (String(url || '').includes('/tasks')) {
      return new Response(JSON.stringify({ tasks: [{ id: 'vk-keep', text: 'Keep active', done: false }] }), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      });
    }
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'content-type': 'application/json' }
    });
  };
});

try {
  await page.goto(vkUrl);
  await page.waitForFunction(() => typeof renderTasks === 'function' && typeof doneTask === 'function');
  await page.evaluate(() => {
    state.token = 'vk-task-actions-smoke-token';
    state.tasks = [
      { id: 'vk-done', text: 'Finish visible VK action', done: false },
      { id: 'vk-keep', text: 'Keep active', done: false }
    ];
    navigate('home');
    renderTasks();
  });

  const firstAction = page.locator('#taskList .task-done-action-vk').first();
  await firstAction.waitFor({ state: 'attached' });
  const before = await page.evaluate(() => {
    const btn = document.querySelector('#taskList .task-done-action-vk');
    const style = btn ? getComputedStyle(btn) : null;
    return {
      actionCount: document.querySelectorAll('#taskList .task-done-action-vk').length,
      label: btn?.textContent?.trim() || '',
      minWidth: style?.minWidth || '',
      height: style?.height || '',
      viewportWidth: window.innerWidth,
      deleteLikeSource: /delete-task|archive-task/i.test(document.documentElement.innerHTML)
    };
  });
  if (before.actionCount !== 2) throw new Error(`expected two visible fallback actions, got ${before.actionCount}`);
  if (before.label !== 'Готово') throw new Error(`expected button label Готово, got ${before.label}`);
  if (before.minWidth !== '74px' || before.height !== '34px') throw new Error(`VK action button sizing is unsafe: ${JSON.stringify(before)}`);
  if (before.deleteLikeSource) throw new Error('VK task actions smoke found destructive delete/archive action');

  await page.evaluate(() => document.querySelector('#taskList .task-done-action-vk')?.click());
  await page.waitForFunction(() => window.__vkDoneCalls.length === 1);
  await page.waitForFunction(() => !Array.from(document.querySelectorAll('#taskList .task-title')).some((el) => el.textContent.includes('Finish visible VK action')));
  const after = await page.evaluate(() => ({
    calls: window.__vkDoneCalls,
    remainingTitles: Array.from(document.querySelectorAll('#taskList .task-title')).map((el) => el.textContent.trim())
  }));
  if (after.calls[0]?.taskId !== 'vk-done') throw new Error(`unexpected done-task payload: ${JSON.stringify(after.calls)}`);
  if (!after.remainingTitles.includes('Keep active')) throw new Error(`remaining VK task missing: ${JSON.stringify(after)}`);

  console.log('VK task actions parity smoke: PASS', JSON.stringify({ before, after }));
} finally {
  await browser.close();
}
