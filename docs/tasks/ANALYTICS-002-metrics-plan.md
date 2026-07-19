# ANALYTICS-002 - Analytics v2 metrics plan

Status: plan before code, 2026-07-19.

Owner: Codex drafts the plan; implementation starts only after Yuri approves the scope.

## Context

`ANALYTICS-001` and `BACK-038` are already Done. The current system has:

- D1 `audit_events` created by `migrations/0001_initial_schema.sql`.
- `recordAuditEvent()` in `<worker-repo-root>/worker.js:1211`, writing `user_id`, `actor_type`, `action`, `entity_type`, `entity_id`, `metadata_json`, `created_at`.
- `POST /analytics/lite-event` in `<worker-repo-root>/worker.js:4673`, currently allowing a narrow set of product events.
- `POST /analytics/payment-event` in `<worker-repo-root>/worker.js:4675`, currently used by payment funnel instrumentation.
- `GET /analytics/summary` in `<worker-repo-root>/worker.js:1296`, protected by `requireAdmin()` / `ADMIN_SECRET`.
- Frontend calls in `index.html`: `trackLiteEvent()` at `index.html:2521`, home/focus/statistics/share events at `index.html:3135`, `3813`, `4366`, `4377`, `4391`, `4402`, `4534`.
- Referral plumbing from `VIRAL-002`: frontend accepts `ref/referral/invite`, worker applies referral rewards, and `publicUser()` returns `referralCode/referralCount`.

The next analytics step is not a third-party SDK. Use the existing D1 system because the product is still privacy-sensitive under 152-FZ / personal data caution. No Yandex AppMetrica, PostHog, session replay, device fingerprinting, or external analytics script should be added without a separate product/legal decision.

## Decision Questions

Analytics v2 should answer four practical questions:

1. Where do users drop between registration, first useful action, AI usage, sharing, and subscription intent?
2. Which acquisition channel produces users who come back on D1/D7/D30 and create real tasks?
3. Are frontend and backend errors or latency spikes blocking activation?
4. Can Yuri inspect this without raw SQL or exposing admin data publicly?

Every proposed event below must support one of those questions. Do not add generic click tracking.

## Current vs Target

| Area | Current state | Target state |
| --- | --- | --- |
| Product metrics | Raw D1/D7 counters for users/tasks/messages/audit events plus lite events for plan/focus/statistics. | Funnel and cohort views: registration -> first task -> plan/focus/statistics -> AI/voice/share -> subscription intent, with D1/D7/D30 retention. |
| Attribution | Referral code exists; platform/source is partially inferable but not normalized for analytics. | Store normalized first-touch acquisition channel and optional UTM fields at registration. Summary can group activation/retention by channel. |
| Technical stability | Console diagnostics are mostly local; server logs are not queryable as metrics. | Safe `client-error` events and coarse API metric buckets for error-rate and p95-ish latency by endpoint family. |
| Dashboard | `/analytics/summary` is admin-only JSON with raw counters. | Admin-only `/admin/analytics` surface or a summary-backed static dashboard showing funnel, retention cohorts, channel breakdown, and stability table. |

## Data Model

### Keep `audit_events` as the main event stream

Use `audit_events` for product and technical events because it already supports action names, entity references, metadata JSON, and timestamps.

Recommended metadata constraints:

- No email, phone, real message text, task text, full URL query, raw stack trace, IP address, exact device fingerprint, session token, payment payload, or provider secret.
- Use enum-like fields: `surface`, `platform`, `channel`, `provider`, `planId`, `result`, `errorCode`, `endpointFamily`.
- For errors, store `messageFingerprint` and `stackFingerprint`, not full text when it may include user data.
- For URLs, store only `pathname` and a small allowlist of non-PII query keys such as `source=telegram_bot` or `utm_source`.

### Add registration attribution fields

Preferred schema addition, pending implementation approval:

```sql
ALTER TABLE users ADD COLUMN acquisition_channel TEXT;
ALTER TABLE users ADD COLUMN acquisition_source TEXT;
ALTER TABLE users ADD COLUMN acquisition_campaign TEXT;
ALTER TABLE users ADD COLUMN acquisition_content TEXT;
ALTER TABLE users ADD COLUMN acquisition_referral_code TEXT;
```

Why store on `users`: attribution is a user-level first-touch fact, needed for cohort grouping even if event metadata is later pruned.

Also write a `register` audit event with the same attribution metadata so existing `audit_events` queries can answer channel questions before broader schema usage is complete.

Allowed `acquisition_channel` values:

