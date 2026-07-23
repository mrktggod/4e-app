import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const less = fs.readFileSync(path.join(root, 'styles', 'screens', 'voice.less'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.min.css'), 'utf8');

function extractFunction(name) {
  const start = index.indexOf(`function ${name}(`);
  if (start < 0) throw new Error(`${name} not found`);
  let depth = 0;
  let seenBody = false;
  for (let i = start; i < index.length; i += 1) {
    const ch = index[i];
    if (ch === '{') {
      depth += 1;
      seenBody = true;
    } else if (ch === '}') {
      depth -= 1;
      if (seenBody && depth === 0) return index.slice(start, i + 1);
    }
  }
  throw new Error(`${name} body did not close`);
}

const actionFn = extractFunction('renderAskActionPreview');
const clarifyFn = extractFunction('renderAskClarificationPreview');
const target = `${actionFn}\n${clarifyFn}`;
const failures = [];

if (/style\s*=/.test(target)) failures.push('target ask preview renderers still generate inline style attributes');

[
  'ask-action-card',
  'ask-action-label',
  'ask-action-list',
  'ask-action-controls',
  'ask-action-btn',
  'ask-action-btn--primary',
  'ask-action-btn--secondary',
  'ask-action-btn--pill'
].forEach((className) => {
  if (!target.includes(className)) failures.push(`renderer missing ${className}`);
  if (!less.includes(`.${className}`)) failures.push(`LESS missing .${className}`);
  if (!css.includes(`.${className}`)) failures.push(`minified CSS missing .${className}`);
});

if (!target.includes('confirmAskActions') || !target.includes('dismissAskActions') || !target.includes('answerAskClarification')) {
  failures.push('target renderers lost expected ask action handlers');
}

if (failures.length) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  checked: ['renderAskActionPreview', 'renderAskClarificationPreview'],
  inlineStyleAttrs: (target.match(/style\s*=/g) || []).length
}, null, 2));
