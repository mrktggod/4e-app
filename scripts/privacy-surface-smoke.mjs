import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function readUtf8(pathname) {
  return readFileSync(pathname, 'utf8');
}

function attr(tag, name) {
  const match = tag.match(new RegExp(`${name}=["']([^"']+)["']`, 'i'));
  return match ? match[1] : '';
}

function stripTags(html) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

const distPrivacyPath = resolve('.pages-dist', 'privacy.html');
const sourcePrivacyPath = resolve('privacy.html');
const indexPath = resolve('index.html');
const layoutPath = resolve('styles', 'layout.less');
const buildScriptPath = resolve('scripts', 'build-pages-whitelist.mjs');

assert(existsSync(distPrivacyPath), '.pages-dist/privacy.html is missing; run npm run build:worker-assets first');
assert(existsSync(sourcePrivacyPath), 'privacy.html source is missing');

const distPrivacy = existsSync(distPrivacyPath) ? readUtf8(distPrivacyPath) : '';
const sourcePrivacy = readUtf8(sourcePrivacyPath);
const indexHtml = readUtf8(indexPath);
const layoutLess = readUtf8(layoutPath);
const buildScript = readUtf8(buildScriptPath);

const h1Match = distPrivacy.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
const h1Text = h1Match ? stripTags(h1Match[1]) : '';
const titleMatch = distPrivacy.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
const titleText = titleMatch ? stripTags(titleMatch[1]) : '';

assert(buildScript.includes('"privacy.html"'), 'build-pages whitelist does not require privacy.html');
assert(distPrivacy.includes('102299/77'), 'Pages artifact privacy.html does not contain RKN number 102299/77');
assert(sourcePrivacy.includes('102299/77'), 'Source privacy.html does not contain RKN number 102299/77');
assert(h1Text.length >= 10, 'Pages artifact privacy.html h1 is missing or too short');
assert(titleText.length >= 10, 'Pages artifact privacy.html title is missing or too short');
assert(!/[?]{4,}/.test(h1Text + titleText), 'Privacy title/heading contains replacement-question mojibake');

const privacyLinkTags = Array.from(indexHtml.matchAll(/<a\b[^>]*data-privacy-policy-link[^>]*>/gi)).map(match => match[0]);
const onboardingLink = indexHtml.match(/<p\b[^>]*legal-note--onboarding[\s\S]*?<a\b[^>]*data-privacy-policy-link[^>]*>/i)?.[0] || '';
const loginLink = indexHtml.match(/<p\b[^>]*legal-note--login[\s\S]*?<a\b[^>]*data-privacy-policy-link[^>]*>/i)?.[0] || '';

assert(privacyLinkTags.length >= 2, `Expected at least 2 privacy policy links, got ${privacyLinkTags.length}`);
assert(onboardingLink, 'Onboarding privacy link is missing');
assert(loginLink, 'Login/register privacy link is missing');

const badHref = privacyLinkTags.filter(tag => attr(tag, 'href') !== 'privacy.html');
assert(badHref.length === 0, `Privacy link href should be privacy.html; bad count=${badHref.length}`);
assert(indexHtml.includes("new URL('privacy.html',window.location.href)"), 'openPrivacyPolicy does not target privacy.html');
assert(indexHtml.includes("document.querySelectorAll('[data-privacy-policy-link]')"), 'privacy policy link binder is missing');

const legalLinkRule = layoutLess.match(/\.auth-legal-link\{[^}]*\}/)?.[0] || '';
assert(legalLinkRule.includes('min-height:44px'), 'auth-legal-link does not include min-height:44px');
assert(legalLinkRule.includes('display:inline-flex'), 'auth-legal-link is not inline-flex for enlarged hit area');

const proof = {
  artifact: {
    privacyHtmlIncluded: existsSync(distPrivacyPath),
    rknNumberFound: distPrivacy.includes('102299/77'),
    titleText,
    h1Text,
  },
  links: {
    count: privacyLinkTags.length,
    onboarding: Boolean(onboardingLink),
    loginRegister: Boolean(loginLink),
    hrefs: privacyLinkTags.map(tag => attr(tag, 'href')),
    handlerTargetsPrivacyHtml: indexHtml.includes("new URL('privacy.html',window.location.href)"),
  },
  hitArea: {
    selector: '.auth-legal-link',
    minHeight44: legalLinkRule.includes('min-height:44px'),
    inlineFlex: legalLinkRule.includes('display:inline-flex'),
  },
};

if (failures.length) {
  console.error('privacy-surface smoke failed');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('privacy-surface smoke passed');
console.log(JSON.stringify(proof, null, 2));
