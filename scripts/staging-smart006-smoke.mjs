const BASE_URL = process.env.STAGING_WORKER_BASE_URL || 'https://restless-lab-d737-staging.shelckograff.workers.dev';

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

function isoInHours(hours) {
  return new Date(Date.now() + hours * 36e5).toISOString();
}

function getAskTaskDoneTimestamp(task) {
  const keys = ['completedAt', 'doneAt', 'finishedAt', 'updatedAt', 'ts'];
  for (const key of keys) {
    const value = task?.[key];
    if (value === null || value === undefined || value === '') continue;
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return null;
}

function buildAskUserProfileSummary(tasks, currentUser) {
  const activeTasks = tasks.filter((task) => !task.done);
  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  let burningCount = 0;
  let overdueCount = 0;
  for (const task of activeTasks) {
    if (!task?.deadline) continue;
    const deadlineTs = Date.parse(task.deadline);
    if (Number.isNaN(deadlineTs)) continue;
    if (deadlineTs < now) {
      overdueCount += 1;
      continue;
    }
    const hoursLeft = Math.round((deadlineTs - now) / 36e5);
    if (hoursLeft <= 24) burningCount += 1;
  }
  const doneWeekCount = tasks.filter((task) => {
    if (!task?.done) return false;
    const doneTs = getAskTaskDoneTimestamp(task);
    return doneTs !== null && doneTs >= weekAgo;
  }).length;
  const currentName = String(currentUser?.name || currentUser?.email || 'Пользователь').trim();
  const currentNameLower = currentName.toLowerCase();
  const topPeopleMap = new Map();
  for (const task of activeTasks) {
    const rawPerson = String(task?.person || '').trim();
    if (!rawPerson) continue;
    const normalized = rawPerson.toLowerCase();
    if (normalized === 'я' || normalized === 'мне' || normalized === 'мой' || normalized === currentNameLower) continue;
    topPeopleMap.set(rawPerson, (topPeopleMap.get(rawPerson) || 0) + 1);
  }
  const topPeople = Array.from(topPeopleMap.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ru'))
    .slice(0, 3)
    .map(([name, count]) => `${name} (${count})`)
    .join(', ') || 'нет данных';
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown';
  const localTime = new Date().toLocaleString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    day: 'numeric',
    month: 'long',
  });
  let planLabel = 'не указан';
  if (currentUser?.plan) planLabel = String(currentUser.plan);
  else if (currentUser?.trialActive === true) planLabel = 'trial';
  else if (currentUser?.trialActive === false) planLabel = 'trial_expired';
  return [
    'Профиль пользователя:',
    '- Имя: ' + currentName,
    '- Локальное время: ' + localTime + ' (' + tz + ')',
    '- Тариф: ' + planLabel,
    '- Активных задач: ' + activeTasks.length,
    '- Горит: ' + burningCount,
    '- Просрочено: ' + overdueCount,
    '- Завершено за 7 дней: ' + doneWeekCount,
    '- Топ людей в задачах: ' + topPeople,
  ].join('\n');
}

function buildTaskSummary(tasks) {
  const activeTasks = tasks.filter((task) => !task.done).slice(0, 12);
  if (!activeTasks.length) return 'Активных задач нет.';
  return 'Активные задачи: ' + activeTasks.map((task) => {
    const now = Date.now();
    const deadlineTs = task.deadline ? new Date(task.deadline).getTime() : null;
    const hoursLeft = deadlineTs ? Math.round((deadlineTs - now) / 36e5) : null;
    const status = deadlineTs && deadlineTs < now ? 'просрочено' : (hoursLeft !== null && hoursLeft <= 24 ? 'burning' : null);
    let info = '[' + String(task.id || '') + '] ' + (task.person || 'Я') + ' — ' + task.text;
    if (task.deadline) info += ' (дедлайн: ' + task.deadline + ')';
    else info += ' (без дедлайна)';
    if (status) info += ' [status: ' + status + ']';
    return info;
  }).join('; ');
}

async function askAnthropic(token, system, question) {
  const response = await request('/anthropic', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-token': token,
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      system,
      messages: [{ role: 'user', content: question }],
    }),
  });
  assert(response.status === 200, `anthropic failed for "${question}": ${response.status} ${response.text}`);
  const text = response.body?.content?.[0]?.text || '';
  assert(text, `anthropic empty response for "${question}"`);
  return { response, text };
}

