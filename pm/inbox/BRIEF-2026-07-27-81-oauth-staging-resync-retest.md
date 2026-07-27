status: DONE

# BRIEF-2026-07-27-81-oauth-staging-resync-retest

## Context

`REPORT-BRIEF-2026-07-25-75-platform-global-alias-oauth-diagnostics.md` (DONE) found that VK ID and Yandex ID login **do not start** on the shared staging page `https://4-ai-staging.pages.dev/` — both buttons return `Сервис входа временно недоступен`. Source already has the fix (`index.html:1898-1906`, `window.PLATFORM`/`window.WORKER` bridge), but the live staging page did not expose those globals during the click test — almost certainly a stale staging build, the same class of issue as the earlier Pages/Worker deploy-lag investigation.

This is P0-priority: broken VK/Yandex login blocks those users from paying at all once monetization launches.

## Task

1. Sync/redeploy staging from current `feat/admin-tariff-api` HEAD.
2. Repeat the exact same click test from the referenced report: headless 390x844, click through onboarding skip, click VK ID button, click Yandex ID button, capture `platformGlobal`/`platformIsAdapter`/`worker`/toast state before and after each click.
3. If `window.PLATFORM === window.FourPlatform` and `window.WORKER` are now present but the OAuth start still fails, inspect `/auth/vk-id/start` and `/auth/yandex-id/start` responses (no secrets in the report) as the next diagnostic layer — do not guess a fix without this evidence.
4. If login now works after resync, say so plainly with the same before/after evidence format as the referenced report.

## Stop Points

- No production deploy, no `main` merge.
- No live device/account login (staging headless only).
- If the fix requires touching auth/session code, stop and report `NEED-CLAUDE` with findings — do not modify auth flow in this brief.

## Verification

- Same JSON evidence shape as `REPORT-BRIEF-2026-07-25-75-platform-global-alias-oauth-diagnostics.md` (before/after for both VK and Yandex).
- `node scripts/check-cp1251-mojibake.mjs`.

## Report

`pm/outbox/REPORT-2026-07-27-81-oauth-staging-resync-retest.md`, plain-language per `AGENTS.md`: does VK/Yandex login work now or not, and what Yuri needs to know either way.
