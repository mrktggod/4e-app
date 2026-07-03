# ИНСТРУКЦИИ ДЛЯ CODEX — Установка редизайна «4»
> Рабочий файл: `4e-app/index.html`  
> Патчи лежат в: `redesign/patches/`
> Общий план: `ПЛАН_РАЗРАБОТКИ.md`

## НАВИГАЦИЯ — читай до начала работы с index.html

index.html = 4928 строк. Не читай целиком. Используй карту:

1. Прочитай `FILE_MAP_UI.md` — найди нужную секцию (диапазон строк)
2. Читай только её: Read с параметрами offset + limit
3. После правки обнови номера строк в FILE_MAP_UI.md если структура сдвинулась

Быстрая навигация по index.html:
- CSS: строки 1–1300
- HTML (экраны): строки 1301–2800
- JavaScript: строки 2801–4928

---

## 🔴 ПРАВИЛО СЕССИИ — читать первым делом

**За одну сессию = одна фаза. Больше не брать.**

1. Прочитай промпт — там написано какую фазу делать (например: "Установи только Фазу 1")
2. Сделай эту фазу, прогони тест, закоммить
3. Напиши результат → стоп

Если закончил фазу раньше — всё равно стоп. Не берись за следующую без нового промпта.

---

## ⚠️ КРИТИЧЕСКИЕ ПРАВИЛА

### Кодировка файлов (нарушалось 3+ раза — самая частая ошибка)

`index.html` содержит кириллицу. Любой неправильный способ записи СЛОМАЕТ весь текст.

```powershell
# ЧИТАТЬ файл:
$content = [System.IO.File]::ReadAllText("4e-app\index.html", [System.Text.Encoding]::UTF8)

# ПИСАТЬ файл:
[System.IO.File]::WriteAllText("4e-app\index.html", $content, (New-Object System.Text.UTF8Encoding $false))

# ПРОВЕРИТЬ после записи:
Select-String -Path "4e-app\index.html" -Pattern 'Войти|Задачи|Сегодня'
# Если строки не найдены — кириллица сломана, восстановить из git немедленно!
```

**НИКОГДА не использовать:** `Set-Content`, `Out-File`, `-replace` оператор PowerShell для этого файла.

### Санкция на изменение index.html

В `AGENTS.md` написано «index.html — не трогать без крайней нужды».  
**Это правило снято для данной задачи.** Редизайн санкционирован Юрием 2026-06-20.  
Работаем с `index.html` в полном объёме согласно фазам ниже.

### После каждой фазы — обновить DEVELOPMENT_LOG.md

```markdown
## 2026-XX-XX — Редизайн Фаза N: [название]

**Что сделано:** какой патч применён, что изменилось

**Проблемы:** если что-то пошло не так

**Проверка:** какие тесты прошли

**Статус:** применено / отложено
```

---

## Общие правила

1. **Перед каждой фазой** — сделать резервную копию `index.html` (например, `index.backup_phaseN.html`)
2. **После каждой фазы** — запустить тест из раздела «Тест» ниже
3. Если патч конфликтует — написать Claude с описанием конфликта, не чинить самостоятельно
4. Патчи не меняют JS-логику (только структуру HTML и CSS) — вся бизнес-логика остаётся

---

## ФАЗА 1 — Светлая тема (`patches/01_light_theme.css`)

### Куда вставить
Открыть `index.html`, найти блок `:root {` (строка ~14).  
**После** закрывающей скобки `}` этого блока вставить содержимое `01_light_theme.css`.

```
:root { … }
/* ← ВСТАВИТЬ ЗДЕСЬ */
[data-theme="light"] { … }
```

### Подключить переключатель
В функции `setTheme(theme)` (или в `#theme-settings`) добавить:
```js
document.documentElement.setAttribute('data-theme', theme);
localStorage.setItem('theme', theme);
```
При загрузке приложения:
```js
const saved = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', saved);
```

### Тест
- [ ] Переключить тему в Профиль → Тема
- [ ] Все 5 основных экранов выглядят корректно в светлой теме
- [ ] Переключение мгновенное, без мигания
- [ ] После перезагрузки тема сохраняется

---

## ФАЗА 2 — Главный экран (`patches/02_home_screen.html`)

### Куда вставить
Найти `<div class="screen" id="home"` (строка ~1102).  
Заменить **весь** `<div>` до соответствующего закрывающего `</div>` (строка ~1225)  
на содержимое `02_home_screen.html`.

