import assert from 'node:assert/strict';
import fs from 'node:fs';

function read(path) {
  return fs.readFileSync(path, 'utf8');
}

function sliceBetween(source, startNeedle, endNeedle, label) {
  const start = source.indexOf(startNeedle);
  const end = source.indexOf(endNeedle, start + startNeedle.length);
  assert.ok(start >= 0, `${label}: start marker not found`);
  assert.ok(end > start, `${label}: end marker not found`);
  return source.slice(start, end);
}

const indexHtml = read('index.html');
const vkHtml = read('vk.html');

const webProfile = sliceBetween(indexHtml, '<!-- PROFILE -->', '<div class="screen" id="subscription"', 'web profile');
assert.equal(webProfile.includes('profile-premium-card'), false, 'web profile premium card removed');
assert.equal(webProfile.includes('Premium активен'), false, 'web profile active Premium banner copy removed');
assert.equal(webProfile.includes('осталось 14'), false, 'web profile stale 14 days copy removed');
assert.ok(webProfile.includes("showSubScreen('subscription')"), 'web profile subscription row remains reachable');
assert.ok(webProfile.includes('profile-card--personal'), 'web profile personal section follows hero without an empty banner gap');

const vkProfile = sliceBetween(vkHtml, '<!-- PROFILE -->', '<!-- NAV -->', 'vk profile');
assert.equal(vkProfile.includes('trial-banner'), false, 'VK profile trial banner removed');
assert.equal(vkProfile.includes('trialDays'), false, 'VK profile trial days element removed');
assert.equal(vkProfile.includes('vkPayBtn'), false, 'VK profile payment banner button removed');
assert.ok(vkProfile.includes('Подписка'), 'VK profile subscription row remains reachable');
assert.ok(vkProfile.includes('identityList'), 'VK profile connected accounts section follows header without an empty banner gap');

console.log('Profile premium banner smoke: PASS');
