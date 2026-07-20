# SMART-007 - AI memory evidence fixture plan

Status: fixture plan only, no live run in this brief.

## Purpose

Promote SMART-007 from generic `SOURCE-ONLY` evidence to a future safe fixture run without using Yuri's personal account, real personal facts, live Telegram device QA, production data, or broad D1 mutations.

## Current Source Mechanism

- D1 schema: worker migration `migrations/0008_user_facts.sql` creates `user_facts(id, user_id, fact, category, confidence, source, created_at, updated_at)` and index `idx_user_facts_user_rank`.
- Extraction trigger: worker `worker.js:3652-3655` runs `extractUserFactsFromAiHistory(...)` after assistant messages are saved.
- Privacy gate: worker `worker.js:3666-3680` reads `user_privacy_settings.ai_memory_enabled` and `ai_processing_enabled`.
- Listing: worker `worker.js:3697-3708` reads ranked facts from `user_facts`.
- Extraction model: worker `worker.js:3812-3851` asks Haiku to extract durable facts from recent AI conversation and stores sanitized results.
- Storage/upsert: worker `worker.js:3768-3808` updates matching facts, inserts new facts, and trims overflow.
- API routes: worker `worker.js:3855-3863` handles `GET /ai/facts`; `worker.js:3867-3876` handles `DELETE /ai/facts/:id`; `worker.js:3880-3886` handles `DELETE /ai/facts`.
- Route wiring: worker `worker.js:4924-4928` maps `/ai/facts` routes.
- App screen: `index.html:1129-1140` defines `#ai-memory`, `#ai-memory-list`, and the "forget all" button.
- App list/render/delete: `index.html:2129-2270` fetches, renders, deletes one fact, and clears all facts.
- Prompt usage: `index.html:6536-6542` injects loaded fact summary into the AI system prompt.

## Safe Fixture Account

Use a fresh staging-only email account:

```text
smart007-fixture-YYYYMMDD-HHMM@example.org
```

Requirements:

- never use Yuri's personal account;
- no real phone, address, birthdate, names of real clients, or private project facts;
- use staging app/worker only;
- record auth token as `<redacted>` in reports.

## Safe Seed Facts

Use 2-3 intentionally synthetic, harmless facts:

1. "Я тестовый пользователь SMART-007 fixture и предпочитаю короткие утренние планы."
2. "Мой учебный проект называется Северный маяк."
3. "Мне удобнее получать задачи списком из трёх пунктов."

These are stable enough for the extractor, but not personal data and not useful outside the fixture.

## Proposed Runbook

1. Register/login the fresh staging fixture account.
2. Ensure privacy settings keep AI processing and AI memory enabled.
3. Send an AI chat message containing the safe seed facts.
4. Send or wait for an assistant reply so the worker's save-message path can trigger `extractUserFactsFromAiHistory()`.
5. Poll `GET /ai/facts?limit=15` with the fixture token until facts appear or a fixed timeout expires.
6. Open the app's "Что 4 знает обо мне" screen and confirm the same facts render in `#ai-memory-list`.
7. Delete one fact through `DELETE /ai/facts/:id` or the UI delete button; verify it disappears from API and UI.
8. Clear all through `DELETE /ai/facts` or "Забыть всё"; verify `GET /ai/facts` returns an empty list.

## Acceptance Criteria

- `GET /ai/facts` returns `200 {"ok":true,"enabled":true,"facts":[...]}` for the fixture account.
- At least one returned fact is semantically from the safe seed facts.
- No returned fact contains email, token, raw message text beyond the durable fact, phone, address, or unrelated private data.
- The app screen renders the returned fact text and category/confidence metadata.
- Deleting one fact removes only that fact for the fixture user.
- Clearing all facts removes all fixture facts and does not touch other users.

## Evidence To Capture

- fixture account email;
- staging app URL and worker URL;
- redacted API request/response snippets for list, delete one, clear all;
- DOM evidence from `#ai-memory-list`;
- D1 query proof only if an approved staging admin path is available; otherwise API proof is enough for the first fixture pass.

## Stop Points

- Do not run this on production.
- Do not use real user data.
- Do not query or mutate Yuri's account.
- Do not broaden AI memory extraction logic during the fixture run.
- Do not promote to `LIVE` unless the fixture is actually executed and raw evidence is attached.