### Новые ID в HTML (для JS-привязки)
| Старый ID | Новый ID | Назначение |
|---|---|---|
| `hero-count` | `home-task-count` | Счётчик задач в фокусе |
| `lime-card` | `home-task-list` | Список задач |
| `dash-done-today` | `stat-done` | Выполнено |
| `dash-tasks-today` | `stat-tasks` | Задачи |
| `dash-prom-today` | `stat-promises` | Обещания |
| `dash-prog-today` | `stat-progress` | Прогресс % |
| `focus-bar-text` | `focus-day-text` | Текст фокуса дня |

### Тест
- [ ] Главный экран отображается корректно в тёмной и светлой теме
- [ ] Фильтр-табы переключаются (Сегодня / Горит / Люди / Неделя / Месяц)
- [ ] Карточки статистики показывают данные
- [ ] Список задач с нумерацией отображается
- [ ] «Смотреть все дела» раскрывает/сворачивает список

---

## ФАЗА 3 — Новые экраны (`patches/03_new_screens.html`)

### Куда вставить
Найти строку `<!-- VOICE OVERLAY -->` (строка ~2309).  
Вставить содержимое `03_new_screens.html` **перед** этой строкой.

### Новые экраны и их ID
| ID экрана | Открывается функцией | Закрывается |
|---|---|---|
| `#new-task` | `openNewTask()` | `goHome()` |
| `#task-confirm` | `openTaskConfirm(taskData)` | `goHome()` или `openTaskDetail()` |
| `#task-move` | `openTaskMove(taskId)` | `history.back()` |
| `#task-done` | `openTaskDone(taskId)` | `goHome()` |

### Добавить функции в JS
```js
function openNewTask() { showScreen('new-task'); }
function openTaskConfirm(data) {
  // заполнить #confirm-task-title, #confirm-task-date, #confirm-task-dir, #confirm-task-person
  showScreen('task-confirm');
}
function openTaskMove(id) {
  currentTaskId = id;
  showScreen('task-move');
}
function openTaskDone(id) {
  currentTaskId = id;
  showScreen('task-done');
}
```

### Тест
- [ ] Экран «Новая задача» открывается, форма заполняется, задача создаётся
- [ ] Экран «4 понял задачу» показывает правильный summary после голосового ввода
- [ ] Экран «Перенос задачи» — все 4 варианта работают
- [ ] Экран «Задача завершена» — анимация проигрывается, кнопка «Отлично» уходит на главную

---

## ФАЗА 4 — Карточка задачи (`patches/04_task_detail.html`)

### Куда вставить
Найти `<div class="screen" id="task-detail">` (строка ~1298).  
Заменить **весь** блок до закрывающего `</div>` (строка ~1398) на `04_task_detail.html`.

### Маппинг старых ID → новые
| Старый | Новый |
|---|---|
| `detail-title-v2` | `detail-title` |
| `detail-person-v2` | `detail-person` |
| `detail-date-v2` | `detail-date` |
| `detail-deadline-input` | `detail-deadline` |
| `detail-orig-msg` | `detail-description` |
| `detail-done-btn` | `btn-task-complete` |

### Новые кнопки внизу
```js
// Кнопка «Перенести»
document.getElementById('btn-task-move').onclick = () => openTaskMove(currentTaskId);
// Кнопка «Завершить»
document.getElementById('btn-task-complete').onclick = () => completeTask(currentTaskId);
```

### Тест
- [ ] Задача открывается с правильными данными
- [ ] Табы Описание / Комментарии / История переключаются
- [ ] Кнопка «Перенести» открывает экран переноса
- [ ] Кнопка «Завершить» помечает задачу выполненной и открывает экран завершения
- [ ] Кнопка «Изменить» переводит поля в режим редактирования

---

## ФАЗА 5 — Голосовой режим (`patches/05_voice_screen.html`)

### Куда вставить
Найти `<div class="voice-overlay" id="voice-overlay">` (строка ~2310).  
Заменить **весь** блок `voice-overlay` на содержимое `05_voice_screen.html`.

### Изменения в JS
```js
// Было:
function openVoice() {
  document.getElementById('voice-overlay').classList.add('active');
}
function closeVoice() {
  document.getElementById('voice-overlay').classList.remove('active');
}

// Стало:
function openVoice() { showScreen('voice'); }
function closeVoice() { goHome(); }
```

### CSS которые можно удалить
После замены можно убрать блок `/* ===== VOICE OVERLAY ===== */` (строки ~352–371) — стили больше не нужны.

