import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('vk.html', 'utf8');

const mainAppStart = source.indexOf('<div id="mainApp"');
const homeStart = source.indexOf('<div class="screen active" id="screen-home">', mainAppStart);
const homeEnd = source.indexOf('<!-- ASK -->', homeStart);

assert.ok(mainAppStart > 0, 'VK main app shell not found');
assert.ok(homeStart > mainAppStart && homeEnd > homeStart, 'VK home shell not found');

const mainAppSource = source.slice(mainAppStart, homeEnd);
const homeSource = source.slice(homeStart, homeEnd);
const topbarLogoCount = (mainAppSource.match(/<div class="topbar-left">\s*<div class="logo">/g) || []).length;

assert.equal(topbarLogoCount, 1, 'VK shell should have exactly one header logo');
assert.equal((source.match(/home-logo-center/g) || []).length, 0, 'VK home should not render a second centered logo');
assert.equal((homeSource.match(/<div class="logo">/g) || []).length, 0, 'VK home content should not duplicate the header logo');

console.log('VK header logo smoke: PASS');
