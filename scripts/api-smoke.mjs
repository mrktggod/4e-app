const BASE_URL = process.env.WORKER_BASE_URL || process.env.API_BASE_URL || 'https://edge.4-ai.site';

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

  const forgotEmpty = await request('/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  log(`forgot-password(empty): ${forgotEmpty.status} ${forgotEmpty.elapsed}ms`);
  assert(forgotEmpty.status === 400, 'forgot-password without email should return 400');

  const forgotInvalid = await request('/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'fff' }),
  });
  log(`forgot-password(invalid): ${forgotInvalid.status} ${forgotInvalid.elapsed}ms`);
  assert(forgotInvalid.status === 400, 'forgot-password with invalid email should return 400');
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

  let token = login.body.token;
  let secondToken = '';

  const linkTelegram = async (userToken, telegramId, label) => {
    const res = await request('/auth/telegram', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-token': userToken,
      },
      body: JSON.stringify({ telegramId }),
    });
    log(`telegram link(${label}): ${res.status} ${res.elapsed}ms`);
    assert(res.status === 200, 'telegram link failed');
    assert(res.body?.ok === true, 'telegram link should return ok=true');
    return res.body?.token || userToken;
  };

  const authHeaders = {
    'Content-Type': 'application/json',
    'x-token': token,
  };

  const me = await request('/auth/me', { method: 'GET', headers: authHeaders });
  log(`auth/me: ${me.status} ${me.elapsed}ms`);
  assert(me.status === 200 && me.body?.ok === true, 'auth/me failed');

  const secondUserEmail = `smart030-smoke-${Date.now()}-2@example.org`;
  const secondUserPassword = 'SmokePass123!';
  const secondReg = await request('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: secondUserEmail, password: secondUserPassword, name: 'Smoke User 2' }),
  });
  log(`register(user2): ${secondReg.status} ${secondReg.elapsed}ms`);
  assert(secondReg.status === 200 || secondReg.status === 201, 'second user register failed');

  const secondLogin = await request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: secondUserEmail, password: secondUserPassword }),
  });
  log(`login(user2): ${secondLogin.status} ${secondLogin.elapsed}ms`);
  assert(secondLogin.status === 200, 'second user login failed');
  assert(secondLogin.body?.token, 'second user login token missing');

  const assigneeTgId = `9${Math.floor(Math.random() * 1e8).toString().padStart(8, '0')}`;
  const receiverTgId = `8${Math.floor(Math.random() * 1e8).toString().padStart(8, '0')}`;

  token = await linkTelegram(token, assigneeTgId, 'creator');
  authHeaders['x-token'] = token;

  const secondHeaders = {
    'Content-Type': 'application/json',
    'x-token': secondLogin.body.token,
  };
  secondToken = secondLogin.body.token;
  secondToken = await linkTelegram(secondToken, receiverTgId, 'receiver');
  secondHeaders['x-token'] = secondToken;

  const receiverMe = await request('/auth/me', { method: 'GET', headers: secondHeaders });
  assert(receiverMe.status === 200 && receiverMe.body?.ok === true, 'receiver auth/me failed');

  const taskText = `BACK-030 smoke ${sanitizeTask(Date.now())}`;
  const taskId = `smoke-task-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  const before = await request('/tasks', {
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
      task: {
        id: taskId,
        text: taskText,
        person: 'Smoke Person',
        assigneeUsername: 'SmokeUser',
        assigneeTgId: receiverTgId,
        direction: 'outgoing',
        directionLabel: 'Работа',
        deadline: null,
      },
    }),
  });
  log(`tasks.create: ${create.status} ${create.elapsed}ms`);
  assert(create.status === 200 && create.body?.ok !== false, 'tasks create failed');

  const after = await request('/tasks', {
    method: 'GET',
    headers: authHeaders,
  });
  log(`tasks.list.after: ${after.status} ${after.elapsed}ms`);
  const afterTasks = asTasksArray(after);
  assert(afterTasks.length >= beforeIds.size + 1, 'tasks list after should contain created task');

  const created = afterTasks.find((item) => {
    return sanitizeTask(item.text) === taskText || String(item.id || '') === String(taskId);
  });
  assert(created, 'created task not found in list by id/text');
  const createdId = created.id || taskId;
  assert(String((created.assigneeUsername || '').toLowerCase()) === 'smokeuser', 'assigneeUsername should be normalized');
  assert(String(created?.assigneeTgId || '').trim() === receiverTgId, 'assigneeTgId should be stored');
  assert(createdId, 'created task id not found');

  const receiverTasksResponse = await request('/tasks', {
    method: 'GET',
    headers: secondHeaders,
  });
  log(`tasks.list.receiver: ${receiverTasksResponse.status} ${receiverTasksResponse.elapsed}ms`);
  assert(receiverTasksResponse.status === 200, 'receiver tasks list failed');
  const receiverTasks = asTasksArray(receiverTasksResponse);
  const receiverCreated = receiverTasks.find((item) => String(item.id || '') === String(createdId));
  assert(!!receiverCreated, 'created task should be copied to assignee user task list');

  const done = await request('', {
    method: 'POST',
    headers: { ...authHeaders, 'x-action': 'done-task' },
    body: JSON.stringify({ taskId: createdId }),
  });
  log(`tasks.done: ${done.status} ${done.elapsed}ms`);
  assert(done.status === 200 && done.body?.ok !== false, 'done-task failed');

  const del = await request('', {
    method: 'POST',
    headers: { ...authHeaders, 'x-action': 'delete-task' },
    body: JSON.stringify({ taskId: createdId }),
  });
  log(`tasks.delete: ${del.status} ${del.elapsed}ms`);
  assert(del.status === 200 && del.body?.ok !== false, 'delete-task failed');

  if (process.env.SKIP_SMART013_SMOKE !== '1') {
    const prompt = {
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 128,
      messages: [
        {
          role: 'user',
          content: 'Generate 4-8 task steps: ' + taskText,
        },
      ],
      stream: false,
    };
    const ai = await request('/anthropic', {
      method: 'POST',
      headers: { ...authHeaders, 'Content-Type': 'application/json', 'anthropic-version': '2023-06-01' },
      body: JSON.stringify(prompt),
    });
    log('anthropic(smoke): ' + ai.status + ' ' + ai.elapsed + 'ms');
    assert(ai.status === 200, 'anthropic endpoint should be available for SMART-013 smoke');
  } else {
    log('smart013 smoke skipped (SKIP_SMART013_SMOKE=1)');
  }

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


