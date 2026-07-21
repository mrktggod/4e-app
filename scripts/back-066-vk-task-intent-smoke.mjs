import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync('vk.html', 'utf8');
const start = source.indexOf('function isTaskCommand');
const end = source.indexOf('async function maybeSaveTaskFromChat');

if (start < 0 || end < 0 || end <= start) {
  throw new Error('Could not extract VK task intent helpers');
}

const sandbox = { Date };
vm.createContext(sandbox);
vm.runInContext(`${source.slice(start, end)}
this.isTaskCommand = isTaskCommand;
this.normalizeTaskText = normalizeTaskText;
this.inferTaskDeadline = inferTaskDeadline;`, sandbox);

function assert(condition, label) {
  if (!condition) throw new Error(label);
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label}: expected "${expected}", got "${actual}"`);
  }
}

const today = new Date().toISOString().slice(0, 10);
const tomorrowDate = new Date();
tomorrowDate.setDate(tomorrowDate.getDate() + 1);
const tomorrow = tomorrowDate.toISOString().slice(0, 10);

const cases = [
  ['надо проверить почему пропадает часть чата', 'проверить почему пропадает часть чата', ''],
  ['поставь Маше задачу подготовить договор к пятнице', 'подготовить договор', ''],
  ['добавь задачу позвонить Ивану завтра', 'позвонить Ивану', tomorrow],
  ['придумать уведомления для агентов сегодня', 'придумать уведомления для агентов', today]
];

for (const [raw, expectedTitle, expectedDeadline] of cases) {
  assert(sandbox.isTaskCommand(raw), `${raw} should be detected as VK task command`);
  assertEqual(sandbox.normalizeTaskText(raw), expectedTitle, `${raw} normalized title`);
  assertEqual(sandbox.inferTaskDeadline(raw), expectedDeadline, `${raw} deadline`);
}

console.log('BACK-066 VK task intent smoke: PASS');