- `telegram_bot`
- `telegram_miniapp`
- `vk_miniapp`
- `web_direct`
- `referral`
- `dev_seed`
- `unknown`

UTM fields:

- Keep `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`.
- Normalize to lowercase, trim, cap length at 120 chars.
- Do not store arbitrary query params.
- If `ref` is present, `acquisition_channel` should be `referral`; store normalized referral code separately.

### Optional API metrics table

For server stability, do not put every request into `audit_events`; that can grow too quickly. Use coarse buckets:

```sql
CREATE TABLE api_metric_buckets (
  bucket_start INTEGER NOT NULL,
  endpoint_family TEXT NOT NULL,
  method TEXT NOT NULL,
  status_group TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  total_latency_ms INTEGER NOT NULL DEFAULT 0,
  max_latency_ms INTEGER NOT NULL DEFAULT 0,
  slow_count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (bucket_start, endpoint_family, method, status_group)
);
```

Bucket interval: 5 minutes. Endpoint family examples: `auth`, `tasks`, `anthropic`, `transcribe`, `analytics`, `payments`, `admin`, `other`.

This gives error-rate, average latency, max latency, and slow request counts without storing request bodies or user identifiers.

## Event Taxonomy

Naming convention: lowercase kebab-case, matching the existing `task-create` and `lite-plan-view` style.

### Product funnel events

| Event | Trigger | Metadata | Decision it informs |
| --- | --- | --- | --- |
| `register` | Successful account creation; already present. | `channel`, `platform`, `utm_*`, `referralCodePresent`, `method`. | Top of funnel and cohort base. |
| `login` | Successful login; already present. | `method`, `platform`. | Return usage and auth health. |
| `onboarding-started` | First post-auth onboarding surface shown. | `surface`, `platform`. | Whether users see onboarding. |
| `onboarding-step-completed` | User completes a meaningful onboarding step. | `step`, `surface`, `platform`. | Onboarding drop-off. |
| `task-create` | Task saved; already present. | `surface`, `source`, `hasAssignee`, `direction`. | Activation and core value. |
| `task-done` | Task completed; already present. | `surface`, `ageBucket`. | Whether tasks produce outcomes. |
| `lite-plan-view` | Existing `plan-view`. | `surface`. | Daily value open. |
| `lite-focus-open` | Existing `focus-open`. | `surface`. | Focus feature usage. |
| `lite-statistics-open` | Existing `statistics-open`. | `surface`. | Stats feature usage. |
| `ai-chat-used` | `/anthropic` completes for user-initiated chat or task help. | `surface`, `intent`, `result`. | AI value usage. |
| `voice-used` | `/transcribe` succeeds or voice task is created. | `surface`, `result`. | Voice adoption. |
| `decomposition-used` | SMART-013 decomposition creates checklist/steps. | `surface`, `stepsCountBucket`. | Whether prompt-to-plan is used. |
| `share-card` | Existing share card event. | `surface`, `mode`. | Organic sharing behavior. |
| `share-weekly-card` | Existing weekly share event. | `surface`, `mode`. | Weekly recap sharing. |
| `referral-created` | User opens/copies referral link. | `surface`. | Referral intent. |
| `subscription-viewed` | Paywall/subscription screen shown. | `surface`, `currentPlan`. | Monetization intent. |
| `subscription-started` | User starts provider flow. | `provider`, `planId`. | Checkout start. |

Do not track:

- Every button click.
- Raw task names, prompt text, chat messages, contact names, or notification text.
- Fine-grained scroll/hover/UI telemetry.
- Payment provider payload details.

### Payment events

Payment analytics already exists and should remain narrow. Keep using `payment-event` plus server-side payment lifecycle audit events:

- `paywall_viewed`
- `plan_selected`
- `checkout_started`
- `invoice_created`
- `payment_provider_callback_received`
- `payment_verified`
- `payment_failed`
- `payment_refunded`
- `entitlement_activated`

For dashboard grouping, map these underscore names into the same funnel view without renaming existing stored events.

No price changes, provider logic changes, entitlement changes, or live-money tests belong to this plan.

### Technical stability events

| Event | Trigger | Metadata | Notes |
| --- | --- | --- | --- |
| `client-error` | Frontend catches unhandled error or rejected promise after sampling/throttle. | `messageFingerprint`, `stackFingerprint`, `platform`, `pathname`, `screen`, `release`, `severity`. | No full message if it may include user text. |
| `client-api-error` | Fetch wrapper sees non-2xx for key app API. | `endpointFamily`, `status`, `screen`, `method`. | No URL query except allowlisted source/utm fields. |
| `client-slow-api` | API call exceeds threshold, e.g. 3s. | `endpointFamily`, `durationBucket`, `screen`, `method`. | Bucket durations, do not store exact request body. |
| `server-api-bucket` | Worker records aggregate bucket. | Stored in `api_metric_buckets`, not per-event. | Use 5-minute buckets. |

