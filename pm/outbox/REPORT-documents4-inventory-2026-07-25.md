# REPORT - Documents\\4 inventory before rename

**Date:** 2026-07-25
**Mode:** read-only inventory for `C:\Users\shelc\Documents\4`; no files were moved, deleted, renamed, or copied from the old folder.

## Verdict

Documents\4 можно переименовывать без потерь.

Reason: the requested old nested repos are absent, the actual old app repo at `C:\Users\shelc\Documents\4` is clean and has no commits ahead of `origin/feat/admin-tariff-api`, and no mandatory file was found that exists only in Documents\4.

## Git Checks

| Check | Result |
| --- | --- |
| `git -C "C:\Users\shelc\Documents\4\.tmp-4e-app-publish" status --short` | path missing |
| `git -C "C:\Users\shelc\Documents\4\.tmp-4e-app-publish" log --oneline origin/feat/admin-tariff-api..HEAD` | path missing |
| `git -C "C:\Users\shelc\Documents\4\4e-worker" status --short` | path missing |
| `git -C "C:\Users\shelc\Documents\4\4e-worker" log --oneline @{u}..HEAD` | path missing |
| additional safety check: `git -C "C:\Users\shelc\Documents\4" status --short --branch` | `## feat/admin-tariff-api...origin/feat/admin-tariff-api` |
| additional safety check: old app `origin/feat/admin-tariff-api..HEAD` | empty |
| old app HEAD / origin | `6f6b568b407ccfecc654461a6fdddcab7dd6979b` / `6f6b568b407ccfecc654461a6fdddcab7dd6979b` |
| X app HEAD / origin | `6f6b568b407ccfecc654461a6fdddcab7dd6979b` / `6f6b568b407ccfecc654461a6fdddcab7dd6979b` |

Note: `X:\4\.tmp-4e-app-publish` already had unrelated local changes before this report. They were not touched or staged except for this report file.

```text
## feat/admin-tariff-api...origin/feat/admin-tariff-api
?? docs/archive/
```

## Recursive Compare Summary

- Compared `C:\Users\shelc\Documents\4` to `X:\4` by relative path.
- Ignored directory names: `node_modules`, `.git`, `.wrangler`, `dist`, `build`.
- Old files scanned: `592`.
- Files present in Documents\4 but absent at the same relative path under X:\4: `589`.
- Of those, byte-identical equivalents under `X:\4\.tmp-4e-app-publish`: `524`.
- Existing under `X:\4\.tmp-4e-app-publish` but different: `50`; these are not mandatory transfers because the old repo is clean at origin and X contains newer local work.
- No equivalent even under `X:\4\.tmp-4e-app-publish`: `15`; all are test artifacts or timestamped `index.html` backups.
- Sensitive-mask hits among C-not-X relative paths: `337`; all have X app equivalents, and `28` differ from X app versions.

Known candidate `4e-worker\AGENTS.md`: `C:\Users\shelc\Documents\4\4e-worker` is missing, so the old candidate is not present. `X:\4\4e-worker\AGENTS.md` is also currently missing, but there is no source copy in Documents\4 to transfer.

## (a) Mandatory Transfers to X:\4

None. No unique mandatory file was found in Documents\4.

## (b) Safe to Lose / Do Not Transfer Automatically

These files have no equivalent under `X:\4\.tmp-4e-app-publish`; they are generated Playwright output or timestamped emergency backups from earlier index.html edits.

| Old path | Classification |
| --- | --- |
| `C:\Users\shelc\Documents\4\autotests\playwright-report\index.html` | Playwright report/test-results artifact |
| `C:\Users\shelc\Documents\4\autotests\test-results\.last-run.json` | Playwright report/test-results artifact |
| `C:\Users\shelc\Documents\4\autotests\test-results\telegram-app-basic-Telegra-bc655-opens-with-mocked-host-data-desktop-chromium\telegram-home.png` | Playwright report/test-results artifact |
| `C:\Users\shelc\Documents\4\autotests\test-results\telegram-app-basic-Telegra-bc655-opens-with-mocked-host-data-mobile-chromium\telegram-home.png` | Playwright report/test-results artifact |
| `C:\Users\shelc\Documents\4\autotests\test-results\vk-app-basic-VK-Mini-App-opens-with-mocked-launch-params-desktop-chromium\vk-home.png` | Playwright report/test-results artifact |
| `C:\Users\shelc\Documents\4\autotests\test-results\vk-app-basic-VK-Mini-App-opens-with-mocked-launch-params-mobile-chromium\vk-home.png` | Playwright report/test-results artifact |
| `C:\Users\shelc\Documents\4\autotests\test-results\web-basic-web-app-shell-opens-desktop-chromium\web-home.png` | Playwright report/test-results artifact |
| `C:\Users\shelc\Documents\4\autotests\test-results\web-basic-web-app-shell-opens-mobile-chromium\web-home.png` | Playwright report/test-results artifact |
| `C:\Users\shelc\Documents\4\index.backup_20260722_0405.html` | timestamped index.html backup |
| `C:\Users\shelc\Documents\4\index.backup_20260722_0409.html` | timestamped index.html backup |
| `C:\Users\shelc\Documents\4\index.backup_20260722_0633.html` | timestamped index.html backup |
| `C:\Users\shelc\Documents\4\index.backup_20260722_0638.html` | timestamped index.html backup |
| `C:\Users\shelc\Documents\4\index.backup_20260722_0641.html` | timestamped index.html backup |
| `C:\Users\shelc\Documents\4\index.backup_20260722_1950.html` | timestamped index.html backup |
| `C:\Users\shelc\Documents\4\index.backup_20260722_1952.html` | timestamped index.html backup |

