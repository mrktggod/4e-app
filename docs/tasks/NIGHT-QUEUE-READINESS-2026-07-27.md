# NIGHT QUEUE READINESS - 2026-07-27

Status: ready for tonight's runner.

## Goal

Ensure tonight's automation has a clean executable queue and a final production rollout instruction.

## Executable NEW Briefs

The runner should process `pm/inbox/BRIEF-*.md` by filename order. These are intentionally `status: NEW`:

- `BRIEF-2026-07-27-81-landing-main-domain-implementation.md`
- `BRIEF-2026-07-27-81-oauth-staging-resync-retest.md`
- `BRIEF-2026-07-27-82-release-readiness-summary.md`
- `BRIEF-2026-07-27-82-vk-dashboard-separate-surface-parity.md`
- `BRIEF-2026-07-27-83-misha-product-list-dedupe.md`
- `BRIEF-2026-07-27-83-vk-task-detail-separate-surface-parity.md`
- `BRIEF-2026-07-27-84-profile-premium-banner-remove.md`
- `BRIEF-2026-07-27-85-return-to-previous-route.md`
- `BRIEF-2026-07-27-86-task-completion-feedback-web-tg.md`
- `BRIEF-2026-07-27-87-task-time-picker-explicit-confirm.md`
- `BRIEF-2026-07-27-88-task-date-popover-viewport-fit.md`
- `BRIEF-2026-07-27-89-task-reminder-bell-active-card.md`
- `BRIEF-2026-07-27-90-voice-hold-hint.md`
- `BRIEF-2026-07-27-91-task-toast-dismiss-on-scroll.md`
- `BRIEF-2026-07-27-92-iphone14-responsive-regression-pass.md`
- `BRIEF-2026-07-27-93-task-advice-manual-generate.md`
- `BRIEF-2026-07-27-94-button-feedback-haptics-pilot.md`
- `BRIEF-2026-07-27-95-telegram-dashboard-one-task-diagnostic.md`
- `BRIEF-2026-07-27-96-telegram-bottom-menu-diagnostic.md`
- `BRIEF-2026-07-27-97-ai-task-title-description-quality.md`
- `BRIEF-2026-07-27-98-vk-task-swipe-actions-parity.md`
- `BRIEF-2026-07-27-99-production-rollout-after-green-queue.md`
- `BRIEF-2026-07-27-99z-post-rollout-playwright-k6-audit.md`

## Duplicate / Superseded Briefs

These files exist only as history or duplicate intake. They must not be processed as tasks:

- `BRIEF-2026-07-26-79-night-session-misha-product-triage-and-release-prep.md` - `SUPERSEDED`
- `BRIEF-2026-07-27-84-task-card-small-ui-fixes.md` - `DUPLICATE`
- `BRIEF-2026-07-27-85-remove-premium-banner-and-advice-button.md` - `DUPLICATE`
- `BRIEF-2026-07-27-86-telegram-dashboard-one-task-diagnostic.md` - `DUPLICATE`
- `BRIEF-2026-07-27-87-telegram-bottom-nav-dark-theme-check.md` - `DUPLICATE`
- `BRIEF-2026-07-27-88-back-navigation-dashboard-fix.md` - `DUPLICATE`

## Production Decision

Yuri explicitly requested on 2026-07-27 that the completed batch be pushed to production tonight so he can review everything together.

This is approval to run the production rollout brief after the queue is closed, not approval to skip checks. After production rollout, run the `99z` post-rollout Playwright/k6 audit to compare Web, Telegram Mini App and VK Mini App in one visual/parity report.

## Release Safety

Before production rollout:

- all executable implementation/diagnostic briefs before `99` must be either `DONE`, `NEED-CLAUDE`, or `NEED-YURI` with reports;
- no `status: NEW` brief before `99` should remain;
- core checks must pass;
- local unrelated dirty files must not be included in the production release.

Known local dirty files at planning time:

- `AGENTS.md`
- `index.html`

If those are still dirty and unrelated, use a clean temporary worktree from `origin/feat/admin-tariff-api` for the release step rather than committing or reverting them.

After production rollout:

- `BRIEF-2026-07-27-99z-post-rollout-playwright-k6-audit.md` must run against the released SHA;
- Playwright must cover Web, Telegram and VK surfaces;
- k6 must be safe/read-only for production or run against a non-production/static target;
- the report must include one combined Web/Telegram/VK parity view and a prioritized follow-up list.
