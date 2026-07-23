import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync('vk.html', 'utf8');
assert.match(source, /href="privacy\.html"/, 'profile privacy link is missing');
assert.match(source, /id="profileAccountSummary"/, 'profile account summary is missing');
assert.match(source, /id="profileIdentitySummary"/, 'profile identity summary is missing');
assert.doesNotMatch(source, /<span class="label">Уведомления<\/span>\s*<svg[\s\S]{0,160}Скоро/, 'legacy notifications soon row should not remain');

const start = source.indexOf('function applyUser');
const end = source.indexOf('function renderLinkChallengePanel', start);
assert.ok(start > 0 && end > start, 'VK profile helper slice not found');

const elements = new Map();
function element(id) {
  if (!elements.has(id)) {
    elements.set(id, {
      id,
      innerHTML: '',
      textContent: '',
      classList: { add() {}, remove() {} },
    });
  }
  return elements.get(id);
}

const sandbox = {
  document: { getElementById: element },
  state: {
    user: {
      id: 'user-1',
      name: 'Beta User',
      email: 'beta@example.test',
      vkId: '500000001',
      trialEndsAt: Date.now() + 3 * 86400000,
    },
    identities: [
      { provider: 'vk', username: 'beta_vk' },
      { provider: 'telegram', username: 'beta_tg' },
    ],
  },
  Date,
  Math,
  Boolean,
  String,
  escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, '');
  },
  pluralRu(n, one, few, many) {
    return n === 1 ? one : n > 1 && n < 5 ? few : many;
  },
  renderLinkChallengePanel() {},
};

vm.createContext(sandbox);
vm.runInContext(source.slice(start, end), sandbox, { filename: 'vk-profile-slice.js' });
vm.runInContext('applyUser(); renderIdentityRows();', sandbox);

assert.equal(element('profileName').textContent, 'Beta User');
assert.equal(element('profileEmail').textContent, 'beta@example.test');
assert.match(element('profileAccountSummary').textContent, /VK ID/);
assert.match(element('profileIdentitySummary').textContent, /3 связи/);
assert.match(element('identityList').innerHTML, /Email/);
assert.match(element('identityList').innerHTML, /VK/);
assert.match(element('identityList').innerHTML, /Telegram/);

console.log('VK profile parity smoke: PASS');
