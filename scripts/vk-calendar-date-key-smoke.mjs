import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync('vk.html', 'utf8');
const start = source.indexOf('function localDateKey');
const end = source.indexOf('// ── STATS', start);
assert.ok(start > 0 && end > start, 'VK calendar date-key slice not found');

const elements = new Map();
function element(id) {
  if (!elements.has(id)) {
    elements.set(id, { id, innerHTML: '', textContent: '', addEventListener() {} });
  }
  return elements.get(id);
}

const sandbox = {
  Date,
  Number,
  String,
  Boolean,
  document: { getElementById: element },
  state: {
    calDate: new Date(2026, 7, 1),
    tasks: [
      { id: 'late-15', title: 'Late timezone task', deadline: '2026-08-15T23:30:00-05:00' },
      { id: 'early-16', title: 'Early timezone task', deadline: '2026-08-16T00:30:00+03:00' },
      { id: 'plain', title: 'Plain date task', deadline: '2026-08-20' },
    ],
  },
  taskHTML(task) {
    return `<article data-task-id="${task.id}">${task.title}</article>`;
  },
};

vm.createContext(sandbox);
vm.runInContext(source.slice(start, end), sandbox, { filename: 'vk-calendar-slice.js' });

assert.equal(vm.runInContext("taskDeadlineDateKey('2026-08-15T23:30:00-05:00')", sandbox), '2026-08-15');
assert.equal(vm.runInContext("taskDeadlineDateKey('2026-08-16T00:30:00+03:00')", sandbox), '2026-08-16');

vm.runInContext('buildCalendar()', sandbox);
assert.match(element('calGrid').innerHTML, /has-task[^>]+showDayTasks\('2026-08-15'\)[^>]*>15/);
assert.match(element('calGrid').innerHTML, /has-task[^>]+showDayTasks\('2026-08-16'\)[^>]*>16/);
assert.match(element('calGrid').innerHTML, /has-task[^>]+showDayTasks\('2026-08-20'\)[^>]*>20/);

vm.runInContext("showDayTasks('2026-08-15')", sandbox);
assert.match(element('calTaskList').innerHTML, /Late timezone task/);
assert.doesNotMatch(element('calTaskList').innerHTML, /Early timezone task/);

vm.runInContext("showDayTasks('2026-08-16')", sandbox);
assert.match(element('calTaskList').innerHTML, /Early timezone task/);

console.log('VK calendar date-key smoke: PASS');