Additionally, the direct root-to-root comparison lists app files at old-root paths such as `index.html`, `pm\...`, `docs\...`, and `shared\...`; those are not mandatory transfers because the canonical app copy is now `X:\4\.tmp-4e-app-publish`, where the same relative paths already exist. Identical copies are duplicates; differing copies are stale old-root versions compared with the active X worktree.

## Sensitive Mask Output

Masks checked: `AGENTS.md`, `FILE_MAP*.md`, `pm/**`, `*.md`, `*.env*`, `*secret*`, `*.key`. No `.env*`, `*secret*`, or `*.key` old-only file was found.

### Sensitive Files Different From X App

These are not transfer candidates; the old app repo is clean at origin and the X app has newer local state.

| Relative path | X app equivalent |
| --- | --- |
| `CODEX_INSTRUCTIONS.md` | `X:\4\.tmp-4e-app-publish\CODEX_INSTRUCTIONS.md` |
| `docs\marketing\СЦЕНАРИИ_РОЛИКОВ.md` | `X:\4\.tmp-4e-app-publish\docs\marketing\СЦЕНАРИИ_РОЛИКОВ.md` |
| `docs\staging-contour.md` | `X:\4\.tmp-4e-app-publish\docs\staging-contour.md` |
| `docs\tasks\BACK-019-task-card-improvements.md` | `X:\4\.tmp-4e-app-publish\docs\tasks\BACK-019-task-card-improvements.md` |
| `docs\tasks\BACK-021-voice-mediarecorder.md` | `X:\4\.tmp-4e-app-publish\docs\tasks\BACK-021-voice-mediarecorder.md` |
| `docs\tasks\BACK-022_task_detail_manual_mvp.md` | `X:\4\.tmp-4e-app-publish\docs\tasks\BACK-022_task_detail_manual_mvp.md` |
| `docs\tasks\BACK-023_task_detail_future_expansion.md` | `X:\4\.tmp-4e-app-publish\docs\tasks\BACK-023_task_detail_future_expansion.md` |
| `docs\tasks\BACK-025_ai_planner_glass_dashboard.md` | `X:\4\.tmp-4e-app-publish\docs\tasks\BACK-025_ai_planner_glass_dashboard.md` |
| `docs\tasks\BACK-026-account-merge.md` | `X:\4\.tmp-4e-app-publish\docs\tasks\BACK-026-account-merge.md` |
| `docs\tasks\BACK-039-completed-tasks-week.md` | `X:\4\.tmp-4e-app-publish\docs\tasks\BACK-039-completed-tasks-week.md` |
| `docs\tasks\BACK-040-admin-tariff-map.md` | `X:\4\.tmp-4e-app-publish\docs\tasks\BACK-040-admin-tariff-map.md` |
| `docs\tasks\BACK-045-russian-service-auth.md` | `X:\4\.tmp-4e-app-publish\docs\tasks\BACK-045-russian-service-auth.md` |
| `docs\tasks\BUG-2026-06-25-002_password_reset.md` | `X:\4\.tmp-4e-app-publish\docs\tasks\BUG-2026-06-25-002_password_reset.md` |
| `docs\tasks\BUG-2026-06-29-001_telegram_login_dead_end.md` | `X:\4\.tmp-4e-app-publish\docs\tasks\BUG-2026-06-29-001_telegram_login_dead_end.md` |
| `docs\tasks\BUG-2026-07-04-002_telegram_web_fallback.md` | `X:\4\.tmp-4e-app-publish\docs\tasks\BUG-2026-07-04-002_telegram_web_fallback.md` |
| `docs\tasks\BUG-2026-07-05-001_bottom_nav_width.md` | `X:\4\.tmp-4e-app-publish\docs\tasks\BUG-2026-07-05-001_bottom_nav_width.md` |
| `docs\tasks\BUG-2026-07-05-002_profile_mobile_layout.md` | `X:\4\.tmp-4e-app-publish\docs\tasks\BUG-2026-07-05-002_profile_mobile_layout.md` |
| `docs\tasks\TASK_TEMPLATE.md` | `X:\4\.tmp-4e-app-publish\docs\tasks\TASK_TEMPLATE.md` |
| `FILE_MAP_BOT.md` | `X:\4\.tmp-4e-app-publish\FILE_MAP_BOT.md` |
| `pm\agent-inbox\codex-to-claude-2026-06-28-branch-main-rule.md` | `X:\4\.tmp-4e-app-publish\pm\agent-inbox\codex-to-claude-2026-06-28-branch-main-rule.md` |
| `pm\assistant-evaluation.md` | `X:\4\.tmp-4e-app-publish\pm\assistant-evaluation.md` |
| `pm\outbox\REPORT-BRIEF-2026-07-20-21-viral-share-card-finish.md` | `X:\4\.tmp-4e-app-publish\pm\outbox\REPORT-BRIEF-2026-07-20-21-viral-share-card-finish.md` |
| `pm\qa-smart-001-002-004-group-bot.md` | `X:\4\.tmp-4e-app-publish\pm\qa-smart-001-002-004-group-bot.md` |
| `pm\release-checklist.md` | `X:\4\.tmp-4e-app-publish\pm\release-checklist.md` |
| `README.md` | `X:\4\.tmp-4e-app-publish\README.md` |
| `shared\COMMIT_CONVENTION.md` | `X:\4\.tmp-4e-app-publish\shared\COMMIT_CONVENTION.md` |
| `shared\DEVELOPMENT_HISTORY.md` | `X:\4\.tmp-4e-app-publish\shared\DEVELOPMENT_HISTORY.md` |
| `shared\FILE_RULES.md` | `X:\4\.tmp-4e-app-publish\shared\FILE_RULES.md` |

