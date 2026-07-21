import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

function fail(message) {
  throw new Error(message);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function countNeedle(needle) {
  return html.split(needle).length - 1;
}

function functionBody(name) {
  const match = new RegExp(`(?:async\\s+)?function\\s+${name}\\s*\\(`).exec(html);
  if (!match) fail(`Missing function ${name}`);

  const open = html.indexOf('{', match.index);
  if (open === -1) fail(`Missing function body for ${name}`);

  let depth = 0;
  let quote = '';
  let escaped = false;

  for (let i = open; i < html.length; i += 1) {
    const char = html[i];

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === quote) {
        quote = '';
      }
      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      continue;
    }

    if (char === '{') depth += 1;
    if (char === '}') {
      depth -= 1;
      if (depth === 0) return html.slice(open, i + 1);
    }
  }

  fail(`Unclosed function body for ${name}`);
}

function expect(body, needle, label) {
  assert(body.includes(needle), `${label}: missing ${needle}`);
}

const taskRows = functionBody('getShareCardTaskRows');
const streak = functionBody('getShareCardStreakAndAchievements');
const weeklyStats = functionBody('getShareWeekStats');
const dailyBuilder = functionBody('buildDailyShareCardBlob');
const weeklyBuilder = functionBody('buildWeeklySummaryCardBlob');
const dailyShare = functionBody('shareDailyCard');
const weeklyShare = functionBody('shareWeeklySummaryCard');

expect(taskRows, '.filter(', 'task rows');
expect(taskRows, 'slice(0,4)', 'task rows');
expect(streak, 'streak', 'streak');
expect(streak, 'doneToday', 'streak');
expect(streak, 'achievements', 'streak');
expect(weeklyStats, 'days', 'weekly stats');
expect(weeklyStats, 'doneWeek', 'weekly stats');
expect(weeklyStats, 'createdWeek', 'weekly stats');

for (const [label, body] of [['daily builder', dailyBuilder], ['weekly builder', weeklyBuilder]]) {
  expect(body, 'document.createElement(\'canvas\')', label);
  expect(body, 'canvas.width=1080', label);
  expect(body, 'canvas.height=1350', label);
  expect(body, 'canvas.toBlob(resolve,\'image/png\',0.92)', label);
}

expect(dailyBuilder, 'getShareCardTaskRows()', 'daily builder');
expect(dailyBuilder, 'getShareCardStreakAndAchievements()', 'daily builder');
expect(weeklyBuilder, 'getShareWeekStats()', 'weekly builder');

for (const [label, body, eventName, fileName, builderName] of [
  ['daily share', dailyShare, 'share-card', '4-plan-day.png', 'buildDailyShareCardBlob'],
  ['weekly share', weeklyShare, 'share-weekly-card', '4-week-summary.png', 'buildWeeklySummaryCardBlob'],
]) {
  expect(body, builderName, label);
  expect(body, 'new File([blob]', label);
  expect(body, fileName, label);
  expect(body, 'navigator.canShare', label);
  expect(body, 'navigator.share', label);
  expect(body, 'document.createElement(\'a\')', label);
  expect(body, 'URL.createObjectURL(blob)', label);
  expect(body, `trackLiteEvent('${eventName}',{surface:'home',mode:'native'})`, label);
  expect(body, `trackLiteEvent('${eventName}',{surface:'home',mode:'download'})`, label);
}

const metrics = {
  status: 'PASS',
  checkedFunctions: 7,
  canvasWidth1080: countNeedle('canvas.width=1080'),
  canvasHeight1350: countNeedle('canvas.height=1350'),
  pngBlobBuilders: countNeedle("canvas.toBlob(resolve,'image/png',0.92)"),
  dailyNativeAnalytics: countNeedle("trackLiteEvent('share-card',{surface:'home',mode:'native'})"),
  dailyDownloadAnalytics: countNeedle("trackLiteEvent('share-card',{surface:'home',mode:'download'})"),
  weeklyNativeAnalytics: countNeedle("trackLiteEvent('share-weekly-card',{surface:'home',mode:'native'})"),
  weeklyDownloadAnalytics: countNeedle("trackLiteEvent('share-weekly-card',{surface:'home',mode:'download'})"),
  nativeShareChecks: countNeedle('navigator.canShare'),
  downloadFallbacks: countNeedle("document.createElement('a')"),
};

console.log('VIRAL share card static smoke: PASS');
console.log(JSON.stringify(metrics, null, 2));