import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync('vk.html', 'utf8');
const start = source.indexOf('function localDateKey');
const end = source.indexOf('async function sendTaskDiscussion', start);
assert.ok(start > 0 && end > start, 'VK AI chat parity slice not found');

const elements = new Map();
function element(id) {
  if (!elements.has(id)) {
    elements.set(id, {
      id,
      value: '',
      textContent: '',
      disabled: false,
      dataset: {},
      addEventListener() {},
      classList: { add() {}, remove() {}, toggle() {} },
    });
  }
  return elements.get(id);
}

const calls = [];
const task = {
  id: 'task-1',
  text: 'Old title',
  title: 'Old title',
  status: 'active',
  priority: 'normal',
  deadline: '',
  done: false,
};

const sandbox = {
  Date,
  Math,
  Number,
  String,
  Boolean,
  JSON,
  RegExp,
  console,
  WORKER: 'https://worker.test',
  state: {
    token: 'vk-token',
    user: { id: 'user-1' },
    tasks: [task],
    currentTask: task,
    currentScreen: 'ask',
    taskDetailReturnScreen: 'home',
  },
  document: {
    getElementById: element,
    querySelector() { return { classList: { add() {}, remove() {}, toggle() {} } }; },
    querySelectorAll() { return []; },
  },
  localStorage: { getItem() { return '[]'; }, setItem() {} },
  async fetch(url, options = {}) {
    const parsed = options.body ? JSON.parse(options.body) : {};
    calls.push({ url, options, body: parsed });
    return { ok: true, status: 200, async json() { return { ok: true, task: parsed.task, tasks: sandbox.state.tasks }; } };
  },
  async readJsonSafe(response) {
    return response.json();
  },
  renderTasks() { sandbox.rendered = true; },
  buildStats() { sandbox.statsBuilt = true; },
  buildCalendar() { sandbox.calendarBuilt = true; },
  loadTasks() { sandbox.loaded = true; sandbox.state.tasks = [task]; },
  showToast(message) { sandbox.lastToast = message; },
  navigate(id) { sandbox.navigated = id; },
  setButtonBusy() {},
};

vm.createContext(sandbox);
vm.runInContext(source.slice(start, end), sandbox, { filename: 'vk-ai-chat-parity-slice.js' });

await vm.runInContext("maybeSaveTaskFromChat('добавь задачу проверить договор завтра')", sandbox);
const directTask = calls.at(-1).body.task;
assert.equal(calls.at(-1).options.headers['x-action'], 'save-task');
assert.equal(calls.at(-1).options.headers['x-token'], 'vk-token');
assert.equal(directTask.originalMsg, 'добавь задачу проверить договор завтра');
assert.equal(directTask.description, 'добавь задачу проверить договор завтра');
assert.equal(directTask.deadline, vm.runInContext("taskDeadlineDateKey('завтра')", sandbox));

await vm.runInContext(`handleVkAiStructuredTags('Готово <create_task>{"text":"Сделать презентацию","person":"Алексей","deadline":"2026-08-01","description":"Добавить финансы","originalMsg":"Сделай презентацию для совета"}</create_task>', 'Сделай презентацию для совета', false)`, sandbox);
const aiCreated = calls.at(-1).body.task;
assert.equal(calls.at(-1).options.headers['x-action'], 'save-task');
assert.equal(aiCreated.text, 'Сделать презентацию');
assert.equal(aiCreated.person, 'Алексей');
assert.equal(aiCreated.deadline, '2026-08-01');
assert.equal(aiCreated.description, 'Добавить финансы');
assert.equal(aiCreated.originalMsg, 'Сделай презентацию для совета');
assert.equal(sandbox.state.tasks.some((item) => item.id === aiCreated.id), true, 'saved AI task stays visible when the immediate task refresh is stale');

const structured = await vm.runInContext(`handleVkAiStructuredTags('Исправил <task_actions>[{"type":"edit","taskId":"task-1","field":"originalMsg","value":"Новое описание"}]</task_actions>', 'измени описание', true)`, sandbox);
const actionCall = calls.at(-1);
assert.equal(structured.cleanText, 'Исправил');
assert.equal(structured.appliedActions, 1);
assert.equal(actionCall.options.headers['x-action'], 'update-task');
assert.equal(actionCall.body.taskId, 'task-1');
assert.equal(actionCall.body.updates.originalMsg, 'Новое описание');
assert.equal(actionCall.body.updates.description, 'Новое описание');
const updatedTask = sandbox.state.tasks.find((item) => item.id === 'task-1');
assert.equal(updatedTask.originalMsg, 'Новое описание');
assert.equal(updatedTask.description, 'Новое описание');
assert.equal(sandbox.rendered, true);
assert.equal(sandbox.statsBuilt, true);
assert.equal(sandbox.calendarBuilt, true);

console.log('VK AI chat main parity smoke: PASS');