(async () => {
  log(`staging-smart006-smoke: worker=${BASE_URL}`);

  const email = `smart006-staging-${Date.now()}@example.org`;
  const password = 'SmokePass123!';
  const name = 'Юрий Смоук';

  const register = await request('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
  log(`register: ${register.status} ${register.elapsed}ms`);
  assert(register.status === 200 || register.status === 201, 'register failed');

  const login = await request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  log(`login: ${login.status} ${login.elapsed}ms`);
  assert(login.status === 200 && login.body?.token, 'login failed');
  const token = login.body.token;

  const me = await request('/auth/me', {
    method: 'GET',
    headers: { 'x-token': token },
  });
  log(`auth/me: ${me.status} ${me.elapsed}ms`);
  assert(me.status === 200 && me.body?.ok === true && me.body?.user, 'auth/me failed');
  const currentUser = me.body.user;

  const tasksToSeed = [
    {
      id: `smart006-burning-${Date.now()}`,
      text: 'Срочно отправить КП Васе',
      person: 'Вася',
      direction: 'outgoing',
      directionLabel: 'Работа',
      deadline: isoInHours(2),
      done: false,
    },
    {
      id: `smart006-vasya-${Date.now() + 1}`,
      text: 'Добить смету для Васи',
      person: 'Вася',
      direction: 'outgoing',
      directionLabel: 'Работа',
      deadline: isoInHours(30),
      done: false,
    },
    {
      id: `smart006-masha-${Date.now() + 2}`,
      text: 'Созвониться с Машей по договору',
      person: 'Маша',
      direction: 'outgoing',
      directionLabel: 'Работа',
      deadline: isoInHours(72),
      done: false,
    },
    {
      id: `smart006-done-${Date.now() + 3}`,
      text: 'Закрыть прошлый отчёт',
      person: 'Игорь',
      direction: 'outgoing',
      directionLabel: 'Работа',
      deadline: isoInHours(-24),
      done: true,
      doneAt: Date.now() - 12 * 36e5,
      status: 'done',
    },
  ];

  for (const task of tasksToSeed) {
    const create = await request('', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-token': token,
        'x-action': 'save-task',
      },
      body: JSON.stringify({ task }),
    });
    log(`seed-task ${task.person}: ${create.status} ${create.elapsed}ms`);
    assert(create.status === 200, `save-task failed for ${task.text}`);
  }

  const tasksResponse = await request('/tasks', {
    method: 'GET',
    headers: { 'x-token': token },
  });
  log(`tasks: ${tasksResponse.status} ${tasksResponse.elapsed}ms`);
  assert(tasksResponse.status === 200 && Array.isArray(tasksResponse.body), 'tasks fetch failed');
  const tasks = tasksResponse.body;

  const today = new Date().toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const system = [
    'Ты — 4, персональный AI-секретарь. Отвечай коротко, по-русски, дружелюбно.',
    '',
    'Сегодня: ' + today,
    buildAskUserProfileSummary(tasks, currentUser),
    buildTaskSummary(tasks),
  ].join('\n');

  const qName = await askAnthropic(token, system, 'Как меня зовут?');
  log(`ask.name: ${qName.response.status} ${qName.response.elapsed}ms :: ${qName.text}`);
  assert(/юрий/i.test(qName.text), 'name response does not mention Юрий');

  const qBurn = await askAnthropic(token, system, 'Что у меня горит?');
  log(`ask.burning: ${qBurn.response.status} ${qBurn.response.elapsed}ms :: ${qBurn.text}`);
  assert(/вас/i.test(qBurn.text) || /кп/i.test(qBurn.text), 'burning response does not mention Вася/КП');

  const qDebt = await askAnthropic(token, system, 'Кому я больше всего должен?');
  log(`ask.debt: ${qDebt.response.status} ${qDebt.response.elapsed}ms :: ${qDebt.text}`);
  assert(/вас/i.test(qDebt.text), 'debt response does not mention Вася');

  log('staging-smart006-smoke: OK');
})().catch((error) => {
  console.error('staging-smart006-smoke failed:', error.message);
  process.exit(1);
});
