import { chromium } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const executablePath = process.env.CHROME_PATH || process.env.BROWSER_PATH;

const browser = await chromium.launch({
  headless: true,
  ...(executablePath ? { executablePath } : {})
});

try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
  await page.addInitScript(() => {
    localStorage.setItem('chetam_onboarded', '1');
    localStorage.setItem('chetam_token', 'smoke-token');
    window.fetch = async () => new Response(JSON.stringify({ ok: true, tasks: [] }), {
      status: 200,
      headers: { 'content-type': 'application/json' }
    });
  });

  await page.goto(pathToFileURL(path.join(root, 'index.html')).href);
  await page.waitForSelector('#task-detail', { state: 'attached' });

  const result = await page.evaluate(async () => {
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    window.__taskChatMutations = [];
    postTaskChatMutation = async (actionName, payload) => {
      window.__taskChatMutations.push({ actionName, payload });
      if (payload?.updates && currentDetailTask) {
        Object.assign(currentDetailTask, payload.updates);
      }
      if (payload?.updates && Array.isArray(allTasksCache) && allTasksCache[0]) {
        Object.assign(allTasksCache[0], payload.updates);
      }
      return { ok: true };
    };
    loadTasks = async () => {};
    loadTaskChat = async () => {};

    chatId = 'task-chat-confirm-smoke';
    const task = {
      id: 'task-chat-confirm-task',
      text: 'Confirm suggested action smoke',
      originalMsg: 'Before confirm',
      status: 'active',
      priority: 'normal'
    };
    allTasksCache = [task];
    openTask(task, 0);
    currentTaskMessages = [{
      role: 'assistant',
      content: 'Готов обновить описание.',
      actions: [{ type: 'edit', field: 'originalMsg', value: 'Updated by task chat confirm' }],
      ts: Date.now()
    }];
    renderTaskChatMessages();
    await wait(50);

    const button = document.querySelector('#detail-comments-list .ask-action-btn--primary');
    if (!button) return { ok: false, reason: 'confirm button missing' };
    button.click();
    await wait(200);

    const secondButton = document.querySelector('#detail-comments-list .ask-action-btn--primary');
    return {
      ok: window.__taskChatMutations.length === 1
        && window.__taskChatMutations[0].actionName === 'update-task'
        && window.__taskChatMutations[0].payload?.updates?.originalMsg === 'Updated by task chat confirm'
        && !secondButton,
      mutations: window.__taskChatMutations,
      previewStillVisible: Boolean(secondButton),
      description: document.getElementById('detail-description')?.value || ''
    };
  });

  if (!result.ok) {
    throw new Error(`task chat confirm smoke failed: ${JSON.stringify(result)}`);
  }

  console.log(JSON.stringify({ smoke: 'task-chat-confirm-action', viewport: '390x844', ...result }, null, 2));
} finally {
  await browser.close();
}
