# REPORT-2026-07-26-folder-and-pm-split-migration

## Scope

- Worked only inside X:\Projects\4-ai-secretary except the required read-only Step 1 checks against X:\4\.tmp-4e-app-publish for origin URL and HEAD parity.
- App branch: eat/admin-tariff-api.
- Worker, bot, production deploy, main merge, prices, payments, entitlement, and secrets were not touched.

## Repositories And SHA

| Repo | URL | Before | After |
| --- | --- | --- | --- |
| app | $appRemote | $appBefore | commit containing this report; exact pushed SHA is available from git rev-parse origin/feat/admin-tariff-api after push. Pre-commit base was $appHeadNow. |
| 4pm | $pmRemote | $pmBefore | $pmAfter on eat/admin-tariff-api |

Remote 4pm after push:

`	ext
4795922553f32737fb24b5531d7220bab8af04e7	refs/heads/feat/admin-tariff-api
`

Note: the exact app-after SHA cannot be embedded into this tracked report before creating the commit, because adding that SHA changes the commit SHA. The final assistant closeout includes the exact pushed app SHA.

## Migration Method

Used git fast-export feat/admin-tariff-api -- pm/ docs/ shared/ from the fresh app clone and git fast-import into the empty 4pm clone, then pushed eat/admin-tariff-api to https://github.com/mrktggod/4pm.git.

git filter-repo was not installed in this environment. git fast-export/ast-import preserved commit history for the selected paths without rewriting public app history.

## What Moved To 4pm

