import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync('index.html', 'utf8');
const start = source.indexOf('function looksLikeTaskRequest');
const end = source.indexOf('function normalizeTaskDupText');

if (start < 0 || end < 0 || end <= start) {
  throw new Error('Could not extract task title/description quality block');
}

const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(`${source.slice(start, end)}
this.fallbackTaskFromText = fallbackTaskFromText;
this.normalizeTaskDraftQuality = normalizeTaskDraftQuality;
this.normalizeTaskTitle = normalizeTaskTitle;
this.looksLikeTaskRequest = looksLikeTaskRequest;`, sandbox);

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label}: expected "${expected}", got "${actual}"`);
  }
}

function assert(condition, label) {
  if (!condition) throw new Error(label);
}

const badGrammar = 'короче мне надо подготовить отчет для инвесторов, там цифры за неделю и риски запуска';
const badGrammarTask = sandbox.fallbackTaskFromText(badGrammar);
assertEqual(badGrammarTask.text, 'Подготовить отчет для инвесторов', 'bad grammar title');
assertEqual(badGrammarTask.description, 'цифры за неделю и риски запуска', 'bad grammar details move to description');
assertEqual(badGrammarTask.originalMsg, badGrammar, 'bad grammar raw preserved');

const longInput = 'создай задачу проверить почему в Telegram на главном экране показывается только одна задача, не забудь сравнить API ответ кеш и количество строк';
const longTask = sandbox.fallbackTaskFromText(longInput);
assertEqual(longTask.text, 'Проверить почему в Telegram на главном экране показывается только', 'long input short title');
assertEqual(longTask.description, 'сравнить API ответ кеш и количество строк', 'long input description');
assertEqual(longTask.originalMsg, longInput, 'long input raw preserved');
assert(longTask.text.split(/\s+/).length <= 9, 'long input title limited to 9 words');

const assigned = 'поставь Маше задачу подготовить договор к пятнице, детали: сверить сумму и юрлицо';
const assignedTask = sandbox.fallbackTaskFromText(assigned);
assertEqual(assignedTask.person, 'Маше', 'assigned person preserved');
assertEqual(assignedTask.text, 'Подготовить договор', 'assigned title');
assertEqual(assignedTask.deadline, 'к пятнице', 'assigned deadline');
assertEqual(assignedTask.description, 'детали: сверить сумму и юрлицо', 'assigned description');

const aiDraft = sandbox.normalizeTaskDraftQuality({
  text: 'мне надо сделать презентацию для совета директоров, там добавить финансы и риски',
  description: 'добавить финансы и риски',
  originalMsg: 'Сделай задачу: презентация для совета директоров с финансами и рисками'
});
assertEqual(aiDraft.text, 'Сделать презентацию для совета директоров', 'AI draft title');
assertEqual(aiDraft.description, 'добавить финансы и риски', 'AI draft explicit description');
assertEqual(aiDraft.originalMsg, 'Сделай задачу: презентация для совета директоров с финансами и рисками', 'AI draft raw preserved');

console.log('task title/description quality smoke: PASS');
