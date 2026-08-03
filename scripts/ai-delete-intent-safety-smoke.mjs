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
    window.__aiDeleteFetches = [];
    window.fetch = async (url, options = {}) => {
      window.__aiDeleteFetches.push({ url: String(url), method: options.method || 'GET' });
      return new Response(JSON.stringify({ ok: true, tasks: [] }), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      });
    };
  });

  await page.goto(pathToFileURL(path.join(root, 'index.html')).href);
  await page.waitForSelector('#ask-field', { state: 'attached' });

  const result = await page.evaluate(async () => {
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    window.__taskChatMutations = [];
    postTaskChatMutation = async (actionName, payload) => {
      window.__taskChatMutations.push({ actionName, payload });
      return { ok: true };
    };
    loadTasks = async () => {};
    checkTrial = () => true;
    chatId = 'ai-delete-intent-smoke';
    allTasksCache = [
      { id: 'task-delete-1', text: 'Smoke active task one', done: false, status: 'active' },
      { id: 'task-delete-2', text: 'Smoke active task two', done: false, status: 'active' }
    ];

    showScreen('ask');
    document.getElementById('ask-field').value = '\u0443\u0434\u0430\u043b\u0438 \u0432\u0441\u0435 \u0437\u0430\u0434\u0430\u0447\u0438';
    await sendAsk();
    await wait(100);

    const destructiveResult = {
      anthropicCalls: window.__aiDeleteFetches.filter(item => item.url.includes('/anthropic')).length,
      mutations: window.__taskChatMutations.slice(),
      taskDone: allTasksCache.some(task => task.done || task.status === 'done'),
      assistantText: document.getElementById('ask-msgs')?.textContent || ''
    };

    window.__taskChatMutations = [];
    askHistory = [
      { id: 'user-delete-old', role: 'user', content: '\u0443\u0434\u0430\u043b\u0438 \u0437\u0430\u0434\u0430\u0447\u0443 Smoke active task one' },
      {
        id: 'assistant-old-action',
        role: 'assistant',
        content: '\u0413\u043e\u0442\u043e\u0432\u043e.',
        actions: [{ type: 'complete', taskId: 'task-delete-1' }]
      }
    ];
    await confirmAskActions('assistant-old-action');
    await wait(100);

    return {
      ok: destructiveResult.anthropicCalls === 0
        && destructiveResult.mutations.length === 0
        && destructiveResult.taskDone === false
        && destructiveResult.assistantText.includes('\u0431\u0435\u0437 \u044f\u0432\u043d\u043e\u0433\u043e \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0438\u044f')
        && window.__taskChatMutations.length === 0
        && !allTasksCache.some(task => task.done || task.status === 'done'),
      destructiveResult,
      oldActionMutations: window.__taskChatMutations
    };
  });

  if (!result.ok) {
    throw new Error(`AI delete intent safety smoke failed: ${JSON.stringify(result)}`);
  }

  console.log(JSON.stringify({ smoke: 'ai-delete-intent-safety', viewport: '390x844', ...result }, null, 2));
} finally {
  await browser.close();
}
