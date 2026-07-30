import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync('vk.html', 'utf8');

const start = source.indexOf('function localDateKey');
const end = source.indexOf('async function sendTaskDiscussion');

if (start < 0 || end < 0 || end <= start) {
  throw new Error('Could not extract VK task-detail helpers');
}

const elements = new Map();
const makeElement = (id) => {
  const element = {
    id,
    value: '',
    textContent: '',
    disabled: false,
    dataset: {},
    addEventListener() {},
    classList: {
      add() {},
      remove() {},
      toggle() {}
    }
  };
  elements.set(id, element);
  return element;
};

[
  'detailTaskTitle',
  'detailTaskMeta',
  'detailReturnHint',
  'detailTaskStatus',
  'detailTaskStatusPill',
  'detailTaskPriorityBadge',
  'detailTaskDeadlineBadge',
  'detailDoneHint',
  'detailTaskDescription',
  'detailTaskHistory',
  'detailEditTitle',
  'detailEditStatus',
  'detailEditPriority',
  'detailEditDeadline',
  'detailEditPerson',
  'detailEditDescription',
  'detailEditError',
  'detailSaveBtn',
  'detailCancelBtn',
  'taskList',
  'taskCount',
  'focusTaskCount',
  'homeActive'
].forEach(makeElement);

elements.get('detailSaveBtn').textContent = 'Сохранить';
elements.get('detailCancelBtn').textContent = 'Отмена';

const task = {
  id: 'vk-detail-1',
  text: 'Старое название',
  title: 'Старое название',
  status: 'active',
  priority: 'normal',
  person: 'Юрий',
  deadline: '2026-07-25',
  done: false,
  type: 'task',
  createdAt: Date.now(),
  description: 'Старое описание',
  originalMsg: 'Исходная формулировка задачи'
};

let updatePayload = null;

const sandbox = {
  Date,
  console,
  WORKER: 'https://worker.test',
  state: {
    token: 'test-token',
    user: { id: 'u1' },
    currentTask: null,
    currentScreen: 'calendar',
    taskDetailReturnScreen: 'home',
    tasks: [task]
  },
  localStorage: {
    getItem() {
      return '[]';
    },
    setItem() {}
  },
  document: {
    getElementById(id) {
      return elements.get(id) || makeElement(id);
    },
    querySelector() {
      return { classList: { add() {}, remove() {}, toggle() {} } };
    },
    querySelectorAll() {
      return [];
    }
  },
  async fetch(url, options) {
    updatePayload = {
      url,
      headers: options.headers,
      body: JSON.parse(options.body)
    };
    return {
      ok: true,
      async json() {
        return { ok: true };
      }
    };
  },
  async readJsonSafe(response) {
    return response.json();
  },
  setButtonBusy(button, busy, label) {
    if (!button) return;
    if (busy) {
      button.disabled = true;
      button.textContent = label || button.textContent;
    } else {
      button.disabled = false;
      button.textContent = 'Сохранить';
    }
  },
  showToast(message) {
    sandbox.lastToast = message;
  },
  renderTasks() {
    sandbox.rendered = true;
  },
  buildStats() {
    sandbox.statsBuilt = true;
  },
  navigate(id) {
    sandbox.lastNavigation = id;
  }
};

vm.createContext(sandbox);
vm.runInContext(`${source.slice(start, end)}
this.openTaskDetail = openTaskDetail;
this.saveTaskDetailEdits = saveTaskDetailEdits;
this.cancelTaskDetailEdits = cancelTaskDetailEdits;`, sandbox);