`	ext
docs/archive/2026-06-pre-beta/BETA_ARCHITECTURE.md
docs/archive/2026-06-pre-beta/BETA_ROADMAP.md
docs/archive/2026-06-pre-beta/DEVELOPMENT_HISTORY.md
docs/archive/2026-06-pre-beta/KV_TO_D1_MIGRATION_PLAN.md
docs/archive/2026-06-pre-beta/MIMO_ACTIVITY.jsonl
docs/archive/2026-06-pre-beta/MIMO_INTEGRATION.md
docs/archive/2026-06-pre-beta/MIMO_WORK_LOG.md
docs/archive/2026-06-pre-beta/PRODUCT_ROADMAP.md
docs/archive/2026-06-pre-beta/PROGRESS_METRICS_2026-06-17_2026-06-19.md
docs/archive/2026-06-pre-beta/README.md
docs/archive/2026-06-pre-beta/SECRETS_INVENTORY.md
docs/archive/2026-06-pre-beta/TECHNICAL_AUDIT.md
docs/archive/2026-06-pre-beta/tasks/CODEX-001_close-gate0.md
docs/archive/2026-06-pre-beta/tasks/CODEX-002_security-remaining.md
docs/archive/2026-06-pre-beta/tasks/CODEX-003_d1_tasks_v2.md
docs/archive/2026-06-pre-beta/tasks/CODEX-004_kv_task_normalization.md
docs/archive/2026-06-pre-beta/tasks/CODEX-005_d1_task_import_plan.md
docs/archive/2026-06-pre-beta/tasks/CODEX-006_local_task_import_validation.md
docs/archive/2026-06-pre-beta/tasks/CODEX-007_staging_task_import.md
docs/archive/2026-06-pre-beta/tasks/CODEX-008_quarantine_reconciliation.md
docs/archive/2026-06-pre-beta/tasks/CODEX-009_conversation_owner_resolver.md
docs/archive/2026-06-pre-beta/tasks/CODEX-010_legacy_conversation_mapping_schema.md
docs/archive/2026-06-pre-beta/tasks/CODEX-011_conversation_mapping_seed_plan.md
docs/archive/2026-06-pre-beta/tasks/CODEX-012_conversation_mapping_approval_tooling.md
docs/archive/2026-06-pre-beta/tasks/CODEX-013_telegram_provider_sync_mapping.md
docs/archive/2026-06-pre-beta/tasks/CODEX-014_staging_telegram_provider_sync_smoke.md
docs/archive/2026-06-pre-beta/tasks/CODEX-015_staging_approved_mapping_report.md
docs/archive/2026-06-pre-beta/tasks/CODEX-016_quarantine_unlock_planner.md
docs/archive/2026-06-pre-beta/tasks/CODEX-017_persistent_synthetic_provider_mapping.md
docs/archive/2026-06-pre-beta/tasks/CODEX-018_synthetic_positive_unlock_branch.md
docs/archive/2026-06-pre-beta/tasks/CODEX-019_encrypted_full_hash_join_planner.md
docs/archive/2026-06-pre-beta/tasks/CODEX-020_synthetic_encrypted_task_import_dry_run.md
docs/archive/2026-06-pre-beta/tasks/CODEX-021_d1_message_repository_pagination_idempotency.md
docs/archive/2026-06-pre-beta/tasks/CODEX-022_v2_messages_route_service.md
docs/archive/2026-06-pre-beta/tasks/CODEX-023_v2_messages_worker_entrypoint_smoke.md
docs/archive/2026-06-pre-beta/tasks/CODEX-024_vk_email_login_connection_hotfix.md
docs/archive/2026-06-pre-beta/tasks/CODEX-025_login_legacy_password_frontend_hardening.md
docs/archive/2026-06-pre-beta/tasks/CODEX-026_vk_ru_origin_cors_hotfix.md
docs/archive/2026-06-pre-beta/tasks/CODEX-027_vk_mobile_webview_x_requested_with_hotfix.md
docs/archive/2026-06-pre-beta/tasks/CODEX-028_vk_mobile_false_connection_after_successful_login.md
docs/archive/2026-06-pre-beta/tasks/CODEX-029_vk_docs_login_timeout_chat_task_persistence.md
docs/archive/2026-06-pre-beta/tasks/CODEX-030_legacy_identity_linking_vk_task_dashboard.md
docs/archive/2026-06-pre-beta/tasks/CODEX-031_vk_connected_accounts_profile_ui.md
docs/archive/2026-06-pre-beta/tasks/CODEX-032_v2_auth_identities_read_endpoint.md
docs/archive/2026-06-pre-beta/tasks/CODEX-033_v2_signed_identity_link_routes.md
docs/archive/2026-06-pre-beta/tasks/CODEX-034_d1_identity_conflict_challenge_foundation.md
docs/archive/2026-06-pre-beta/tasks/CODEX-035_d1_link_challenge_completion_route.md
docs/archive/2026-06-pre-beta/tasks/CODEX-036_d1_link_challenge_merge_confirmation_route.md
docs/archive/2026-06-pre-beta/tasks/CODEX-037_vk_identity_conflict_merge_ui_layer.md
docs/archive/2026-06-pre-beta/tasks/CODEX-038_d1_legacy_session_bridge.md
docs/archive/2026-06-pre-beta/tasks/CODEX-039_vk_frontend_d1_auth_bridge_handshake.md
docs/archive/2026-06-pre-beta/tasks/CODEX-040_production_d1_cutover_readiness_checker.md
docs/archive/2026-06-pre-beta/tasks/CODEX-041_production_d1_gate.md
docs/archive/2026-06-pre-beta/tasks/CODEX-042_defensive_legacy_session_parse.md
docs/archive/2026-06-pre-beta/tasks/CODEX-043_production_d1_migration_status_report.md
docs/archive/2026-06-pre-beta/tasks/CODEX-044_ready_task_import_approval_pack.md
docs/archive/2026-06-pre-beta/tasks/CODEX-045_privacy_controls_foundation.md
docs/archive/2026-06-pre-beta/tasks/CODEX-046_v2_privacy_routes.md
docs/archive/2026-06-pre-beta/tasks/CODEX-047_privacy_center_frontend.md
docs/archive/2026-06-pre-beta/tasks/CODEX-048_staging_privacy_gate.md
docs/archive/2026-06-pre-beta/tasks/CODEX-049_production_privacy_gate.md
docs/archive/2026-06-pre-beta/tasks/CODEX-050_frontend_privacy_center_publish.md
docs/archive/2026-06-pre-beta/tasks/CODEX-051_vk_mobile_auth_timeout_retry.md
docs/archive/2026-06-pre-beta/tasks/CODEX-052_vk_mobile_simple_cors_auth_diagnostics.md
docs/archive/2026-06-pre-beta/tasks/CODEX-053_vk_api_edge_domain.md
docs/archive/2026-06-pre-beta/tasks/CODEX-054_vk_auth_screen_fast_boot.md
docs/archive/2026-06-pre-beta/tasks/CODEX-055_vk_email_login_recovery.md
docs/archive/2026-06-pre-beta/tasks/CODEX-056_vk_auth_connection_warmup.md
docs/archive/2026-06-pre-beta/tasks/CODEX-057_light_theme_discussion_tab_polish.md
docs/archive/2026-06-pre-beta/tasks/CODEX-058_vk_runtime_redesign_route_fix.md
docs/back-036-login-fallback-options.md
docs/back-048-dev-test-accounts-runbook.md
docs/git-team-rules.md
docs/infra-005-yandex-ru-proxy.md
"docs/marketing/\320\241\320\246\320\225\320\235\320\220\320\240\320\230\320\230_\320\240\320\236\320\233\320\230\320\232\320\236\320\222.md"
docs/qa/GPT-QA-PACKET-2026-07-20-v2.md
docs/qa/GPT-QA-PACKET-2026-07-20.md
docs/qa/autotest-agent-playbook.md
docs/staging-contour.md
docs/tasks/ANALYTICS-002-metrics-plan.md
docs/tasks/BACK-009-vk-pay-verification-plan.md
docs/tasks/BACK-010-payment-support-policy.md
docs/tasks/BACK-011-command-workspace.md
docs/tasks/BACK-012-component-inventory-2026-07-22.md
docs/tasks/BACK-012-css-architecture-plan.md
docs/tasks/BACK-017-notifications-delivery-smoke.md
docs/tasks/BACK-019-task-card-improvements.md
docs/tasks/BACK-019-task-card-mobile-smoke.md
docs/tasks/BACK-021-voice-mediarecorder.md
docs/tasks/BACK-022_task_detail_manual_mvp.md
docs/tasks/BACK-023_task_detail_future_expansion.md
docs/tasks/BACK-025_ai_planner_glass_dashboard.md
docs/tasks/BACK-026-account-merge.md
docs/tasks/BACK-039-completed-tasks-week.md
docs/tasks/BACK-040-admin-tariff-map.md
docs/tasks/BACK-040-tariff-config-readiness.md
docs/tasks/BACK-044-task-detail-card-cleanup.md
docs/tasks/BACK-045-russian-service-auth.md
docs/tasks/BACK-048-dev-test-accounts.md
docs/tasks/BACK-050-accessibility-baseline.md
docs/tasks/BACK-050-accessibility-smoke-checklist.md
docs/tasks/BACK-055-notifications-action-cards.md
docs/tasks/BACK-055-notifications-headless-smoke.md
docs/tasks/BACK-056-home-focus-time-copy.md
docs/tasks/BACK-057-offline-mode-plan.md
docs/tasks/BACK-057-offline-runtime-scope-audit.md
docs/tasks/BACK-058-oauth-profile-consent.md
docs/tasks/BACK-060-bot-path-signature-reconciliation.md
docs/tasks/BACK-064-notification-salience-delivery-audit.md
docs/tasks/BACK-065-task-title-normalization.md
docs/tasks/BACK-066-vk-functional-parity-audit-2026-07-22.md
docs/tasks/BACK-066-vk-stable-line-functional-parity.md
docs/tasks/BUG-2026-06-25-002_password_reset.md
docs/tasks/BUG-2026-06-29-001_telegram_login_dead_end.md
docs/tasks/BUG-2026-07-04-002_telegram_web_fallback.md
docs/tasks/BUG-2026-07-05-001_bottom_nav_width.md
docs/tasks/BUG-2026-07-05-002_profile_mobile_layout.md
docs/tasks/BUG-2026-07-15-005-staging-resmoke-2026-07-17.md
docs/tasks/BUG-2026-07-22-task-detail-ios-regressions.md
docs/tasks/CAL-001-calendar-concept.md
docs/tasks/DESIGN-LIGHT-CHAT-2026-07-25-evidence.md
docs/tasks/EVIDENCE-AUDIT-2026-07-17.md
docs/tasks/HOME-001-dashboard-redesign.md
docs/tasks/HORIZON05-MANUAL-GATES-PACK-2026-07-22.md
docs/tasks/INFRA-005-yandex-ru-proxy-step1.md
docs/tasks/INFRA-006-worker-line-ending-incident-2026-07-17.md
docs/tasks/MERGE-READINESS-2026-07-17.md
docs/tasks/MONETIZATION-DECISIONS-2026-07-16.md
docs/tasks/NATIVE-PLATFORM-DECISIONS-2026-07-16.md
docs/tasks/NEW-006-tma-safe-area-live-smoke.md
docs/tasks/NEW-008-chat-keyboard-live-smoke.md
docs/tasks/OMNI-001-omnichannel-surfaces.md
docs/tasks/PERF-2026-07-18-task-latency-recheck.md
docs/tasks/PLAT-003-twa-capacitor-roadmap.md
docs/tasks/PRICE-MAP-2026-07-17.md
docs/tasks/PRODUCT-DECISIONS-2026-07-16.md
docs/tasks/RELEASE-BETA-GATES-2026-07-16.md
docs/tasks/SAFE-AREA-RESERVE-2026-07-25-evidence.md
docs/tasks/SMART-004-group-task-capture-smoke.md
docs/tasks/SMART-007-memory-evidence-fixture-plan.md
docs/tasks/SMART-011-waiting-on-people-smoke.md
docs/tasks/SMART-012-adaptive-reminders-plan.md
docs/tasks/SMART-013-ai-task-decomposition.md
docs/tasks/STAGING-AUTOMATED-QA-2026-07-17.md
docs/tasks/SW-CACHE-MATRIX-2026-07-25.md
docs/tasks/TASK_TEMPLATE.md
docs/tasks/VIRAL-005-first-ai-plan-wow.md
docs/tasks/assets/4_liquid_glass_panel_component_2026-07-21.html
docs/tasks/assets/BACK-055-notifications-action-cards-wireframe.svg
docs/tasks/assets/BACK-055-notifications-glass-2026-07-24-dark.png
docs/tasks/assets/BACK-055-notifications-glass-2026-07-24-light.png
docs/tasks/assets/BACK-069-task-detail-glass-2026-07-24-dark.png
docs/tasks/assets/BACK-069-task-detail-glass-2026-07-24-light.png
docs/tasks/assets/BUG-2026-07-22-task-detail-hero-overflow-ios.png
docs/tasks/assets/BUG-2026-07-22-task-detail-tag-popup-ios.png
docs/tasks/assets/HOME-001-dashboard-smoke-2026-07-20-dark.png
docs/tasks/assets/HOME-001-dashboard-smoke-2026-07-20-light.png
docs/tasks/assets/SMART-013-ai-task-decomposition-mockup.png
docs/tasks/assets/SMART-013-ai-task-decomposition-mockup.svg
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-ask-dark-360x800-keyboard.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-ask-dark-360x800.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-ask-dark-390x844-empty.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-ask-dark-390x844-error.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-ask-dark-390x844-keyboard.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-ask-dark-390x844-loading.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-ask-dark-390x844.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-ask-dark-430x932-keyboard.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-ask-dark-430x932.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-ask-light-360x800-keyboard.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-ask-light-360x800.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-ask-light-390x844-empty.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-ask-light-390x844-error.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-ask-light-390x844-keyboard.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-ask-light-390x844-loading.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-ask-light-390x844.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-ask-light-430x932-keyboard.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-ask-light-430x932.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-chat-conv-dark-360x800-keyboard.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-chat-conv-dark-360x800.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-chat-conv-dark-390x844-empty.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-chat-conv-dark-390x844-error.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-chat-conv-dark-390x844-keyboard.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-chat-conv-dark-390x844-loading.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-chat-conv-dark-390x844.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-chat-conv-dark-430x932-keyboard.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-chat-conv-dark-430x932.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-chat-conv-light-360x800-keyboard.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-chat-conv-light-360x800.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-chat-conv-light-390x844-empty.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-chat-conv-light-390x844-error.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-chat-conv-light-390x844-keyboard.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-chat-conv-light-390x844-loading.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-chat-conv-light-390x844.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-chat-conv-light-430x932-keyboard.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-chat-conv-light-430x932.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-chats-dark-360x800.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-chats-dark-390x844-empty.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-chats-dark-390x844-error.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-chats-dark-390x844-loading.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-chats-dark-390x844.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-chats-dark-430x932.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-chats-light-360x800.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-chats-light-390x844-empty.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-chats-light-390x844-error.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-chats-light-390x844-loading.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-chats-light-390x844.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-chats-light-430x932.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-dom-metrics.json
docs/tasks/assets/manual-qa-2026-07-22-home-bottom-bg.png
docs/tasks/assets/manual-qa-2026-07-22-profile-bottom-bg.png
docs/tasks/assets/manual-qa-2026-07-22-task-detail-tag-popup-blocked.png
docs/tasks/assets/manual-qa-2026-07-22-task-detail-tag-popup-keyboard.png
docs/tasks/assets/safe-area-reserve-2026-07-25/SAFE-AREA-2026-07-25-ask-keyboard-390x844.png
docs/tasks/assets/safe-area-reserve-2026-07-25/SAFE-AREA-2026-07-25-home-390x844.png
docs/tasks/assets/safe-area-reserve-2026-07-25/SAFE-AREA-2026-07-25-home-landscape-844x390.png
docs/tasks/assets/safe-area-reserve-2026-07-25/SAFE-AREA-2026-07-25-profile-390x844.png
docs/tasks/assets/safe-area-reserve-2026-07-25/SAFE-AREA-RESERVE-2026-07-25-metrics.json
docs/tasks/assets/sw-cache-matrix-2026-07-25/SW-CACHE-MATRIX-2026-07-25-metrics.json
docs/team-sync-protocol.md
docs/ui-architecture-rules.md
"docs/\320\227\320\220\320\224\320\220\320\247\320\230_\320\221\320\225\320\242\320\220_\320\230_\320\222\320\230\320\240\320\220\320\233\320\254\320\235\320\236\320\241\320\242\320\254.md"
"docs/\320\227\320\220\320\224\320\220\320\247\320\230_\320\243\320\234\320\235\320\253\320\231_\320\220\320\241\320\241\320\230\320\241\320\242\320\225\320\235\320\242.md"
pm/ANALYSIS-2026-07-23-night-session-and-next-periods.md
pm/ANALYSIS-2026-07-24-night-session-test-tools-and-manual-queue.md
pm/agent-inbox/codex-to-claude-2026-06-28-branch-main-rule.md
pm/agent-inbox/codex-to-team-2026-07-08-omnichannel-calendar-roadmap.md
pm/agent-inbox/codex-to-yuri-2026-07-06-accessibility-baseline.md
pm/agent-inbox/codex-to-yuri-2026-07-06-accessibility-permanent-rule.md
pm/agent-inbox/codex-to-yuri-2026-07-08-roadmap-filters-monetization.md
pm/assistant-evaluation.md
pm/autotest-backlog-coverage-2026-07-23.md
pm/back-035-manual-shortlist.md
pm/backlog.md
pm/beta-invite-pack-2026-07.md
pm/beta-invite-ready-checklist-2026-07-17.md
pm/beta-run-2026-07.md
pm/bugs.md
pm/cloudflare-secrets-handoff-2026-07-17.md
pm/cycle-execution-report-2026-07-17.md
pm/design-references/README.md
pm/design-references/glass-card-reference-spec.md
pm/design-references/glass-card-reference.png
pm/design-roadmap-correction-2026-07-23.md
pm/design-system-glass-inventory-2026-07-24.md
pm/feedback-loop-2026-07.md
pm/idea-capture-2026-07-21.md
pm/inbox/BRIEF-2026-07-18-00-agents-autonomy-rules.md
pm/inbox/BRIEF-2026-07-18-01-redesign-cutover-staging.md
pm/inbox/BRIEF-2026-07-18-price-align-security-perf.md
pm/inbox/BRIEF-2026-07-18-selftest.md
pm/inbox/BRIEF-2026-07-19-10-push-origin-sync.md
pm/inbox/BRIEF-2026-07-19-10a-auth-avatar-login-diagnose.md
pm/inbox/BRIEF-2026-07-19-11-save-badge-copy-sync.md
pm/inbox/BRIEF-2026-07-19-12-voice-perf-new-020.md
pm/inbox/BRIEF-2026-07-19-13-back-055-notifications-evidence.md
pm/inbox/BRIEF-2026-07-19-14-agents-stale-priorities.md
pm/inbox/BRIEF-2026-07-19-15-pm-docs-hygiene.md
pm/inbox/BRIEF-2026-07-19-16-analytics-002-scope-pause-and-document.md
pm/inbox/BRIEF-2026-07-19-17-arch001-evidence-upgrade.md
pm/inbox/BRIEF-2026-07-19-18-smart007-evidence-upgrade.md
pm/inbox/BRIEF-2026-07-20-20-back012-css-bem-cleanup.md
pm/inbox/BRIEF-2026-07-20-21-viral-share-card-finish.md
pm/inbox/BRIEF-2026-07-20-22-arch001-continue-split.md
pm/inbox/BRIEF-2026-07-20-23-preview-state-flags-for-qa.md
pm/inbox/BRIEF-2026-07-20-24-codex-self-visual-qa-probe.md
pm/inbox/BRIEF-2026-07-20-25-preview-stability-fix.md
pm/inbox/BRIEF-2026-07-20-26-layout-overlaps-from-gpt-qa.md
pm/inbox/BRIEF-2026-07-20-27-back049-ui-guard-evidence-upgrade.md
pm/inbox/BRIEF-2026-07-20-28-file-map-sync-audit.md
pm/inbox/BRIEF-2026-07-20-morning-refine-01-auth-avatar-login-diagnose.md
pm/inbox/BRIEF-2026-07-20-morning-refine-02-analytics-002-scope-document.md
pm/inbox/BRIEF-2026-07-21-morning-refine-01-auth-password-error-narrow-fix.md
pm/inbox/BRIEF-2026-07-21-morning-refine-02-avatar-draft-scope-privacy-fix.md
pm/inbox/BRIEF-2026-07-21-morning-refine-03-platform-global-alias-investigate.md
pm/inbox/BRIEF-2026-07-21-night-liquid-glass-system.md
pm/inbox/BRIEF-2026-07-22-30-focus-panel-visible-preview.md
pm/inbox/BRIEF-2026-07-22-31-task-reminder-time-ios.md
pm/inbox/BRIEF-2026-07-22-32-task-tag-popup-ios.md
pm/inbox/BRIEF-2026-07-22-33-task-detail-hero-overflow-ios.md
pm/inbox/BRIEF-2026-07-22-34-chat-history-over-40-evidence.md
pm/inbox/BRIEF-2026-07-22-35-smart007-memory-ui-regression-smoke.md
pm/inbox/BRIEF-2026-07-22-36-privacy-surface-regression-smoke.md
pm/inbox/BRIEF-2026-07-22-37-back037-ci-coverage-audit.md
pm/inbox/BRIEF-2026-07-22-38-horizon05-manual-gates-pack.md
pm/inbox/BRIEF-2026-07-22-39-arch001-status-evidence-audit.md
pm/inbox/BRIEF-2026-07-22-40-back012-component-inventory.md
pm/inbox/BRIEF-2026-07-22-41-horizon05-status-consistency.md
pm/inbox/BRIEF-2026-07-23-42-glass-design-system-foundation.md
pm/inbox/BRIEF-2026-07-23-43-vk-beta-readiness-map.md
pm/inbox/BRIEF-2026-07-23-44-vk-task-detail-beta-parity.md
pm/inbox/BRIEF-2026-07-23-45-vk-home-beta-parity.md
pm/inbox/BRIEF-2026-07-23-46-vk-profile-beta-parity.md
pm/inbox/BRIEF-2026-07-23-47-vk-calendar-parser-beta-parity.md
pm/inbox/BRIEF-2026-07-23-48-vk-auth-session-claude-scope.md
pm/inbox/BRIEF-2026-07-23-49-vk-ai-chat-claude-scope.md
pm/inbox/BRIEF-2026-07-24-50-glass-notification-card-slice.md
pm/inbox/BRIEF-2026-07-24-51-glass-task-detail-reference-slice.md
pm/inbox/BRIEF-2026-07-24-52-glass-night-visual-qa-handoff.md
pm/inbox/BRIEF-2026-07-24-53-glass-home-focus-dashboard-package2.md
pm/inbox/BRIEF-2026-07-24-54-glass-task-list-card-family-package2.md
pm/inbox/BRIEF-2026-07-24-55-glass-profile-menu-package2.md
pm/inbox/BRIEF-2026-07-24-56-glass-package2-visual-qa-handoff.md
pm/inbox/BRIEF-2026-07-24-57-glass-forms-dialogs-controls-package3.md
pm/inbox/BRIEF-2026-07-24-58-glass-chat-conversation-package3.md
pm/inbox/BRIEF-2026-07-24-59-glass-vk-parity-package3.md
pm/inbox/BRIEF-2026-07-24-60-glass-package3-final-qa-handoff.md
pm/inbox/BRIEF-2026-07-25-61-expired-premium-task-actions.md
pm/inbox/BRIEF-2026-07-25-62-expired-premium-voice-gate.md
pm/inbox/BRIEF-2026-07-25-63-voice-consent-checkbox-accessibility.md
pm/inbox/BRIEF-2026-07-25-64-voice-exit-controls.md
pm/inbox/BRIEF-2026-07-25-65-relative-time-copy.md
pm/inbox/BRIEF-2026-07-25-66-dashboard-right-edge-overflow.md
pm/inbox/BRIEF-2026-07-25-67-chat-voice-entrypoint.md
pm/inbox/BRIEF-2026-07-25-68-ai-delete-intent-safety.md
pm/inbox/BRIEF-2026-07-25-69-telegram-group-bot-capture.md
pm/inbox/BRIEF-2026-07-25-70-focus-counters-consistency.md
pm/inbox/BRIEF-2026-07-25-71-statistics-active-tasks-empty.md
pm/inbox/BRIEF-2026-07-25-72-calendar-task-list-clickability.md
pm/inbox/BRIEF-2026-07-25-73-task-detail-glass-layout-restore.md
pm/inbox/BRIEF-2026-07-25-74-task-chat-confirm-action.md
pm/inbox/BRIEF-2026-07-25-75-platform-global-alias-oauth-diagnostics.md
pm/inbox/BRIEF-2026-07-25-76-focus-panel-acceptance-restart.md
pm/inbox/BRIEF-2026-07-25-77-branch-inventory-no-delete.md
pm/inbox/BRIEF-2026-07-26-78-ai-delete-intent-refuse-fix.md
pm/inbox/BRIEF-TEMPLATE.md
pm/inbox/README.md
pm/infra-006-preflight-checklist.md
pm/infra-006-workspace-unification.md
pm/infra-006-x-drive-migration-2026-07-16.md
pm/manual-qa-2026-07-17.md
pm/morning-command-center-2026-07-17.md
pm/next-actions.md
pm/next-cycle-matrix-2026-07-17.md
pm/night-handoff-2026-07-16-to-17.md
pm/night-handoff-addendum-2026-07-17.md
pm/night-session-2026-07-24-glass-packages-2-3-plan.md
pm/night-session-2026-07-24-glass-reference-plan.md
pm/outbox/README.md
pm/outbox/REPORT-2026-07-22-gpt-live-browser-qa-intake.md
pm/outbox/REPORT-2026-07-22-light-theme-chat-buttons-intake.md
pm/outbox/REPORT-2026-07-22-manual-qa-task-detail-home-bg.md
pm/outbox/REPORT-2026-07-23-43-vk-beta-readiness-map.md
pm/outbox/REPORT-2026-07-23-44-vk-task-detail-beta-parity.md
pm/outbox/REPORT-2026-07-23-45-vk-home-beta-parity.md
pm/outbox/REPORT-2026-07-23-46-vk-profile-beta-parity.md
pm/outbox/REPORT-2026-07-23-47-vk-calendar-parser-beta-parity.md
pm/outbox/REPORT-2026-07-23-48-vk-auth-session-claude-scope.md
pm/outbox/REPORT-2026-07-23-49-vk-ai-chat-claude-scope.md
pm/outbox/REPORT-2026-07-23-pm-inbox-daily-runner-final.md
pm/outbox/REPORT-2026-07-23-vk-beta-night-queue.md
pm/outbox/REPORT-2026-07-25-misha-bug-night-queue.md
pm/outbox/REPORT-4e-full-system-roadmap-and-design-audit-2026-07-23.md
pm/outbox/REPORT-4e-morning-inbox-and-safe-backlog-runner-2026-07-22.md
pm/outbox/REPORT-4e-morning-inbox-and-safe-backlog-runner-2026-07-23.md
pm/outbox/REPORT-4e-morning-inbox-and-safe-backlog-runner-2026-07-24.md
pm/outbox/REPORT-4e-morning-inbox-and-safe-backlog-runner-2026-07-25.md
pm/outbox/REPORT-4e-night-inbox-and-whitelist-backlog-runner-2026-07-21.md
pm/outbox/REPORT-4e-night-inbox-and-whitelist-backlog-runner-2026-07-22.md
pm/outbox/REPORT-4e-night-inbox-and-whitelist-backlog-runner-2026-07-23.md
pm/outbox/REPORT-4e-night-inbox-and-whitelist-backlog-runner-2026-07-24.md
pm/outbox/REPORT-4e-night-inbox-and-whitelist-backlog-runner-2026-07-25.md
pm/outbox/REPORT-4e-night-inbox-and-whitelist-backlog-runner-2026-07-26.md
pm/outbox/REPORT-4e-pm-inbox-daily-runner-2026-07-20.md
pm/outbox/REPORT-4e-pm-inbox-daily-runner-2026-07-21-final.md
pm/outbox/REPORT-4e-pm-inbox-daily-runner-2026-07-22-final.md
pm/outbox/REPORT-4e-pm-inbox-daily-runner-2026-07-24-final.md
pm/outbox/REPORT-4e-pm-inbox-daily-runner-2026-07-25.md
pm/outbox/REPORT-4e-pm-inbox-daily-runner-presync-2026-07-21.md
pm/outbox/REPORT-4e-pre-dawn-inbox-and-whitelist-backlog-runner-2026-07-20.md
pm/outbox/REPORT-4e-pre-dawn-inbox-and-whitelist-backlog-runner-2026-07-21.md
pm/outbox/REPORT-4e-pre-dawn-inbox-and-whitelist-backlog-runner-2026-07-22.md
pm/outbox/REPORT-4e-pre-dawn-inbox-and-whitelist-backlog-runner-2026-07-23.md
pm/outbox/REPORT-4e-pre-dawn-inbox-and-whitelist-backlog-runner-2026-07-24.md
pm/outbox/REPORT-BACK-012-ask-action-preview-bem-cleanup-2026-07-23.md
pm/outbox/REPORT-BACK-012-auth-inline-cleanup-2026-07-22.md
pm/outbox/REPORT-BACK-012-calendar-inline-cleanup-2026-07-22.md
pm/outbox/REPORT-BACK-012-notification-renderer-bem-cleanup-2026-07-23.md
pm/outbox/REPORT-BACK-012-notifications-inline-cleanup-2026-07-22.md
pm/outbox/REPORT-BACK-012-statistics-inline-cleanup-2026-07-22.md
pm/outbox/REPORT-BACK-012-task-card-head-meta-bem-cleanup-2026-07-23.md
pm/outbox/REPORT-BACK-012-task-move-inline-cleanup-2026-07-22.md
pm/outbox/REPORT-BACK-019-status-sync.md
pm/outbox/REPORT-BACK-019-task-card-mobile-smoke.md
pm/outbox/REPORT-BACK-034-staging-api-resmoke-2026-07-20.md
pm/outbox/REPORT-BACK-050-accessibility-smoke-2026-07-20.md
pm/outbox/REPORT-BACK-055-notifications-headless-smoke.md
pm/outbox/REPORT-BACK-061-062-auth-legal-playwright-2026-07-24.md
pm/outbox/REPORT-BACK-064-notification-salience-delivery-audit.md
pm/outbox/REPORT-BACK-065-status-sync-2026-07-25.md
pm/outbox/REPORT-BACK-065-task-title-normalization.md
pm/outbox/REPORT-BACK-066-vk-functional-parity-audit.md
pm/outbox/REPORT-BACK-066-vk-playwright-parity-2026-07-24.md
pm/outbox/REPORT-BACK-066A-vk-task-intent.md
pm/outbox/REPORT-BRIEF-2026-07-18-00-agents-autonomy-rules.md
pm/outbox/REPORT-BRIEF-2026-07-18-01-redesign-cutover-staging.md
pm/outbox/REPORT-BRIEF-2026-07-18-price-align-security-perf.md
pm/outbox/REPORT-BRIEF-2026-07-18-selftest.md
pm/outbox/REPORT-BRIEF-2026-07-19-10-push-origin-sync.md
pm/outbox/REPORT-BRIEF-2026-07-19-10a-auth-avatar-login-diagnose.md
pm/outbox/REPORT-BRIEF-2026-07-19-11-save-badge-copy-sync.md
pm/outbox/REPORT-BRIEF-2026-07-19-12-voice-perf-new-020.md
pm/outbox/REPORT-BRIEF-2026-07-19-13-back-055-notifications-evidence.md
pm/outbox/REPORT-BRIEF-2026-07-19-14-agents-stale-priorities.md
pm/outbox/REPORT-BRIEF-2026-07-19-15-pm-docs-hygiene.md
pm/outbox/REPORT-BRIEF-2026-07-19-16-analytics-002-scope-pause-and-document.md
pm/outbox/REPORT-BRIEF-2026-07-19-17-arch001-evidence-upgrade.md
pm/outbox/REPORT-BRIEF-2026-07-19-18-smart007-evidence-upgrade.md
pm/outbox/REPORT-BRIEF-2026-07-20-20-back012-css-bem-cleanup.md
pm/outbox/REPORT-BRIEF-2026-07-20-21-viral-share-card-finish.md
pm/outbox/REPORT-BRIEF-2026-07-20-22-arch001-continue-split.md
pm/outbox/REPORT-BRIEF-2026-07-20-23-preview-state-flags-for-qa.md
pm/outbox/REPORT-BRIEF-2026-07-20-25-preview-stability-fix.md
pm/outbox/REPORT-BRIEF-2026-07-20-26-layout-overlaps-from-gpt-qa.md
pm/outbox/REPORT-BRIEF-2026-07-20-27-back049-ui-guard-evidence-upgrade.md
pm/outbox/REPORT-BRIEF-2026-07-20-28-file-map-sync-audit.md
pm/outbox/REPORT-BRIEF-2026-07-20-morning-refine-01-auth-avatar-login-diagnose.md
pm/outbox/REPORT-BRIEF-2026-07-20-morning-refine-02-analytics-002-scope-document.md
pm/outbox/REPORT-BRIEF-2026-07-21-morning-refine-01-auth-password-error-narrow-fix.md
pm/outbox/REPORT-BRIEF-2026-07-21-morning-refine-02-avatar-draft-scope-privacy-fix.md
pm/outbox/REPORT-BRIEF-2026-07-21-morning-refine-03-platform-global-alias-investigate.md
pm/outbox/REPORT-BRIEF-2026-07-21-night-liquid-glass-system.md
pm/outbox/REPORT-BRIEF-2026-07-22-30-focus-panel-visible-preview.md
pm/outbox/REPORT-BRIEF-2026-07-22-31-task-reminder-time-ios.md
pm/outbox/REPORT-BRIEF-2026-07-22-32-task-tag-popup-ios.md
pm/outbox/REPORT-BRIEF-2026-07-22-33-task-detail-hero-overflow-ios.md
pm/outbox/REPORT-BRIEF-2026-07-22-34-chat-history-over-40-evidence.md
pm/outbox/REPORT-BRIEF-2026-07-22-35-smart007-memory-ui-regression-smoke.md
pm/outbox/REPORT-BRIEF-2026-07-22-36-privacy-surface-regression-smoke.md
pm/outbox/REPORT-BRIEF-2026-07-22-37-back037-ci-coverage-audit.md
pm/outbox/REPORT-BRIEF-2026-07-22-38-horizon05-manual-gates-pack.md
pm/outbox/REPORT-BRIEF-2026-07-22-39-arch001-status-evidence-audit.md
pm/outbox/REPORT-BRIEF-2026-07-22-40-back012-component-inventory.md
pm/outbox/REPORT-BRIEF-2026-07-22-41-horizon05-status-consistency.md
pm/outbox/REPORT-BRIEF-2026-07-23-42-glass-design-system-foundation.md
pm/outbox/REPORT-BRIEF-2026-07-24-50-glass-notification-card-slice.md
pm/outbox/REPORT-BRIEF-2026-07-24-51-glass-task-detail-reference-slice.md
pm/outbox/REPORT-BRIEF-2026-07-24-52-glass-night-visual-qa-handoff.md
pm/outbox/REPORT-BRIEF-2026-07-24-53-glass-home-focus-dashboard-package2.md
pm/outbox/REPORT-BRIEF-2026-07-24-54-glass-task-list-card-family-package2.md
pm/outbox/REPORT-BRIEF-2026-07-24-55-glass-profile-menu-package2.md
pm/outbox/REPORT-BRIEF-2026-07-24-56-glass-package2-visual-qa-handoff.md
pm/outbox/REPORT-BRIEF-2026-07-24-57-glass-forms-dialogs-controls-package3.md
pm/outbox/REPORT-BRIEF-2026-07-24-58-glass-chat-conversation-package3.md
pm/outbox/REPORT-BRIEF-2026-07-24-59-glass-vk-parity-package3.md
pm/outbox/REPORT-BRIEF-2026-07-24-60-glass-package3-final-qa-handoff.md
pm/outbox/REPORT-BRIEF-2026-07-25-50-design-light-chat-evidence.md
pm/outbox/REPORT-BRIEF-2026-07-25-51-safe-area-reserve-token.md
pm/outbox/REPORT-BRIEF-2026-07-25-52-sw-cache-matrix-evidence.md
pm/outbox/REPORT-BRIEF-2026-07-25-61-expired-premium-task-actions.md
pm/outbox/REPORT-BRIEF-2026-07-25-62-expired-premium-voice-gate.md
pm/outbox/REPORT-BRIEF-2026-07-25-63-voice-consent-checkbox-accessibility.md
pm/outbox/REPORT-BRIEF-2026-07-25-64-voice-exit-controls.md
pm/outbox/REPORT-BRIEF-2026-07-25-65-relative-time-copy.md
pm/outbox/REPORT-BRIEF-2026-07-25-66-dashboard-right-edge-overflow.md
pm/outbox/REPORT-BRIEF-2026-07-25-67-chat-voice-entrypoint.md
pm/outbox/REPORT-BRIEF-2026-07-25-68-ai-delete-intent-safety.md
pm/outbox/REPORT-BRIEF-2026-07-25-69-telegram-group-bot-capture.md
pm/outbox/REPORT-BRIEF-2026-07-25-70-focus-counters-consistency.md
pm/outbox/REPORT-BRIEF-2026-07-25-71-statistics-active-tasks-empty.md
pm/outbox/REPORT-BRIEF-2026-07-25-72-calendar-task-list-clickability.md
pm/outbox/REPORT-BRIEF-2026-07-26-78-ai-delete-intent-refuse-fix.md
pm/outbox/REPORT-DESIGN-GLASS-001-night-scheduling-2026-07-23.md
pm/outbox/REPORT-HOME-001-dashboard-smoke-2026-07-20.md
pm/outbox/REPORT-NEW-006-BACK-046-navigation-safe-area-playwright-2026-07-24.md
pm/outbox/REPORT-NEW-008-chat-keyboard-playwright-2026-07-24.md
pm/outbox/REPORT-SMART-005-roadmap-status-sync.md
pm/outbox/REPORT-SMART-007-memory-fixture-smoke-2026-07-20.md
pm/outbox/REPORT-X-drive-canon-path-guard-2026-07-25.md
pm/outbox/REPORT-analytics-002-step1-2-retro.md
pm/outbox/REPORT-automation-disk-guard-2026-07-25.md
pm/outbox/REPORT-automation-morning-reconcile-2026-07-25.md
pm/outbox/REPORT-automation-night-step0-intake-2026-07-25.md
pm/outbox/REPORT-doc-task-status-sync-2026-07-21.md
pm/outbox/REPORT-docs-tree-consolidation-2026-07-25.md
pm/outbox/REPORT-documents4-inventory-2026-07-25.md
pm/partial-done-runtime-freeze-audit-2026-07-17.md
pm/post-beta-decision-tree-2026-07.md
pm/qa-checklist.md
pm/qa-results-2026-07-17.md
pm/qa-smart-001-002-004-group-bot.md
pm/qa-tooling-plan-2026-07-23.md
pm/ready-for-qa-triage-2026-07-17.md
pm/release-checklist.md
pm/tail-closeout-2026-07-17.md
pm/team-sync.md
pm/vk-parity-plan-2026-07-23.md
shared/COMMIT_CONVENTION.md
shared/DEVELOPMENT_HISTORY.md
shared/FILE_RULES.md
shared/ROADMAP.md
shared/WORK_LOG.md
`

