status: NEW

# BRIEF-2026-07-26-79-night-session-misha-product-triage-and-release-prep

## Context

Two new lists landed today from Yuri: `pm/inbox/MISHA_BUGS.md` (8 items, iPhone 14 web adaptive testing) and `pm/inbox/PRODUCT_IDEAS_TASKS.md` (10 items, mixed bugs/product ideas).

Cross-check already done by Claude/Cowork: `MISHA_BUGS.md` BUG-001 (focus counters mismatch) and BUG-002 (statistics shows no active tasks) are the same issues as `BUG-2026-07-25-017` and `BUG-2026-07-25-018` — both already fixed on this branch and marked `Ready for QA`. Misha was testing the live production web build, which has not been released since `main` last moved (`57ae1b4`, 2026-07-21) — this branch is ~134 commits ahead. This is the real root cause of "fixes don't show up" complaints, not a new regression.

## Task — do in this exact order, report after each numbered step

**1. Release readiness summary (no merge yet).**
Produce a plain-language list (see `AGENTS.md` → "Как писать отчёты для Юрия") of everything currently `Ready for QA` / `Done` in `pm/bugs.md` and `pm/backlog.md` on this branch. Group by area (task cards, dashboard, calendar, voice, VK, etc.). This is for Yuri to give a one-word go/no-go — do not merge to `main` or deploy production as part of this step.

**2. Triage the two new lists — dedupe first.**
Walk every item in `MISHA_BUGS.md` and `PRODUCT_IDEAS_TASKS.md`. For each, check whether it matches an existing `pm/bugs.md` entry (like the BUG-001/002 duplicates above). If it's a duplicate of an already-fixed item, mark it as such in a short note, do not re-implement. Add genuinely new items to `pm/bugs.md`/`pm/backlog.md` with proper IDs.

**3. Fix tonight — small, isolated items only:**
- Misha BUG-004 (reminder/bell button on task card does nothing)
- Misha BUG-005 (time picker auto-saves and closes while scrolling minutes, before the checkmark is tapped)
- Misha BUG-006 (date/time popover overflows the right edge of the viewport on iPhone-width screens)
- Misha BUG-007 ("Сохранено" toast never dismisses when the task page is scrolled)
- Misha BUG-008 (task row on "Сегодня" overflows the right edge at iPhone 14 width)
- Product TASK-002 (remove the "premium 14 days" banner from profile — always showed 14 regardless of real subscription state; real subscription info stays in the Подписки tab)
- Product TASK-010 (remove auto-generation of AI task advice on opening a task; replace with an explicit "Сгенерировать совет" button)
- Product BUG-007 (Telegram Mini App dashboard shows only 1 task — check for a hardcoded `limit: 1` or pagination bug in the query feeding the dashboard)
- Product BUG-008 (Telegram Mini App bottom nav is unreadable in dark theme on the dashboard, and an old nav variant still shows on other pages) — **first check whether this is the stale service-worker cache issue fixed earlier today (`PWA_VERSION` auto-versioning) rather than a fresh bug; only implement a code fix if it reproduces on a build with the new cache-busting in place.**

**4. Check for a shared root cause before fixing separately:**
Product BUG-004 ("Завершить задачу" gives no clear visual feedback — dots animate away, completion indicator doesn't turn green/red) looks related to the already-logged `VK-TASK-COMPLETE-001` (VK can't complete tasks either). Check whether both surfaces hit the same completion-state code path. If yes, fix once and cross-link both records instead of two separate fixes.

**5. Do NOT implement tonight — write a short plan doc only, no code:**
- Product IDEA-001 (connect Telegram support bot) — needs Yuri's answers to the 3 questions already listed in `PRODUCT_IDEAS_TASKS.md` before any implementation.
- Product TASK-005 (haptic/click feedback on every button, every platform) — propose a single pilot screen first, not an all-surfaces rollout.
- Product TASK-006 (notification system audit across all platforms) — this is multi-day scope; produce a plan doc with phases, no implementation.
- Product TASK-009 (AI-generated task title/description quality) — propose the prompt/rule approach and a QA example set; implement only if it stays narrow and reversible.

**6. Fix if time allows, needs wider regression pass:**
Product BUG-003 (back/exit from a task or entity always lands on the dashboard instead of the previous screen). Real bug, but touches navigation broadly — after fixing, run an extended smoke covering enter/exit across tasks, calendar, statistics, profile, not just one screen.

**7. Misha BUG-003 (long-press-to-talk isn't discoverable)** — not a bug, a UX/onboarding gap. Add a small hint/coachmark only if it fits cleanly without touching unrelated onboarding flows; otherwise write it up as a follow-up idea, don't force it in tonight.

## Stop Points

- No merge into `main`, no production deploy — that only happens after Yuri's explicit go/no-go on step 1's summary.
- No implementation for items in step 5 — plan documents only.
- No payment, entitlement, CAL, price, secret, or live-device Telegram/VK actions.
- If step 4's shared-root-cause check is inconclusive, say so honestly and fix the two surfaces separately rather than guessing.

## Verification

- `node scripts/check-cp1251-mojibake.mjs`, `bash scripts/check-ui-architecture.sh`, `git diff --check` after each fix.
- Targeted smoke per fixed item (screenshot or headless assertion), not a full-suite rerun per step.
- For product BUG-007 (Telegram dashboard 1-task limit): raw before/after evidence of the task count returned, not just "looks fixed."

## Report

One `pm/outbox/REPORT-2026-07-26-79-*.md` per numbered step (or a clearly sectioned single report), written in the plain-language style from `AGENTS.md`: what was done, whether Yuri needs to do anything, where to check. Include the release-readiness summary from step 1 as its own clearly marked section so it's easy for Yuri to find.
