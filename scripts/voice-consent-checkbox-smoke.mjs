import fs from 'node:fs';

const index = fs.readFileSync('index.html', 'utf8');
const less = fs.readFileSync('styles/screens/voice.less', 'utf8');

function block(selector) {
  const start = less.indexOf(`${selector} {`);
  if (start === -1) throw new Error(`${selector} block not found`);
  const braceStart = less.indexOf('{', start);
  const braceEnd = less.indexOf('\n}', braceStart);
  if (braceEnd === -1) throw new Error(`${selector} block not closed`);
  return less.slice(braceStart + 1, braceEnd);
}

function numericPx(cssBlock, prop) {
  const match = cssBlock.match(new RegExp(`${prop}:\\s*([0-9.]+)px`));
  if (!match) throw new Error(`${prop} px value missing`);
  return Number(match[1]);
}

if (!index.includes('<label class="bio-consent-check">')) {
  throw new Error('biometric consent checkbox label missing');
}
if (!index.includes('Я даю согласие на обработку биометрических персональных данных (голоса)')) {
  throw new Error('legal consent copy changed or missing');
}

const labelBlock = block('.bio-consent-check');
const inputBlock = block('.bio-consent-check input');
const boxBlock = block('.bio-check-box');
const checkedBlock = block('.bio-consent-check input:checked + .bio-check-box');

if (numericPx(labelBlock, 'min-height') < 44) {
  throw new Error('checkbox label touch target is below 44px');
}
if (numericPx(boxBlock, 'width') < 28 || numericPx(boxBlock, 'height') < 28) {
  throw new Error('visible checkbox is too small');
}
if (/display:\s*none/.test(inputBlock)) {
  throw new Error('checkbox input is display:none instead of visually hidden');
}
if (!/position:\s*absolute/.test(inputBlock) || !/opacity:\s*0/.test(inputBlock)) {
  throw new Error('checkbox input is not visually hidden in an accessible way');
}
if (!/background:\s*var\(--green\)/.test(checkedBlock)) {
  throw new Error('checked checkbox state is not visibly green');
}
if (!less.includes('.bio-consent-check:focus-within .bio-check-box')) {
  throw new Error('focus-visible checkbox state missing');
}

console.log('voice consent checkbox smoke: PASS');
