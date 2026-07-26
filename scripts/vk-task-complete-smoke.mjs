import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync('vk.html', 'utf8');
const start = source.indexOf('async function loadTasks');
const end = source.indexOf('const HOME_PRIORITY_WEIGHTS', start);
assert.ok(start > 0 && end > start, 'VK task completion slice not found');

async function runScenario({ postResponse, getResponse }) {
  const calls = [];
  const toasts = [];
  const sandbox = {
    Date,
    Array,
    String,
    WORKER: 'https://worker.test',
    state: {
      token: 'vk-token',
      tasks: [
        { id: 'done-me', title: 'Finish from VK', done: false },
        { id: 'keep-me', title: 'Keep active', done: false },
      ],
    },
    fetch: async (url, options = {}) => {
      calls.push({ url, options });
      if (options.method === 'POST') return postResponse;
      return getResponse;
    },
    renderTasks() {},
    buildStats() {},
    showToast(message) { toasts.push(message); },
  };

  vm.createContext(sandbox);
  vm.runInContext(source.slice(start, end), sandbox, { filename: 'vk-task-complete-slice.js' });
  const result = await vm.runInContext("doneTask('done-me')", sandbox);
  return { calls, toasts, state: sandbox.state, result };
}

const success = await runScenario({
  postResponse: { ok: true, json: async () => ({ ok: true }) },
  getResponse: { ok: true, json: async () => ({ tasks: [{ id: 'keep-me', title: 'Keep active', done: false }] }) },
});

assert.equal(success.result, true);
assert.equal(success.calls[0].options.headers['x-action'], 'done-task');
assert.equal(success.calls[0].options.headers['x-token'], 'vk-token');
assert.deepEqual(JSON.parse(success.calls[0].options.body), { taskId: 'done-me' });
assert.deepEqual(success.state.tasks.map((task) => task.id), ['keep-me']);
assert.deepEqual(success.toasts, ['Готово']);

const failure = await runScenario({
  postResponse: { ok: false, json: async () => ({ ok: false, error: 'not allowed' }) },
  getResponse: { ok: true, json: async () => ({ tasks: [] }) },
});

assert.equal(failure.result, false);
assert.equal(failure.calls.length, 1);
assert.equal(failure.state.tasks.find((task) => task.id === 'done-me').done, false);
assert.deepEqual(failure.toasts, ['Не удалось завершить задачу']);

console.log('VK task complete smoke: PASS');
