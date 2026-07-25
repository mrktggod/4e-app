import fs from 'node:fs';

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

const voiceHtmlStart = source.indexOf('<!-- VOICE SCREEN -->');
const voiceHtmlEnd = source.indexOf('<div class="global-nav"', voiceHtmlStart);
const voiceHtml = source.slice(voiceHtmlStart, voiceHtmlEnd);
const closeVoiceCalls = [...voiceHtml.matchAll(/onclick="closeVoice\(\)"/g)].length;
if (closeVoiceCalls < 2) {
  throw new Error('voice back and cancel controls must both call closeVoice()');
}

const openVoiceStart = source.indexOf('async function openVoice(){');
const openVoiceHead = source.slice(openVoiceStart, openVoiceStart + 360);
if (!openVoiceHead.includes('rememberVoiceReturnScreen();')) {
  throw new Error('openVoice does not remember previous screen');
}
if (openVoiceHead.indexOf('rememberVoiceReturnScreen();') > openVoiceHead.indexOf("showScreen('voice')")) {
  throw new Error('voice return screen is remembered after entering voice');
}

const closeVoice = extractFunction('closeVoice');
for (const expected of [
  'recognition.onend=null',
  'recognition.onresult=null',
  'recognition.onerror=null',
  'recognition.stop()',
  'recognition=null',
  'clearVoiceTransientState()',
  'returnFromVoice()',
]) {
  if (!closeVoice.includes(expected)) {
    throw new Error(`closeVoice missing ${expected}`);
  }
}

const clearVoiceTransientState = extractFunction('clearVoiceTransientState');
if (!clearVoiceTransientState.includes('voiceTimers.forEach(id=>clearTimeout(id))')) {
  throw new Error('voice transient cleanup does not clear queued timers');
}
if (!clearVoiceTransientState.includes("setVoiceStep(id.replace('vs-',''),'pending')")) {
  throw new Error('voice transient cleanup does not reset steps');
}

const voiceBlockStart = source.indexOf('// VOICE');
const voiceBlockEnd = source.indexOf('// ===== SUBSCREEN NAVIGATION =====', voiceBlockStart);
const voiceBlock = source.slice(voiceBlockStart, voiceBlockEnd);
const directSetTimeouts = [...voiceBlock.matchAll(/setTimeout\(/g)].length;
if (directSetTimeouts !== 1 || !extractFunction('queueVoiceTimeout').includes('setTimeout(')) {
  throw new Error('voice flow must use queueVoiceTimeout for cancellable timers');
}

const returnFromVoice = extractFunction('returnFromVoice');
if (!returnFromVoice.includes('VOICE_SAFE_RETURN_SCREENS.has(voiceReturnScreen)')) {
  throw new Error('returnFromVoice does not validate safe screen target');
}
if (!returnFromVoice.includes("goHome()") || !returnFromVoice.includes('showScreen(target)')) {
  throw new Error('returnFromVoice missing home/default screen returns');
}

console.log('voice exit controls smoke: PASS');
