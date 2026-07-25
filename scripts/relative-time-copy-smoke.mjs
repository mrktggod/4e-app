import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync('index.html', 'utf8');

function extractFunction(name) {
  const start = source.indexOf(`function ${name}`);
  if (start === -1) throw new Error(`${name} not found`);
  const braceStart = source.indexOf('{', start);
  let depth = 0;
  for (let i = braceStart; i < source.length; i += 1) {
    const ch = source[i];
    if (ch === '{') depth += 1;
    if (ch === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(start, i + 1);
    }
  }
  throw new Error(`${name} body not closed`);
}

const taskDateBlockStart = source.indexOf('function startOfLocalDay');
const taskDateBlockEnd = source.indexOf('// NOTE: task-card + notification render logic moved', taskDateBlockStart);
if (taskDateBlockStart < 0 || taskDateBlockEnd <= taskDateBlockStart) {
  throw new Error('task date helper block not found');
}

const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(`
${source.slice(taskDateBlockStart, taskDateBlockEnd)}
${extractFunction('getStatsTimestampMs')}
${extractFunction('getTaskCreatedTimestamp')}
${extractFunction('formatTaskCreatedMeta')}
${extractFunction('getHomePriorityMeta')}
this.formatTaskCreatedMeta = formatTaskCreatedMeta;
this.getHomePriorityMeta = getHomePriorityMeta;
`, sandbox);

function assert(condition, label) {
  if (!condition) throw new Error(label);
}

const oldDate = new Date();
oldDate.setDate(oldDate.getDate() - 47);
oldDate.setHours(12, 0, 0, 0);

const legacyOldTask = {
  id: 'relative-old-legacy',
  text: 'Old legacy task',
  direction: 'outgoing',
  date: oldDate.toISOString(),
};

const createdMeta = sandbox.formatTaskCreatedMeta(legacyOldTask);
assert(/поставлена 47 дней назад/.test(createdMeta), `expected 47-day created copy, got: ${createdMeta}`);
assert(!/недавно/i.test(createdMeta), `created copy must not say recently: ${createdMeta}`);

const homeMeta = sandbox.getHomePriorityMeta(legacyOldTask);
assert(/поставлена 47 дней назад/.test(homeMeta), `home meta should include exact age, got: ${homeMeta}`);
assert(!/недавно/i.test(homeMeta), `home meta must not say recently: ${homeMeta}`);

const datelessMeta = sandbox.formatTaskCreatedMeta({ id: 'dateless', text: 'No date' });
assert(datelessMeta === 'поставлена без даты', `dateless fallback should be neutral, got: ${datelessMeta}`);

console.log('relative time copy smoke: PASS');
