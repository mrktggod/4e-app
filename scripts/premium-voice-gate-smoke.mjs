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

const openVoiceStart = source.indexOf('async function openVoice(){');
if (openVoiceStart === -1) throw new Error('openVoice not found');
const openVoiceBodyStart = source.slice(openVoiceStart, openVoiceStart + 260);
if (!openVoiceBodyStart.includes('if(handlePremiumRequiredVoiceAccess()) return;')) {
  throw new Error('openVoice does not gate expired Premium before voice start');
}
if (openVoiceBodyStart.indexOf('handlePremiumRequiredVoiceAccess') > openVoiceBodyStart.indexOf("showScreen('voice')")) {
  throw new Error('Premium voice gate runs after voice screen opens');
}

const snippet = [
  extractFunction('getCurrentEntitlement'),
  extractFunction('hasCurrentPremiumAccess'),
  extractFunction('isPremiumRequiredError'),
  extractFunction('showPremiumRequiredVoiceGate'),
  extractFunction('handlePremiumRequiredVoiceAccess'),
  extractFunction('handlePremiumRequiredVoiceError'),
].join('\n');

const now = Date.now();
const toastMessages = [];
const screens = [];
const sandbox = {
  Date,
  currentUser: {
    id: 'premium-expired-smoke',
    trialEndsAt: now - 864e5,
    entitlement: { status: 'expired', plan: 'trial', accessUntil: now - 864e5 },
  },
  toastMessages,
  screens,
  showToast(message) {
    toastMessages.push(message);
  },
  showSubScreen(id) {
    screens.push(id);
  },
  setTimeout(fn) {
    fn();
  },
};

vm.createContext(sandbox);
vm.runInContext(`${snippet}\nresult = handlePremiumRequiredVoiceAccess();`, sandbox);

if (sandbox.result !== true) throw new Error('expired Premium user was not blocked');
if (!sandbox.toastMessages.some((message) => /Голосовой режим доступен с Premium/.test(message))) {
  throw new Error('voice Premium denial copy missing');
}
if (!sandbox.screens.includes('subscription')) {
  throw new Error('voice Premium denial did not route to subscription');
}

vm.runInContext(
  "premiumErrorResult = handlePremiumRequiredVoiceError({status:403,message:'premium entitlement required'});",
  sandbox,
);
if (sandbox.premiumErrorResult !== true) {
  throw new Error('premium Worker-style voice error was not handled');
}

console.log('premium voice gate smoke: PASS');