function assert(condition, label) {
  if (!condition) throw new Error(label);
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label}: expected "${expected}", got "${actual}"`);
  }
}

sandbox.openTaskDetail('vk-detail-1');
assertEqual(elements.get('detailEditTitle').value, 'Старое название', 'initial title field');
assertEqual(elements.get('detailEditDeadline').value, '2026-07-25', 'initial deadline field');
assertEqual(elements.get('detailEditPriority').value, 'normal', 'initial priority field');
assertEqual(elements.get('detailEditPerson').value, 'Юрий', 'initial person field');
assertEqual(elements.get('detailEditDescription').value, 'Старое описание', 'initial description field');
assertEqual(elements.get('detailReturnHint').textContent, 'Вернемся в календарь', 'return hint follows source screen');
assertEqual(elements.get('detailTaskStatusPill').textContent, 'В работе', 'active status pill');
assertEqual(elements.get('detailTaskStatusPill').dataset.status, 'active', 'active status data attribute');
assertEqual(elements.get('detailTaskPriorityBadge').textContent, 'Обычный', 'priority summary tile');
assertEqual(elements.get('detailTaskDeadlineBadge').textContent, '25 июл', 'deadline summary tile');
assert(elements.get('detailDoneHint').textContent.includes('активного списка'), 'completion hint explains active-list removal');

elements.get('detailEditTitle').value = 'Обновить договор';
elements.get('detailEditStatus').value = 'waiting';
elements.get('detailEditPriority').value = 'high';
elements.get('detailEditDeadline').value = '2026-07-30';
elements.get('detailEditPerson').value = 'Алексей';
elements.get('detailEditDescription').value = 'Обсудить правки и отправить итоговый текст';

await sandbox.saveTaskDetailEdits();

assert(updatePayload, 'update-task fetch should be called');
assertEqual(updatePayload.url, 'https://worker.test', 'worker update URL');
assertEqual(updatePayload.headers['x-action'], 'update-task', 'worker action header');
assertEqual(updatePayload.headers['x-token'], 'test-token', 'worker token header');
assertEqual(updatePayload.body.taskId, 'vk-detail-1', 'task id payload');
assertEqual(updatePayload.body.updates.text, 'Обновить договор', 'updated text payload');
assertEqual(updatePayload.body.updates.title, 'Обновить договор', 'updated title payload');
assertEqual(updatePayload.body.updates.person, 'Алексей', 'updated person payload');
assertEqual(updatePayload.body.updates.description, 'Обсудить правки и отправить итоговый текст', 'updated description payload');
assertEqual(updatePayload.body.updates.originalMsg, 'Обсудить правки и отправить итоговый текст', 'updated originalMsg payload');
assertEqual(updatePayload.body.updates.status, 'waiting', 'updated status payload');
assertEqual(updatePayload.body.updates.priority, 'high', 'updated priority payload');
assertEqual(updatePayload.body.updates.deadline, '2026-07-30', 'updated deadline payload');
assertEqual(updatePayload.body.updates.done, false, 'waiting status is not done');
assertEqual(sandbox.state.tasks[0].text, 'Обновить договор', 'local task text persisted');
assertEqual(sandbox.state.tasks[0].person, 'Алексей', 'local task person persisted');
assertEqual(sandbox.state.tasks[0].description, 'Обсудить правки и отправить итоговый текст', 'local task description persisted');
assertEqual(sandbox.state.tasks[0].originalMsg, 'Обсудить правки и отправить итоговый текст', 'local task originalMsg persisted');
assertEqual(sandbox.state.tasks[0].status, 'waiting', 'local task status persisted');
assertEqual(sandbox.state.tasks[0].priority, 'high', 'local task priority persisted');
assertEqual(sandbox.state.tasks[0].deadline, '2026-07-30', 'local task deadline persisted');
assert(sandbox.rendered, 'task list rerendered');
assert(sandbox.statsBuilt, 'stats rebuilt');
assertEqual(elements.get('detailEditTitle').value, 'Обновить договор', 'reopened title field');
assertEqual(elements.get('detailEditPriority').value, 'high', 'reopened priority field');
assertEqual(elements.get('detailEditDeadline').value, '2026-07-30', 'reopened deadline field');
assertEqual(elements.get('detailEditPerson').value, 'Алексей', 'reopened person field');
assertEqual(elements.get('detailEditDescription').value, 'Обсудить правки и отправить итоговый текст', 'reopened description field');
assertEqual(elements.get('detailEditError').textContent, '', 'no edit error shown');

console.log('VK task detail edit smoke: PASS');