`scripts/tma-diagnostics.js` should feed only sanitized `client-error` style events. It should not persist Telegram init data, user agent strings beyond coarse platform, raw stack traces, or device fingerprints.

## Cohort Retention

Current `/analytics/summary` D1/D7 counters are rolling-window counts, not retention. Add a real cohort calculation:

- Cohort date: `date(users.created_at)` in UTC or Moscow time, choose one and keep it consistent. Recommendation: UTC for storage, dashboard labels can show Moscow date.
- Returned on D1: user has at least one qualifying event in `[created_at + 1 day, created_at + 2 days)`.
- Returned on D7: event in `[created_at + 7 days, created_at + 8 days)`.
- Returned on D30: event in `[created_at + 30 days, created_at + 31 days)`.
- Qualifying return events: `login`, `task-create`, `task-done`, `lite-plan-view`, `lite-focus-open`, `lite-statistics-open`, `ai-chat-used`, `voice-used`, `decomposition-used`, `share-card`, `share-weekly-card`.
- Exclude system/admin-only events and payment callbacks from retention unless there is a user-initiated subscription event.

Example summary shape:

```json
{
  "retention": {
    "cohorts": [
      {
        "cohortDate": "2026-07-18",
        "newUsers": 12,
        "d1": { "returned": 5, "rate": 0.417 },
        "d7": { "returned": 2, "rate": 0.167 },
        "d30": { "returned": null, "rate": null }
      }
    ]
  }
}
```

For incomplete cohorts, return `null`, not `0`, so the dashboard does not imply failure before enough time has passed.

## Summary API v2

Extend `GET /analytics/summary`, still protected by `ADMIN_SECRET`, with these sections:

```json
{
  "funnel": {
    "register": 0,
    "firstTask": 0,
    "dailyValue": 0,
    "aiOrVoice": 0,
    "share": 0,
    "subscriptionViewed": 0,
    "subscriptionStarted": 0
  },
  "retention": { "cohorts": [] },
  "channels": {
    "telegram_bot": { "users": 0, "firstTaskRate": 0, "d1Rate": 0 },
    "vk_miniapp": { "users": 0, "firstTaskRate": 0, "d1Rate": 0 },
    "web_direct": { "users": 0, "firstTaskRate": 0, "d1Rate": 0 },
    "referral": { "users": 0, "firstTaskRate": 0, "d1Rate": 0 }
  },
  "stability": {
    "clientErrors24h": 0,
    "api": [
      {
        "endpointFamily": "tasks",
        "requests24h": 0,
        "errorRate": 0,
        "avgLatencyMs": 0,
        "maxLatencyMs": 0,
        "slowCount": 0
      }
    ]
  }
}
```

Keep the existing raw counters for backward compatibility while adding the v2 sections.

## Dashboard v1

Build the first dashboard as an internal admin surface. Two acceptable options:

1. `GET /admin/analytics` returns an HTML page protected by the same `requireAdmin()` path and calls `/analytics/summary`.
2. Keep only `/analytics/summary` in the worker and add a simple static admin page in the app repo that requires an admin secret input locally in the browser.

Recommendation: option 1 if the worker can serve a small HTML page without adding a heavy build step. It keeps the admin surface close to the protected API and avoids exposing it in the consumer Mini App.

Dashboard v1 should include:

- Funnel cards: register, first task, daily value, AI/voice, share, subscription viewed, subscription started.
- Retention table: cohorts by date with D1/D7/D30 and incomplete markers.
- Channel table: users, first task rate, D1/D7 rates by acquisition channel.
- Stability table: endpoint family, requests, error-rate, avg/max latency, slow count.
- Client error list: top fingerprints by count, last seen, platform, screen.

Dashboard v1 should not include:

- Session replay.
- User-level drilldown with email/phone/name.
- Raw event export.
- Payment provider payloads.
- Price controls or tariff editing.

## Implementation Plan

Each step gets its own brief, commit, and staging proof. Stop after each checkpoint for review.

### Step 1 - Tracking contract and frontend source metadata

Scope:

- Add a shared event allowlist document or constant for `lite-event`.
- Normalize `source/ref/utm` capture on frontend startup.
- Pass safe attribution metadata through register/OAuth/Telegram/VK auth paths where already applicable.
- Do not add third-party scripts.

Checkpoint proof:

