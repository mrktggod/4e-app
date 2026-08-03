import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync('index.html', 'utf8');

assert.match(source, /id="detail-decompose-preview"/, 'task detail should include a decomposition preview container');
assert.match(source, /data-detail-action="decompose-task"/, 'task detail should expose the decomposition action');
assert.match(source, /confirmDetailDecomposition/, 'task detail should require an explicit confirm step');
assert.match(source, /cancelDetailDecomposition/, 'task detail should support cancellation without saving');

const start = source.indexOf('function sanitizeTaskForPrompt');
const end = source.indexOf('function addDetailChecklistItem', start);
assert.ok(start > 0 && end > start, 'Could not extract decomposition helpers');
const helperSource = source.slice(start, end);
assert.doesNotMatch(helperSource, /4-8|4–8/, 'decomposition prompt should request the 3-7 step MVP range');

const elements = new Map();
function makeElement(id) {
  const element = {
    id,
    value: '',
    textContent: '',
    innerHTML: '',
    hidden: false,
    disabled: false,
    style: {},
    dataset: {},
    scrollHeight: 42,
    querySelectorAll() { return []; },
    classList: {
      add() {},
      remove() {},
      toggle() {}
    }
  };
  elements.set(id, element);
  return element;
}

[
  'detail-split-btn',
  'detail-checklist',
  'detail-decompose-preview',
  'detail-description'
].forEach(makeElement);

elements.get('detail-split-btn').textContent = 'Split into steps';

const sandbox = {
  Date,
  Math,
  Number,
  String,
  Boolean,
  JSON,
  RegExp,
  console,
  document: {
    getElementById(id) {
      return elements.get(id) || makeElement(id);
    }
  },
  requestAnimationFrame(callback) {
    if (typeof callback === 'function') callback();
  },
  getToken() {
    return 'test-token';
  },
  async aiCall(body) {
    sandbox.aiBody = body;
    return { content: [{ text: JSON.stringify({ steps: ['First step', 'Second step', 'Third step'] }) }] };
  },
  async saveTaskEdits() {
    sandbox.saveCount += 1;
  },
  showToast(message) {
    sandbox.lastToast = message;
  },
  e2(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },
  parseAIText(payload) {
    if (payload?._raw) return payload._raw;
    if (payload?.content?.[0]?.text) return payload.content[0].text;
    if (payload?.completion) return payload.completion;
    if (typeof payload === 'string') return payload;
    return JSON.stringify(payload);
  },
  saveCount: 0
};

vm.createContext(sandbox);
vm.runInContext(`${helperSource}
this.decomposeCurrentTask = decomposeCurrentTask;
this.confirmDetailDecomposition = confirmDetailDecomposition;
this.cancelDetailDecomposition = cancelDetailDecomposition;
this.pickChecklistSteps = pickChecklistSteps;
this.renderDetailChecklist = renderDetailChecklist;
currentDetailTask = {
  id: 'task-1',
  text: 'Launch onboarding QA',
  description: 'Prepare release checklist',
  priority: 'high',
  deadline: '2026-08-01'
};
currentDetailChecklist = [];
pendingDetailChecklistSteps = [];
`, sandbox, { filename: 'task-decomposition-slice.js' });

await sandbox.decomposeCurrentTask();
assert.equal(sandbox.saveCount, 0, 'AI decomposition must not save before confirmation');
assert.equal(vm.runInContext('JSON.stringify(currentDetailChecklist)', sandbox), '[]', 'checklist must stay unchanged before confirmation');
assert.equal(vm.runInContext('pendingDetailChecklistSteps.length', sandbox), 3, 'AI steps should be held as pending preview');
assert.equal(elements.get('detail-decompose-preview').hidden, false, 'preview should be visible after decomposition');
assert.match(elements.get('detail-decompose-preview').innerHTML, /First step/, 'preview should render proposed steps');
assert.match(sandbox.aiBody.messages[0].content, /3-7/, 'AI prompt should request 3-7 steps');

sandbox.cancelDetailDecomposition();
assert.equal(sandbox.saveCount, 0, 'cancel must not save');
assert.equal(vm.runInContext('JSON.stringify(currentDetailChecklist)', sandbox), '[]', 'cancel must leave checklist unchanged');
assert.equal(vm.runInContext('pendingDetailChecklistSteps.length', sandbox), 0, 'cancel should clear pending steps');
assert.equal(elements.get('detail-decompose-preview').hidden, true, 'cancel should hide preview');

await sandbox.decomposeCurrentTask();
await sandbox.confirmDetailDecomposition();
assert.equal(sandbox.saveCount, 1, 'confirm should save exactly once');
assert.equal(
  vm.runInContext('JSON.stringify(currentDetailChecklist.map((item) => item.text))', sandbox),
  JSON.stringify(['First step', 'Second step', 'Third step']),
  'confirm should append pending steps to checklist'
);
assert.equal(vm.runInContext('pendingDetailChecklistSteps.length', sandbox), 0, 'confirm should clear pending steps');

const capped = vm.runInContext('pickChecklistSteps({content:[{text:JSON.stringify({steps:["one step","two step","three step","four step","five step","six step","seven step","eight step"]})}]}, "task").length', sandbox);
assert.equal(capped, 7, 'AI step list should be capped at seven items');

console.log('Task decomposition preview smoke: PASS');
