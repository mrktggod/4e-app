import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync('index.html', 'utf8');
const start = source.indexOf('function looksLikeTaskRequest');
const end = source.indexOf('function normalizeTaskDupText');

if (start < 0 || end < 0 || end <= start) {
  throw new Error('Could not extract task title normalization block');
}

const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(`${source.slice(start, end)}
this.normalizeTaskTitle = normalizeTaskTitle;
this.fallbackTaskFromText = fallbackTaskFromText;
this.formatTaskIntentTitle = formatTaskIntentTitle;
this.looksLikeTaskRequest = looksLikeTaskRequest;`, sandbox);

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label}: expected "${expected}", got "${actual}"`);
  }
}

function assert(condition, label) {
  if (!condition) throw new Error(label);
}

const cases = [
  ['мне надо позвонить Ивану завтра', 'Позвонить Ивану', 'завтра'],
  [
    'тебе надо придумать на платформе как вести разработку агентабота через задачи',
    'Придумать управление разработкой агентабота через задачи',
    null
  ],
  ['я придумать на платформе уведомления для агентов', 'Придумать уведомления для агентов', null],
  ['поставь Маше задачу подготовить договор к пятнице', 'Подготовить договор', 'к пятнице'],
  ['надо проверить почему пропадает часть чата', 'Проверить пропажу части чата', null]
];

for (const [raw, expectedTitle, expectedDeadline] of cases) {
  assert(sandbox.looksLikeTaskRequest(raw), `${raw} should be detected as task intent`);
  const task = sandbox.fallbackTaskFromText(raw);
  assertEqual(task.text, expectedTitle, raw);
  assertEqual(task.deadline || null, expectedDeadline, `${raw} deadline`);
  assertEqual(task.originalMsg, raw, `${raw} originalMsg`);
  assert(task.text.split(/\s+/).length <= 9, `${raw} title is longer than 9 words`);
}

assertEqual(
  sandbox.normalizeTaskTitle('Подготовить финальную версию презентации'),
  'Подготовить финальную версию презентации',
  'short manual quick-add phrase'
);

console.log('BACK-065 task title normalization smoke: PASS');
