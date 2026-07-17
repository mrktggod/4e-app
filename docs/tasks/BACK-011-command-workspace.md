# BACK-011 — командный Workspace

Статус документа: draft, подготовлено 2026-07-16.

Цель: дать нескольким людям общий рабочий контекст без превращения 4 в тяжёлый корпоративный таск-трекер.

## Product promise

Workspace в 4 — это не Jira и не CRM. Это общий штаб дня:

- кто кому что обещал;
- какие задачи реально горят;
- что ждёт ответа;
- где 4 может напомнить, суммировать и подсветить риск.

## MVP scope

Первая версия должна закрыть только базовый совместный контекст:

- один пользователь создаёт workspace;
- приглашает 1-5 участников;
- задача может принадлежать workspace;
- у задачи есть owner/assignee;
- участники видят общие задачи workspace;
- 4 показывает отдельный workspace-фокус: `мои задачи`, `ждём от людей`, `горящие`;
- личные задачи пользователя остаются приватными и не попадают в workspace без явного выбора.

## Non-goals для MVP

- сложные роли уровня enterprise;
- проекты/доски/колонки;
- файлы и вложения;
- billing per seat;
- внешний календарь workspace;
- автоматическое чтение личных задач других участников;
- публичные ссылки на workspace.

## Роли

`owner`:

- создаёт workspace;
- приглашает/удаляет участников;
- может архивировать workspace;
- видит все workspace-задачи.

`member`:

- видит workspace-задачи;
- создаёт задачи внутри workspace;
- меняет свои задачи;
- отмечает выполненными задачи, где он owner/assignee.

`guest` — не делать в MVP.

## Данные

Минимальная модель:

```json
{
  "workspaceId": "ws_...",
  "name": "Команда",
  "ownerUserId": "user_...",
  "members": [
    {
      "userId": "user_...",
      "role": "owner",
      "status": "active"
    }
  ],
  "createdAt": 1720000000000
}
```

Task extension:

```json
{
  "workspaceId": "ws_...",
  "visibility": "personal|workspace",
  "ownerUserId": "user_...",
  "assigneeUserId": "user_..."
}
```

Правило приватности:

- если `visibility !== "workspace"`, задача не должна попадать в workspace API;
- workspace-задачу нельзя создать случайно через старый personal flow без явного surface/context.

## API sketch

```text
POST /workspaces
GET /workspaces
GET /workspaces/:id
POST /workspaces/:id/invites
POST /workspaces/:id/invites/:token/accept
GET /workspaces/:id/tasks
POST /workspaces/:id/tasks
PATCH /workspaces/:id/tasks/:taskId
```

Все endpoint должны проверять:

- authenticated user;
- membership;
- role для owner-only действий;
- task belongs to workspace.

## UI sketch

Минимально:

- profile/settings: блок `Workspace`;
- home: переключатель `Личное / Workspace`;
- task create: выбор visibility/context;
- task card: бейдж workspace;
- focus panel: workspace summary.

Не делать отдельную сложную navigation tab до первого live feedback.

## AI behavior

4 должен говорить:

- `В workspace сейчас 3 горящих задачи`;
- `Ждём ответа от Анны по 2 задачам`;
- `Твои личные задачи не видны команде`;
- `Хочешь сохранить это как личную или командную задачу?`

AI не должен:

- раскрывать личные задачи в workspace summary;
- автоматически переносить personal task в workspace;
- писать участникам без явного действия пользователя.

## Security / privacy

Обязательные проверки:

- user не может читать workspace без membership;
- member не может удалить owner;
- invite token одноразовый или ограниченный по TTL;
- personal tasks не появляются в workspace task list;
- analytics не смешивает personal/workspace без явного поля.

## Phasing

Phase 0 — spec:

- этот документ;
- backlog split на API/UI/security/QA.

Phase 1 — backend:

- workspace CRUD;
- membership;
- invite accept;
- workspace task list.

Phase 2 — frontend:

- workspace switcher;
- create task in workspace;
- workspace focus summary.

Phase 3 — bot/AI:

- workspace-aware summary;
- reminders to assignees;
- safe copy for privacy boundaries.

## Definition of Done

`BACK-011` можно закрывать только после:

- workspace create/list works on staging;
- invite accept works for second user;
- personal task is not visible to second user;
- workspace task is visible to members;
- task ownership/assignee update works;
- manual QA with two real accounts is recorded in `pm/bugs.md` or `shared/WORK_LOG.md`.