## What Stayed In App

`	ext
docs/tasks/ANALYTICS-002-metrics-plan.md
docs/tasks/BACK-009-vk-pay-verification-plan.md
docs/tasks/BACK-010-payment-support-policy.md
docs/tasks/BACK-011-command-workspace.md
docs/tasks/BACK-012-component-inventory-2026-07-22.md
docs/tasks/BACK-012-css-architecture-plan.md
docs/tasks/BACK-017-notifications-delivery-smoke.md
docs/tasks/BACK-019-task-card-improvements.md
docs/tasks/BACK-019-task-card-mobile-smoke.md
docs/tasks/BACK-021-voice-mediarecorder.md
docs/tasks/BACK-022_task_detail_manual_mvp.md
docs/tasks/BACK-023_task_detail_future_expansion.md
docs/tasks/BACK-025_ai_planner_glass_dashboard.md
docs/tasks/BACK-026-account-merge.md
docs/tasks/BACK-039-completed-tasks-week.md
docs/tasks/BACK-040-admin-tariff-map.md
docs/tasks/BACK-040-tariff-config-readiness.md
docs/tasks/BACK-044-task-detail-card-cleanup.md
docs/tasks/BACK-045-russian-service-auth.md
docs/tasks/BACK-048-dev-test-accounts.md
docs/tasks/BACK-050-accessibility-baseline.md
docs/tasks/BACK-050-accessibility-smoke-checklist.md
docs/tasks/BACK-055-notifications-action-cards.md
docs/tasks/BACK-055-notifications-headless-smoke.md
docs/tasks/BACK-056-home-focus-time-copy.md
docs/tasks/BACK-057-offline-mode-plan.md
docs/tasks/BACK-057-offline-runtime-scope-audit.md
docs/tasks/BACK-058-oauth-profile-consent.md
docs/tasks/BACK-060-bot-path-signature-reconciliation.md
docs/tasks/BACK-064-notification-salience-delivery-audit.md
docs/tasks/BACK-065-task-title-normalization.md
docs/tasks/BACK-066-vk-functional-parity-audit-2026-07-22.md
docs/tasks/BACK-066-vk-stable-line-functional-parity.md
docs/tasks/BUG-2026-06-25-002_password_reset.md
docs/tasks/BUG-2026-06-29-001_telegram_login_dead_end.md
docs/tasks/BUG-2026-07-04-002_telegram_web_fallback.md
docs/tasks/BUG-2026-07-05-001_bottom_nav_width.md
docs/tasks/BUG-2026-07-05-002_profile_mobile_layout.md
docs/tasks/BUG-2026-07-15-005-staging-resmoke-2026-07-17.md
docs/tasks/BUG-2026-07-22-task-detail-ios-regressions.md
docs/tasks/CAL-001-calendar-concept.md
docs/tasks/DESIGN-LIGHT-CHAT-2026-07-25-evidence.md
docs/tasks/EVIDENCE-AUDIT-2026-07-17.md
docs/tasks/HOME-001-dashboard-redesign.md
docs/tasks/HORIZON05-MANUAL-GATES-PACK-2026-07-22.md
docs/tasks/INFRA-005-yandex-ru-proxy-step1.md
docs/tasks/INFRA-006-worker-line-ending-incident-2026-07-17.md
docs/tasks/MERGE-READINESS-2026-07-17.md
docs/tasks/MONETIZATION-DECISIONS-2026-07-16.md
docs/tasks/NATIVE-PLATFORM-DECISIONS-2026-07-16.md
docs/tasks/NEW-006-tma-safe-area-live-smoke.md
docs/tasks/NEW-008-chat-keyboard-live-smoke.md
docs/tasks/OMNI-001-omnichannel-surfaces.md
docs/tasks/PERF-2026-07-18-task-latency-recheck.md
docs/tasks/PLAT-003-twa-capacitor-roadmap.md
docs/tasks/PRICE-MAP-2026-07-17.md
docs/tasks/PRODUCT-DECISIONS-2026-07-16.md
docs/tasks/RELEASE-BETA-GATES-2026-07-16.md
docs/tasks/SAFE-AREA-RESERVE-2026-07-25-evidence.md
docs/tasks/SMART-004-group-task-capture-smoke.md
docs/tasks/SMART-007-memory-evidence-fixture-plan.md
docs/tasks/SMART-011-waiting-on-people-smoke.md
docs/tasks/SMART-012-adaptive-reminders-plan.md
docs/tasks/SMART-013-ai-task-decomposition.md
docs/tasks/STAGING-AUTOMATED-QA-2026-07-17.md
docs/tasks/SW-CACHE-MATRIX-2026-07-25.md
docs/tasks/TASK_TEMPLATE.md
docs/tasks/VIRAL-005-first-ai-plan-wow.md
docs/tasks/assets/4_liquid_glass_panel_component_2026-07-21.html
docs/tasks/assets/BACK-055-notifications-action-cards-wireframe.svg
docs/tasks/assets/BACK-055-notifications-glass-2026-07-24-dark.png
docs/tasks/assets/BACK-055-notifications-glass-2026-07-24-light.png
docs/tasks/assets/BACK-069-task-detail-glass-2026-07-24-dark.png
docs/tasks/assets/BACK-069-task-detail-glass-2026-07-24-light.png
docs/tasks/assets/BUG-2026-07-22-task-detail-hero-overflow-ios.png
docs/tasks/assets/BUG-2026-07-22-task-detail-tag-popup-ios.png
docs/tasks/assets/HOME-001-dashboard-smoke-2026-07-20-dark.png
docs/tasks/assets/HOME-001-dashboard-smoke-2026-07-20-light.png
docs/tasks/assets/SMART-013-ai-task-decomposition-mockup.png
docs/tasks/assets/SMART-013-ai-task-decomposition-mockup.svg
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-ask-dark-360x800-keyboard.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-ask-dark-360x800.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-ask-dark-390x844-empty.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-ask-dark-390x844-error.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-ask-dark-390x844-keyboard.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-ask-dark-390x844-loading.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-ask-dark-390x844.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-ask-dark-430x932-keyboard.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-ask-dark-430x932.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-ask-light-360x800-keyboard.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-ask-light-360x800.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-ask-light-390x844-empty.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-ask-light-390x844-error.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-ask-light-390x844-keyboard.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-ask-light-390x844-loading.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-ask-light-390x844.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-ask-light-430x932-keyboard.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-ask-light-430x932.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-chat-conv-dark-360x800-keyboard.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-chat-conv-dark-360x800.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-chat-conv-dark-390x844-empty.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-chat-conv-dark-390x844-error.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-chat-conv-dark-390x844-keyboard.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-chat-conv-dark-390x844-loading.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-chat-conv-dark-390x844.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-chat-conv-dark-430x932-keyboard.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-chat-conv-dark-430x932.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-chat-conv-light-360x800-keyboard.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-chat-conv-light-360x800.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-chat-conv-light-390x844-empty.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-chat-conv-light-390x844-error.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-chat-conv-light-390x844-keyboard.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-chat-conv-light-390x844-loading.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-chat-conv-light-390x844.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-chat-conv-light-430x932-keyboard.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-chat-conv-light-430x932.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-chats-dark-360x800.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-chats-dark-390x844-empty.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-chats-dark-390x844-error.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-chats-dark-390x844-loading.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-chats-dark-390x844.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-chats-dark-430x932.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-chats-light-360x800.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-chats-light-390x844-empty.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-chats-light-390x844-error.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-chats-light-390x844-loading.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-chats-light-390x844.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-chats-light-430x932.png
docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-dom-metrics.json
docs/tasks/assets/manual-qa-2026-07-22-home-bottom-bg.png
docs/tasks/assets/manual-qa-2026-07-22-profile-bottom-bg.png
docs/tasks/assets/manual-qa-2026-07-22-task-detail-tag-popup-blocked.png
docs/tasks/assets/manual-qa-2026-07-22-task-detail-tag-popup-keyboard.png
docs/tasks/assets/safe-area-reserve-2026-07-25/SAFE-AREA-2026-07-25-ask-keyboard-390x844.png
docs/tasks/assets/safe-area-reserve-2026-07-25/SAFE-AREA-2026-07-25-home-390x844.png
docs/tasks/assets/safe-area-reserve-2026-07-25/SAFE-AREA-2026-07-25-home-landscape-844x390.png
docs/tasks/assets/safe-area-reserve-2026-07-25/SAFE-AREA-2026-07-25-profile-390x844.png
docs/tasks/assets/safe-area-reserve-2026-07-25/SAFE-AREA-RESERVE-2026-07-25-metrics.json
docs/tasks/assets/sw-cache-matrix-2026-07-25/SW-CACHE-MATRIX-2026-07-25-metrics.json
pm/inbox/BRIEF-2026-07-18-00-agents-autonomy-rules.md
pm/inbox/BRIEF-2026-07-18-01-redesign-cutover-staging.md
pm/inbox/BRIEF-2026-07-18-price-align-security-perf.md
pm/inbox/BRIEF-2026-07-18-selftest.md
pm/inbox/BRIEF-2026-07-19-10-push-origin-sync.md
pm/inbox/BRIEF-2026-07-19-10a-auth-avatar-login-diagnose.md
pm/inbox/BRIEF-2026-07-19-11-save-badge-copy-sync.md
pm/inbox/BRIEF-2026-07-19-12-voice-perf-new-020.md
pm/inbox/BRIEF-2026-07-19-13-back-055-notifications-evidence.md
pm/inbox/BRIEF-2026-07-19-14-agents-stale-priorities.md
pm/inbox/BRIEF-2026-07-19-15-pm-docs-hygiene.md
pm/inbox/BRIEF-2026-07-19-16-analytics-002-scope-pause-and-document.md
pm/inbox/BRIEF-2026-07-19-17-arch001-evidence-upgrade.md
pm/inbox/BRIEF-2026-07-19-18-smart007-evidence-upgrade.md
pm/inbox/BRIEF-2026-07-20-20-back012-css-bem-cleanup.md
pm/inbox/BRIEF-2026-07-20-21-viral-share-card-finish.md
pm/inbox/BRIEF-2026-07-20-22-arch001-continue-split.md
pm/inbox/BRIEF-2026-07-20-23-preview-state-flags-for-qa.md
pm/inbox/BRIEF-2026-07-20-24-codex-self-visual-qa-probe.md
pm/inbox/BRIEF-2026-07-20-25-preview-stability-fix.md
pm/inbox/BRIEF-2026-07-20-26-layout-overlaps-from-gpt-qa.md
pm/inbox/BRIEF-2026-07-20-27-back049-ui-guard-evidence-upgrade.md
pm/inbox/BRIEF-2026-07-20-28-file-map-sync-audit.md
pm/inbox/BRIEF-2026-07-20-morning-refine-01-auth-avatar-login-diagnose.md
pm/inbox/BRIEF-2026-07-20-morning-refine-02-analytics-002-scope-document.md
pm/inbox/BRIEF-2026-07-21-morning-refine-01-auth-password-error-narrow-fix.md
pm/inbox/BRIEF-2026-07-21-morning-refine-02-avatar-draft-scope-privacy-fix.md
pm/inbox/BRIEF-2026-07-21-morning-refine-03-platform-global-alias-investigate.md
pm/inbox/BRIEF-2026-07-21-night-liquid-glass-system.md
pm/inbox/BRIEF-2026-07-22-30-focus-panel-visible-preview.md
pm/inbox/BRIEF-2026-07-22-31-task-reminder-time-ios.md
pm/inbox/BRIEF-2026-07-22-32-task-tag-popup-ios.md
pm/inbox/BRIEF-2026-07-22-33-task-detail-hero-overflow-ios.md
pm/inbox/BRIEF-2026-07-22-34-chat-history-over-40-evidence.md
pm/inbox/BRIEF-2026-07-22-35-smart007-memory-ui-regression-smoke.md
pm/inbox/BRIEF-2026-07-22-36-privacy-surface-regression-smoke.md
pm/inbox/BRIEF-2026-07-22-37-back037-ci-coverage-audit.md
pm/inbox/BRIEF-2026-07-22-38-horizon05-manual-gates-pack.md
pm/inbox/BRIEF-2026-07-22-39-arch001-status-evidence-audit.md
pm/inbox/BRIEF-2026-07-22-40-back012-component-inventory.md
pm/inbox/BRIEF-2026-07-22-41-horizon05-status-consistency.md
pm/inbox/BRIEF-2026-07-23-42-glass-design-system-foundation.md
pm/inbox/BRIEF-2026-07-23-43-vk-beta-readiness-map.md
pm/inbox/BRIEF-2026-07-23-44-vk-task-detail-beta-parity.md
pm/inbox/BRIEF-2026-07-23-45-vk-home-beta-parity.md
pm/inbox/BRIEF-2026-07-23-46-vk-profile-beta-parity.md
pm/inbox/BRIEF-2026-07-23-47-vk-calendar-parser-beta-parity.md
pm/inbox/BRIEF-2026-07-23-48-vk-auth-session-claude-scope.md
pm/inbox/BRIEF-2026-07-23-49-vk-ai-chat-claude-scope.md
pm/inbox/BRIEF-2026-07-24-50-glass-notification-card-slice.md
pm/inbox/BRIEF-2026-07-24-51-glass-task-detail-reference-slice.md
pm/inbox/BRIEF-2026-07-24-52-glass-night-visual-qa-handoff.md
pm/inbox/BRIEF-2026-07-24-53-glass-home-focus-dashboard-package2.md
pm/inbox/BRIEF-2026-07-24-54-glass-task-list-card-family-package2.md
pm/inbox/BRIEF-2026-07-24-55-glass-profile-menu-package2.md
pm/inbox/BRIEF-2026-07-24-56-glass-package2-visual-qa-handoff.md
pm/inbox/BRIEF-2026-07-24-57-glass-forms-dialogs-controls-package3.md
pm/inbox/BRIEF-2026-07-24-58-glass-chat-conversation-package3.md
pm/inbox/BRIEF-2026-07-24-59-glass-vk-parity-package3.md
pm/inbox/BRIEF-2026-07-24-60-glass-package3-final-qa-handoff.md
pm/inbox/BRIEF-2026-07-25-61-expired-premium-task-actions.md
pm/inbox/BRIEF-2026-07-25-62-expired-premium-voice-gate.md
pm/inbox/BRIEF-2026-07-25-63-voice-consent-checkbox-accessibility.md
pm/inbox/BRIEF-2026-07-25-64-voice-exit-controls.md
pm/inbox/BRIEF-2026-07-25-65-relative-time-copy.md
pm/inbox/BRIEF-2026-07-25-66-dashboard-right-edge-overflow.md
pm/inbox/BRIEF-2026-07-25-67-chat-voice-entrypoint.md
pm/inbox/BRIEF-2026-07-25-68-ai-delete-intent-safety.md
pm/inbox/BRIEF-2026-07-25-69-telegram-group-bot-capture.md
pm/inbox/BRIEF-2026-07-25-70-focus-counters-consistency.md
pm/inbox/BRIEF-2026-07-25-71-statistics-active-tasks-empty.md
pm/inbox/BRIEF-2026-07-25-72-calendar-task-list-clickability.md
pm/inbox/BRIEF-2026-07-25-73-task-detail-glass-layout-restore.md
pm/inbox/BRIEF-2026-07-25-74-task-chat-confirm-action.md
pm/inbox/BRIEF-2026-07-25-75-platform-global-alias-oauth-diagnostics.md
pm/inbox/BRIEF-2026-07-25-76-focus-panel-acceptance-restart.md
pm/inbox/BRIEF-2026-07-25-77-branch-inventory-no-delete.md
pm/inbox/BRIEF-2026-07-26-78-ai-delete-intent-refuse-fix.md
pm/inbox/BRIEF-TEMPLATE.md
pm/inbox/README.md
pm/outbox/README.md
pm/outbox/REPORT-2026-07-22-gpt-live-browser-qa-intake.md
pm/outbox/REPORT-2026-07-22-light-theme-chat-buttons-intake.md
pm/outbox/REPORT-2026-07-22-manual-qa-task-detail-home-bg.md
pm/outbox/REPORT-2026-07-23-43-vk-beta-readiness-map.md
pm/outbox/REPORT-2026-07-23-44-vk-task-detail-beta-parity.md
pm/outbox/REPORT-2026-07-23-45-vk-home-beta-parity.md
pm/outbox/REPORT-2026-07-23-46-vk-profile-beta-parity.md
pm/outbox/REPORT-2026-07-23-47-vk-calendar-parser-beta-parity.md
pm/outbox/REPORT-2026-07-23-48-vk-auth-session-claude-scope.md
pm/outbox/REPORT-2026-07-23-49-vk-ai-chat-claude-scope.md
pm/outbox/REPORT-2026-07-23-pm-inbox-daily-runner-final.md
pm/outbox/REPORT-2026-07-23-vk-beta-night-queue.md
pm/outbox/REPORT-2026-07-25-misha-bug-night-queue.md
pm/outbox/REPORT-4e-full-system-roadmap-and-design-audit-2026-07-23.md
pm/outbox/REPORT-4e-morning-inbox-and-safe-backlog-runner-2026-07-22.md
pm/outbox/REPORT-4e-morning-inbox-and-safe-backlog-runner-2026-07-23.md
pm/outbox/REPORT-4e-morning-inbox-and-safe-backlog-runner-2026-07-24.md
pm/outbox/REPORT-4e-morning-inbox-and-safe-backlog-runner-2026-07-25.md
pm/outbox/REPORT-4e-night-inbox-and-whitelist-backlog-runner-2026-07-21.md
pm/outbox/REPORT-4e-night-inbox-and-whitelist-backlog-runner-2026-07-22.md
pm/outbox/REPORT-4e-night-inbox-and-whitelist-backlog-runner-2026-07-23.md
pm/outbox/REPORT-4e-night-inbox-and-whitelist-backlog-runner-2026-07-24.md
pm/outbox/REPORT-4e-night-inbox-and-whitelist-backlog-runner-2026-07-25.md
pm/outbox/REPORT-4e-night-inbox-and-whitelist-backlog-runner-2026-07-26.md
pm/outbox/REPORT-4e-pm-inbox-daily-runner-2026-07-20.md
pm/outbox/REPORT-4e-pm-inbox-daily-runner-2026-07-21-final.md
pm/outbox/REPORT-4e-pm-inbox-daily-runner-2026-07-22-final.md
pm/outbox/REPORT-4e-pm-inbox-daily-runner-2026-07-24-final.md
pm/outbox/REPORT-4e-pm-inbox-daily-runner-2026-07-25.md
pm/outbox/REPORT-4e-pm-inbox-daily-runner-presync-2026-07-21.md
pm/outbox/REPORT-4e-pre-dawn-inbox-and-whitelist-backlog-runner-2026-07-20.md
pm/outbox/REPORT-4e-pre-dawn-inbox-and-whitelist-backlog-runner-2026-07-21.md
pm/outbox/REPORT-4e-pre-dawn-inbox-and-whitelist-backlog-runner-2026-07-22.md
pm/outbox/REPORT-4e-pre-dawn-inbox-and-whitelist-backlog-runner-2026-07-23.md
pm/outbox/REPORT-4e-pre-dawn-inbox-and-whitelist-backlog-runner-2026-07-24.md
pm/outbox/REPORT-BACK-012-ask-action-preview-bem-cleanup-2026-07-23.md
pm/outbox/REPORT-BACK-012-auth-inline-cleanup-2026-07-22.md
pm/outbox/REPORT-BACK-012-calendar-inline-cleanup-2026-07-22.md
pm/outbox/REPORT-BACK-012-notification-renderer-bem-cleanup-2026-07-23.md
pm/outbox/REPORT-BACK-012-notifications-inline-cleanup-2026-07-22.md
pm/outbox/REPORT-BACK-012-statistics-inline-cleanup-2026-07-22.md
pm/outbox/REPORT-BACK-012-task-card-head-meta-bem-cleanup-2026-07-23.md
pm/outbox/REPORT-BACK-012-task-move-inline-cleanup-2026-07-22.md
pm/outbox/REPORT-BACK-019-status-sync.md
pm/outbox/REPORT-BACK-019-task-card-mobile-smoke.md
pm/outbox/REPORT-BACK-034-staging-api-resmoke-2026-07-20.md
pm/outbox/REPORT-BACK-050-accessibility-smoke-2026-07-20.md
pm/outbox/REPORT-BACK-055-notifications-headless-smoke.md
pm/outbox/REPORT-BACK-061-062-auth-legal-playwright-2026-07-24.md
pm/outbox/REPORT-BACK-064-notification-salience-delivery-audit.md
pm/outbox/REPORT-BACK-065-status-sync-2026-07-25.md
pm/outbox/REPORT-BACK-065-task-title-normalization.md
pm/outbox/REPORT-BACK-066-vk-functional-parity-audit.md
pm/outbox/REPORT-BACK-066-vk-playwright-parity-2026-07-24.md
pm/outbox/REPORT-BACK-066A-vk-task-intent.md
pm/outbox/REPORT-BRIEF-2026-07-18-00-agents-autonomy-rules.md
pm/outbox/REPORT-BRIEF-2026-07-18-01-redesign-cutover-staging.md
pm/outbox/REPORT-BRIEF-2026-07-18-price-align-security-perf.md
pm/outbox/REPORT-BRIEF-2026-07-18-selftest.md
pm/outbox/REPORT-BRIEF-2026-07-19-10-push-origin-sync.md
pm/outbox/REPORT-BRIEF-2026-07-19-10a-auth-avatar-login-diagnose.md
pm/outbox/REPORT-BRIEF-2026-07-19-11-save-badge-copy-sync.md
pm/outbox/REPORT-BRIEF-2026-07-19-12-voice-perf-new-020.md
pm/outbox/REPORT-BRIEF-2026-07-19-13-back-055-notifications-evidence.md
pm/outbox/REPORT-BRIEF-2026-07-19-14-agents-stale-priorities.md
pm/outbox/REPORT-BRIEF-2026-07-19-15-pm-docs-hygiene.md
pm/outbox/REPORT-BRIEF-2026-07-19-16-analytics-002-scope-pause-and-document.md
pm/outbox/REPORT-BRIEF-2026-07-19-17-arch001-evidence-upgrade.md
pm/outbox/REPORT-BRIEF-2026-07-19-18-smart007-evidence-upgrade.md
pm/outbox/REPORT-BRIEF-2026-07-20-20-back012-css-bem-cleanup.md
pm/outbox/REPORT-BRIEF-2026-07-20-21-viral-share-card-finish.md
pm/outbox/REPORT-BRIEF-2026-07-20-22-arch001-continue-split.md
pm/outbox/REPORT-BRIEF-2026-07-20-23-preview-state-flags-for-qa.md
pm/outbox/REPORT-BRIEF-2026-07-20-25-preview-stability-fix.md
pm/outbox/REPORT-BRIEF-2026-07-20-26-layout-overlaps-from-gpt-qa.md
pm/outbox/REPORT-BRIEF-2026-07-20-27-back049-ui-guard-evidence-upgrade.md
pm/outbox/REPORT-BRIEF-2026-07-20-28-file-map-sync-audit.md
pm/outbox/REPORT-BRIEF-2026-07-20-morning-refine-01-auth-avatar-login-diagnose.md
pm/outbox/REPORT-BRIEF-2026-07-20-morning-refine-02-analytics-002-scope-document.md
pm/outbox/REPORT-BRIEF-2026-07-21-morning-refine-01-auth-password-error-narrow-fix.md
pm/outbox/REPORT-BRIEF-2026-07-21-morning-refine-02-avatar-draft-scope-privacy-fix.md
pm/outbox/REPORT-BRIEF-2026-07-21-morning-refine-03-platform-global-alias-investigate.md
pm/outbox/REPORT-BRIEF-2026-07-21-night-liquid-glass-system.md
pm/outbox/REPORT-BRIEF-2026-07-22-30-focus-panel-visible-preview.md
pm/outbox/REPORT-BRIEF-2026-07-22-31-task-reminder-time-ios.md
pm/outbox/REPORT-BRIEF-2026-07-22-32-task-tag-popup-ios.md
pm/outbox/REPORT-BRIEF-2026-07-22-33-task-detail-hero-overflow-ios.md
pm/outbox/REPORT-BRIEF-2026-07-22-34-chat-history-over-40-evidence.md
pm/outbox/REPORT-BRIEF-2026-07-22-35-smart007-memory-ui-regression-smoke.md
pm/outbox/REPORT-BRIEF-2026-07-22-36-privacy-surface-regression-smoke.md
pm/outbox/REPORT-BRIEF-2026-07-22-37-back037-ci-coverage-audit.md
pm/outbox/REPORT-BRIEF-2026-07-22-38-horizon05-manual-gates-pack.md
pm/outbox/REPORT-BRIEF-2026-07-22-39-arch001-status-evidence-audit.md
pm/outbox/REPORT-BRIEF-2026-07-22-40-back012-component-inventory.md
pm/outbox/REPORT-BRIEF-2026-07-22-41-horizon05-status-consistency.md
pm/outbox/REPORT-BRIEF-2026-07-23-42-glass-design-system-foundation.md
pm/outbox/REPORT-BRIEF-2026-07-24-50-glass-notification-card-slice.md
pm/outbox/REPORT-BRIEF-2026-07-24-51-glass-task-detail-reference-slice.md
pm/outbox/REPORT-BRIEF-2026-07-24-52-glass-night-visual-qa-handoff.md
pm/outbox/REPORT-BRIEF-2026-07-24-53-glass-home-focus-dashboard-package2.md
pm/outbox/REPORT-BRIEF-2026-07-24-54-glass-task-list-card-family-package2.md
pm/outbox/REPORT-BRIEF-2026-07-24-55-glass-profile-menu-package2.md
pm/outbox/REPORT-BRIEF-2026-07-24-56-glass-package2-visual-qa-handoff.md
pm/outbox/REPORT-BRIEF-2026-07-24-57-glass-forms-dialogs-controls-package3.md
pm/outbox/REPORT-BRIEF-2026-07-24-58-glass-chat-conversation-package3.md
pm/outbox/REPORT-BRIEF-2026-07-24-59-glass-vk-parity-package3.md
pm/outbox/REPORT-BRIEF-2026-07-24-60-glass-package3-final-qa-handoff.md
pm/outbox/REPORT-BRIEF-2026-07-25-50-design-light-chat-evidence.md
pm/outbox/REPORT-BRIEF-2026-07-25-51-safe-area-reserve-token.md
pm/outbox/REPORT-BRIEF-2026-07-25-52-sw-cache-matrix-evidence.md
pm/outbox/REPORT-BRIEF-2026-07-25-61-expired-premium-task-actions.md
pm/outbox/REPORT-BRIEF-2026-07-25-62-expired-premium-voice-gate.md
pm/outbox/REPORT-BRIEF-2026-07-25-63-voice-consent-checkbox-accessibility.md
pm/outbox/REPORT-BRIEF-2026-07-25-64-voice-exit-controls.md
pm/outbox/REPORT-BRIEF-2026-07-25-65-relative-time-copy.md
pm/outbox/REPORT-BRIEF-2026-07-25-66-dashboard-right-edge-overflow.md
pm/outbox/REPORT-BRIEF-2026-07-25-67-chat-voice-entrypoint.md
pm/outbox/REPORT-BRIEF-2026-07-25-68-ai-delete-intent-safety.md
pm/outbox/REPORT-BRIEF-2026-07-25-69-telegram-group-bot-capture.md
pm/outbox/REPORT-BRIEF-2026-07-25-70-focus-counters-consistency.md
pm/outbox/REPORT-BRIEF-2026-07-25-71-statistics-active-tasks-empty.md
pm/outbox/REPORT-BRIEF-2026-07-25-72-calendar-task-list-clickability.md
pm/outbox/REPORT-BRIEF-2026-07-26-78-ai-delete-intent-refuse-fix.md
pm/outbox/REPORT-DESIGN-GLASS-001-night-scheduling-2026-07-23.md
pm/outbox/REPORT-HOME-001-dashboard-smoke-2026-07-20.md
pm/outbox/REPORT-NEW-006-BACK-046-navigation-safe-area-playwright-2026-07-24.md
pm/outbox/REPORT-NEW-008-chat-keyboard-playwright-2026-07-24.md
pm/outbox/REPORT-SMART-005-roadmap-status-sync.md
pm/outbox/REPORT-SMART-007-memory-fixture-smoke-2026-07-20.md
pm/outbox/REPORT-X-drive-canon-path-guard-2026-07-25.md
pm/outbox/REPORT-analytics-002-step1-2-retro.md
pm/outbox/REPORT-automation-disk-guard-2026-07-25.md
pm/outbox/REPORT-automation-morning-reconcile-2026-07-25.md
pm/outbox/REPORT-automation-night-step0-intake-2026-07-25.md
pm/outbox/REPORT-doc-task-status-sync-2026-07-21.md
pm/outbox/REPORT-docs-tree-consolidation-2026-07-25.md
pm/outbox/REPORT-documents4-inventory-2026-07-25.md
`

