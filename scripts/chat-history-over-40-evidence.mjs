import { readFileSync } from 'node:fs';

const source = readFileSync('index.html', 'utf8');
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function numberedMessages(prefix, count) {
  return Array.from({ length: count }, (_, index) => {
    const n = String(index + 1).padStart(2, '0');
    return {
      id: `${prefix}-${n}`,
      role: index % 2 ? 'assistant' : 'user',
      content: `${prefix}-message-${n}`,
      ts: 1784664000000 + index * 1000,
    };
  });
}

const ASK_HISTORY_MAX = 40;
const aiMessages = numberedMessages('ai', 60);
let askHistory = aiMessages.slice();
if (askHistory.length > ASK_HISTORY_MAX) askHistory = askHistory.slice(-ASK_HISTORY_MAX);

assert(source.includes('const ASK_HISTORY_MAX = 40;'), 'ASK_HISTORY_MAX is not 40 in index.html');
assert(source.includes("askHistory = askHistory.slice(-ASK_HISTORY_MAX)"), 'AI local history trim is missing');
assert(source.includes("'/ai/messages?limit=' + ASK_HISTORY_MAX"), 'AI remote history request does not use ASK_HISTORY_MAX');
assert(askHistory.length === 40, `AI local window expected 40, got ${askHistory.length}`);
assert(askHistory[0]?.content === 'ai-message-21', `AI local first visible should be ai-message-21, got ${askHistory[0]?.content}`);
assert(askHistory.at(-1)?.content === 'ai-message-60', `AI local last visible should be ai-message-60, got ${askHistory.at(-1)?.content}`);

const remoteAiFixture = aiMessages.slice(-ASK_HISTORY_MAX);
const remoteAiLoaded = remoteAiFixture
  .filter(message => (message.role === 'user' || message.role === 'assistant') && message.content)
  .map(message => ({ id: message.id || '', role: message.role, content: message.content, actions: [] }));

assert(remoteAiLoaded.length === 40, `AI remote loaded window expected 40, got ${remoteAiLoaded.length}`);
assert(remoteAiLoaded[0]?.content === 'ai-message-21', `AI remote first visible should be ai-message-21, got ${remoteAiLoaded[0]?.content}`);
assert(remoteAiLoaded.at(-1)?.content === 'ai-message-60', `AI remote last visible should be ai-message-60, got ${remoteAiLoaded.at(-1)?.content}`);

const taskMessages = numberedMessages('task', 60);
const taskApiWindow = taskMessages.slice(-40);
const taskUiRenderedCountIfSupplied = taskMessages.map(message => message.content).length;

assert(source.includes("'/messages/task?taskId='+encodeURIComponent(currentTaskId)+'&limit=40'"), 'Task chat load request does not use limit=40');
assert(source.includes('currentTaskMessages=d.messages.filter(function(message){'), 'Task chat loader no longer maps d.messages into currentTaskMessages');
assert(source.includes('list.innerHTML=currentTaskMessages.map(function(message){'), 'Task chat UI render no longer maps all currentTaskMessages');
assert(source.includes('const history=currentTaskMessages.slice(-6).map(function(message){'), 'Task chat AI prompt context no longer uses last 6 messages');
assert(taskApiWindow.length === 40, `Task API fixture window expected 40, got ${taskApiWindow.length}`);
assert(taskApiWindow[0]?.content === 'task-message-21', `Task API first visible should be task-message-21, got ${taskApiWindow[0]?.content}`);
assert(taskApiWindow.at(-1)?.content === 'task-message-60', `Task API last visible should be task-message-60, got ${taskApiWindow.at(-1)?.content}`);
assert(taskUiRenderedCountIfSupplied === 60, `Task UI supplied-message render expected 60, got ${taskUiRenderedCountIfSupplied}`);

const proof = {
  ai: {
    fixtureMessages: aiMessages.length,
    localSessionWindow: askHistory.length,
    localFirstVisible: askHistory[0]?.content,
    localLastVisible: askHistory.at(-1)?.content,
    remoteRequestedLimit: ASK_HISTORY_MAX,
    remoteLoadedWindow: remoteAiLoaded.length,
  },
  taskChat: {
    fixtureMessages: taskMessages.length,
    frontendRequestedLimit: 40,
    apiWindowFirstVisible: taskApiWindow[0]?.content,
    apiWindowLastVisible: taskApiWindow.at(-1)?.content,
    uiRenderedCountIfSupplied: taskUiRenderedCountIfSupplied,
    promptContextWindow: 6,
  },
  conclusion: 'Frontend shows a last-message window without pagination; this evidence does not prove remote storage loss.',
};

if (failures.length) {
  console.error('chat-history-over-40 evidence failed');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('chat-history-over-40 evidence passed');
console.log(JSON.stringify(proof, null, 2));