### All Sensitive Mask Hits

| Relative path | Category |
| --- | --- |
| `AGENTS.md` | same content in X app |
| `autotests\README.md` | same content in X app |
| `CLAUDE.md` | same content in X app |
| `CODEX_INSTRUCTIONS.md` | different from X app |
| `COWORK_INSTRUCTIONS.md` | same content in X app |
| `DEVELOPMENT_LOG.md` | same content in X app |
| `docs\back-036-login-fallback-options.md` | same content in X app |
| `docs\back-048-dev-test-accounts-runbook.md` | same content in X app |
| `docs\git-team-rules.md` | same content in X app |
| `docs\infra-005-yandex-ru-proxy.md` | same content in X app |
| `docs\marketing\СЦЕНАРИИ_РОЛИКОВ.md` | different from X app |
| `docs\qa\autotest-agent-playbook.md` | same content in X app |
| `docs\qa\GPT-QA-PACKET-2026-07-20.md` | same content in X app |
| `docs\qa\GPT-QA-PACKET-2026-07-20-v2.md` | same content in X app |
| `docs\staging-contour.md` | different from X app |
| `docs\tasks\ANALYTICS-002-metrics-plan.md` | same content in X app |
| `docs\tasks\BACK-009-vk-pay-verification-plan.md` | same content in X app |
| `docs\tasks\BACK-010-payment-support-policy.md` | same content in X app |
| `docs\tasks\BACK-011-command-workspace.md` | same content in X app |
| `docs\tasks\BACK-012-component-inventory-2026-07-22.md` | same content in X app |
| `docs\tasks\BACK-012-css-architecture-plan.md` | same content in X app |
| `docs\tasks\BACK-017-notifications-delivery-smoke.md` | same content in X app |
| `docs\tasks\BACK-019-task-card-improvements.md` | different from X app |
| `docs\tasks\BACK-019-task-card-mobile-smoke.md` | same content in X app |
| `docs\tasks\BACK-021-voice-mediarecorder.md` | different from X app |
| `docs\tasks\BACK-022_task_detail_manual_mvp.md` | different from X app |
| `docs\tasks\BACK-023_task_detail_future_expansion.md` | different from X app |
| `docs\tasks\BACK-025_ai_planner_glass_dashboard.md` | different from X app |
| `docs\tasks\BACK-026-account-merge.md` | different from X app |
| `docs\tasks\BACK-039-completed-tasks-week.md` | different from X app |
| `docs\tasks\BACK-040-admin-tariff-map.md` | different from X app |
| `docs\tasks\BACK-040-tariff-config-readiness.md` | same content in X app |
| `docs\tasks\BACK-044-task-detail-card-cleanup.md` | same content in X app |
| `docs\tasks\BACK-045-russian-service-auth.md` | different from X app |
| `docs\tasks\BACK-048-dev-test-accounts.md` | same content in X app |
| `docs\tasks\BACK-050-accessibility-baseline.md` | same content in X app |
| `docs\tasks\BACK-050-accessibility-smoke-checklist.md` | same content in X app |
| `docs\tasks\BACK-055-notifications-action-cards.md` | same content in X app |
| `docs\tasks\BACK-055-notifications-headless-smoke.md` | same content in X app |
| `docs\tasks\BACK-056-home-focus-time-copy.md` | same content in X app |
| `docs\tasks\BACK-057-offline-mode-plan.md` | same content in X app |
| `docs\tasks\BACK-057-offline-runtime-scope-audit.md` | same content in X app |
| `docs\tasks\BACK-058-oauth-profile-consent.md` | same content in X app |
| `docs\tasks\BACK-060-bot-path-signature-reconciliation.md` | same content in X app |
| `docs\tasks\BACK-064-notification-salience-delivery-audit.md` | same content in X app |
| `docs\tasks\BACK-065-task-title-normalization.md` | same content in X app |
| `docs\tasks\BACK-066-vk-functional-parity-audit-2026-07-22.md` | same content in X app |
| `docs\tasks\BACK-066-vk-stable-line-functional-parity.md` | same content in X app |
| `docs\tasks\BUG-2026-06-25-002_password_reset.md` | different from X app |
| `docs\tasks\BUG-2026-06-29-001_telegram_login_dead_end.md` | different from X app |
| `docs\tasks\BUG-2026-07-04-002_telegram_web_fallback.md` | different from X app |
| `docs\tasks\BUG-2026-07-05-001_bottom_nav_width.md` | different from X app |
| `docs\tasks\BUG-2026-07-05-002_profile_mobile_layout.md` | different from X app |
| `docs\tasks\BUG-2026-07-15-005-staging-resmoke-2026-07-17.md` | same content in X app |
| `docs\tasks\BUG-2026-07-22-task-detail-ios-regressions.md` | same content in X app |
| `docs\tasks\CAL-001-calendar-concept.md` | same content in X app |
| `docs\tasks\EVIDENCE-AUDIT-2026-07-17.md` | same content in X app |
| `docs\tasks\HOME-001-dashboard-redesign.md` | same content in X app |
| `docs\tasks\HORIZON05-MANUAL-GATES-PACK-2026-07-22.md` | same content in X app |
| `docs\tasks\INFRA-005-yandex-ru-proxy-step1.md` | same content in X app |
| `docs\tasks\INFRA-006-worker-line-ending-incident-2026-07-17.md` | same content in X app |
| `docs\tasks\MERGE-READINESS-2026-07-17.md` | same content in X app |
| `docs\tasks\MONETIZATION-DECISIONS-2026-07-16.md` | same content in X app |
| `docs\tasks\NATIVE-PLATFORM-DECISIONS-2026-07-16.md` | same content in X app |
| `docs\tasks\NEW-006-tma-safe-area-live-smoke.md` | same content in X app |
| `docs\tasks\NEW-008-chat-keyboard-live-smoke.md` | same content in X app |
| `docs\tasks\OMNI-001-omnichannel-surfaces.md` | same content in X app |
| `docs\tasks\PERF-2026-07-18-task-latency-recheck.md` | same content in X app |
| `docs\tasks\PLAT-003-twa-capacitor-roadmap.md` | same content in X app |
| `docs\tasks\PRICE-MAP-2026-07-17.md` | same content in X app |
| `docs\tasks\PRODUCT-DECISIONS-2026-07-16.md` | same content in X app |
| `docs\tasks\RELEASE-BETA-GATES-2026-07-16.md` | same content in X app |
| `docs\tasks\SMART-004-group-task-capture-smoke.md` | same content in X app |
| `docs\tasks\SMART-007-memory-evidence-fixture-plan.md` | same content in X app |
| `docs\tasks\SMART-011-waiting-on-people-smoke.md` | same content in X app |
| `docs\tasks\SMART-012-adaptive-reminders-plan.md` | same content in X app |
| `docs\tasks\SMART-013-ai-task-decomposition.md` | same content in X app |
| `docs\tasks\STAGING-AUTOMATED-QA-2026-07-17.md` | same content in X app |
| `docs\tasks\TASK_TEMPLATE.md` | different from X app |
| `docs\tasks\VIRAL-005-first-ai-plan-wow.md` | same content in X app |
| `docs\team-sync-protocol.md` | same content in X app |
| `docs\ui-architecture-rules.md` | same content in X app |
| `docs\ЗАДАЧИ_БЕТА_И_ВИРАЛЬНОСТЬ.md` | same content in X app |
| `docs\ЗАДАЧИ_УМНЫЙ_АССИСТЕНТ.md` | same content in X app |
| `FILE_MAP.md` | same content in X app |
| `FILE_MAP_BOT.md` | different from X app |
| `FILE_MAP_UI.md` | same content in X app |
| `FILE_MAP_WORKER.md` | same content in X app |
| `pm\agent-inbox\codex-to-claude-2026-06-28-branch-main-rule.md` | different from X app |
| `pm\agent-inbox\codex-to-team-2026-07-08-omnichannel-calendar-roadmap.md` | same content in X app |
| `pm\agent-inbox\codex-to-yuri-2026-07-06-accessibility-baseline.md` | same content in X app |
| `pm\agent-inbox\codex-to-yuri-2026-07-06-accessibility-permanent-rule.md` | same content in X app |
| `pm\agent-inbox\codex-to-yuri-2026-07-08-roadmap-filters-monetization.md` | same content in X app |
| `pm\ANALYSIS-2026-07-23-night-session-and-next-periods.md` | same content in X app |
| `pm\ANALYSIS-2026-07-24-night-session-test-tools-and-manual-queue.md` | same content in X app |
| `pm\assistant-evaluation.md` | different from X app |
| `pm\autotest-backlog-coverage-2026-07-23.md` | same content in X app |
| `pm\back-035-manual-shortlist.md` | same content in X app |
| `pm\backlog.md` | same content in X app |
| `pm\beta-invite-pack-2026-07.md` | same content in X app |
| `pm\beta-invite-ready-checklist-2026-07-17.md` | same content in X app |
| `pm\beta-run-2026-07.md` | same content in X app |
| `pm\bugs.md` | same content in X app |
| `pm\cloudflare-secrets-handoff-2026-07-17.md` | same content in X app |
| `pm\cycle-execution-report-2026-07-17.md` | same content in X app |
| `pm\design-references\glass-card-reference.png` | same content in X app |
| `pm\design-references\glass-card-reference-spec.md` | same content in X app |
| `pm\design-references\README.md` | same content in X app |
| `pm\design-roadmap-correction-2026-07-23.md` | same content in X app |
| `pm\design-system-glass-inventory-2026-07-24.md` | same content in X app |
| `pm\feedback-loop-2026-07.md` | same content in X app |
| `pm\idea-capture-2026-07-21.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-18-00-agents-autonomy-rules.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-18-01-redesign-cutover-staging.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-18-price-align-security-perf.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-18-selftest.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-19-10a-auth-avatar-login-diagnose.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-19-10-push-origin-sync.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-19-11-save-badge-copy-sync.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-19-12-voice-perf-new-020.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-19-13-back-055-notifications-evidence.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-19-14-agents-stale-priorities.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-19-15-pm-docs-hygiene.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-19-16-analytics-002-scope-pause-and-document.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-19-17-arch001-evidence-upgrade.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-19-18-smart007-evidence-upgrade.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-20-20-back012-css-bem-cleanup.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-20-21-viral-share-card-finish.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-20-22-arch001-continue-split.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-20-23-preview-state-flags-for-qa.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-20-24-codex-self-visual-qa-probe.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-20-25-preview-stability-fix.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-20-26-layout-overlaps-from-gpt-qa.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-20-27-back049-ui-guard-evidence-upgrade.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-20-28-file-map-sync-audit.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-20-morning-refine-01-auth-avatar-login-diagnose.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-20-morning-refine-02-analytics-002-scope-document.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-21-morning-refine-01-auth-password-error-narrow-fix.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-21-morning-refine-02-avatar-draft-scope-privacy-fix.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-21-morning-refine-03-platform-global-alias-investigate.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-21-night-liquid-glass-system.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-22-30-focus-panel-visible-preview.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-22-31-task-reminder-time-ios.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-22-32-task-tag-popup-ios.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-22-33-task-detail-hero-overflow-ios.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-22-34-chat-history-over-40-evidence.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-22-35-smart007-memory-ui-regression-smoke.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-22-36-privacy-surface-regression-smoke.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-22-37-back037-ci-coverage-audit.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-22-38-horizon05-manual-gates-pack.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-22-39-arch001-status-evidence-audit.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-22-40-back012-component-inventory.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-22-41-horizon05-status-consistency.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-23-42-glass-design-system-foundation.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-23-43-vk-beta-readiness-map.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-23-44-vk-task-detail-beta-parity.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-23-45-vk-home-beta-parity.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-23-46-vk-profile-beta-parity.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-23-47-vk-calendar-parser-beta-parity.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-23-48-vk-auth-session-claude-scope.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-23-49-vk-ai-chat-claude-scope.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-24-50-glass-notification-card-slice.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-24-51-glass-task-detail-reference-slice.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-24-52-glass-night-visual-qa-handoff.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-24-53-glass-home-focus-dashboard-package2.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-24-54-glass-task-list-card-family-package2.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-24-55-glass-profile-menu-package2.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-24-56-glass-package2-visual-qa-handoff.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-24-57-glass-forms-dialogs-controls-package3.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-24-58-glass-chat-conversation-package3.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-24-59-glass-vk-parity-package3.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-24-60-glass-package3-final-qa-handoff.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-25-61-expired-premium-task-actions.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-25-62-expired-premium-voice-gate.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-25-63-voice-consent-checkbox-accessibility.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-25-64-voice-exit-controls.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-25-65-relative-time-copy.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-25-66-dashboard-right-edge-overflow.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-25-67-chat-voice-entrypoint.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-25-68-ai-delete-intent-safety.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-25-69-telegram-group-bot-capture.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-25-70-focus-counters-consistency.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-25-71-statistics-active-tasks-empty.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-25-72-calendar-task-list-clickability.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-25-73-task-detail-glass-layout-restore.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-25-74-task-chat-confirm-action.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-25-75-platform-global-alias-oauth-diagnostics.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-25-76-focus-panel-acceptance-restart.md` | same content in X app |
| `pm\inbox\BRIEF-2026-07-25-77-branch-inventory-no-delete.md` | same content in X app |
| `pm\inbox\BRIEF-TEMPLATE.md` | same content in X app |
| `pm\inbox\README.md` | same content in X app |
| `pm\infra-006-preflight-checklist.md` | same content in X app |
| `pm\infra-006-workspace-unification.md` | same content in X app |
| `pm\infra-006-x-drive-migration-2026-07-16.md` | same content in X app |
| `pm\manual-qa-2026-07-17.md` | same content in X app |
| `pm\morning-command-center-2026-07-17.md` | same content in X app |
| `pm\next-actions.md` | same content in X app |
| `pm\next-cycle-matrix-2026-07-17.md` | same content in X app |
| `pm\night-handoff-2026-07-16-to-17.md` | same content in X app |
| `pm\night-handoff-addendum-2026-07-17.md` | same content in X app |
| `pm\night-session-2026-07-24-glass-packages-2-3-plan.md` | same content in X app |
| `pm\night-session-2026-07-24-glass-reference-plan.md` | same content in X app |
| `pm\outbox\README.md` | same content in X app |
| `pm\outbox\REPORT-2026-07-22-gpt-live-browser-qa-intake.md` | same content in X app |
| `pm\outbox\REPORT-2026-07-22-light-theme-chat-buttons-intake.md` | same content in X app |
| `pm\outbox\REPORT-2026-07-22-manual-qa-task-detail-home-bg.md` | same content in X app |
| `pm\outbox\REPORT-2026-07-23-43-vk-beta-readiness-map.md` | same content in X app |
| `pm\outbox\REPORT-2026-07-23-44-vk-task-detail-beta-parity.md` | same content in X app |
| `pm\outbox\REPORT-2026-07-23-45-vk-home-beta-parity.md` | same content in X app |
| `pm\outbox\REPORT-2026-07-23-46-vk-profile-beta-parity.md` | same content in X app |
| `pm\outbox\REPORT-2026-07-23-47-vk-calendar-parser-beta-parity.md` | same content in X app |
| `pm\outbox\REPORT-2026-07-23-48-vk-auth-session-claude-scope.md` | same content in X app |
| `pm\outbox\REPORT-2026-07-23-49-vk-ai-chat-claude-scope.md` | same content in X app |
| `pm\outbox\REPORT-2026-07-23-pm-inbox-daily-runner-final.md` | same content in X app |
| `pm\outbox\REPORT-2026-07-23-vk-beta-night-queue.md` | same content in X app |
| `pm\outbox\REPORT-2026-07-25-misha-bug-night-queue.md` | same content in X app |
| `pm\outbox\REPORT-4e-full-system-roadmap-and-design-audit-2026-07-23.md` | same content in X app |
| `pm\outbox\REPORT-4e-morning-inbox-and-safe-backlog-runner-2026-07-22.md` | same content in X app |
| `pm\outbox\REPORT-4e-morning-inbox-and-safe-backlog-runner-2026-07-23.md` | same content in X app |
| `pm\outbox\REPORT-4e-morning-inbox-and-safe-backlog-runner-2026-07-24.md` | same content in X app |
| `pm\outbox\REPORT-4e-morning-inbox-and-safe-backlog-runner-2026-07-25.md` | same content in X app |
| `pm\outbox\REPORT-4e-night-inbox-and-whitelist-backlog-runner-2026-07-21.md` | same content in X app |
| `pm\outbox\REPORT-4e-night-inbox-and-whitelist-backlog-runner-2026-07-22.md` | same content in X app |
| `pm\outbox\REPORT-4e-night-inbox-and-whitelist-backlog-runner-2026-07-23.md` | same content in X app |
| `pm\outbox\REPORT-4e-night-inbox-and-whitelist-backlog-runner-2026-07-24.md` | same content in X app |
| `pm\outbox\REPORT-4e-night-inbox-and-whitelist-backlog-runner-2026-07-25.md` | same content in X app |
| `pm\outbox\REPORT-4e-pm-inbox-daily-runner-2026-07-20.md` | same content in X app |
| `pm\outbox\REPORT-4e-pm-inbox-daily-runner-2026-07-21-final.md` | same content in X app |
| `pm\outbox\REPORT-4e-pm-inbox-daily-runner-2026-07-22-final.md` | same content in X app |
| `pm\outbox\REPORT-4e-pm-inbox-daily-runner-2026-07-24-final.md` | same content in X app |
| `pm\outbox\REPORT-4e-pm-inbox-daily-runner-presync-2026-07-21.md` | same content in X app |
| `pm\outbox\REPORT-4e-pre-dawn-inbox-and-whitelist-backlog-runner-2026-07-20.md` | same content in X app |
| `pm\outbox\REPORT-4e-pre-dawn-inbox-and-whitelist-backlog-runner-2026-07-21.md` | same content in X app |
| `pm\outbox\REPORT-4e-pre-dawn-inbox-and-whitelist-backlog-runner-2026-07-22.md` | same content in X app |
| `pm\outbox\REPORT-4e-pre-dawn-inbox-and-whitelist-backlog-runner-2026-07-23.md` | same content in X app |
| `pm\outbox\REPORT-4e-pre-dawn-inbox-and-whitelist-backlog-runner-2026-07-24.md` | same content in X app |
| `pm\outbox\REPORT-analytics-002-step1-2-retro.md` | same content in X app |
| `pm\outbox\REPORT-automation-disk-guard-2026-07-25.md` | same content in X app |
| `pm\outbox\REPORT-automation-morning-reconcile-2026-07-25.md` | same content in X app |
| `pm\outbox\REPORT-automation-night-step0-intake-2026-07-25.md` | same content in X app |
| `pm\outbox\REPORT-BACK-012-ask-action-preview-bem-cleanup-2026-07-23.md` | same content in X app |
| `pm\outbox\REPORT-BACK-012-auth-inline-cleanup-2026-07-22.md` | same content in X app |
| `pm\outbox\REPORT-BACK-012-calendar-inline-cleanup-2026-07-22.md` | same content in X app |
| `pm\outbox\REPORT-BACK-012-notification-renderer-bem-cleanup-2026-07-23.md` | same content in X app |
| `pm\outbox\REPORT-BACK-012-notifications-inline-cleanup-2026-07-22.md` | same content in X app |
| `pm\outbox\REPORT-BACK-012-statistics-inline-cleanup-2026-07-22.md` | same content in X app |
| `pm\outbox\REPORT-BACK-012-task-card-head-meta-bem-cleanup-2026-07-23.md` | same content in X app |
| `pm\outbox\REPORT-BACK-012-task-move-inline-cleanup-2026-07-22.md` | same content in X app |
| `pm\outbox\REPORT-BACK-019-status-sync.md` | same content in X app |
| `pm\outbox\REPORT-BACK-019-task-card-mobile-smoke.md` | same content in X app |
| `pm\outbox\REPORT-BACK-034-staging-api-resmoke-2026-07-20.md` | same content in X app |
| `pm\outbox\REPORT-BACK-050-accessibility-smoke-2026-07-20.md` | same content in X app |
| `pm\outbox\REPORT-BACK-055-notifications-headless-smoke.md` | same content in X app |
| `pm\outbox\REPORT-BACK-061-062-auth-legal-playwright-2026-07-24.md` | same content in X app |
| `pm\outbox\REPORT-BACK-064-notification-salience-delivery-audit.md` | same content in X app |
| `pm\outbox\REPORT-BACK-065-status-sync-2026-07-25.md` | same content in X app |
| `pm\outbox\REPORT-BACK-065-task-title-normalization.md` | same content in X app |
| `pm\outbox\REPORT-BACK-066A-vk-task-intent.md` | same content in X app |
| `pm\outbox\REPORT-BACK-066-vk-functional-parity-audit.md` | same content in X app |
| `pm\outbox\REPORT-BACK-066-vk-playwright-parity-2026-07-24.md` | same content in X app |
| `pm\outbox\REPORT-BRIEF-2026-07-18-00-agents-autonomy-rules.md` | same content in X app |
| `pm\outbox\REPORT-BRIEF-2026-07-18-01-redesign-cutover-staging.md` | same content in X app |
| `pm\outbox\REPORT-BRIEF-2026-07-18-price-align-security-perf.md` | same content in X app |
| `pm\outbox\REPORT-BRIEF-2026-07-18-selftest.md` | same content in X app |
| `pm\outbox\REPORT-BRIEF-2026-07-19-10a-auth-avatar-login-diagnose.md` | same content in X app |
| `pm\outbox\REPORT-BRIEF-2026-07-19-10-push-origin-sync.md` | same content in X app |
| `pm\outbox\REPORT-BRIEF-2026-07-19-11-save-badge-copy-sync.md` | same content in X app |
| `pm\outbox\REPORT-BRIEF-2026-07-19-12-voice-perf-new-020.md` | same content in X app |
| `pm\outbox\REPORT-BRIEF-2026-07-19-13-back-055-notifications-evidence.md` | same content in X app |
| `pm\outbox\REPORT-BRIEF-2026-07-19-14-agents-stale-priorities.md` | same content in X app |
| `pm\outbox\REPORT-BRIEF-2026-07-19-15-pm-docs-hygiene.md` | same content in X app |
| `pm\outbox\REPORT-BRIEF-2026-07-19-16-analytics-002-scope-pause-and-document.md` | same content in X app |
| `pm\outbox\REPORT-BRIEF-2026-07-19-17-arch001-evidence-upgrade.md` | same content in X app |
| `pm\outbox\REPORT-BRIEF-2026-07-19-18-smart007-evidence-upgrade.md` | same content in X app |
| `pm\outbox\REPORT-BRIEF-2026-07-20-20-back012-css-bem-cleanup.md` | same content in X app |
| `pm\outbox\REPORT-BRIEF-2026-07-20-21-viral-share-card-finish.md` | different from X app |
| `pm\outbox\REPORT-BRIEF-2026-07-20-22-arch001-continue-split.md` | same content in X app |
| `pm\outbox\REPORT-BRIEF-2026-07-20-23-preview-state-flags-for-qa.md` | same content in X app |
| `pm\outbox\REPORT-BRIEF-2026-07-20-25-preview-stability-fix.md` | same content in X app |
| `pm\outbox\REPORT-BRIEF-2026-07-20-26-layout-overlaps-from-gpt-qa.md` | same content in X app |
| `pm\outbox\REPORT-BRIEF-2026-07-20-27-back049-ui-guard-evidence-upgrade.md` | same content in X app |
| `pm\outbox\REPORT-BRIEF-2026-07-20-28-file-map-sync-audit.md` | same content in X app |
| `pm\outbox\REPORT-BRIEF-2026-07-20-morning-refine-01-auth-avatar-login-diagnose.md` | same content in X app |
| `pm\outbox\REPORT-BRIEF-2026-07-20-morning-refine-02-analytics-002-scope-document.md` | same content in X app |
| `pm\outbox\REPORT-BRIEF-2026-07-21-morning-refine-01-auth-password-error-narrow-fix.md` | same content in X app |
| `pm\outbox\REPORT-BRIEF-2026-07-21-morning-refine-02-avatar-draft-scope-privacy-fix.md` | same content in X app |
| `pm\outbox\REPORT-BRIEF-2026-07-21-morning-refine-03-platform-global-alias-investigate.md` | same content in X app |
| `pm\outbox\REPORT-BRIEF-2026-07-21-night-liquid-glass-system.md` | same content in X app |
| `pm\outbox\REPORT-BRIEF-2026-07-22-30-focus-panel-visible-preview.md` | same content in X app |
| `pm\outbox\REPORT-BRIEF-2026-07-22-31-task-reminder-time-ios.md` | same content in X app |
| `pm\outbox\REPORT-BRIEF-2026-07-22-32-task-tag-popup-ios.md` | same content in X app |
| `pm\outbox\REPORT-BRIEF-2026-07-22-33-task-detail-hero-overflow-ios.md` | same content in X app |
| `pm\outbox\REPORT-BRIEF-2026-07-22-34-chat-history-over-40-evidence.md` | same content in X app |
| `pm\outbox\REPORT-BRIEF-2026-07-22-35-smart007-memory-ui-regression-smoke.md` | same content in X app |
| `pm\outbox\REPORT-BRIEF-2026-07-22-36-privacy-surface-regression-smoke.md` | same content in X app |
| `pm\outbox\REPORT-BRIEF-2026-07-22-37-back037-ci-coverage-audit.md` | same content in X app |
| `pm\outbox\REPORT-BRIEF-2026-07-22-38-horizon05-manual-gates-pack.md` | same content in X app |
| `pm\outbox\REPORT-BRIEF-2026-07-22-39-arch001-status-evidence-audit.md` | same content in X app |
| `pm\outbox\REPORT-BRIEF-2026-07-22-40-back012-component-inventory.md` | same content in X app |
| `pm\outbox\REPORT-BRIEF-2026-07-22-41-horizon05-status-consistency.md` | same content in X app |
| `pm\outbox\REPORT-BRIEF-2026-07-23-42-glass-design-system-foundation.md` | same content in X app |
| `pm\outbox\REPORT-BRIEF-2026-07-24-50-glass-notification-card-slice.md` | same content in X app |
| `pm\outbox\REPORT-BRIEF-2026-07-24-51-glass-task-detail-reference-slice.md` | same content in X app |
| `pm\outbox\REPORT-BRIEF-2026-07-24-52-glass-night-visual-qa-handoff.md` | same content in X app |
| `pm\outbox\REPORT-BRIEF-2026-07-24-53-glass-home-focus-dashboard-package2.md` | same content in X app |
| `pm\outbox\REPORT-BRIEF-2026-07-24-54-glass-task-list-card-family-package2.md` | same content in X app |
| `pm\outbox\REPORT-BRIEF-2026-07-24-55-glass-profile-menu-package2.md` | same content in X app |
| `pm\outbox\REPORT-BRIEF-2026-07-24-56-glass-package2-visual-qa-handoff.md` | same content in X app |
| `pm\outbox\REPORT-BRIEF-2026-07-24-57-glass-forms-dialogs-controls-package3.md` | same content in X app |
| `pm\outbox\REPORT-BRIEF-2026-07-24-58-glass-chat-conversation-package3.md` | same content in X app |
| `pm\outbox\REPORT-BRIEF-2026-07-24-59-glass-vk-parity-package3.md` | same content in X app |
| `pm\outbox\REPORT-BRIEF-2026-07-24-60-glass-package3-final-qa-handoff.md` | same content in X app |
| `pm\outbox\REPORT-DESIGN-GLASS-001-night-scheduling-2026-07-23.md` | same content in X app |
| `pm\outbox\REPORT-doc-task-status-sync-2026-07-21.md` | same content in X app |
| `pm\outbox\REPORT-HOME-001-dashboard-smoke-2026-07-20.md` | same content in X app |
| `pm\outbox\REPORT-NEW-006-BACK-046-navigation-safe-area-playwright-2026-07-24.md` | same content in X app |
| `pm\outbox\REPORT-NEW-008-chat-keyboard-playwright-2026-07-24.md` | same content in X app |
| `pm\outbox\REPORT-SMART-005-roadmap-status-sync.md` | same content in X app |
| `pm\outbox\REPORT-SMART-007-memory-fixture-smoke-2026-07-20.md` | same content in X app |
| `pm\outbox\REPORT-X-drive-canon-path-guard-2026-07-25.md` | same content in X app |
| `pm\partial-done-runtime-freeze-audit-2026-07-17.md` | same content in X app |
| `pm\post-beta-decision-tree-2026-07.md` | same content in X app |
| `pm\qa-checklist.md` | same content in X app |
| `pm\qa-results-2026-07-17.md` | same content in X app |
| `pm\qa-smart-001-002-004-group-bot.md` | different from X app |
| `pm\qa-tooling-plan-2026-07-23.md` | same content in X app |
| `pm\ready-for-qa-triage-2026-07-17.md` | same content in X app |
| `pm\release-checklist.md` | different from X app |
| `pm\tail-closeout-2026-07-17.md` | same content in X app |
| `pm\team-sync.md` | same content in X app |
| `pm\vk-parity-plan-2026-07-23.md` | same content in X app |
| `README.md` | different from X app |
| `shared\COMMIT_CONVENTION.md` | different from X app |
| `shared\DEVELOPMENT_HISTORY.md` | different from X app |
| `shared\FILE_RULES.md` | different from X app |
| `shared\ROADMAP.md` | same content in X app |
| `shared\WORK_LOG.md` | same content in X app |

## Raw Commands

```powershell
git -C "C:\Users\shelc\Documents\4\.tmp-4e-app-publish" status --short
git -C "C:\Users\shelc\Documents\4\.tmp-4e-app-publish" log --oneline origin/feat/admin-tariff-api..HEAD
git -C "C:\Users\shelc\Documents\4\4e-worker" status --short
git -C "C:\Users\shelc\Documents\4\4e-worker" log --oneline @{u}..HEAD
git -C "C:\Users\shelc\Documents\4" status --short --branch
git -C "C:\Users\shelc\Documents\4" log --oneline origin/feat/admin-tariff-api..HEAD
```

## Verification Before Commit

- `node scripts/check-cp1251-mojibake.mjs` -> `CP1251 mojibake check passed: 0 suspicious tokens`.
- `git diff --check -- pm/outbox/REPORT-documents4-inventory-2026-07-25.md` -> passed.
- `npm run check:portable-paths` -> not executed successfully in this Windows session because `bash` is not available in `PATH`: `spawnSync bash ENOENT`. This is an environment/tooling issue, not a report-content failure.