## git log --follow Verification

### pm/backlog.md

`	ext
b3f8a70 fix(calendar): open deadline rows
e418847 fix(stats): clarify active task empty state
0afeac2 fix(home): align focus counters
7c93bf2 docs(pm): classify group bot blocker
70e3070 docs(pm): classify delete intent safety
f84bfe9 fix(chat): add voice composer entrypoint
3e78fd8 test(home): guard dashboard viewport edges
18d8626 fix(copy): use exact old task relative time
79532ae fix(voice): make exit controls reset flow
c0c308d fix(voice): enlarge consent checkbox target
b9951d4 fix(voice): gate expired premium voice entry
91c1135 fix(ui): explain premium task denials
`

### shared/ROADMAP.md

`	ext
4f55c22 docs(pm): enforce x drive project canon
9f8b496 fix(ui): stabilize ask keyboard prebeta gate
1c89184 docs(pm): queue vk beta readiness night work
15808d0 docs(qa): add autotest gate and backlog coverage
f29d1a7 docs(ui): schedule glass design system pass
fdc6428 docs(pm): синхронизировать итоги ночной сессии
96b3032 docs(pm): sync night runner qa intake
6e3013d docs(pm): sync horizon privacy status
c1aa5d2 docs(pm): sync smart005 roadmap status
b2fddc1 docs(pm): sync night runner roadmap status
2f5ade9 test(ai): add smart 007 memory fixture smoke
c8b590b test(api): refresh staging smoke evidence
`

