import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync('vk.html', 'utf8');
const start = source.indexOf('const HOME_PRIORITY_WEIGHTS');
const end = source.indexOf('function isTaskCommand', start);
assert.ok(start > 0 && end > start, 'VK home helper slice not found');

const elements = new Map();
function element(id) {
  if (!elements.has(id)) {
    elements.set(id, {
      id,
      dataset: {},
      hidden: false,
      innerHTML: '',
      textContent: '',
      onclick: null,
      onkeydown: null,
    });
  }
  return elements.get(id);
}

const opened = [];
const sandbox = {
  Date,
  Number,
  String,
  Boolean,
  document: { getElementById: element },
  state: {
    tasks: [
      { id: 'low', title: 'Regular follow-up', priority: 'low', deadline: '2099-01-05' },
      { id: 'urgent', title: 'Critical beta task', priority: 'urgent', deadline: '2099-01-02' },
      { id: 'overdue', title: 'Overdue task', priority: 'normal', deadline: '2000-01-01' },
      { id: 'done', title: 'Finished', done: true, priority: 'urgent', deadline: '1999-01-01' },
    ],
  },
  escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, '');
  },
  getTaskDetailPriority(task) {
    return task?.priority || 'normal';
  },
  openTaskDetail(taskId) {
    opened.push(taskId);
  },
};

vm.createContext(sandbox);
vm.runInContext(source.slice(start, end), sandbox, { filename: 'vk-home-slice.js' });
vm.runInContext('renderTasks()', sandbox);

assert.equal(element('taskCount').textContent, 3);
assert.match(element('focusTaskCount').textContent, /3/);
assert.match(element('focusSummary').textContent, /просроч/i);
assert.match(element('focusUrgent').textContent, /1/);
assert.match(element('focusOverdue').textContent, /1/);
assert.match(element('focusNextDeadline').textContent, /1 янв|1 Jan|1 undefined/i);
assert.equal(element('homePriorityRow').hidden, false);
assert.equal(element('homePriorityRow').dataset.taskId, 'urgent');
assert.equal(element('homePriorityTitle').textContent, 'Critical beta task');

element('homePriorityRow').onclick();
assert.deepEqual(opened, ['urgent']);

console.log('VK home parity smoke: PASS');
