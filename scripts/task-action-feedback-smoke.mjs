import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('task-ui-renderers.js', import.meta.url), 'utf8');
const homeLess = readFileSync(new URL('../styles/screens/home.less', import.meta.url), 'utf8');

function extractFunction(name) {
  const starts = [`function ${name}`, `async function ${name}`];
  const start = starts.map((needle) => source.indexOf(needle)).find((index) => index >= 0);
  assert.notEqual(start, undefined, `${name} exists`);
  const paramsStart = source.indexOf('(', start);
  let paramDepth = 0;
  let paramsEnd = -1;
  for (let i = paramsStart; i < source.length; i += 1) {
    if (source[i] === '(') paramDepth += 1;
    if (source[i] === ')') paramDepth -= 1;
    if (paramDepth === 0) {
      paramsEnd = i;
      break;
    }
  }
  const braceStart = source.indexOf('{', paramsEnd);
  let depth = 0;
  for (let i = braceStart; i < source.length; i += 1) {
    if (source[i] === '{') depth += 1;
    if (source[i] === '}') depth -= 1;
    if (depth === 0) return source.slice(start, i + 1);
  }
  throw new Error(`${name} body was not closed`);
}

function createButton(overrides = {}) {
  const classes = new Set();
  return {
    disabled: false,
    dataset: {},
    ...overrides,
    getAttribute(name) {
      return this.attributes?.[name] || null;
    },
    classList: {
      add(name) { classes.add(name); },
      remove(name) { classes.delete(name); },
      contains(name) { return classes.has(name); }
    }
  };
}

const timers = [];
const sandbox = {
  window: { Telegram: { WebApp: { HapticFeedback: { impactOccurred: () => { sandbox.haptics += 1; } } } } },
  navigator: { vibrate: () => { sandbox.vibrations += 1; } },
  setTimeout: (fn, ms) => { timers.push({ fn, ms }); },
  haptics: 0,
  vibrations: 0
};
vm.createContext(sandbox);
vm.runInContext([
  extractFunction('vibrateTaskCard'),
  extractFunction('isTaskActionFeedbackBlocked'),
  extractFunction('triggerTaskActionFeedback')
].join('\n'), sandbox);

const enabled = createButton();
assert.equal(sandbox.triggerTaskActionFeedback(enabled), true, 'enabled button triggers feedback');
assert.equal(sandbox.haptics, 1, 'Telegram haptic fires once');
assert.equal(sandbox.vibrations, 0, 'vibrate fallback is skipped when Telegram haptics are available');
assert.equal(enabled.dataset.feedbackLocked, '1', 'feedback lock is set');
assert.equal(enabled.classList.contains('task-swipe-btn--pressed'), true, 'pressed class is visible immediately');

assert.equal(sandbox.triggerTaskActionFeedback(enabled), false, 'rapid duplicate tap is ignored while locked');
assert.equal(sandbox.haptics, 1, 'rapid duplicate tap does not duplicate haptic feedback');

timers.splice(0).forEach((timer) => timer.fn());
assert.equal(enabled.dataset.feedbackLocked, undefined, 'feedback lock clears after the pressed window');
assert.equal(enabled.classList.contains('task-swipe-btn--pressed'), false, 'pressed class clears after the pressed window');

const disabled = createButton({ disabled: true });
assert.equal(sandbox.triggerTaskActionFeedback(disabled), false, 'disabled button does not trigger feedback');
assert.equal(sandbox.haptics, 1, 'disabled button does not fire haptics');

const ariaDisabled = createButton({ attributes: { 'aria-disabled': 'true' } });
assert.equal(sandbox.triggerTaskActionFeedback(ariaDisabled), false, 'aria-disabled button does not trigger feedback');
assert.equal(sandbox.haptics, 1, 'aria-disabled button does not fire haptics');

const loading = createButton();
loading.dataset.doneLoading = '1';
assert.equal(sandbox.triggerTaskActionFeedback(loading), false, 'loading task action does not duplicate feedback');

const handlerSource = extractFunction('handleTaskSwipeButton');
assert.ok(handlerSource.includes("btn.matches('.task-swipe-btn')"), 'feedback pilot stays scoped to task swipe buttons');
assert.ok(handlerSource.indexOf('triggerTaskActionFeedback') < handlerSource.indexOf("btn.dataset.taskAction==='cancel'"), 'feedback guard runs before task actions');
assert.ok(source.includes('completeThreshold'), 'full right swipe has a separate completion threshold');
assert.ok(source.includes("shell.classList.add('swipe-committing')"), 'full right swipe has a committed exit state');
assert.ok(source.includes("setTaskSwipe(shell,'right')"), 'partial right swipe settles with the done action revealed');
assert.ok(homeLess.includes('.task-card-shell .task-swipe-btn--pressed'), 'pressed visual modifier is present');

console.log('task-action-feedback smoke: PASS');