- Source grep shows no third-party analytics SDK.
- Fresh staging registration through web with UTM/ref stores safe attribution metadata.
- Existing `/analytics/lite-event` smoke still passes.

### Step 2 - Worker attribution persistence

Scope:

- Add migration for `users.acquisition_*` fields.
- Store first-touch attribution at registration only; do not overwrite on later login.
- Mirror attribution into `register` audit event metadata.

Checkpoint proof:

- Staging D1 query shows new fields populated for fresh test accounts.
- `/analytics/summary` still returns 200 only with admin auth.
- No PII fields are added.

### Step 3 - Product event expansion

Scope:

- Extend `lite-event` allowlist for approved events: `onboarding-started`, `onboarding-step-completed`, `ai-chat-used`, `voice-used`, `decomposition-used`, `share-card`, `share-weekly-card`, `referral-created`, `subscription-viewed`, `subscription-started`.
- Add narrow frontend/worker event calls at already-defined user actions.
- Keep event properties small and enum-like.

Checkpoint proof:

- Staging fresh account creates at least one event in each major family where safe.
- D1 `audit_events` contains action counts, no raw task/prompt/contact text.
- Existing task and AI flows still work.

### Step 4 - Cohort retention summary

Scope:

- Add retention queries to `/analytics/summary`.
- Include D1/D7/D30 with `null` for incomplete cohorts.
- Add channel grouping using `users.acquisition_channel`.

Checkpoint proof:

- Unit-like query fixtures or staging D1 seeded rows show correct D1/D7/D30 math.
- Summary output distinguishes rolling counters from retention cohorts.

### Step 5 - Technical stability metrics

Scope:

- Add `api_metric_buckets` migration.
- Wrap key worker route families with coarse timing/error aggregation.
- Add sanitized `client-error`, `client-api-error`, `client-slow-api` ingestion with throttle and allowlist.
- Feed `scripts/tma-diagnostics.js` into the sanitized endpoint only.

Checkpoint proof:

- Staging smoke creates API bucket rows without storing request body.
- Simulated frontend error creates one sanitized fingerprint event.
- No stack/message with user text appears in D1.

### Step 6 - Dashboard v1

Scope:

- Build admin-only dashboard over `/analytics/summary`.
- Keep it read-only.
- Use simple tables first; charts are optional and should not require a heavy frontend stack.

Checkpoint proof:

- Unauthorized request returns 401.
- Authorized staging request shows funnel, cohorts, channels, and stability.
- Dashboard has no price/payment controls and no user PII table.

## Verification Matrix

| Area | Required proof |
| --- | --- |
| Privacy | Search and D1 spot-check show no email, phone, raw task text, prompt text, stack trace, IP, device fingerprint, token, or payment payload in analytics metadata. |
| Admin protection | `/analytics/summary` and dashboard return 401 without `ADMIN_SECRET`; 200 with valid admin auth in staging. |
| Attribution | Fresh registrations through web/referral/platform paths populate `acquisition_channel` and allowed UTM fields. |
| Product funnel | Fresh staging account can produce register -> first task -> daily value -> AI/voice/share/subscription-viewed events. |
| Retention | Seeded cohort rows produce correct D1/D7/D30 rates and incomplete cohorts return `null`. |
| Stability | Forced client error and slow API smoke produce sanitized aggregate rows only. |
| Regression | Existing `api-smoke` still passes; payment/entitlement behavior is unchanged. |

## Non-goals

- No production deploy as part of planning.
- No price changes.
- No payment or entitlement refactor.
- No CAL work.
- No third-party analytics SDK or script.
- No session replay.
- No raw PII collection beyond already stored app account data.
- No IP/device fingerprint attribution.
- No user-level admin CRM in dashboard v1.
- No implementation before Yuri approves this plan.

## Open Decisions for Yuri

1. Confirm the event list is enough for beta decisions, especially `subscription-viewed` / `subscription-started` without deeper payment drilldown.
2. Confirm whether attribution should use first-touch only, or first-touch plus last-touch for UTM campaigns.
3. Confirm dashboard v1 location: worker-served `/admin/analytics` HTML vs separate static admin page.
4. Confirm whether product wants channel grouping by `telegram_bot` and `telegram_miniapp` separately, or one `telegram` rollup in the UI.

## Recommended Next Brief

After approval, create a narrow implementation brief for Step 1 and Step 2 only:

- Add attribution fields migration.
- Capture and persist safe channel/UTM/ref metadata on registration.
- Extend `/analytics/summary` with channel counts.
- Do not add dashboard or technical stability in the first implementation commit.
