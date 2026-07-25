import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

function extractFunction(name) {
  const starts = [`async function ${name}`, `function ${name}`];
  const start = starts.map((needle) => html.indexOf(needle)).find((index) => index >= 0);
  assert.notEqual(start, undefined, `${name} function exists`);
  const braceStart = html.indexOf('{', start);
  assert.ok(braceStart > start, `${name} has a body`);

  let depth = 0;
  for (let i = braceStart; i < html.length; i += 1) {
    if (html[i] === '{') depth += 1;
    if (html[i] === '}') depth -= 1;
    if (depth === 0) return html.slice(start, i + 1);
  }
  throw new Error(`${name} body was not closed`);
}

function assertHandlerBeforeGenericToast(fnName) {
  const body = extractFunction(fnName);
  const catchIndex = body.indexOf('catch(e)');
  assert.ok(catchIndex >= 0, `${fnName} has a catch block`);
  const handlerIndex = body.indexOf('handlePremiumRequiredTaskActionError(e)', catchIndex);
  const genericToastIndex = body.indexOf('showToast', catchIndex);
  assert.ok(handlerIndex >= 0, `${fnName} checks premium denial in catch`);
  assert.ok(genericToastIndex >= 0, `${fnName} still has generic fallback toast`);
  assert.ok(handlerIndex < genericToastIndex, `${fnName} handles premium denial before generic toast`);
}

const createError = extractFunction('createWorkerActionError');
assert.ok(createError.includes('error.status=response?.status||0'), 'worker error preserves HTTP status');
assert.ok(createError.includes('error.data=data||{}'), 'worker error preserves backend payload');

const isPremiumRequired = extractFunction('isPremiumRequiredError');
assert.ok(isPremiumRequired.includes('status===402||status===403'), 'premium check covers 402 and 403');
assert.ok(isPremiumRequired.includes('premium'), 'premium check recognizes English backend denial');
assert.ok(isPremiumRequired.includes('entitlement'), 'premium check recognizes entitlement denial');

const premiumHandler = extractFunction('handlePremiumRequiredTaskActionError');
assert.ok(premiumHandler.includes('showToast('), 'premium handler shows explicit UI copy');
assert.ok(premiumHandler.includes("showSubScreen('subscription')"), 'premium handler routes to subscription screen');

const postMutation = extractFunction('postTaskChatMutation');
assert.ok(
  postMutation.includes("throw createWorkerActionError(r,d,'"),
  'task chat mutations preserve denied backend status instead of generic Error'
);

const quickDone = extractFunction('quickDoneTask');
assert.ok(quickDone.includes('const res=await fetch('), 'quick done inspects worker response');
assert.ok(quickDone.includes('const data=await readJsonSafe(res)'), 'quick done reads denial payload');
assert.ok(
  quickDone.includes("throw createWorkerActionError(res,data,'"),
  'quick done throws typed worker action error on backend denial'
);
assertHandlerBeforeGenericToast('quickDoneTask');

assertHandlerBeforeGenericToast('confirmAndSaveTask');
assertHandlerBeforeGenericToast('submitQuickAdd');
assertHandlerBeforeGenericToast('confirmTaskChatActions');
assertHandlerBeforeGenericToast('saveTaskEdits');
assertHandlerBeforeGenericToast('saveTaskToWorker');

const handlerCalls = html.match(/handlePremiumRequiredTaskActionError\(e\)/g) || [];
assert.ok(handlerCalls.length >= 6, 'premium denial handler is wired into task action failure paths');

console.log('premium-task-action-denial-smoke: ok');