### docs/team-sync-protocol.md

`	ext
786eb61 docs(process): clarify yuri git via claude
5909a2d docs(process): add team sync protocol
`

## Unclassified Files

None. Classification was deterministic from the requested rules:

- stayed in app: pm/inbox/**, pm/outbox/**, docs/tasks/**;
- moved to 4pm and removed from app: all other tracked files under pm/, all tracked docs/** outside docs/tasks/**, and all tracked shared/**.

## Reference Cleanup

Updated active navigation/process files to point business-doc readers to https://github.com/mrktggod/4pm:

- AGENTS.md
- README.md
- CLAUDE.md
- COWORK_INSTRUCTIONS.md
- FILE_MAP.md
- .github/workflows/path-guard.yml
- scripts/check-doc-encoding.mjs
- scripts/check-cp1251-mojibake.mjs
- styles/screens/light-redesign.less
- styles.css

Historical files that remain in pm/outbox/**, docs/tasks/**, and DEVELOPMENT_LOG.md still contain archival mentions of old local paths or old PM files. They were not rewritten because they are evidence records, not live navigation or config.

## Path Hygiene

- App was cloned fresh into X:\Projects\4-ai-secretary\app.
- `npm run check:portable-paths` could not run because this fresh environment has no `bash` in PATH: `spawnSync bash ENOENT`.
- Manual `rg` checks found no `X:\4\...` or `C:\...` references in active code/scripts/config after replacing the old light-redesign CSS source comment.
- Remaining `X:\4\.tmp-4e-app-publish` mentions are documentation-only stop-point notes in AGENTS.md and FILE_MAP.md.

## Checks

```text
npm run check:cp1251-mojibake
CP1251 mojibake check passed: 0 suspicious tokens

npm run check:js-syntax
JS syntax check: no staged JS or HTML files

node scripts/check-doc-encoding.mjs
Markdown encoding check passed for 287 operational Markdown files.

npm run build:css
build:css passed

git diff --check
passed
```

## What I Did Not Do In This Run

- Did not move worker.
- Did not move bot.
- Did not move or edit cowork-docs.
- Did not modify, delete, or clean old X:\4 checkout contents beyond the required read-only Step 1 origin/HEAD checks.
- Did not merge to main.
- Did not deploy to production.
- Did not touch prices, payments, entitlement, secrets, or live payment flows.
