const BASE_URL = process.env.WORKER_BASE_URL || process.env.API_BASE_URL || 'https://edge.4-ai.site';
const TASK_CHAT = `smoke-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

function log(message) {
  process.stdout.write(String(message) + '\n');
}

async function request(path, options = {}) {
  const url = BASE_URL.replace(/\/$/, '') + path;
  const start = Date.now();
  const res = await fetch(url, options);
  const text = await res.text();
  const elapsed = Date.now() - start;
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { ok: res.ok, status: res.status, body, elapsed, url, text };
}

function assert(cond, message) {
  if (!cond) {
    throw new Error(message);
  }
}

function asTasksArray(response) {
  if (!Array.isArray(response.body)) {
    throw new Error(`Expected array from ${response.url}, got ${typeof response.body}`);
  }
  return response.body;
}

function sanitizeTask(taskText) {
  return String(taskText || '').replace(/\s+/g, ' ').trim();
}

(async () => {
  log(`api-smoke: worker=${BASE_URL}`);

  const email = `smart013-smoke-${Date.now()}@example.org`;
  const password = 'SmokePass123!';
  const name = 'Smoke User';

  const reg = await request('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
  log(`register: ${reg.status} ${reg.elapsed}ms`);
  assert(reg.status === 200 || reg.status === 201, 'register failed');

  const login = await request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  log(`login: ${login.status} ${login.elapsed}ms`);
  assert(login.status === 200, 'login failed');
  assert(login.body?.token, 'login token missing');

  const token = login.body.token;
  const authHeaders = {
    'Content-Type': 'application/json',
    'x-token': token,
  };

  const me = await request('/auth/me', { method: 'GET', headers: authHeaders });
  log(`auth/me: ${me.status} ${me.elapsed}ms`);
  assert(me.status === 200 && me.body?.ok === true, 'auth/me failed');

  const taskText = `SMART-013 smoke ${sanitizeTask(TASK_CHAT)}`;
  const before = await request(`/tasks?chatId=${encodeURIComponent(TASK_CHAT)}`, {
    method: 'GET',
    headers: authHeaders,
  });
  log(`tasks.list.before: ${before.status} ${before.elapsed}ms`);
  assert(before.status === 200, 'tasks list before failed');
  const beforeIds = new Set(asTasksArray(before).map((item) => String(item.id || '')));

  const create = await request('', {
    method: 'POST',
    headers: { ...authHeaders, 'x-action': 'save-task' },
    body: JSON.stringify({
      chatId: TASK_CHAT,
      task: {
        text: taskText,
        person: 'Smoke Person',
        direction: 'outgoing',
        directionLabel: 'Работа',
        deadline: null,
      },
    }),
  });
  log(`tasks.create: ${create.status} ${create.elapsed}ms`);
  assert(create.status === 200 && create.body?.ok !== false, 'tasks create failed');

  const after = await request(`/tasks?chatId=${encodeURIComponent(TASK_CHAT)}`, {
    method: 'GET',
    headers: authHeaders,
  });
  log(`tasks.list.after: ${after.status} ${after.elapsed}ms`);
  const afterTasks = asTasksArray(after);
  assert(afterTasks.length >= beforeIds.size + 1, 'tasks list after should contain created task');

  const created = afterTasks.find((item) => {
    return sanitizeTask(item.text) === taskText && !beforeIds.has(String(item.id || ''));
  });
  const createdId = created?.id;
  assert(createdId, 'created task id not found');

  const done = await request('', {
    method: 'POST',
    headers: { ...authHeaders, 'x-action': 'done-task' },
    body: JSON.stringify({ chatId: TASK_CHAT, taskId: createdId }),
  });
  log(`tasks.done: ${done.status} ${done.elapsed}ms`);
  assert(done.status === 200 && done.body?.ok !== false, 'done-task failed');

  const del = await request('', {
    method: 'POST',
    headers: { ...authHeaders, 'x-action': 'delete-task' },
    body: JSON.stringify({ chatId: TASK_CHAT, taskId: createdId }),
  });
  log(`tasks.delete: ${del.status} ${del.elapsed}ms`);
  assert(del.status === 200 && del.body?.ok !== false, 'delete-task failed');

  const emptyTranscribe = await request('/transcribe', {
    method: 'POST',
    headers: authHeaders,
    body: new FormData(),
  });
  log(`transcribe(no-file): ${emptyTranscribe.status} ${emptyTranscribe.elapsed}ms`);
  assert(emptyTranscribe.status === 400, 'transcribe without file should return 400');

  log('api-smoke: OK');
})().catch((error) => {
  console.error('api-smoke failed:', error.message);
  process.exit(1);
});