### Тест
- [ ] Нажатие на микрофон в нав-баре открывает полный экран
- [ ] «Слушаю...» / шаги обновляются в реальном времени
- [ ] «Отменить» возвращает на главную без потери данных
- [ ] После распознавания открывается экран подтверждения (#task-confirm)

---

## ФАЗА 6 — Мелкие правки (`patches/06_minor_fixes.html`)

### Чаты (#chats)
Найти `<div class="msng-tabs">` в секции `#chats`.  
Заменить блок `msng-tabs` на новую секцию иконок из патча.

### Календарь (#calendar)
Найти конец секции `#calendar` — после `</div>` блока с `.cal-grid`.  
Добавить секцию «ДЕДЛАЙНЫ» из патча.

### Тест
- [ ] Иконки мессенджеров в чатах — горизонтальный ряд, кликабельны
- [ ] Секция ДЕДЛАЙНЫ в календаре отображается корректно
- [ ] Точки на датах с задачами видны

---

## ФАЗА 7 — Адаптив (`patches/07_responsive.css`)

### Куда вставить
Добавить содержимое `07_responsive.css` в самый конец блока `<style>` в `index.html`,  
перед закрывающим тегом `</style>`.

### JS для sidebar
Добавить в JS-секцию:
```js
function initResponsive() {
  const mq = window.matchMedia('(min-width: 768px)');
  mq.addEventListener('change', e => {
    document.body.classList.toggle('is-wide', e.matches);
  });
  document.body.classList.toggle('is-wide', mq.matches);
}
// вызвать в DOMContentLoaded
```

### Тест
- [ ] 375px (iPhone) — без изменений, нижний нав есть
- [ ] 768px (iPad portrait) — левый сайдбар появляется, нижний нав скрыт
- [ ] 1024px (iPad landscape / ноутбук) — список + деталь рядом
- [ ] 1440px (десктоп) — всё читаемо, ничего не растянуто
- [ ] Hover-эффекты на карточках работают только при наличии мыши

---

## ФАЗА 8 — VK адаптер (`patches/08_vk_adapter.js`)

### Куда вставить
Добавить строку перед закрывающим `</script>` в `index.html`:
```html
<script src="patches/08_vk_adapter.js"></script>
```
Или вставить содержимое файла inline в конец основного `<script>`.

### Что адаптер делает автоматически
- Определяет `isVK` через `window.VKWebAppInit`
- При `isVK = true`: пропускает экран логина, запрашивает данные через `VKWebAppGetUserInfo`
- Подписывается на `VKWebAppUpdateConfig` → применяет тему VK к `[data-theme]`
- Запрашивает safe area → устанавливает CSS-переменные `--safe-top`, `--safe-bottom`
- Перехватывает `localStorage` → проксирует через `VKWebAppStorageSet/Get`
- На Desktop VK (ширина ≥ 680px) — применяет tablet-макет

### Архивировать vk.html
```
mv 4e-app/vk.html 4e-app/vk.ARCHIVED.html
mv 4_vk_mini_app.html 4_vk_mini_app.ARCHIVED.html
```

### Тест
- [ ] Открыть в VK WebView на Android — авторизация без email/пароля
- [ ] Тема VK синхронизируется (тёмная/светлая)
- [ ] Нотч/safe area не перекрывает контент
- [ ] Вибрация при нажатии кнопок (на устройстве)
- [ ] Свайп-назад в VK не закрывает приложение на вложенных экранах
- [ ] Desktop VK — sidebar-макет, не full-screen

---

## ФАЗА 9 — Юридическое соответствие 152-ФЗ (`patches/09_biometric_consent.html`)

> ⚠️ Это не редизайн — это правовое требование. Установить до первого публичного релиза.

### Куда вставить
Вставить содержимое `09_biometric_consent.html` целиком **перед закрывающим `</body>`** в `index.html`.

### Обновить openVoice()
```js
// Было:
function openVoice() { showScreen('voice'); }

// Стало:
function openVoice() {
  if (!window.biometricConsentRequired()) return;
  showScreen('voice');
}
```

### Задеплоить privacy.html
Файл `4e-app/privacy.html` уже создан. Нужно только закоммитить:
```powershell
cd 4e-app
git add privacy.html
git commit -m "legal: add privacy policy page"
git push
```

### Добавить ссылку на политику в онбординг/регистрацию
Найти форму регистрации или онбординг (`#onboarding` или `#login`) и добавить:
```html
<p class="legal-note">
  Нажимая «Войти», вы соглашаетесь с
  <a href="privacy.html" target="_blank">Политикой конфиденциальности</a>
</p>
```

### Тест
- [ ] При первом нажатии на микрофон появляется экран согласия
- [ ] Кнопка «Разрешить голосовой ввод» неактивна пока не нажат чекбокс
- [ ] После согласия голосовой экран открывается нормально
- [ ] Повторное нажатие на микрофон — экран согласия больше не показывается
- [ ] Ссылка на Политику конфиденциальности открывается
- [ ] `mrktggod.github.io/4e-app/privacy.html` доступна после деплоя

### Готовый промпт для запуска этой фазы
```
Установи только Фазу 9 из CODEX_INSTRUCTIONS.md.
Фаза 9 = вставить 09_biometric_consent.html перед </body>, обновить openVoice(),
закоммитить privacy.html, добавить ссылку в форму логина.
Шаг 0 до/после. Тест Фазы 9. Коммит "legal: biometric consent and privacy policy". Стоп.
```

---

## Частые проблемы

| Проблема | Решение |
|---|---|
| После замены экрана JS перестал заполнять данные | Проверить маппинг ID (раздел «Маппинг» для каждой фазы) |
| Светлая тема не применяется | Убедиться что `setAttribute('data-theme','light')` идёт на `<html>`, а не `<body>` |
| VK не отдаёт данные пользователя | Проверить что `VKWebAppInit` вызван первым, до любых других bridge-запросов |
| Сайдбар на планшете перекрывает контент | Проверить что `.screen` имеет `margin-left: var(--sidebar-width)` при `is-wide` |
| Анимация голосового экрана не запускается | Функция `startVoiceSteps()` должна вызываться после `showScreen('voice')` |

---

*Вопросы по дизайну — Claude. Вопросы по JS-логике — Codex решает самостоятельно.*

---

## ФАЗА 11 — Относительные даты в карточках задач

> Цель: вместо `2026-06-20` показывать `Сегодня`, `Завтра`, `Вчера`, `2 дня`, `скоро` (красный если ≤2 дней).

### Шаг 0 — Проверка кодировки (обязательно)
```powershell
cd <repo-root>
$before = (Select-String -Path "4e-app\index.html" -Pattern 'Войти|Задачи|Сегодня').Count
Write-Host "BEFORE: $before совпадений"
# Ожидаем 26-27
```

### Шаг 1 — Найти место для функции relativeDate
```powershell
Select-String -Path "4e-app\index.html" -Pattern "function e2\(" -n
# Запомни номер строки (назовём его LINE_E2)
```

### Шаг 2 — Прочитать 3 строки вокруг найденного места
```powershell
$content = [System.IO.File]::ReadAllText("4e-app\index.html", [System.Text.Encoding]::UTF8)
```

### Шаг 3 — Вставить функцию relativeDate СРАЗУ ПОСЛЕ функции e2

Найти в файле строку:
```
function e2(s){return(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
```

Заменить на:
```
function e2(s){return(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function relativeDate(s){
  if(!s) return '';
  var d=new Date(s.includes('.')? s.split('.').reverse().join('-') : s);
  if(isNaN(d)) return s;
  var now=new Date(); var today=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  var target=new Date(d.getFullYear(),d.getMonth(),d.getDate());
  var diff=Math.round((target-today)/(1000*60*60*24));
  if(diff===0) return 'Сегодня';
  if(diff===1) return 'Завтра';
  if(diff===-1) return 'Вчера';
  if(diff>1 && diff<=6) return 'Через '+diff+' дн.';
  if(diff<0) return Math.abs(diff)+' дн. назад';
  var mo=['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'];
  return d.getDate()+' '+mo[d.getMonth()];
}
function deadlineBadge(s){
  if(!s) return '';
  var d=new Date(s.includes('.')? s.split('.').reverse().join('-') : s);
  if(isNaN(d)) return '';
  var diff=Math.round((d-new Date())/(1000*60*60*24));
  if(diff<0) return '<span style="color:#e05555;font-size:10px;font-weight:600"> · просрочено</span>';
  if(diff<=2) return '<span style="color:#e08c30;font-size:10px;font-weight:600"> · скоро</span>';
  return '';
}
```

### Шаг 4 — Найти все места рендера `.task-row-meta` (4 места)
```powershell
Select-String -Path "4e-app\index.html" -Pattern "task-row-meta" -n
```

В каждом из 4 мест заменить:
```
'<div class="task-row-meta">' + (t.deadline ? '📅 ' + e2(t.deadline) : (t.date ? e2(t.date) : '')) + '</div>'
```
на:
```
'<div class="task-row-meta">' + (t.deadline ? '📅 ' + relativeDate(t.deadline) + deadlineBadge(t.deadline) : (t.date ? relativeDate(t.date) : '')) + '</div>'
```

> Если строки отличаются незначительно (кавычки, пробелы) — адаптируй замену под реальный код, но смысл одинаковый: `e2(t.deadline)` → `relativeDate(t.deadline) + deadlineBadge(t.deadline)`.

### Шаг 5 — Записать файл и проверить кодировку
```powershell
# (уже прочитан в Шаг 2, делай замены в переменной $content, затем:)
[System.IO.File]::WriteAllText("4e-app\index.html", $content, (New-Object System.Text.UTF8Encoding $false))
$after = (Select-String -Path "4e-app\index.html" -Pattern 'Войти|Задачи|Сегодня').Count
Write-Host "AFTER: $after совпадений"
# Должно быть >= BEFORE (добавили 'Сегодня' в код → может вырасти на 1-3)
```

### Шаг 6 — Деплой
```powershell
Copy-Item "4e-app\index.html" ".tmp-4e-app-publish\index.html"
cd .tmp-4e-app-publish
git add index.html
git commit -m "feat: relative dates in task cards phase 11"
git push
cd ..
```

### Тест Фазы 11
- [ ] Задача с дедлайном сегодня → показывает «Сегодня»
- [ ] Задача с дедлайном завтра → показывает «Завтра»
- [ ] Задача с просроченным дедлайном → «N дн. назад» красным
- [ ] Задача без даты → пусто (не ломается)
- [ ] Задача с дедлайном послезавтра → «Через 2 дн.» + оранжевый «· скоро»

### Готовый промпт Codex
```
Установи Фазу 11 из `CODEX_INSTRUCTIONS.md` из текущего репозитория.
Фаза 11 = добавить функции relativeDate() и deadlineBadge() после e2(), заменить e2(t.deadline) → relativeDate()+deadlineBadge() в 4 местах рендера карточек.
Шаг 0 до/после. Тест Фазы 11. Коммит "feat: relative dates phase 11". Стоп.
```

---

## ФАЗА 12 — Backend: Email + Сброс пароля

> Цель: починить отправку email через Resend + добавить эндпоинт сброса пароля.

### Контекст (читать обязательно)
- Worker: `4e-worker/worker.js` (минифицирован — **не редактировать напрямую**)
- Исходник: `4e-worker/src/` — редактировать здесь, потом собирать
- Деплой Worker: `cd 4e-worker && npx wrangler deploy`
- Resend API key: в `wrangler.toml` как `RESEND_API_KEY` или в Cloudflare Secrets

### Шаг 0 — Проверить текущий эндпоинт email
```powershell
Select-String -Path "4e-worker\src\index.js" -Pattern "resend|send-email|sendEmail" -n
# Найди где вызывается отправка email
```

### Шаг 1 — Найти и починить отправку через Resend

Найти в `src/index.js` или `src/bot/` функцию отправки email. Типичная ошибка — неверный `from` адрес или отсутствие `Authorization: Bearer`.

Правильный вызов Resend:
```javascript
async function sendEmail(to, subject, html, env) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + env.RESEND_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'noreply@4-ai.site',  // домен должен быть верифицирован в Resend
      to: [to],
      subject: subject,
      html: html
    })
  });
  const data = await res.json();
  if (!res.ok) throw new Error('Resend error: ' + JSON.stringify(data));
  return data;
}
```

### Шаг 2 — Добавить эндпоинт сброса пароля

В обработчике роутов добавить два новых case:

```javascript
// POST /auth/reset-request
// Body: { email: "..." }
if (path === '/auth/reset-request' && method === 'POST') {
  const { email } = await request.json();
  // Найти пользователя по email в KV
  const userKey = 'user:email:' + email.toLowerCase();
  const userId = await env.KV.get(userKey);
  if (!userId) return new Response(JSON.stringify({ok:true})); // не раскрываем существование
  // Создать токен
  const token = crypto.randomUUID();
  await env.KV.put('reset:' + token, userId, { expirationTtl: 3600 }); // 1 час
  // Отправить email
  const link = 'https://mrktggod.github.io/4e-app/?reset=' + token;
  await sendEmail(email, 'Сброс пароля — 4 AI', 
    '<p>Ссылка для сброса пароля (действует 1 час):</p><p><a href="' + link + '">' + link + '</a></p>', 
    env);
  return new Response(JSON.stringify({ok:true}));
}

// POST /auth/reset-confirm  
// Body: { token: "...", newPassword: "..." }
if (path === '/auth/reset-confirm' && method === 'POST') {
  const { token, newPassword } = await request.json();
  const userId = await env.KV.get('reset:' + token);
  if (!userId) return new Response(JSON.stringify({error:'Токен недействителен или истёк'}), {status:400});
  // Хешировать новый пароль (используй тот же метод что и при регистрации)
  const hash = await hashPassword(newPassword); // функция должна уже существовать
  await env.KV.put('user:' + userId + ':password', hash);
  await env.KV.delete('reset:' + token);
  return new Response(JSON.stringify({ok:true}));
}
```

### Шаг 3 — Добавить кнопку «Забыл пароль» в index.html

Найти форму логина (`id="login"` или похожую) в `4e-app/index.html`.
Найти кнопку «Войти» — добавить под ней:
```html
<button onclick="openForgotPassword()" style="background:transparent;border:none;color:var(--text2);font-size:13px;cursor:pointer;font-family:'Inter',sans-serif;margin-top:8px;text-decoration:underline">
  Забыл пароль
</button>
```

В JS добавить:
```javascript
function openForgotPassword(){
  const email = prompt('Введите email для сброса пароля:');
  if(!email) return;
  fetch(WORKER+'/auth/reset-request',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email})})
    .then(()=>alert('Если этот email зарегистрирован — письмо отправлено.'))
    .catch(()=>alert('Ошибка. Попробуйте позже.'));
}
```

### Шаг 4 — Деплой Worker
```powershell
cd <worker-repo-root>
npx wrangler deploy
```

### Шаг 5 — Деплой index.html
```powershell
cd <repo-root>
$content = [System.IO.File]::ReadAllText("4e-app\index.html", [System.Text.Encoding]::UTF8)
# (после правок)
[System.IO.File]::WriteAllText("4e-app\index.html", $content, (New-Object System.Text.UTF8Encoding $false))
$count = (Select-String -Path "4e-app\index.html" -Pattern 'Войти|Задачи').Count
Write-Host "Кириллица: $count (должно быть >=26)"
Copy-Item "4e-app\index.html" ".tmp-4e-app-publish\index.html"
cd .tmp-4e-app-publish
git add index.html; git commit -m "feat: forgot password button phase 12"; git push
```

### Тест Фазы 12
- [ ] Кнопка «Забыл пароль» видна на экране логина
- [ ] Ввод email → алерт «письмо отправлено» (без ошибки)
- [ ] В Resend Dashboard → Logs → письмо появилось
- [ ] Ссылка из письма `?reset=TOKEN` открывает приложение
- [ ] Новый пароль работает для входа

### Готовый промпт Codex
```
Установи Фазу 12 из `CODEX_INSTRUCTIONS.md` из текущего репозитория.
Фаза 12 = починить sendEmail() в Worker, добавить /auth/reset-request и /auth/reset-confirm, добавить кнопку «Забыл пароль» в login-форму.
Шаг 0 до/после (кириллица). Тест Фазы 12. Коммит worker "feat: password reset phase 12", коммит app "feat: forgot password button phase 12". Стоп.
```

---

## ПРИНЦИПЫ РАБОТЫ CODEX (читать один раз, держать в голове)

1. **Читай только нужный фрагмент.** `index.html` = 5000+ строк. Используй `offset`+`limit` или `Select-String` чтобы найти точное место. Читать файл целиком запрещено — это трата токенов.

2. **Не импровизируй.** Если инструкция говорит «вставить после строки X» — вставь именно туда. Не переименовывай переменные, не рефакторь, не улучшай.

3. **Каждое изменение — минимальная атомарная правка.** Меняешь ровно то что написано в инструкции. Если замена не совпадает буквально — ищи `Select-String` точный контекст, не гадай.

4. **Кириллица = красная линия.** До и после каждого изменения: `(Select-String -Path ... -Pattern 'Войти').Count`. Упало — откат немедленно, не разбирайся почему.

5. **Один коммит = одна фаза.** Не смешивай изменения разных фаз. Сообщение коммита — из инструкции буквально.

6. **Стоп после фазы.** Выполнил, закоммитил, написал результат → всё. Не начинай следующую без нового промпта от Юрия.
